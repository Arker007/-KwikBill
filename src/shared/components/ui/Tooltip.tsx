import React from 'react';
import { Tooltip as AntTooltip, ConfigProvider } from 'antd';
import type { TooltipPlacement as AntTooltipPlacement } from 'antd/es/tooltip';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  title: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  placement = 'top',
  delay = 150,
  className = '',
}) => {
  const isDark = useIsDarkMode();

  if (!title) return children;

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntTooltip
        title={title}
        placement={placement as AntTooltipPlacement}
        mouseEnterDelay={delay / 1000}
        rootClassName={className}
      >
        {children}
      </AntTooltip>
    </ConfigProvider>
  );
};

export default Tooltip;
