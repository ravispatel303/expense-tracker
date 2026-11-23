import {
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Plus,
  Receipt,
  Settings,
  Tags,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { displayNameOf, useAuth } from '../auth/useAuth';
import { cn } from '../lib/cn';
import { useExpenseDialog } from './expenses/useExpenseDialog';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const nav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const linkClass = (isActive: boolean, compact = false) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive ? 'bg-primary-soft text-primary' : 'text-text-muted hover:bg-surface-muted hover:text-text',
    compact && 'flex-col gap-1 px-2 py-1.5 text-[11px]',
  );

function MobileLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} end className={({ isActive }) => linkClass(isActive, true)}>
      <Icon className="size-5" />
      {item.label}
    </NavLink>
  );
}

export function AppShell() {
  const { user, signOut } = useAuth();
  const dialog = useExpenseDialog();
  const [dashboard, expenses, budgets, categories, settings] = nav;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="border-border bg-surface sticky top-0 hidden h-dvh flex-col border-r px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <Button className="mt-8" onClick={() => dialog.open()}>
          <Plus className="size-4" />
          Add expense
        </Button>
        <nav aria-label="Main" className="mt-6 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => linkClass(isActive)}>
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-border mt-auto border-t pt-4">
          <p className="truncate px-3 text-sm font-semibold">{displayNameOf(user)}</p>
          <p className="text-text-muted truncate px-3 text-xs" title={user?.email ?? ''}>
            {user?.email}
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-text-muted hover:bg-surface-muted hover:text-text mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
          >
            <LogOut className="size-5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col pb-24 lg:pb-0">
        {/* Top bar */}
        <header className="border-border bg-bg/80 sticky top-0 z-10 flex items-center justify-between border-b px-5 py-3 backdrop-blur lg:justify-end lg:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NavLink
              to={settings.to}
              aria-label="Settings"
              className="text-text-muted hover:bg-surface-muted hover:text-text grid size-10 place-items-center rounded-xl transition lg:hidden"
            >
              <Settings className="size-5" />
            </NavLink>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav (mobile) with a centred add button */}
      <nav
        aria-label="Main"
        className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 items-center border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
      >
        <MobileLink item={dashboard} />
        <MobileLink item={expenses} />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => dialog.open()}
            aria-label="Add expense"
            className="bg-primary text-on-primary shadow-primary/30 -mt-6 grid size-14 place-items-center rounded-2xl shadow-lg transition hover:opacity-90"
          >
            <Plus className="size-6" />
          </button>
        </div>
        <MobileLink item={budgets} />
        <MobileLink item={categories} />
      </nav>
    </div>
  );
}
