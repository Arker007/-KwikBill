import React, { forwardRef, useId } from 'react';
import { ColorPicker as AntColorPicker, ConfigProvider } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface ColorPickerProps {
  label?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  presets?: string[];
  containerClassName?: string;
  disabled?: boolean;
}

const defaultPresets = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#141414',
];

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  (
    {
      label,
      value = '#1677ff',
      onChange,
      presets = defaultPresets,
      containerClassName = '',
      disabled = false,
    },
    ref
  ) => {
    const isDark = useIsDarkMode();
    const generatedId = useId();
    const colorId = `colorpicker-${generatedId}`;

    const handleChange = (color: Color, hex: string) => {
      onChange?.(hex || color.toHexString());
    };

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div className={`form-group ${containerClassName}`.trim()}>
          {label && (
            <label htmlFor={colorId} className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {label}
            </label>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <AntColorPicker
              {...({ id: colorId } as any)}
              value={value}
              disabled={disabled}
              showText
              onChange={handleChange}
              presets={[
                {
                  label: 'Recommended',
                  colors: presets,
                },
              ]}
            />
          </div>
        </div>
      </ConfigProvider>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
