import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string;
  error?: string | null;
  hint?: string;
  /** Element shown inside the field on the left, e.g. a currency symbol. */
  prefix?: ReactNode;
}

export const fieldClass =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/70 transition focus:border-primary focus:ring-4 focus:ring-primary-soft focus:outline-none';

export function Input({ label, error, hint, prefix, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-text text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="text-text-muted pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(fieldClass, Boolean(prefix) && 'pl-8', error && 'border-danger', className)}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-danger text-xs">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="text-text-muted text-xs">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
