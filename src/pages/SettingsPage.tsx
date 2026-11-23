import { LogOut, Moon, Sun } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { displayNameOf, useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/useToast';
import { useTheme } from '../theme/useTheme';

export function SettingsPage() {
  const { user, updateDisplayName, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [name, setName] = useState(
    (user?.user_metadata?.display_name as string | undefined) ?? displayNameOf(user),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError('Enter a name.');
    if (trimmed.length > 40) return setError('Keep it under 40 characters.');
    setError(null);
    setSaving(true);
    try {
      await updateDisplayName(trimmed);
      toast('Name updated');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>

      <Card>
        <h2 className="font-semibold">Profile</h2>
        <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-4">
          <Input
            label="Display name"
            hint="Shown in your dashboard greeting."
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />
          <Input label="Email" value={user?.email ?? ''} disabled readOnly />
          <Button type="submit" disabled={saving} className="self-start">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold">Appearance</h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            <p className="text-text-muted text-xs">Your choice is remembered on this device.</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Account</h2>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => void signOut()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
