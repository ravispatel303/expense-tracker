import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-border bg-surface rounded-2xl border p-5 shadow-[0_1px_2px_rgba(43,40,64,0.04)]',
        className,
      )}
      {...props}
    />
  );
}
