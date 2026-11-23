import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-text text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'border-border bg-surface text-text placeholder:text-text-muted/70 focus:border-primary focus:ring-primary-soft rounded-xl border px-3.5 py-2.5 text-sm transition focus:ring-4 focus:outline-none',
          className,
        )}
        {...props}
      />
    </div>
  );
}
