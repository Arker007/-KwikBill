import React, { forwardRef, useId } from 'react';
import { Select as AntSelect, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'value' | 'onChange'> {
  label?: React.ReactNode;
  error?: string | boolean;
  hasError?: boolean;
  helperText?: React.ReactNode;
  selectSize?: SelectSize;
  fullWidth?: boolean;
  options?: SelectOption[];
  containerClassName?: string;
  placeholder?: string;
  value?: string | number | string[] | number[];
  onChange?: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | ((val: any) => void);
  showSearch?: boolean;
  allowClear?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hasError = false,
      helperText,
      selectSize = 'md',
      fullWidth = false,
      options = [],
      containerClassName = '',
      className = '',
      id,
      disabled,
      placeholder,
      children,
      value,
      onChange,
      showSearch,
      allowClear,
      ...props
    },
    ref
  ) => {
    const isDark = useIsDarkMode();
    const generatedId = useId();
    const selectId = id || `select-${generatedId}`;
    const errorId = `error-${selectId}`;
    const helperId = `helper-${selectId}`;

    const isInvalid = Boolean(error || hasError);
    const errorMessage = typeof error === 'string' ? error : undefined;
    const widthClass = fullWidth ? 'w-full' : 'inline-block';

    const antSize = selectSize === 'sm' ? 'small' : selectSize === 'lg' ? 'large' : 'middle';

    // Parse options from children if passed as <option> elements
    let effectiveOptions: SelectOption[] = options;
    if ((!options || options.length === 0) && children) {
      const parsedOptions: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        const childProps = React.isValidElement(child) ? (child.props as Record<string, any>) : null;
        if (React.isValidElement(child) && (child.type === 'option' || (childProps && 'value' in childProps))) {
          parsedOptions.push({
            value: childProps?.value ?? '',
            label: childProps?.children ?? childProps?.label ?? String(childProps?.value),
            disabled: childProps?.disabled,
          });
        }
      });
      if (parsedOptions.length > 0) {
        effectiveOptions = parsedOptions;
      }
    }

    const handleChange = (val: any) => {
      if (!onChange) return;
      // Handle either raw value callback or standard event object callback
      try {
        const syntheticEvent = {
          target: { value: val, name: (props as any).name || selectId, id: selectId },
          currentTarget: { value: val, name: (props as any).name || selectId, id: selectId },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLSelectElement>;

        (onChange as any)(syntheticEvent);
      } catch {
        (onChange as any)(val);
      }
    };

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div className={`form-group ${widthClass} ${containerClassName}`.trim()}>
          {label && (
            <label
              htmlFor={selectId}
              className="form-label block mb-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {label}
            </label>
          )}

          <AntSelect
            id={selectId}
            size={antSize}
            disabled={disabled}
            status={isInvalid ? 'error' : undefined}
            placeholder={placeholder}
            value={value !== undefined && value !== null ? value : undefined}
            onChange={handleChange}
            title=""
            options={effectiveOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
              disabled: opt.disabled,
              title: '',
            }))}
            showSearch={showSearch ?? true}
            allowClear={allowClear}
            filterOption={(input, option) =>
              (String(option?.label ?? '')).toLowerCase().includes(input.toLowerCase())
            }
            classNames={{
              popup: {
                root: 'slim-select-dropdown',
              },
            }}
            className={`w-full ${className}`.trim()}
          />

          {errorMessage && (
            <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>{errorMessage}</span>
            </p>
          )}
          {!errorMessage && helperText && (
            <p id={helperId} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {helperText}
            </p>
          )}
        </div>
      </ConfigProvider>
    );
  }
);

Select.displayName = 'Select';

export default Select;
