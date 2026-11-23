import { AlertTriangle, MailCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { isSupabaseConfigured } from '../lib/supabase';

type Mode = 'signin' | 'signup';

export function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        navigate(from, { replace: true });
      } else {
        const { needsConfirmation } = await signUp(email, password);
        if (needsConfirmation) setCheckEmail(true);
        else navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const isSignIn = mode === 'signin';

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-10">
      {/* Soft pastel background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-lavender absolute -top-24 -left-24 size-80 rounded-full opacity-60 blur-3xl" />
        <div className="bg-mint absolute top-1/3 -right-24 size-72 rounded-full opacity-60 blur-3xl" />
        <div className="bg-peach absolute -bottom-24 left-1/4 size-72 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="border-border bg-surface/90 shadow-primary/5 rounded-3xl border p-7 shadow-xl backdrop-blur">
          {checkEmail ? (
            <div className="text-center">
              <div className="bg-mint text-success mx-auto mb-4 grid size-12 place-items-center rounded-2xl">
                <MailCheck className="size-6" />
              </div>
              <h1 className="text-xl font-bold">Check your email</h1>
              <p className="text-text-muted mt-2 text-sm">
                We sent a confirmation link to <strong className="text-text">{email}</strong>. Open it to
                finish creating your account.
              </p>
              <Button
                variant="secondary"
                className="mt-6 w-full"
                onClick={() => {
                  setCheckEmail(false);
                  setMode('signin');
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">
                {isSignIn ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-text-muted mt-1 text-sm">
                {isSignIn ? 'Sign in to see where your money goes.' : 'Start tracking in under a minute.'}
              </p>

              {!isSupabaseConfigured && (
                <div role="alert" className="bg-butter text-text mt-5 flex gap-2.5 rounded-xl p-3 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Supabase isn't configured yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
                    <code>VITE_SUPABASE_ANON_KEY</code> (see README).
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <Input
                  label="Password"
                  type="password"
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignIn ? '••••••••' : 'At least 8 characters'}
                />

                {error && (
                  <p role="alert" className="bg-danger-soft text-danger rounded-xl px-3 py-2 text-sm">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={submitting || !isSupabaseConfigured} className="mt-1 w-full">
                  {submitting ? 'Please wait…' : isSignIn ? 'Sign in' : 'Create account'}
                </Button>
              </form>

              <p className="text-text-muted mt-6 text-center text-sm">
                {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => {
                    setMode(isSignIn ? 'signup' : 'signin');
                    setError(null);
                  }}
                >
                  {isSignIn ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
