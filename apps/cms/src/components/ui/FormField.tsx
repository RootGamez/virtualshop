import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-primary">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClassName =
  'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, className, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error}>
      <input id={fieldId} className={`${inputClassName} ${className ?? ''}`} {...props} />
    </FieldWrapper>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({ label, error, id, className, ...props }: TextAreaFieldProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error}>
      <textarea id={fieldId} className={`${inputClassName} ${className ?? ''}`} rows={4} {...props} />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function SelectField({ label, error, id, className, children, ...props }: SelectFieldProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error}>
      <select id={fieldId} className={`${inputClassName} ${className ?? ''}`} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
