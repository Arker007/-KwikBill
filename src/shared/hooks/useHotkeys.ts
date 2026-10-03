import { useEffect, useRef } from 'react';

export interface HotkeyOptions {
  /**
   * Whether the hotkey listener is active (default: true)
   */
  enabled?: boolean;
  /**
   * Whether to call event.preventDefault() when the hotkey triggers (default: true)
   */
  preventDefault?: boolean;
  /**
   * Whether to call event.stopPropagation() when the hotkey triggers (default: false)
   */
  stopPropagation?: boolean;
  /**
   * Whether hotkey triggers when focus is inside an input, textarea, or contentEditable element (default: false)
   */
  enableOnFormTags?: boolean;
}

/**
 * Normalizes a key combo string like 'ctrl+s', 'meta+k', 'alt+shift+p', 'escape'
 */
function parseKeyCombo(combo: string) {
  const parts = combo.toLowerCase().split('+').map((s) => s.trim());
  const hasCtrl = parts.includes('ctrl') || parts.includes('control');
  const hasMeta = parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
  const hasAlt = parts.includes('alt') || parts.includes('option');
  const hasShift = parts.includes('shift');
  // Mod key represents ctrl on Windows/Linux, cmd on Mac
  const hasMod = parts.includes('mod');

  const key = parts.find(
    (p) => !['ctrl', 'control', 'meta', 'cmd', 'command', 'alt', 'option', 'shift', 'mod'].includes(p)
  ) || '';

  return { hasCtrl, hasMeta, hasAlt, hasShift, hasMod, key };
}

/**
 * Checks if the target element is an active form input
 */
function isFormElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toUpperCase();
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
}

/**
 * Custom hook for registering global keyboard shortcuts with modifier keys and form safety.
 *
 * @param combo Key combination string (e.g. 'ctrl+s', 'mod+k', 'escape', 'alt+n') or array of combinations
 * @param handler Callback invoked when the key combo is pressed
 * @param options Configuration options
 */
export function useHotkeys(
  combo: string | string[],
  handler: (event: KeyboardEvent) => void,
  options: HotkeyOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    enableOnFormTags = false,
  } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const combos = Array.isArray(combo) ? combo : [combo];
    const parsedCombos = combos.map(parseKeyCombo);

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if inside form element unless enabled or modifier key is used
      const inForm = isFormElement(event.target);
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

      for (const parsed of parsedCombos) {
        const { hasCtrl, hasMeta, hasAlt, hasShift, hasMod, key } = parsed;

        // Check modifier keys
        const ctrlMatch = hasMod
          ? isMac
            ? event.metaKey
            : event.ctrlKey
          : hasCtrl
          ? event.ctrlKey
          : !event.ctrlKey;

        const metaMatch = hasMod
          ? isMac
            ? event.metaKey
            : !event.metaKey
          : hasMeta
          ? event.metaKey
          : !event.metaKey;

        const altMatch = hasAlt ? event.altKey : !event.altKey;
        const shiftMatch = hasShift ? event.shiftKey : !event.shiftKey;

        // Key match (case-insensitive or special key names)
        const eventKey = event.key.toLowerCase();
        let keyMatch = false;

        if (key === 'esc' || key === 'escape') {
          keyMatch = eventKey === 'escape';
        } else if (key === 'enter' || key === 'return') {
          keyMatch = eventKey === 'enter';
        } else if (key === 'space') {
          keyMatch = eventKey === ' ' || eventKey === 'spacebar';
        } else if (key === 'slash' || key === '/') {
          keyMatch = eventKey === '/' || event.code === 'Slash';
        } else if (key) {
          keyMatch = eventKey === key.toLowerCase() || event.code.toLowerCase() === `key${key.toLowerCase()}`;
        } else {
          // Combination was just modifier keys (rare)
          keyMatch = true;
        }

        if (ctrlMatch && metaMatch && altMatch && shiftMatch && keyMatch) {
          // If in form element and not enabled on form tags, allow only if Ctrl/Meta/Alt modifier was required
          const hasModifier = hasCtrl || hasMeta || hasAlt || hasMod;
          if (inForm && !enableOnFormTags && !hasModifier) {
            continue;
          }

          if (preventDefault) {
            event.preventDefault();
          }
          if (stopPropagation) {
            event.stopPropagation();
          }

          handlerRef.current(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [combo, enabled, preventDefault, stopPropagation, enableOnFormTags]);
}
