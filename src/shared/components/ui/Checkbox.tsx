import React, { forwardRef, useId } from 'react';
import { Checkbox as AntCheckbox, ConfigProvider } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  containerClassName?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      containerClassName = '',
      className = '',
      id,
      disabled,
      checked,
      defaultChecked,
      onChange,
      indeterminate,
      ...props
    },
    ref
  ) => {
    const isDark = useIsDarkMode();
    const generatedId = useId();
    const checkboxId = id || `checkbox-${generatedId}`;

    const handleChange = (e: CheckboxChangeEvent) => {
      if (!onChange) return;
      try {
        const syntheticEvent = {
          target: {
            type: 'checkbox',
            checked: e.target.checked,
            name: (props as any).name || checkboxId,
            id: checkboxId,
            value: (props as any).value || 'on',
          },
          currentTarget: {
            type: 'checkbox',
            checked: e.target.checked,
            name: (props as any).name || checkboxId,
            id: checkboxId,
            value: (props as any).value || 'on',
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
      } catch {
        (onChange as any)(e);
      }
    };

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div className={`flex items-start gap-2.5 select-none ${containerClassName}`.trim()}>
          <AntCheckbox
            id={checkboxId}
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            indeterminate={indeterminate}
            onChange={handleChange}
            className={className}
          >
            {(label || description) && (
              <span className="inline-flex flex-col ml-1">
                {label && (
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {label}
                  </span>
                )}
                {description && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {description}
                  </span>
                )}
              </span>
            )}
          </AntCheckbox>
        </div>
      </ConfigProvider>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
