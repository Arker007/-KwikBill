import React, { ReactNode } from 'react';
import { Badge as AntBadge, ConfigProvider } from 'antd';
import type { PresetStatusColorType } from 'antd/es/_util/colors';
import { useIsDarkMode, getAntdTheme } from '../primitives/AntdThemeConfig';

export interface BadgeProps {
  count?: ReactNode;
  dot?: boolean;
  overflowCount?: number;
  showZero?: boolean;
  status?: PresetStatusColorType;
  color?: string;
  text?: ReactNode;
  size?: 'default' | 'small';
  offset?: [number | string, number | string];
  title?: string;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Badge: Aggregated message indicators.
 * Position at the upper-right of icons/avatars or after titles when no icon exists.
 * Use precise numeric counts for important, user-relevant information;
 * use a red dot for lower-priority or less personally relevant updates.
 */
export const Badge: React.FC<BadgeProps> = ({
  count,
  dot = false,
  overflowCount = 99,
  showZero = false,
  status,
  color,
  text,
  size = 'default',
  offset,
  title,
  children,
  className = '',
  style,
}) => {
  const isDark = useIsDarkMode();

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntBadge
        count={count}
        dot={dot}
        overflowCount={overflowCount}
        showZero={showZero}
        status={status}
        color={color}
        text={text}
        size={size === 'default' ? undefined : size}
        offset={offset}
        title={title}
        className={className}
        style={style}
      >
        {children}
      </AntBadge>
    </ConfigProvider>
  );
};

export default Badge;
