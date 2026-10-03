import React, { useId } from 'react';
import { Switch as AntSwitch, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
  id,
}) => {
  const isDark = useIsDarkMode();
  const generatedId = useId();
  const switchId = id || `switch-${generatedId}`;

  const antSize = size === 'sm' ? 'small' : 'default';

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div className={`flex items-center justify-between gap-3 ${className}`.trim()}>
        {(label || description) && (
          <label htmlFor={switchId} className="flex flex-col cursor-pointer select-none">
            {label && (
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </span>
            )}
          </label>
        )}
        <AntSwitch
          id={switchId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          size={antSize}
        />
      </div>
    </ConfigProvider>
  );
};

export default Switch;
