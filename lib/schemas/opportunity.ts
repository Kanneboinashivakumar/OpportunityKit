import { z } from 'zod';

export const OPPORTUNITY_TYPES = [
  'internship',
  'scholarship',
  'competition',
  'hackathon',
  'other',
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const createOpportunitySchema = z.object({
  raw_text: z
    .string()
    .min(50, 'Announcement must be at least 50 characters')
    .max(Number(process.env.MAX_ANNOUNCEMENT_CHARS ?? 30000), 'Announcement text is too long'),
  type: z.enum(OPPORTUNITY_TYPES).optional(),
  source_url: z
    .string()
    .url('Invalid source URL')
    .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), 'Source URL must use HTTP or HTTPS')
    .optional()
    .or(z.literal('')),
  title: z.string().max(200).optional(),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
