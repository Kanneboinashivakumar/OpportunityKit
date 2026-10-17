import { z } from 'zod';

export const AUDIT_STATUSES = ['MATCH', 'MISMATCH', 'MISSING_INFO'] as const;
export type AuditStatus = (typeof AUDIT_STATUSES)[number];

export const GAP_CLASSIFICATIONS = [
  'PROFILE_OMISSION',
  'TIME_SENSITIVE_GAP',
  'HARD_BLOCKER',
  'UNKNOWN',
] as const;
export type GapClassification = (typeof GAP_CLASSIFICATIONS)[number];

export const auditResultSchema = z.object({
  id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  requirement_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  status: z.enum(AUDIT_STATUSES),
  reason_code: z.string().nullable().optional(),
  explanation: z.string(),
  evaluated_profile_value: z.unknown().nullable().optional(),
  next_action: z.string().nullable().optional(),
  engine_version: z.string().default('1.0.0'),
  evaluated_at: z.string(),
});

export type AuditResult = z.infer<typeof auditResultSchema>;
