import React, { ReactNode } from 'react';
import { Tabs as AntTabs, Segmented, ConfigProvider } from 'antd';
import type { TabsProps as AntTabsProps } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  count?: number | string;
  badge?: ReactNode;
  disabled?: boolean;
  children?: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'basic' | 'line' | 'card' | 'pill' | 'vertical';
  tabPosition?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'small' | 'middle' | 'large';
  centered?: boolean;
  className?: string;
  tabBarExtraContent?: ReactNode;
  id?: string;
}

/**
 * Ant Design Navigation System - Tabs Component
 * 
 * Spec Rules:
 * - Categorizes substantial content by business logic or state, enabling in-place switching without page transitions.
 * - Keep category labels <15 characters.
 * - BASIC (line): Switch core functions or entire-page content.
 * - CARD: Switch content within a bordered, visually separated page section.
 * - PILL: Quick switching inside small sections/cards.
 * - VERTICAL: Accommodate numerous categories in a vertically extensible tab list.
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'basic',
  tabPosition = variant === 'vertical' ? 'left' : 'top',
  size = 'middle',
  centered = false,
  className = '',
  tabBarExtraContent,
  id,
}) => {
  const isDark = useIsDarkMode();

  if (variant === 'pill') {
    const segmentedOptions = tabs.map((tab) => ({
      value: tab.id,
      disabled: tab.disabled,
      label: (
        <span className="inline-flex items-center gap-1.5 px-1 py-0.5 text-xs truncate max-w-[140px]">
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          <span className="truncate">{tab.label}</span>
          {tab.count !== undefined && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#1677ff] dark:text-[#4096ff] font-semibold">
              {tab.count}
            </span>
          )}
          {tab.badge}
        </span>
      ),
    }));

    const activeContent = tabs.find((t) => t.id === activeTab)?.children;

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div id={id} className={`ant-segmented-tabs-wrapper ${className}`.trim()}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <Segmented
              options={segmentedOptions}
              value={activeTab}
              onChange={(val) => onChange(String(val))}
              size={size === 'large' ? 'large' : size === 'small' ? 'small' : 'middle'}
            />
            {tabBarExtraContent && <div>{tabBarExtraContent}</div>}
          </div>
          {activeContent && <div className="tab-pane-content mt-2">{activeContent}</div>}
        </div>
      </ConfigProvider>
    );
  }

  const antType = variant === 'card' ? 'card' : 'line';

  const items = tabs.map((tab) => ({
    key: tab.id,
    disabled: tab.disabled,
    label: (
      <span className="inline-flex items-center gap-2 max-w-[180px]">
        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
        <span className="truncate">{tab.label}</span>
        {tab.count !== undefined && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#1677ff] dark:text-[#4096ff] font-semibold">
            {tab.count}
          </span>
        )}
        {tab.badge}
      </span>
    ),
    children: tab.children,
  }));

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div id={id} className={`custom-antd-tabs ${className}`.trim()}>
        <AntTabs
          activeKey={activeTab}
          onChange={onChange}
          type={antType}
          tabPosition={tabPosition}
          size={size}
          centered={centered}
          tabBarExtraContent={tabBarExtraContent}
          items={items}
        />
      </div>
    </ConfigProvider>
  );
};

export default Tabs;
