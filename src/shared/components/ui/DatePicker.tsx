import React, { forwardRef, useId, useEffect, useState } from 'react';
import { DatePicker as AntDatePicker, ConfigProvider, theme as antdTheme } from 'antd';
import type { DatePickerProps as AntDatePickerProps } from 'antd';
import type { RangePickerProps as AntRangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export type DatePickerSize = 'sm' | 'md' | 'lg' | 'small' | 'middle' | 'large';

export interface DatePickerProps extends Omit<AntDatePickerProps, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  label?: React.ReactNode;
  error?: string | boolean;
  helperText?: React.ReactNode;
  pickerSize?: 'sm' | 'md' | 'lg';
  size?: DatePickerSize;
  fullWidth?: boolean;
  containerClassName?: string;
  className?: string;
  id?: string;
  name?: string;
  value?: string | Dayjs | Date | null;
  defaultValue?: string | Dayjs | Date | null;
  onChange?: ((e: { target: { value: string; name?: string; id?: string } }) => void) | ((date: Dayjs | null, dateString: string | string[]) => void) | any;
  onValueChange?: (dateString: string, date: Dayjs | null) => void;
  onClear?: () => void;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  showNetPresets?: boolean;
  baseDate?: string | Dayjs | Date | null;
}

export interface DateRangePickerProps extends Omit<AntRangePickerProps, 'size' | 'value' | 'onChange'> {
  label?: React.ReactNode;
  error?: string | boolean;
  helperText?: React.ReactNode;
  pickerSize?: 'sm' | 'md' | 'lg';
  size?: DatePickerSize;
  fullWidth?: boolean;
  containerClassName?: string;
  className?: string;
  id?: string;
  name?: string;
  value?: [string | Dayjs | Date | null, string | Dayjs | Date | null] | null;
  onChange?: ((dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => void) | ((e: { target: { value: [string, string]; name?: string } }) => void) | any;
  onRangeChange?: (dateStrings: [string, string], dates: [Dayjs | null, Dayjs | null] | null) => void;
  format?: string;
  placeholder?: [string, string];
  disabled?: boolean;
}

const mapSizeToAntd = (size?: DatePickerSize, pickerSize?: 'sm' | 'md' | 'lg'): 'small' | 'middle' | 'large' => {
  const effective = pickerSize || size;
  if (effective === 'sm' || effective === 'small') return 'small';
  if (effective === 'lg' || effective === 'large') return 'large';
  return 'middle';
};

const parseDayjsValue = (val: any, format = 'YYYY-MM-DD'): Dayjs | null => {
  if (!val) return null;
  if (dayjs.isDayjs(val)) return val.isValid() ? val : null;
  if (val instanceof Date) {
    const d = dayjs(val);
    return d.isValid() ? d : null;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const parsed = dayjs(trimmed, [format, 'YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD', 'YYYY-MM-DDTHH:mm:ss.SSSZ']);
    if (parsed.isValid()) return parsed;
    const fallback = dayjs(trimmed);
    return fallback.isValid() ? fallback : null;
  }
  return null;
};

function useIsDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
      setIsDark(dark);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

const NetPresetsFooter = ({
  onSelectDate,
  baseDate,
  currentValue,
  format = 'YYYY-MM-DD',
}: {
  onSelectDate: (d: Dayjs) => void;
  baseDate?: any;
  currentValue?: Dayjs | null;
  format?: string;
}) => {
  const [customDays, setCustomDays] = useState('');
  const anchor = parseDayjsValue(baseDate, format) || dayjs();

  const handleApplyDays = (days: number) => {
    const targetDate = days === 0 ? dayjs() : anchor.add(days, 'day');
    onSelectDate(targetDate);
  };

  const isNetSelected = (days: number) => {
    if (!currentValue || !currentValue.isValid()) return false;
    const targetDate = days === 0 ? dayjs() : anchor.add(days, 'day');
    return currentValue.isSame(targetDate, 'day');
  };

  return (
    <div className="p-2 border-t border-slate-100 dark:border-slate-800 space-y-2 select-none">
      {/* Row 1 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleApplyDays(0)}
          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            isNetSelected(0)
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-semibold'
              : 'bg-[#f7fee7] dark:bg-[#1e290b] text-slate-800 dark:text-slate-200 border-[#d0f282] dark:border-[#425e11] hover:bg-[#ecfccb]'
          }`}
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => handleApplyDays(15)}
          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            isNetSelected(15)
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-semibold'
              : 'bg-[#f7fee7] dark:bg-[#1e290b] text-slate-800 dark:text-slate-200 border-[#d0f282] dark:border-[#425e11] hover:bg-[#ecfccb]'
          }`}
        >
          Net 15
        </button>

        <button
          type="button"
          onClick={() => handleApplyDays(30)}
          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            isNetSelected(30)
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-semibold'
              : 'bg-[#f7fee7] dark:bg-[#1e290b] text-slate-800 dark:text-slate-200 border-[#d0f282] dark:border-[#425e11] hover:bg-[#ecfccb]'
          }`}
        >
          Net 30
        </button>
      </div>

      {/* Row 2 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleApplyDays(60)}
          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            isNetSelected(60)
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-semibold'
              : 'bg-[#f7fee7] dark:bg-[#1e290b] text-slate-800 dark:text-slate-200 border-[#d0f282] dark:border-[#425e11] hover:bg-[#ecfccb]'
          }`}
        >
          Net 60
        </button>

        <button
          type="button"
          onClick={() => handleApplyDays(90)}
          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            isNetSelected(90)
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-semibold'
              : 'bg-[#f7fee7] dark:bg-[#1e290b] text-slate-800 dark:text-slate-200 border-[#d0f282] dark:border-[#425e11] hover:bg-[#ecfccb]'
          }`}
        >
          Net 90
        </button>

        <input
          type="number"
          min="0"
          placeholder="Net Days"
          value={customDays}
          onChange={(e) => {
            const val = e.target.value;
            setCustomDays(val);
            const num = parseInt(val, 10);
            if (!isNaN(num) && num >= 0) {
              handleApplyDays(num);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const num = parseInt(customDays, 10);
              if (!isNaN(num) && num >= 0) {
                handleApplyDays(num);
              }
            }
          }}
          className="w-24 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141414] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export const DatePickerComponent = forwardRef<any, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      pickerSize,
      size,
      fullWidth = true,
      containerClassName = '',
      className = '',
      id,
      name,
      value,
      defaultValue,
      onChange,
      onValueChange,
      onClear,
      format = 'YYYY-MM-DD',
      placeholder = 'Select date',
      disabled = false,
      allowClear = true,
      status,
      showNetPresets = false,
      baseDate,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const datePickerId = id || `ant-datepicker-${generatedId}`;
    const antdSize = mapSizeToAntd(size, pickerSize);
    const isDark = useIsDarkMode();

    const parsedValue = parseDayjsValue(value, format);
    const parsedDefaultValue = parseDayjsValue(defaultValue, format);

    const extraFooterToRender = (mode: any) => {
      let customNode = null;
      if (props.renderExtraFooter) {
        customNode = props.renderExtraFooter(mode);
      }
      if (showNetPresets) {
        return (
          <>
            {customNode}
            <NetPresetsFooter
              onSelectDate={(d) => handleChange(d, d.format(format))}
              baseDate={baseDate || value}
              currentValue={parsedValue}
              format={format}
            />
          </>
        );
      }
      return customNode;
    };

    const handleChange = (date: Dayjs | null, dateString: string | string[]) => {
      const strVal = typeof dateString === 'string' ? dateString : (dateString?.[0] || (date ? date.format(format) : ''));

      if (!date && onClear) {
        onClear();
      }

      if (onValueChange) {
        onValueChange(strVal, date);
      }

      if (onChange) {
        // Construct a standard synthetic event so legacy React event handlers (e.target.value) work seamlessly
        const syntheticEvent = {
          target: {
            value: strVal,
            name: name || datePickerId,
            id: datePickerId,
          },
          currentTarget: {
            value: strVal,
            name: name || datePickerId,
            id: datePickerId,
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        };

        try {
          (onChange as any)(syntheticEvent, strVal, date);
        } catch {
          // If the consumer expects (date, dateString)
          try {
            (onChange as any)(date, strVal);
          } catch (err) {
            console.error('Error in DatePicker onChange handler:', err);
          }
        }
      }
    };

    const effectiveStatus = error ? 'error' : status;

    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#2563eb', // Blue-600
            borderRadius: 6,
            fontFamily: 'inherit',
            fontSize: antdSize === 'small' ? 12 : antdSize === 'large' ? 15 : 13,
            controlHeightSM: 28,
            controlHeight: 34,
            controlHeightLG: 40,
            colorBgContainer: isDark ? '#141414' : '#ffffff',
            colorBorder: isDark ? '#424242' : '#d9d9d9',
          },
        }}
      >
        <div className={`form-group ${fullWidth ? 'w-full' : ''} ${containerClassName}`.trim()}>
          {label && (
            <label
              htmlFor={datePickerId}
              className="form-label block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {label}
            </label>
          )}

          <div className="relative flex items-center w-full">
            <AntDatePicker
              ref={ref}
              id={datePickerId}
              name={name}
              disabled={disabled}
              value={parsedValue}
              defaultValue={parsedDefaultValue}
              onChange={handleChange}
              format={format}
              placeholder={placeholder}
              size={antdSize}
              allowClear={allowClear}
              status={effectiveStatus}
              renderExtraFooter={showNetPresets || props.renderExtraFooter ? extraFooterToRender : undefined}
              style={{ width: fullWidth ? '100%' : undefined }}
              className={`ant-date-picker-custom ${className}`.trim()}
              {...props}
            />
          </div>

          {typeof error === 'string' && error.trim().length > 0 && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          {helperText && !error && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
          )}
        </div>
      </ConfigProvider>
    );
  }
);

DatePickerComponent.displayName = 'DatePicker';

export const RangePicker = forwardRef<any, DateRangePickerProps>(
  (
    {
      label,
      error,
      helperText,
      pickerSize,
      size,
      fullWidth = true,
      containerClassName = '',
      className = '',
      id,
      name,
      value,
      onChange,
      onRangeChange,
      format = 'YYYY-MM-DD',
      placeholder = ['Start date', 'End date'],
      disabled = false,
      allowClear = true,
      status,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const rangePickerId = id || `ant-rangepicker-${generatedId}`;
    const antdSize = mapSizeToAntd(size, pickerSize);
    const isDark = useIsDarkMode();

    const parsedValue: [Dayjs | null, Dayjs | null] | null = value
      ? [parseDayjsValue(value[0], format), parseDayjsValue(value[1], format)]
      : null;

    const handleChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
      const strings: [string, string] = dateStrings || ['', ''];
      if (onRangeChange) {
        onRangeChange(strings, dates);
      }
      if (onChange) {
        const syntheticEvent = {
          target: {
            value: strings,
            name: name || rangePickerId,
            id: rangePickerId,
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        try {
          (onChange as any)(dates, dateStrings, syntheticEvent);
        } catch {
          try {
            (onChange as any)(syntheticEvent);
          } catch (err) {
            console.error('Error in RangePicker onChange handler:', err);
          }
        }
      }
    };

    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#2563eb',
            borderRadius: 6,
            fontFamily: 'inherit',
            fontSize: antdSize === 'small' ? 12 : antdSize === 'large' ? 15 : 13,
            controlHeightSM: 28,
            controlHeight: 34,
            controlHeightLG: 40,
            colorBgContainer: isDark ? '#141414' : '#ffffff',
            colorBorder: isDark ? '#424242' : '#d9d9d9',
          },
        }}
      >
        <div className={`form-group ${fullWidth ? 'w-full' : ''} ${containerClassName}`.trim()}>
          {label && (
            <label
              htmlFor={rangePickerId}
              className="form-label block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {label}
            </label>
          )}
          <AntDatePicker.RangePicker
            ref={ref}
            id={rangePickerId}
            name={name}
            disabled={disabled}
            value={parsedValue as any}
            onChange={handleChange as any}
            format={format}
            placeholder={placeholder}
            size={antdSize}
            allowClear={allowClear}
            status={error ? 'error' : status}
            style={{ width: fullWidth ? '100%' : undefined }}
            className={`ant-date-picker-custom ${className}`.trim()}
            {...props}
          />
          {typeof error === 'string' && error.trim().length > 0 && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          {helperText && !error && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
          )}
        </div>
      </ConfigProvider>
    );
  }
);

RangePicker.displayName = 'RangePicker';

export const DatePicker = Object.assign(DatePickerComponent, {
  RangePicker,
});

export default DatePicker;
