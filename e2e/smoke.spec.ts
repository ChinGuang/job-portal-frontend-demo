import { test, expect, type Page } from "@playwright/test";

const JOB = {
  id: "job-1",
  title: "Senior Frontend Engineer",
  description: "Build delightful UIs for the whole team.",
  requirements: ["React", "TypeScript"],
  location: "Kuala Lumpur, MY",
  jobType: "FULL_TIME",
  status: "PUBLISHED",
  salaryMin: 8000,
  salaryMax: 12000,
  currency: "MYR",
  employer: { id: "emp-1", companyName: "Acme Sdn Bhd" },
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const SEEKER_PROFILE = {
  name: "Test Seeker",
  headline: "Frontend developer",
  bio: "",
  phone: "",
  skills: ["React"],
  yearsOfExperience: 5,
  resumeUrl: "https://files.example.com/resume.pdf",
};

// Backend origin the app calls. Must match the dev server's
// NEXT_PUBLIC_API_BASE_URL (see playwright.config.ts); override for a server
// whose API base differs from the default.
const API_ORIGIN = process.env.E2E_API_ORIGIN ?? "http://localhost:3000";

function json(body: unknown, status = 200) {
  return { status, contentType: "application/json", body: JSON.stringify(body) };
}

/**
 * Mock Supabase auth + the backend so the flow is hermetic. Backend routes are
 * scoped to the backend origin (:3000) so they never intercept the app's own
 * `/jobs/*` page navigations (:3001).
 */
async function mockAll(page: Page) {
  // Supabase password sign-in (its own origin, never the app's).
  await page.route("**/auth/v1/token**", async (route) => {
    const now = Math.floor(Date.now() / 1000);
    await route.fulfill(
      json({
        access_token: "test-access-token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: now + 3600,
        refresh_token: "test-refresh-token",
        user: {
          id: "user-1",
          aud: "authenticated",
          role: "authenticated",
          email: "seeker@example.com",
          app_metadata: { provider: "email", providers: ["email"] },
          user_metadata: {},
          created_at: "2026-01-01T00:00:00Z",
        },
      }),
    );
  });

  // Backend REST API (job listings, profiles, applications).
  await page.route(`${API_ORIGIN}/**`, async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;

    if (req.method() === "POST" && /\/jobs\/[^/]+\/applications$/.test(path)) {
      await route.fulfill(
        json(
          {
            id: "app-1",
            jobId: JOB.id,
            jobSeekerProfileId: "js-1",
            resumeUrl: SEEKER_PROFILE.resumeUrl,
            status: "SUBMITTED",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          },
          201,
        ),
      );
      return;
    }
    if (path.endsWith("/profiles/job-seeker")) {
      await route.fulfill(json(SEEKER_PROFILE));
      return;
    }
    if (path.endsWith("/profiles/employer")) {
      await route.fulfill(json({ statusCode: 404, message: "Not found" }, 404));
      return;
    }
    if (/\/jobs\/[^/]+$/.test(path)) {
      await route.fulfill(json(JOB)); // detail
      return;
    }
    if (path.endsWith("/jobs")) {
      await route.fulfill(json({ items: [JOB], total: 1 })); // list
      return;
    }
    await route.fulfill(json({ statusCode: 404, message: "Not mocked" }, 404));
  });
}

test("browse → login → apply happy path", async ({ page }) => {
  await mockAll(page);

  // 1. Browse: the published job is listed.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: JOB.title }),
  ).toBeVisible();

  // 2. Open the job detail.
  await page.getByRole("heading", { name: JOB.title }).click();
  await expect(page).toHaveURL(new RegExp(`/jobs/${JOB.id}`));

  // 3. Apply requires sign-in when logged out.
  const signInToApply = page.getByRole("link", { name: /sign in to apply/i });
  await expect(signInToApply).toBeVisible();
  await signInToApply.click();
  await expect(page).toHaveURL(/\/login/);

  // 4. Log in.
  await page.getByLabel("Email").fill("seeker@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();

  // 5. Back on the job, now eligible to apply.
  await expect(page).toHaveURL(new RegExp(`/jobs/${JOB.id}`));
  await page.getByRole("button", { name: "Apply now" }).click();
  await page.getByLabel(/cover letter/i).fill("I'm excited to apply!");
  await page
    .getByRole("button", { name: /submit application/i })
    .click();

  // 6. Application submitted.
  await expect(page.getByText("Application submitted")).toBeVisible();
});
