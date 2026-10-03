import React, { ReactNode } from 'react';
import { Popconfirm as AntPopconfirm, ConfigProvider } from 'antd';
import type { TooltipPlacement } from 'antd/es/tooltip';
import { AlertCircle } from 'lucide-react';
import { useIsDarkMode, getAntdTheme } from '../primitives/AntdThemeConfig';

export interface PopconfirmProps {
  title: ReactNode;
  description?: ReactNode;
  onConfirm?: (e?: React.MouseEvent<HTMLElement>) => void | Promise<any>;
  onCancel?: (e?: React.MouseEvent<HTMLElement>) => void;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okType?: 'primary' | 'danger' | 'default';
  icon?: ReactNode;
  placement?: TooltipPlacement;
  disabled?: boolean;
  children: React.ReactElement;
  className?: string;
  id?: string;
}

/**
 * Popconfirm: Lightweight floating confirmation panel anchored near the target element.
 * Prefer this to a full-screen modal when lightweight contextual confirmation is sufficient.
 */
export const Popconfirm: React.FC<PopconfirmProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  okText = 'Yes',
  cancelText = 'No',
  okType = 'primary',
  icon,
  placement = 'top',
  disabled = false,
  children,
  className = '',
}) => {
  const isDark = useIsDarkMode();
  const isDanger = okType === 'danger';

  const defaultIcon = (
    <span className={`inline-flex mr-1.5 align-middle ${isDanger ? 'text-red-500' : 'text-amber-500'}`}>
      <AlertCircle size={15} />
    </span>
  );

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntPopconfirm
        title={title}
        description={description}
        onConfirm={onConfirm}
        onCancel={onCancel}
        okText={okText}
        cancelText={cancelText}
        okButtonProps={{ danger: isDanger, size: 'small' }}
        cancelButtonProps={{ size: 'small' }}
        icon={icon !== undefined ? icon : defaultIcon}
        placement={placement}
        disabled={disabled}
        overlayClassName={className}
      >
        {children}
      </AntPopconfirm>
    </ConfigProvider>
  );
};

export default Popconfirm;
