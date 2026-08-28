# Job Portal Frontend (Demo)

A [Next.js](https://nextjs.org/) web application that demonstrates the features of the
**Startup Job Portal** backend — a NestJS + PostgreSQL job marketplace with identity
delegated to Supabase Auth.

This frontend exercises the full v1 API surface: public job browsing, Supabase-backed
authentication, and both the **job seeker** and **employer** journeys.

> Backend API reference: [ChinGuang/job-portal-backend #1](https://github.com/ChinGuang/job-portal-backend/issues/1)

## Features

**Public**
- Browse published job listings with keyword search, filters (job type, location), and pagination
- View a single job listing with the hiring company's profile

**Job Seeker**
- Create and edit a job-seeker profile (name, headline, bio, skills, experience)
- Upload a résumé (PDF/DOC/DOCX, 5 MB max)
- Apply to published jobs with an optional cover letter
- Track submitted applications and their status

**Employer**
- Create and edit a company profile (name, website, logo, industry, size, description)
- Post job listings and manage their lifecycle (`DRAFT → PUBLISHED → CLOSED / ARCHIVED`)
- Review applicants per listing, filter by status, and view résumés via short-lived signed URLs
- Move applications through the review pipeline (`SUBMITTED → REVIEWED → OFFERED / REJECTED`)

A single account may hold **both** a job-seeker and an employer profile; capabilities are
derived from which profiles exist.

## Architecture

- **Framework:** Next.js (App Router) + TypeScript
- **Authentication:** Real Supabase Auth via `@supabase/supabase-js`. Supabase issues the JWT;
  the frontend attaches it as a `Bearer` token on every backend request. The backend verifies
  the token against Supabase's JWKS — no login endpoints exist on the backend itself.
- **Data fetching:** TanStack Query, with a thin API client that injects the token, sets the
  base URL, and maps the backend's consistent error format to UI errors
- **Styling:** Tailwind CSS + shadcn/ui

> **Important:** The Supabase project used by this frontend **must be the same project the
> backend verifies against** (same issuer / JWKS), otherwise the backend rejects tokens with
> `401 Unauthorized`.

## Getting Started

### Prerequisites

- Node.js 18.18+ (or 20+)
- The [job-portal backend](https://github.com/ChinGuang/job-portal-backend) running locally
  (default: `http://localhost:3000/api`)
- A Supabase project (the same one the backend trusts)

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

Set the following in `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Run

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (the backend occupies port 3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend REST API (e.g. `http://localhost:3000/api`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL — must match the backend's Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key for client-side auth |

## Project Status

🚧 Early development. See the project plan/spec for the full set of routes, user stories, and
scope decisions.

## License

For demonstration purposes.
