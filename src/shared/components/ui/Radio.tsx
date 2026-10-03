import React, { forwardRef, useId } from 'react';
import { Radio as AntRadio, ConfigProvider } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface RadioOption {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  containerClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      containerClassName = '',
      className = '',
      id,
      disabled,
      checked,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const isDark = useIsDarkMode();
    const generatedId = useId();
    const radioId = id || `radio-${generatedId}`;

    const handleChange = (e: RadioChangeEvent) => {
      if (!onChange) return;
      try {
        const syntheticEvent = {
          target: {
            type: 'radio',
            checked: e.target.checked,
            value: e.target.value ?? value,
            name: (props as any).name || radioId,
            id: radioId,
          },
          currentTarget: {
            type: 'radio',
            checked: e.target.checked,
            value: e.target.value ?? value,
            name: (props as any).name || radioId,
            id: radioId,
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
          <AntRadio
            id={radioId}
            disabled={disabled}
            checked={checked}
            value={value}
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
          </AntRadio>
        </div>
      </ConfigProvider>
    );
  }
);

Radio.displayName = 'Radio';

export interface RadioGroupProps {
  name?: string;
  options: RadioOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  direction?: 'horizontal' | 'vertical';
  containerClassName?: string;
  label?: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  direction = 'horizontal',
  containerClassName = '',
  label,
}) => {
  const isDark = useIsDarkMode();

  const handleGroupChange = (e: RadioChangeEvent) => {
    onChange?.(e.target.value);
  };

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div className={`form-group ${containerClassName}`.trim()}>
        {label && (
          <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {label}
          </label>
        )}
        <AntRadio.Group
          name={name}
          value={value}
          onChange={handleGroupChange}
          className={`flex ${direction === 'vertical' ? 'flex-col gap-2' : 'flex-row items-center gap-4 flex-wrap'}`}
        >
          {options.map((opt) => (
            <AntRadio key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </AntRadio>
          ))}
        </AntRadio.Group>
      </div>
    </ConfigProvider>
  );
};

export default Radio;
