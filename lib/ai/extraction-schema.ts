import { z } from 'zod';

export const CATEGORIES = [
  'academic', 'branch', 'year', 'cgpa', 'marks', 'income', 'skill',
  'document', 'portfolio', 'github', 'availability', 'team_size',
  'deadline', 'location', 'work_authorization', 'other',
] as const;

export const OPERATOR_ALLOWLIST = [
  'GTE', 'LTE', 'EQ', 'IN', 'ARRAY_INCLUDES', 'ARRAY_CONTAINS_ALL',
  'REQUIRED_TRUE', 'DATE_BEFORE', 'DATE_AFTER', 'TEXT_PRESENT', 'MANUAL_REVIEW',
] as const;

export const extractedRequirementSchema = z.object({
  id: z.string().min(1),
  category: z.enum(CATEGORIES),
  label: z.string().min(1).max(300),
  operator: z.enum(OPERATOR_ALLOWLIST),
  expectedValue: z.unknown().nullable().optional(),
  required: z.boolean().default(true),
  sourceText: z.string().max(500).nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  needsReview: z.boolean().default(false),
  notes: z.string().max(1000).nullable().optional(),
});

export type ExtractedRequirement = z.infer<typeof extractedRequirementSchema>;

export const extractionOutputSchema = z.object({
  title: z.string().min(1).max(200),
  type: z
    .enum(['internship', 'scholarship', 'competition', 'hackathon', 'other'])
    .default('other'),
  deadline: z.string().nullable().optional(),
  requirements: z.array(extractedRequirementSchema).min(0).max(50),
  extractionNotes: z.string().max(2000).nullable().optional(),
});

export type ExtractionOutput = z.infer<typeof extractionOutputSchema>;
