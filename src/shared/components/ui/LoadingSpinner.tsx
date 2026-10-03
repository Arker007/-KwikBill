import React from 'react';
import { Spin as AntSpin, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullPage = false,
  className = '',
}) => {
  const isDark = useIsDarkMode();
  const antSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'default';

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`.trim()}>
      <AntSpin size={antSize} description={text} />
    </div>
  );

  if (fullPage) {
    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xs">
          {spinnerContent}
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      {spinnerContent}
    </ConfigProvider>
  );
};

export default LoadingSpinner;
