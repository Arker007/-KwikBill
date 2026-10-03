import React, { ReactNode } from 'react';
import { Alert as AntAlert, Button, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from '../ui/AntdThemeConfig';

export interface AlertBannerProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: ReactNode;
  children?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
  id?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  title,
  children,
  description,
  icon,
  action,
  actionLabel,
  onAction,
  onDismiss,
  className = '',
  id,
}) => {
  const isDark = useIsDarkMode();

  const handleActionClick = () => {
    if (action) {
      action.onClick();
    } else if (onAction) {
      onAction();
    }
  };

  const labelText = action ? action.label : actionLabel;

  const actionNode = labelText ? (
    <Button size="small" type="primary" onClick={handleActionClick}>
      {labelText}
    </Button>
  ) : undefined;

  const descContent = description || children;

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div id={id} className={className}>
        <AntAlert
          type={type}
          title={title}
          description={descContent}
          action={actionNode}
          icon={icon}
          closable={Boolean(onDismiss)}
          onClose={onDismiss}
          showIcon
          className="rounded-xl border shadow-xs"
        />
      </div>
    </ConfigProvider>
  );
};

export default AlertBanner;

