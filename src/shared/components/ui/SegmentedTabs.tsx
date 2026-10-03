import React from 'react';
import { Segmented as AntSegmented, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface SegmentedTabOption {
  key: string;
  label: string;
  count?: number;
  dotColor?: string;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export interface SegmentedTabsProps {
  options: SegmentedTabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  size?: 'sm' | 'md';
  className?: string;
  id?: string;
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  options,
  activeKey,
  onChange,
  size = 'md',
  className = '',
  id,
}) => {
  const isDark = useIsDarkMode();
  const antSize = size === 'sm' ? 'small' : 'middle';

  const segmentedOptions = options.map((opt) => ({
    value: opt.key,
    label: (
      <span className="inline-flex items-center gap-1.5 py-0.5">
        {opt.dotColor && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: opt.dotColor }}
          />
        )}
        <span>{opt.label}</span>
        {typeof opt.count === 'number' && (
          <span
            className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
              opt.key === activeKey
                ? 'bg-blue-100 text-[#1677ff] dark:bg-blue-950/60 dark:text-[#4096ff]'
                : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {opt.count}
          </span>
        )}
      </span>
    ),
  }));

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div id={id} className={`inline-block ${className}`.trim()}>
        <AntSegmented
          value={activeKey}
          onChange={(val) => onChange(String(val))}
          options={segmentedOptions}
          size={antSize}
        />
      </div>
    </ConfigProvider>
  );
};

export default SegmentedTabs;
