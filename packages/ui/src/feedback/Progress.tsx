import React, { ReactNode } from 'react';
import { Progress as AntProgress, Modal as AntModal, Button as AntButton, ConfigProvider } from 'antd';
import { Loader2, AlertCircle } from 'lucide-react';
import { useIsDarkMode, getAntdTheme } from '../primitives/AntdThemeConfig';

export interface ProgressBarProps {
  percent?: number;
  status?: 'normal' | 'exception' | 'active' | 'success';
  showInfo?: boolean;
  strokeColor?: string | { from: string; to: string };
  size?: 'default' | 'small';
  className?: string;
  format?: (percent?: number, successPercent?: number) => ReactNode;
}

/**
 * ProgressBar: Linear progress indicator.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent = 0,
  status = 'normal',
  showInfo = true,
  strokeColor,
  size = 'default',
  className = '',
  format,
}) => {
  const isDark = useIsDarkMode();

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntProgress
        percent={Math.min(100, Math.max(0, Math.round(percent)))}
        status={status}
        showInfo={showInfo}
        strokeColor={strokeColor}
        size={size === 'small' ? 'small' : undefined}
        className={className}
        format={format}
      />
    </ConfigProvider>
  );
};

export interface ProgressCircleProps {
  percent?: number;
  status?: 'normal' | 'exception' | 'success';
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  format?: (percent?: number) => ReactNode;
  className?: string;
}

/**
 * ProgressCircle: Circular progress indicator.
 */
export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percent = 0,
  status = 'normal',
  size = 64,
  strokeWidth = 6,
  strokeColor,
  format,
  className = '',
}) => {
  const isDark = useIsDarkMode();

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntProgress
        type="circle"
        percent={Math.min(100, Math.max(0, Math.round(percent)))}
        status={status}
        size={size}
        strokeWidth={strokeWidth}
        strokeColor={strokeColor}
        format={format}
        className={className}
      />
    </ConfigProvider>
  );
};

export interface LongOperationModalProps {
  open: boolean;
  title: ReactNode;
  statusText?: ReactNode;
  percent?: number;
  status?: 'normal' | 'exception' | 'active' | 'success';
  cancellable?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  icon?: ReactNode;
}

/**
 * LongOperationModal: For operations taking noticeably long (>2 seconds).
 * Displays current status and progress, and provides cancellation for prolonged operations.
 */
export const LongOperationModal: React.FC<LongOperationModalProps> = ({
  open,
  title,
  statusText,
  percent = 0,
  status = 'active',
  cancellable = true,
  cancelLabel = 'Cancel Operation',
  onCancel,
  icon,
}) => {
  const isDark = useIsDarkMode();

  const defaultIcon = (
    <Loader2 size={22} className="animate-spin text-blue-600 dark:text-blue-400" />
  );

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntModal
        open={open}
        closable={false}
        footer={
          cancellable && onCancel ? (
            <div className="flex justify-end pt-2">
              <AntButton onClick={onCancel} danger>
                {cancelLabel}
              </AntButton>
            </div>
          ) : null
        }
        centered
        width={440}
        destroyOnHidden
      >
        <div className="py-2 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 shrink-0">
              {icon || defaultIcon}
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 m-0">
                {title}
              </h4>
              {statusText && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
                  {statusText}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <AntProgress
              percent={Math.min(100, Math.max(0, Math.round(percent)))}
              status={status}
              strokeColor={{
                from: '#1677ff',
                to: '#52c41a',
              }}
            />
          </div>
        </div>
      </AntModal>
    </ConfigProvider>
  );
};

export default ProgressBar;
