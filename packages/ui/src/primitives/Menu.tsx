import React, { ReactNode } from 'react';
import { Menu as AntMenu, ConfigProvider } from 'antd';
import type { MenuProps as AntMenuProps } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface MenuItemType {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  children?: MenuItemType[];
  disabled?: boolean;
  danger?: boolean;
  type?: 'group' | 'divider';
  onClick?: () => void;
}

export interface MenuProps {
  items: MenuItemType[];
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  mode?: 'horizontal' | 'vertical' | 'inline';
  theme?: 'light' | 'dark';
  inlineCollapsed?: boolean;
  onSelect?: (info: { key: string; keyPath: string[]; selectedKeys: string[] }) => void;
  onOpenChange?: (openKeys: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

/**
 * Ant Design Navigation System - Menu Component
 * 
 * Spec Rules:
 * - TOP NAVIGATION: Horizontal links for landing pages and consumer-facing apps.
 *   Use 2-7 first-level items, each label <15 characters.
 * - SIDE NAVIGATION: Vertical/inline, downward-extensible menu for dashboards,
 *   multi-level structures and operation-intensive applications. Supports scrolling.
 */
export const Menu: React.FC<MenuProps> = ({
  items,
  selectedKeys,
  defaultSelectedKeys,
  openKeys,
  defaultOpenKeys,
  mode = 'inline',
  theme,
  inlineCollapsed,
  onSelect,
  onOpenChange,
  className = '',
  style,
  id,
}) => {
  const isDark = useIsDarkMode();
  const effectiveTheme = theme || (isDark ? 'dark' : 'light');

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div id={id} className={`ant-menu-container ${className}`.trim()} style={style}>
        <AntMenu
          items={items as any}
          selectedKeys={selectedKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          openKeys={openKeys}
          defaultOpenKeys={defaultOpenKeys}
          mode={mode}
          theme={effectiveTheme}
          inlineCollapsed={inlineCollapsed}
          onSelect={onSelect}
          onOpenChange={onOpenChange}
          className="border-none"
        />
      </div>
    </ConfigProvider>
  );
};

export default Menu;
