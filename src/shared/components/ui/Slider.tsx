import React, { forwardRef, useId } from 'react';
import { Slider as AntSlider, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | number) => void;
  containerClassName?: string;
  showValueBadge?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      min = 0,
      max = 100,
      step = 1,
      value = 0,
      onChange,
      containerClassName = '',
      className = '',
      id,
      disabled,
      showValueBadge = true,
      ...props
    },
    ref
  ) => {
    const isDark = useIsDarkMode();
    const generatedId = useId();
    const sliderId = id || `slider-${generatedId}`;

    const handleChange = (val: number) => {
      if (!onChange) return;
      try {
        const syntheticEvent = {
          target: { value: String(val), name: (props as any).name || sliderId, id: sliderId },
          currentTarget: { value: String(val), name: (props as any).name || sliderId, id: sliderId },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        (onChange as any)(syntheticEvent);
      } catch {
        (onChange as any)(val);
      }
    };

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div className={`form-group w-full ${containerClassName}`.trim()}>
          {(label || showValueBadge) && (
            <div className="flex items-center justify-between mb-1">
              {label && (
                <label htmlFor={sliderId} className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {label}
                </label>
              )}
              {showValueBadge && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-[4px] bg-[#e6f4ff] dark:bg-[rgba(22,119,255,0.2)] text-[#1677ff] dark:text-[#69b1ff]">
                  {value}%
                </span>
              )}
            </div>
          )}
          <AntSlider
            id={sliderId}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            className={`w-full ${className}`.trim()}
          />
        </div>
      </ConfigProvider>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
