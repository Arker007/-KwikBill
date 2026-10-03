import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal as AntModal, Button as AntButton, Input as AntInput, ConfigProvider } from 'antd';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react';
import { useIsDarkMode, getAntdTheme } from '../primitives/AntdThemeConfig';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'default';
}

export interface PromptOptions {
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  inputType?: 'text' | 'number' | string;
}

type ModalKind = 'confirm' | 'prompt';

interface ModalState {
  kind: ModalKind;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'default';
  defaultValue?: string;
  placeholder?: string;
  inputType?: string;
  resolve: (value: any) => void;
}

let dispatchFn: ((modal: ModalState | null) => void) | null = null;

/**
 * Open an in-app confirmation modal using Ant Design.
 */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof dispatchFn !== 'function') {
      // Container not mounted yet — fall back to native so calls made
      // pre-mount don't silently return undefined.
      resolve(window.confirm(options?.message || options?.title || 'Are you sure?'));
      return;
    }
    dispatchFn({ ...options, kind: 'confirm', resolve });
  });
}

/**
 * Open an in-app text-prompt modal using Ant Design.
 */
export function promptAction(options: PromptOptions): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof dispatchFn !== 'function') {
      resolve(window.prompt(options?.message || options?.title || '', options?.defaultValue || ''));
      return;
    }
    dispatchFn({ ...options, kind: 'prompt', resolve });
  });
}

export function ConfirmModalContainer(): React.ReactElement | null {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [value, setValue] = useState<string>('');
  const inputRef = useRef<any>(null);
  const isDark = useIsDarkMode();

  const dispatch = useCallback((next: ModalState | null) => {
    setModal(next);
    setValue(next?.defaultValue || '');
  }, []);

  useEffect(() => {
    dispatchFn = dispatch;
    return () => { dispatchFn = null; };
  }, [dispatch]);

  useEffect(() => {
    if (modal?.kind === 'prompt' && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus?.();
        inputRef.current?.select?.();
      }, 50);
    }
  }, [modal]);

  const cancel = useCallback(() => {
    if (!modal) return;
    modal.resolve(modal.kind === 'prompt' ? null : false);
    setModal(null);
  }, [modal]);

  const confirm = useCallback(() => {
    if (!modal) return;
    modal.resolve(modal.kind === 'prompt' ? value : true);
    setModal(null);
  }, [modal, value]);

  if (!modal) return null;

  const tone = modal.tone || 'default';
  const isDanger = tone === 'danger';
  const isWarning = tone === 'warning';
  const Icon = isDanger ? Trash2 : isWarning ? AlertTriangle : HelpCircle;
  const iconColor = isDanger ? '#ff4d4f' : isWarning ? '#faad14' : '#1677ff';
  const iconBg = isDanger ? 'rgba(255, 77, 79, 0.12)' : isWarning ? 'rgba(250, 173, 20, 0.12)' : 'rgba(22, 119, 255, 0.12)';

  const primaryLabel = modal.confirmLabel || (modal.kind === 'prompt' ? 'OK' : (isDanger ? 'Delete' : 'Confirm'));
  const secondaryLabel = modal.cancelLabel || 'Cancel';

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntModal
        open={true}
        onCancel={cancel}
        title={
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: iconBg,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{modal.title}</span>
          </div>
        }
        footer={[
          <AntButton key="cancel" onClick={cancel}>
            {secondaryLabel}
          </AntButton>,
          <AntButton
            key="confirm"
            type="primary"
            danger={isDanger}
            onClick={confirm}
          >
            {primaryLabel}
          </AntButton>,
        ]}
        width={440}
        centered
        destroyOnHidden
      >
        <div className="py-2 flex flex-col gap-3">
          {modal.message && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap m-0">
              {modal.message}
            </p>
          )}
          {modal.kind === 'prompt' && (
            <form onSubmit={(e) => { e.preventDefault(); confirm(); }}>
              <AntInput
                ref={inputRef}
                type={modal.inputType || 'text'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={modal.placeholder || ''}
                className="mt-2"
                autoFocus
              />
            </form>
          )}
        </div>
      </AntModal>
    </ConfigProvider>
  );
}

export default ConfirmModalContainer;

