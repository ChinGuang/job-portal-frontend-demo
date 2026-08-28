/**
 * Public runtime configuration, read from `NEXT_PUBLIC_*` environment variables.
 *
 * Supabase values are intentionally allowed to be empty at this stage — real
 * auth wiring lands in a later ticket. `apiBaseUrl` falls back to the local
 * backend so the app is runnable out of the box.
 */
export const env = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

/** Whether the Supabase client can be configured from the current environment. */
export const isSupabaseConfigured =
  env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;
