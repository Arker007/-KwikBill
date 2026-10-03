import React, { ReactNode } from 'react';
import { Alert as AntAlert, Button as AntButton, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from '../primitives/AntdThemeConfig';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

export interface AlertProps {
  type?: AlertType;
  message?: ReactNode;
  title?: ReactNode; // Alias for message
  description?: ReactNode;
  children?: ReactNode; // Fallback for description
  showIcon?: boolean;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDismiss?: () => void; // Alias for onClose
  action?: {
    label: string;
    onClick: () => void;
  } | ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  banner?: boolean;
  className?: string;
  id?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  title,
  description,
  children,
  showIcon = true,
  icon,
  closable,
  onClose,
  onDismiss,
  action,
  actionLabel,
  onAction,
  banner = false,
  className = '',
  id,
}) => {
  const isDark = useIsDarkMode();

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClose) onClose(e);
    if (onDismiss) onDismiss();
  };

  let actionNode: ReactNode = undefined;
  if (React.isValidElement(action)) {
    actionNode = action;
  } else if (action && typeof action === 'object' && 'label' in action && 'onClick' in action) {
    actionNode = (
      <AntButton size="small" type="primary" onClick={(action as any).onClick}>
        {(action as any).label}
      </AntButton>
    );
  } else if (actionLabel && onAction) {
    actionNode = (
      <AntButton size="small" type="primary" onClick={onAction}>
        {actionLabel}
      </AntButton>
    );
  }

  const effectiveTitle = message || title;
  const effectiveDescription = description || children;
  const effectiveClosable = closable !== undefined ? closable : Boolean(onClose || onDismiss);

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div id={id} className={`w-full ${className}`.trim()}>
        <AntAlert
          type={type}
          title={effectiveTitle}
          description={effectiveDescription}
          showIcon={showIcon}
          icon={icon}
          closable={effectiveClosable}
          onClose={handleClose}
          action={actionNode}
          banner={banner}
          className="rounded-lg border shadow-xs"
        />
      </div>
    </ConfigProvider>
  );
};

export default Alert;
