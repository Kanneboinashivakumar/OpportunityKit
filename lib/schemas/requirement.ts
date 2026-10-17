import { z } from 'zod';

export const CATEGORIES = [
  'academic',
  'branch',
  'year',
  'cgpa',
  'marks',
  'income',
  'skill',
  'document',
  'portfolio',
  'github',
  'availability',
  'team_size',
  'deadline',
  'location',
  'work_authorization',
  'other',
] as const;

export type RequirementCategory = (typeof CATEGORIES)[number];

export const OPERATOR_ALLOWLIST = [
  'GTE',
  'LTE',
  'EQ',
  'IN',
  'ARRAY_INCLUDES',
  'ARRAY_CONTAINS_ALL',
  'REQUIRED_TRUE',
  'DATE_BEFORE',
  'DATE_AFTER',
  'TEXT_PRESENT',
  'MANUAL_REVIEW',
] as const;

export type Operator = (typeof OPERATOR_ALLOWLIST)[number];

export const requirementSchema = z.object({
  id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  category: z.enum(CATEGORIES),
  label: z.string().min(1).max(300),
  operator: z.enum(OPERATOR_ALLOWLIST),
  expected_value: z.unknown().nullable().optional(),
  required: z.boolean().default(true),
  source_text: z.string().max(500).nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  needs_review: z.boolean().default(true),
  notes: z.string().max(1000).nullable().optional(),
  sort_order: z.number().int().default(0),
  created_at: z.string(),
});

export type Requirement = z.infer<typeof requirementSchema>;

export const requirementUpdateSchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  label: z.string().min(1).max(300).optional(),
  operator: z.enum(OPERATOR_ALLOWLIST).optional(),
  expected_value: z.unknown().nullable().optional(),
  required: z.boolean().optional(),
  notes: z.string().max(1000).nullable().optional(),
  needs_review: z.boolean().optional(),
});

export type RequirementUpdate = z.infer<typeof requirementUpdateSchema>;
