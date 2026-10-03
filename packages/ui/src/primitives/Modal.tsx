import React, { ReactNode } from 'react';
import { Modal as AntModal, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  maxWidthClass?: string;
  className?: string;
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  footer,
  maxWidthClass = 'max-w-lg',
  className = '',
  closeOnOverlayClick = true,
}) => {
  const isDark = useIsDarkMode();

  // Determine width based on maxWidthClass
  let width: number | string = 520;
  if (maxWidthClass.includes('max-w-xs')) width = 320;
  else if (maxWidthClass.includes('max-w-sm')) width = 384;
  else if (maxWidthClass.includes('max-w-md')) width = 448;
  else if (maxWidthClass.includes('max-w-lg')) width = 512;
  else if (maxWidthClass.includes('max-w-xl')) width = 576;
  else if (maxWidthClass.includes('max-w-2xl')) width = 672;
  else if (maxWidthClass.includes('max-w-3xl')) width = 768;
  else if (maxWidthClass.includes('max-w-4xl')) width = 896;
  else if (maxWidthClass.includes('max-w-5xl')) width = 1024;
  else if (maxWidthClass.includes('max-w-6xl')) width = 1152;
  else if (maxWidthClass.includes('max-w-7xl')) width = 1280;

  const effectiveFooter = actions || footer ? (
    <div className="flex items-center justify-end gap-3 pt-2">
      {footer || actions}
    </div>
  ) : null;

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntModal
        open={isOpen}
        onCancel={onClose}
        title={title}
        footer={effectiveFooter}
        width={width}
        maskClosable={closeOnOverlayClick}
        centered
        className={`custom-antd-modal ${className}`}
        destroyOnHidden
      >
        <div className="py-2 text-slate-700 dark:text-slate-200">
          {children}
        </div>
      </AntModal>
    </ConfigProvider>
  );
};

export default Modal;
