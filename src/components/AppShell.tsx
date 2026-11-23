import { LayoutDashboard, LogOut, PiggyBank, Receipt, Settings, Tags } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { cn } from '../lib/cn';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  soon?: boolean;
}

const nav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt, soon: true },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank, soon: true },
  { to: '/categories', label: 'Categories', icon: Tags, soon: true },
  { to: '/settings', label: 'Settings', icon: Settings, soon: true },
];

function NavLinks({ compact = false }: { compact?: boolean }) {
  return (
    <>
      {nav.map(({ to, label, icon: Icon, soon }) =>
        soon ? (
          <span
            key={to}
            aria-disabled="true"
            title="Coming soon"
            className={cn(
              'text-text-muted/60 flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
              compact && 'flex-col gap-1 px-2 py-1.5 text-[11px]',
            )}
          >
            <Icon className="size-5" />
            {label}
          </span>
        ) : (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-primary-soft text-primary'
                  : 'text-text-muted hover:bg-surface-muted hover:text-text',
                compact && 'flex-col gap-1 px-2 py-1.5 text-[11px]',
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ),
      )}
    </>
  );
}

export function AppShell() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="border-border bg-surface sticky top-0 hidden h-dvh flex-col border-r px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
          <NavLinks />
        </nav>
        <div className="border-border mt-auto border-t pt-4">
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

      <div className="flex min-h-dvh flex-col pb-20 lg:pb-0">
        {/* Top bar */}
        <header className="border-border bg-bg/80 sticky top-0 z-10 flex items-center justify-between border-b px-5 py-3 backdrop-blur lg:justify-end lg:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Sign out"
              className="text-text-muted hover:bg-surface-muted hover:text-text grid size-10 place-items-center rounded-xl transition lg:hidden"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav
        aria-label="Main"
        className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-10 flex justify-around border-t px-2 py-2 backdrop-blur lg:hidden"
      >
        <NavLinks compact />
      </nav>
    </div>
  );
}
