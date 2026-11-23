import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-text-muted hover:bg-surface-muted hover:text-text grid size-10 place-items-center rounded-xl transition"
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
