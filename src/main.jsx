import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from '@/App.jsx'
import './index.css'

// Suppress React 19 legacy `.ref` deprecation warnings from third-party UI libraries in node_modules
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = String(args[0] || '');
  if (msg.includes('element.ref was removed') || msg.includes('Accessing element.ref')) {
    return;
  }
  originalConsoleError(...args);
};

// v1.10.2 — Deferred SW update. Prior code called `updateSW(true)`
// inside `onNeedRefresh` which triggers `location.reload()` immediately.
// If the user was mid-invoice (typing line items, editing terms), that
// state was blown away on every deploy.
//
// v1.10.33 — Reported "it work in incognito only ... it should auto
// refresh hard cache after update". Root cause: v1.10.2's deferred
// pattern only fired the update on blur, but if the user never blurred
// the tab AND the old bundle hashes stopped matching the new
// index.html assets, the tab served a broken bundle → white screen.
// Now:
//   1. onNeedRefresh: stash flag + dispatch event (existing UI hook).
//   2. Auto-apply after 20 seconds of no user activity — long enough
//      that a mid-form user can save/finish, short enough that we
//      don't wait for a browser blur that may never come.
//   3. Still auto-apply on blur (fastest safe moment).
//   4. Also auto-apply immediately if the user is on a read-only view
//      (dashboard, clients, reports). Detected via presence of ANY
//      `contenteditable`, `<input>`, or `<textarea>` with a non-empty
//      value — if none, we're not editing.
let __updateSW = null;
window.__fgsbSwUpdateReady = false;

const isDev = Boolean(import.meta.env.DEV);
const isIframe = typeof window !== 'undefined' && window.self !== window.top;

// In development or when running inside an iframe (AI Studio preview),
// active service workers cause stale bundle caching and reload loops.
// Unregister them and skip PWA service worker lifecycle auto-reloads.
if (isDev || isIframe) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        reg.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
} else {
  // Production standalone registration: notify UI without aggressive auto-reload
  try {
    __updateSW = registerSW({
      onNeedRefresh() {
        window.__fgsbSwUpdateReady = true;
        window.dispatchEvent(new CustomEvent('fgsb-sw-update-ready'));
      },
      onOfflineReady() {
        window.dispatchEvent(new CustomEvent('fgsb-sw-offline-ready'));
      },
    });
  } catch {
    /* non-blocking */
  }
}

// User-initiated or non-destructive SW update trigger
window.__fgsbApplyUpdate = () => {
  if (!window.__fgsbSwUpdateReady) return;
  window.__fgsbSwUpdateReady = false;
  if (__updateSW) __updateSW(true);
};

// Safe rate-limited reload helper to permanently prevent reload loops
const safeReloadOnce = () => {
  try {
    const KEY = '__fgsb_last_chunk_reload';
    const last = Number(sessionStorage.getItem(KEY) || '0');
    const now = Date.now();
    if (now - last < 30000) {
      // Already reloaded in the last 30 seconds; abort to avoid infinite loop
      return;
    }
    sessionStorage.setItem(KEY, String(now));
    window.location.reload();
  } catch {
    /* storage blocked */
  }
};

if (!isDev && !isIframe && 'serviceWorker' in navigator) {
  // Chunk-load safety net with rate-limiting guard
  window.addEventListener('error', (e) => {
    const msg = String(e?.message || e?.error?.message || '');
    if (/dynamically imported module|Loading chunk|Failed to fetch dynamically/i.test(msg)) {
      safeReloadOnce();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    const msg = String(e?.reason?.message || e?.reason || '');
    if (/dynamically imported module|Loading chunk|Failed to fetch dynamically/i.test(msg)) {
      safeReloadOnce();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
