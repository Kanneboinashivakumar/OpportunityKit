# OpportunityKit Architecture

## Trust boundary
The browser handles presentation and user interaction. The server authenticates requests, validates input, calls the LLM provider, and accesses the database. Supabase RLS is the final database-level owner boundary.

## Data flow
1. Student submits pasted announcement text or supported file.
2. `POST /api/extract` validates the authenticated user, input length/type, and the Postgres-backed hourly rate limit. PDF files are parsed in the browser before only their extracted text is submitted.
3. Server calls the configured LLM using a strict extraction schema.
4. Zod validates the output. Uncertain/unsupported rules are marked `needsReview`; the LLM cannot return eligibility outcomes.
5. The user reviews and confirms the requirements.
6. Confirmed opportunity and requirements are persisted.
7. The pure TypeScript eligibility engine evaluates confirmed rules against the user's current profile.
8. Audit results and action items are persisted with an engine version.
9. Inline profile edits are explicitly saved, then the audit is recalculated.
10. Dashboard and saved opportunities query the database and display real user-owned records.

## Status semantics
- MATCH: known valid data satisfies the confirmed requirement.
- MISMATCH: known valid data violates a confirmed requirement.
- MISSING INFO: data or rule clarification is absent, invalid, or ambiguous.
- Extraction uncertainty is not an eligibility status and must remain visible for review.

## Failure handling
If the LLM is unavailable or unconfigured, display a clear actionable error and offer manual requirement entry/editing. Do not return a fake extracted response. If the database is unavailable, show an error and preserve user-entered form text where practical without claiming it was saved.

## Dataset policy
Kaggle datasets are optional and static. Use only for offline tests or clearly labeled sample records, with license and provenance recorded. The core product must operate from a user's pasted announcement and persisted profile without any dataset.
