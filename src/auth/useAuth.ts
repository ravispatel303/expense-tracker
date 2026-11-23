import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** The user's chosen display name, or the part of their email before "@". */
export function displayNameOf(user: User | null): string {
  const name = (user?.user_metadata?.display_name as string | undefined)?.trim();
  return name || user?.email?.split('@')[0] || '';
}
