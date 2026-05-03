import { z } from 'zod'

const link = z.string().url().or(z.literal('')).optional()

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  typed_roles: z.array(z.string().min(1)).min(1, 'At least one role'),
  bio_story: z.array(z.string()).default([]),
  interests: z
    .array(
      z.object({
        icon: z.string(),
        title: z.string(),
        copy: z.string(),
      }),
    )
    .default([]),
  fun_facts: z
    .array(
      z.object({
        emoji: z.string(),
        title: z.string(),
        copy: z.string(),
      }),
    )
    .default([]),
  social_links: z.object({
    github: link,
    linkedin: link,
    instagram: link,
    email: z.string().optional().or(z.literal('')),
  }),
  resume_url: z.string().url().or(z.literal('')).optional(),
  footer_badges: z.array(z.string().min(1)).default([]),
})
