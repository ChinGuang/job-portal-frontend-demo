import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "./env";

let client: SupabaseClient | null = null;

/**
 * Return the singleton Supabase browser client, or `null` when Supabase is not
 * configured (so the app can render and surface a clear message instead of
 * crashing). Session persistence + auto-refresh are enabled, so the access
 * token attached to backend calls stays fresh.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
