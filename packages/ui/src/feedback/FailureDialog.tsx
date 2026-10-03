import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { Modal as AntModal, Button as AntButton, ConfigProvider } from 'antd';
import { AlertOctagon, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useIsDarkMode, getAntdTheme } from '../primitives/AntdThemeConfig';

const safeStringifyObj = (obj: any, space?: number): string => {
  const seen = new WeakSet();
  try {
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (
            seen.has(value) ||
            (typeof window !== 'undefined' && value === window) ||
            (typeof document !== 'undefined' && value === document) ||
            value?.constructor?.name === 'Window' ||
            value?.constructor?.name === 'Document'
          ) {
            return '[Circular / Window]';
          }
          seen.add(value);
        }
        return value;
      },
      space
    );
  } catch {
    return String(obj?.message || obj || 'Unknown error');
  }
};

export interface FailureDialogOptions {
  title: string;
  reason?: ReactNode;
  message?: ReactNode; // Alias for reason
  errorCode?: string | number;
  technicalDetails?: string | Record<string, any>;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void | Promise<void>;
  closeLabel?: string;
}

interface FailureDialogState extends FailureDialogOptions {
  id: string;
  resolve: () => void;
}

let failureDispatchFn: ((state: FailureDialogState | null) => void) | null = null;

/**
 * Open a persistent, actionable dialog that explains a failure and its reason.
 * Adheres to Ant Design result feedback guidelines: never rely on transient toasts for important failures.
 */
export function showFailureDialog(options: FailureDialogOptions): Promise<void> {
  return new Promise((resolve) => {
    if (typeof failureDispatchFn !== 'function') {
      window.alert(`FAILURE: ${options.title}\n\n${options.reason || options.message || ''}`);
      resolve();
      return;
    }
    failureDispatchFn({
      ...options,
      id: `failure_${Date.now()}`,
      resolve,
    });
  });
}

export function FailureDialogContainer(): React.ReactElement | null {
  const [current, setCurrent] = useState<FailureDialogState | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const isDark = useIsDarkMode();

  useEffect(() => {
    failureDispatchFn = (state) => {
      setCurrent(state);
      setShowDetails(false);
      setCopied(false);
    };
    return () => {
      failureDispatchFn = null;
    };
  }, []);

  const handleDismiss = useCallback(() => {
    if (current) {
      current.resolve();
      setCurrent(null);
    }
  }, [current]);

  const handleAction = useCallback(async () => {
    if (current?.onAction) {
      await current.onAction();
    }
    handleDismiss();
  }, [current, handleDismiss]);

  const handleSecondaryAction = useCallback(async () => {
    if (current?.onSecondaryAction) {
      await current.onSecondaryAction();
    }
    handleDismiss();
  }, [current, handleDismiss]);

  const handleCopyDetails = () => {
    if (!current) return;
    const textToCopy = [
      `Error: ${current.title}`,
      current.errorCode ? `Code: ${current.errorCode}` : '',
      current.reason || current.message ? `Reason: ${String(current.reason || current.message)}` : '',
      current.technicalDetails
        ? `Technical Details:\n${typeof current.technicalDetails === 'object' ? safeStringifyObj(current.technicalDetails, 2) : current.technicalDetails}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    navigator.clipboard?.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!current) return null;

  const reasonContent = current.reason || current.message;
  const technicalDetails = current.technicalDetails;
  const techDetailsText: string | undefined =
    typeof technicalDetails === 'string'
      ? technicalDetails
      : technicalDetails
        ? safeStringifyObj(technicalDetails, 2)
        : undefined;

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntModal
        open={true}
        onCancel={handleDismiss}
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertOctagon size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 m-0">
                {current.title}
              </h3>
              {current.errorCode && (
                <span className="text-[11px] font-mono text-red-600 dark:text-red-400">
                  Error Code: {current.errorCode}
                </span>
              )}
            </div>
          </div>
        }
        footer={[
          <AntButton key="close" onClick={handleDismiss}>
            {current.closeLabel || 'Dismiss'}
          </AntButton>,
          current.secondaryActionLabel && (
            <AntButton key="secondary" onClick={handleSecondaryAction}>
              {current.secondaryActionLabel}
            </AntButton>
          ),
          current.actionLabel && (
            <AntButton key="primary" type="primary" danger onClick={handleAction}>
              {current.actionLabel}
            </AntButton>
          ),
        ].filter(Boolean)}
        width={480}
        centered
        destroyOnHidden
      >
        <div className="py-2 flex flex-col gap-3">
          {reasonContent && (
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed m-0 whitespace-pre-wrap">
              {reasonContent}
            </p>
          )}

          {techDetailsText && (
            <div className="mt-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <span>Technical details & logs</span>
                {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showDetails && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-end mb-1">
                    <button
                      type="button"
                      onClick={handleCopyDetails}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy log'}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-black/40 p-2 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-40 whitespace-pre-wrap select-all m-0">
                    {techDetailsText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </AntModal>
    </ConfigProvider>
  );
}

export default FailureDialogContainer;
