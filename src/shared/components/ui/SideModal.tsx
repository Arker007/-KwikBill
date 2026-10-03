import React, { ReactNode } from 'react';
import { Drawer as AntDrawer, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidthClass?: string;
  className?: string;
}

export const SideModal: React.FC<SideModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  maxWidthClass = 'max-w-3xl',
  className = '',
}) => {
  const isDark = useIsDarkMode();

  let width: number | string = 720;
  if (maxWidthClass.includes('max-w-xs')) width = 320;
  else if (maxWidthClass.includes('max-w-sm')) width = 384;
  else if (maxWidthClass.includes('max-w-md')) width = 480;
  else if (maxWidthClass.includes('max-w-lg')) width = 560;
  else if (maxWidthClass.includes('max-w-xl')) width = 640;
  else if (maxWidthClass.includes('max-w-2xl')) width = 720;
  else if (maxWidthClass.includes('max-w-3xl')) width = 840;
  else if (maxWidthClass.includes('max-w-4xl')) width = 960;
  else if (maxWidthClass.includes('max-w-5xl')) width = 1100;
  else if (maxWidthClass.includes('max-w-6xl')) width = 1200;

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntDrawer
        open={isOpen}
        onClose={onClose}
        title={title}
        extra={actions}
        size={width as any}
        className={`custom-antd-drawer ${className}`}
        destroyOnHidden
        styles={{
          body: { padding: 0 },
        }}
      >
        <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-[#141414]">
          {children}
        </div>
      </AntDrawer>
    </ConfigProvider>
  );
};

export default SideModal;
