import React, { forwardRef, useId } from 'react';
import { Input as AntInput, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'prefix'> {
  label?: React.ReactNode;
  error?: string | boolean;
  hasError?: boolean;
  helperText?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hasError = false,
      helperText,
      fullWidth = true,
      containerClassName = '',
      className = '',
      id,
      disabled,
      rows = 3,
      showCount,
      maxLength,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const isDark = useIsDarkMode();
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;
    const errorId = `error-${textareaId}`;
    const helperId = `helper-${textareaId}`;

    const isInvalid = Boolean(error || hasError);
    const errorMessage = typeof error === 'string' ? error : undefined;
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div className={`form-group ${widthClass} ${containerClassName}`.trim()}>
          {label && (
            <label
              htmlFor={textareaId}
              className="form-label block mb-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {label}
            </label>
          )}
          <AntInput.TextArea
            ref={ref as any}
            id={textareaId}
            rows={rows}
            disabled={disabled}
            status={isInvalid ? 'error' : undefined}
            value={value}
            onChange={onChange}
            showCount={showCount}
            maxLength={maxLength}
            className={`w-full ${className}`.trim()}
            {...(props as any)}
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

Textarea.displayName = 'Textarea';

export default Textarea;
