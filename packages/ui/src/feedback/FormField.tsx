import React, { ReactNode, useId } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export interface FormFieldProps {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: ReactNode;
  warning?: ReactNode;
  helperText?: ReactNode;
  className?: string;
  children: ReactNode;
  id?: string;
}

/**
 * FormField: Provides input validation feedback presentation.
 * Places descriptive feedback directly after the relevant field.
 * Keeps error text visible until the corresponding corrective interaction; never auto-dismisses it.
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  warning,
  helperText,
  className = '',
  children,
  id,
}) => {
  const generatedId = useId();
  const fieldId = id || htmlFor || `field-${generatedId}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const hasError = Boolean(error);
  const hasWarning = Boolean(warning && !hasError);

  return (
    <div className={`form-field flex flex-col gap-1 w-full ${className}`.trim()}>
      {label && (
        <label
          htmlFor={fieldId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 select-none"
        >
          <span>{label}</span>
          {required && (
            <span className="text-red-500 font-bold leading-none" title="Required">
              *
            </span>
          )}
        </label>
      )}

      <div className="w-full">
        {children}
      </div>

      {/* Input validation feedback: placed directly after the input and stays visible */}
      {hasError && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium mt-0.5 animate-fadeIn"
        >
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {hasWarning && (
        <div
          id={errorId}
          role="status"
          className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5"
        >
          <AlertTriangle size={13} className="shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {!hasError && !hasWarning && helperText && (
        <div
          id={helperId}
          className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5"
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

export default FormField;
