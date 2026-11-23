import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <div className="bg-rose grid size-14 place-items-center rounded-2xl">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="text-text-muted mt-1 max-w-sm text-sm">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <p role="alert" className="bg-danger-soft text-danger rounded-xl px-4 py-3 text-sm">
      Couldn't load your data: {message}
    </p>
  );
}

export function Skeleton({ className = 'h-5 w-full' }: { className?: string }) {
  return <div className={`bg-surface-muted animate-pulse rounded-lg ${className}`} />;
}
