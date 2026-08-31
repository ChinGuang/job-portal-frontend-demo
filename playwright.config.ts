import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright drives the real app; all network (backend + Supabase auth) is
 * mocked per-test by path, so the smoke test is hermetic and needs neither a
 * running backend nor real credentials.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Used only when Playwright starts the server (test values; the mocks match
    // by path, so real values on a reused dev server work too).
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000",
    },
  },
});
