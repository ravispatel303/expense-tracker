import { createElement } from 'react';
import { COLOR_BG, iconFor } from '../config/categories';
import { cn } from '../lib/cn';
import type { CategoryColor } from '../types';

interface CategoryIconProps {
  icon: string | null | undefined;
  color: CategoryColor | null | undefined;
  size?: 'sm' | 'md';
}

/** Pastel rounded square with the category's icon. Uncategorized items use a neutral tile. */
export function CategoryIcon({ icon, color, size = 'md' }: CategoryIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'text-text grid shrink-0 place-items-center rounded-xl',
        color ? COLOR_BG[color] : 'bg-surface-muted',
        size === 'md' ? 'size-10' : 'size-8',
      )}
    >
      {createElement(iconFor(icon), { className: size === 'md' ? 'size-5' : 'size-4' })}
    </span>
  );
}
