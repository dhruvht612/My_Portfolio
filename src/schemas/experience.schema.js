import { z } from 'zod'

export const experienceSchema = z.object({
  organization: z.string().min(1),
  organization_sub: z.string().optional().or(z.literal('')),
  employment_type: z.string().optional().or(z.literal('')),
  role_title: z.string().min(1),
  date_range: z.string().min(1),
  location: z.string().optional().or(z.literal('')),
  work_mode: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  bullets: z.array(z.string()).default([]),
  skills_used: z.array(z.string()).default([]),
  logo_url: z.string().url().or(z.literal('')).optional(),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().default(0),
})
