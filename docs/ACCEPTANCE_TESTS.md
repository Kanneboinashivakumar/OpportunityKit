# End-to-End Acceptance Checklist

## Authentication and profile
- [ ] Signup creates a real Supabase Auth user.
- [ ] Login/logout and password reset work.
- [ ] Protected routes reject unauthenticated users on the server.
- [ ] Profile edits persist after refresh and a new login.
- [ ] One user's records are not readable or writable by another user (RLS test).

## Extraction and review
- [ ] Pasting announcement text calls the configured server-side LLM.
- [ ] Missing API key and provider errors show honest error states.
- [ ] Extraction response is schema-validated.
- [ ] Ambiguous requirements are flagged for human review.
- [ ] The user can edit/remove/add requirements before audit.
- [ ] No LLM-generated eligibility result is trusted by the rule engine.

## Eligibility
- [ ] MATCH, MISMATCH and MISSING INFO behavior is tested.
- [ ] Missing profile data never automatically becomes MISMATCH.
- [ ] Invalid numeric/date/URL values are handled safely.
- [ ] Skill omission and explicit lack of skill are different.
- [ ] Inline updates recalculate results and persist after refresh.
- [ ] Source evidence and explanation appear for every requirement.
- [ ] Engine tests cover operator boundaries and malformed data.

## Dynamic data
- [ ] Dashboard and saved opportunity views query persisted records.
- [ ] No fake counts or fabricated activity are shown as real.
- [ ] Deadlines are calculated from stored dates and timezone rules.
- [ ] Campus TPO data is either real authorized imported data or explicitly labeled demo data.

## UX and security
- [ ] Loading, empty, error, retry and success states exist.
- [ ] Responsive at mobile, tablet and desktop sizes.
- [ ] Keyboard navigation, labels, focus, contrast and reduced motion are checked.
- [ ] API keys remain server-side.
- [ ] Every user-owned database table has RLS.
- [ ] Input sizes and extraction requests are rate-limited.
- [ ] No sensitive content is written to logs.
