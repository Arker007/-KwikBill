import React, { ReactNode } from 'react';
import { Popover as AntPopover, ConfigProvider } from 'antd';
import type { TooltipPlacement } from 'antd/es/tooltip';
import { useIsDarkMode, getAntdTheme } from '../primitives/AntdThemeConfig';

export interface PopoverProps {
  title?: ReactNode;
  content: ReactNode;
  trigger?: 'hover' | 'focus' | 'click';
  placement?: TooltipPlacement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  arrow?: boolean;
  children: React.ReactElement;
  className?: string;
  overlayClassName?: string;
}

/**
 * Popover: Contextual card shown in response to user interaction.
 * Supports supplementary descriptions and related actions (including links and buttons).
 * Use when Tooltip content is insufficient.
 */
export const Popover: React.FC<PopoverProps> = ({
  title,
  content,
  trigger = 'hover',
  placement = 'top',
  open,
  onOpenChange,
  arrow = true,
  children,
  className = '',
  overlayClassName = '',
}) => {
  const isDark = useIsDarkMode();

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntPopover
        title={title}
        content={content}
        trigger={trigger}
        placement={placement}
        open={open}
        onOpenChange={onOpenChange}
        arrow={arrow}
        className={className}
        overlayClassName={overlayClassName}
      >
        {children}
      </AntPopover>
    </ConfigProvider>
  );
};

export default Popover;
