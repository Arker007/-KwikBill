import React, { forwardRef, useId } from 'react';
import { Input as AntInput, Space, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: React.ReactNode;
  error?: string | boolean;
  hasError?: boolean;
  helperText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: InputSize;
  fullWidth?: boolean;
  containerClassName?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  allowClear?: boolean | { clearIcon?: React.ReactNode };
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hasError = false,
      helperText,
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      allowClear,
      inputSize = 'md',
      fullWidth = true,
      containerClassName = '',
      className = '',
      id,
      disabled,
      type = 'text',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const isDark = useIsDarkMode();
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = `error-${inputId}`;
    const helperId = `helper-${inputId}`;

    const isInvalid = Boolean(error || hasError);
    const errorMessage = typeof error === 'string' ? error : undefined;
    const widthClass = fullWidth ? 'w-full' : '';

    const antSize = inputSize === 'sm' ? 'small' : inputSize === 'lg' ? 'large' : 'middle';
    const effectivePrefix = prefix || leftIcon;
    const effectiveSuffix = suffix || rightIcon;

    const inputElement = type === 'password' ? (
      <AntInput.Password
        id={inputId}
        size={antSize}
        disabled={disabled}
        status={isInvalid ? 'error' : undefined}
        prefix={effectivePrefix}
        suffix={effectiveSuffix}
        allowClear={allowClear}
        value={value}
        onChange={onChange}
        className={`w-full ${className}`.trim()}
        {...(props as any)}
      />
    ) : (
      <AntInput
        ref={ref as any}
        id={inputId}
        type={type}
        size={antSize}
        disabled={disabled}
        status={isInvalid ? 'error' : undefined}
        prefix={effectivePrefix}
        suffix={effectiveSuffix}
        allowClear={allowClear}
        value={value}
        onChange={onChange}
        className={`w-full ${className}`.trim()}
        {...(props as any)}
      />
    );

    const hasAddons = Boolean(addonBefore || addonAfter);

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div className={`form-group ${widthClass} ${containerClassName}`.trim()}>
          {label && (
            <label
              htmlFor={inputId}
              className="form-label block mb-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {label}
            </label>
          )}

          {hasAddons ? (
            <Space.Compact className="w-full">
              {addonBefore && (
                <span className="ant-input-group-addon inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-l-md">
                  {addonBefore}
                </span>
              )}
              {inputElement}
              {addonAfter && (
                <span className="ant-input-group-addon inline-flex items-center px-3 bg-slate-100 border border-l-0 border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-r-md">
                  {addonAfter}
                </span>
              )}
            </Space.Compact>
          ) : (
            inputElement
          )}

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

Input.displayName = 'Input';

export default Input;
