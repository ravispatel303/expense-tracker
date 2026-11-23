import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when both Supabase environment variables are set. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * The Supabase client, or null when the app runs without configuration
 * (e.g. a fresh clone before `.env` is filled in).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, anonKey!) : null;
