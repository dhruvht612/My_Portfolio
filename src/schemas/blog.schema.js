import { z } from 'zod'

export const blogSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  content: z.string().optional().or(z.literal('')),
  excerpt: z.string().optional().or(z.literal('')),
  cover_image_url: z.string().url().or(z.literal('')).optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']),
  published_at: z.string().nullable().optional(),
})
