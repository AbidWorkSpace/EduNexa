import { z as zod } from 'zod';

// ----------------------------------------------------------------------

/** POST /api/schools body — minimal school-onboarding payload. */
export const SchoolCreateSchema = zod.object({
  name: zod.string().trim().min(1, { message: 'School name is required' }).max(120),
  slug: zod
    .string()
    .trim()
    .min(1, { message: 'Slug is required' })
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      message: 'Slug must be lowercase, alphanumeric, and hyphen-separated',
    }),
  contactEmail: zod.string().trim().email({ message: 'Must be a valid email address' }),
  contactPhone: zod.string().trim().max(40).nullable().optional(),
  adminEmail: zod.string().trim().email({ message: 'Must be a valid email address' }),
  adminPassword: zod.string().min(6, { message: 'Password must be at least 6 characters' }),
  adminName: zod.string().trim().min(1).max(120),
});
