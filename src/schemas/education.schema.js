import { z } from 'zod'

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  logo_url: z.string().url().or(z.literal('')).optional(),
  progress_percent: z.number().int().min(0).max(100).default(50),
  focus_areas: z.array(z.string()).default([]),
  highlights: z
    .array(
      z.object({
        icon: z.string(),
        title: z.string(),
        description: z.string(),
      }),
    )
    .default([]),
  is_active: z.boolean().default(true),
})
