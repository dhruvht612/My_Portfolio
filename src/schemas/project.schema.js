import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon_class: z.string().optional().or(z.literal('')),
  badge: z.string().optional().or(z.literal('')),
  features: z.array(z.string()).default([]),
  tech_stack: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  live_url: z.string().url().or(z.literal('')).or(z.literal('#')).optional(),
  code_url: z.string().url().or(z.literal('')).or(z.literal('#')).optional(),
  is_disabled: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().default(0),
  image_url: z.string().url().or(z.literal('')).optional(),
})
