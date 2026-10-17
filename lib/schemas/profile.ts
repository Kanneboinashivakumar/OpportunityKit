import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  degree: z.string().max(100).nullable().optional(),
  branch: z.string().max(100).nullable().optional(),
  academic_year: z.string().max(20).nullable().optional(),
  cgpa: z.number().min(0).max(100).nullable().optional(),
  cgpa_scale: z.number().positive().default(10),
  marks_percentage: z.number().min(0).max(100).nullable().optional(),
  annual_income: z.number().min(0).nullable().optional(),
  skills: z.array(z.string().min(1).max(100)).default([]),
  skill_gaps: z.array(z.string().min(1).max(100)).default([]),
  documents: z.array(z.string().min(1).max(100)).default([]),
  location: z.string().max(100).nullable().optional(),
  work_authorization: z.boolean().nullable().optional(),
  team_size: z.number().int().min(1).max(100).nullable().optional(),
  github_url: z.string().url('Invalid URL').nullable().optional().or(z.literal('')),
  portfolio_url: z.string().url('Invalid URL').nullable().optional().or(z.literal('')),
  college: z.string().max(150).nullable().optional(),
  phone_number: z.string().max(30).nullable().optional(),
  date_of_birth: z.string().max(30).nullable().optional(),
  gender: z.string().max(30).nullable().optional(),
  preferences: z.record(z.string(), z.unknown()).default({}),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const profileUpdateSchema = profileSchema.partial().superRefine((profile, context) => {
  if (profile.cgpa !== undefined && profile.cgpa !== null && profile.cgpa > (profile.cgpa_scale ?? 10)) {
    context.addIssue({ code: 'custom', path: ['cgpa'], message: 'CGPA cannot exceed its declared scale.' });
  }
});
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
