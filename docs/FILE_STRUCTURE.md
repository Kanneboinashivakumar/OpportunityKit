# Recommended File Structure

```text
opportunitykit/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    # Landing page
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── auth/callback/route.ts
│   ├── (workspace)/
│   │   └── app/
│   │       ├── layout.tsx              # Authenticated shell
│   │       ├── page.tsx                # Dashboard
│   │       ├── analyze/page.tsx
│   │       ├── analyze/[id]/review/page.tsx
│   │       ├── opportunities/page.tsx
│   │       ├── opportunities/[id]/page.tsx
│   │       ├── profile/page.tsx
│   │       ├── settings/page.tsx
│   │       └── campus-tpo/page.tsx
│   ├── api/
│   │   ├── extract/route.ts            # Server-only LLM extraction
│   │   ├── opportunities/route.ts      # Create/list
│   │   ├── opportunities/[id]/route.ts # Read/update/delete with ownership
│   │   ├── opportunities/[id]/audit/route.ts
│   │   ├── profile/route.ts
│   │   └── campus-tpo/import/route.ts
│   ├── globals.css                     # Design tokens, base styles
│   └── layout.tsx
├── components/
│   ├── ui/                             # Reusable accessible primitives
│   ├── marketing/                      # Hero, features, FAQ, footer
│   ├── shell/                          # Sidebar, topbar, mobile nav
│   ├── forms/                          # Validated fields, uploaders
│   ├── opportunity/                    # Paste box, extraction preview
│   ├── audit/                          # Table, status badges, inline fixes
│   ├── action-plan/                    # Tasks, priorities, deadline
│   └── campus-tpo/                     # CSV import, aggregate summaries
├── lib/
│   ├── auth/                            # Server/client Supabase helpers
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── ai/
│   │   ├── provider.ts                  # Provider interface
│   │   ├── gemini-provider.ts
│   │   └── extraction-schema.ts         # Zod schema
│   ├── eligibility/
│   │   ├── engine.ts                    # Pure deterministic engine
│   │   ├── operators.ts
│   │   ├── gap-classifier.ts
│   │   ├── action-plan.ts
│   │   └── __tests__/
│   ├── schemas/                         # Request/profile/opportunity schemas
│   ├── validation/                      # URL, file, numeric validation
│   ├── dates/                           # Deadline helpers
│   └── utils.ts
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql       # Tables, indexes, RLS policies
├── data/
│   ├── README.md                        # Dataset provenance/license
│   ├── samples/                         # Clearly labeled development-only samples
│   └── scripts/import-opportunities.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FILE_STRUCTURE.md
│   └── ACCEPTANCE_TESTS.md
├── tests/
│   └── e2e/                             # Optional Playwright tests
├── public/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Build order
1. Shared tokens, typography, components, marketing layout.
2. Supabase auth, protected routes, profile CRUD and RLS.
3. Paste/upload input, server-side extraction, review/edit.
4. Deterministic tri-state engine with unit tests.
5. Audit table, inline updates, persistence, action plan.
6. Saved opportunities and dashboard from database queries.
7. Campus TPO import/demo, tests, accessibility, deployment.
