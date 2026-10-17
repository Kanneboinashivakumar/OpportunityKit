# OpportunityKit

OpportunityKit turns an opportunity announcement into a reviewed requirements checklist, a deterministic eligibility audit, and a deadline-aware action plan. Missing or unconfirmed information is reported as **MISSING INFO**; the language model extracts requirements but never decides eligibility.

## Current implementation

- Supabase Auth with signup, login, email confirmation callback, password reset, and protected workspace routes.
- Private, owner-scoped data access through Supabase Row Level Security.
- Announcement extraction through the server-side Gemini provider, with schema validation and a manual-review route when extraction is unavailable.
- Plain text and text-based PDF ingestion. Scanned image-only PDFs require OCR before upload.
- Requirement review, human confirmation, manual requirement entry, deterministic audits, profile fixes, and persisted action plans.
- Campus TPO page is a clearly labeled proposal/demo; bulk student import is not implemented.

The product requires configured services before authenticated workflows can run. A successful build alone does not mean a deployment is operational.

## Requirements

- Node.js 22.12 or newer (required by the installed Vite/Vitest toolchain).
- npm.
- A Supabase project with email authentication enabled.
- A Gemini API key for automated extraction. Manual requirement entry works without it.

## Local setup

```powershell
npm ci
Copy-Item .env.example .env.local
```

Fill in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.8-flash
APP_URL=http://localhost:3000
MAX_ANNOUNCEMENT_CHARS=30000
MAX_UPLOAD_MB=5
EXTRACTION_RATE_LIMIT_PER_HOUR=20
```

Apply `database/migrations/001_initial_schema.sql` followed by `database/migrations/002_production_hardening.sql` in the Supabase SQL Editor or through the Supabase CLI. The first migration creates the app tables; the second safely adds profile fields, the authenticated extraction limiter, and stricter ownership checks. Review both before applying them to an existing database.

In Supabase Auth settings, add the local and deployed origins to the allowed redirect URLs. Include `http://localhost:3000/auth/callback` for local email confirmation and password recovery, and the equivalent URL for your deployment. Do not put a service-role key in the browser; the application does not need one.

Start the app:

```powershell
npm run dev
```

Open `http://localhost:3000`, create an account, and complete the email confirmation step. Configure `GEMINI_API_KEY` for extraction, or use **Continue with manual review** to enter requirements yourself.

## Verification commands

```powershell
npm run typecheck
npm test
npm run lint
npm run build
```

Before deployment, verify the manual checklist in [`docs/ACCEPTANCE_TESTS.md`](docs/ACCEPTANCE_TESTS.md) against a configured Supabase project and Gemini key. Cross-user RLS behavior and provider-backed extraction cannot be validated by the local unit tests alone.

## Deployment

Deploy as a Node.js Next.js application (for example, to Vercel). Set the same environment variables in the hosting environment, apply the migration to the target Supabase project, configure Supabase redirect URLs, and confirm email delivery settings. Keep `GEMINI_API_KEY` server-only. The extraction limiter is enforced atomically in Postgres and fails closed if the migration has not been applied.

## Privacy and limitations

- Announcement text is sent to Gemini when automated extraction is used.
- Profiles, opportunities, audits, and action plans are stored in Supabase and protected by owner-scoped RLS.
- Uploaded PDFs are parsed in the browser; only extracted announcement text is sent to the app server.
- Documents in a profile are names only. Private file storage and resume uploads are not implemented.
- Arbitrary source URLs are saved for reference and are not fetched.
- There is no Campus TPO CSV batch processing, verified-opening directory, or Kaggle dataset.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/FILE_STRUCTURE.md`](docs/FILE_STRUCTURE.md), and [`docs/ACCEPTANCE_TESTS.md`](docs/ACCEPTANCE_TESTS.md) for the design and remaining deployment checks.
