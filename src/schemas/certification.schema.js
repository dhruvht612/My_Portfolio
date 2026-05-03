import { z } from 'zod'

export const certificationSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  issued_date: z.string().optional().or(z.literal('')),
  credential_id: z.string().nullable().optional(),
  credential_url: z.string().url().or(z.literal('')).or(z.literal('#')).optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional().or(z.literal('')),
  is_featured: z.boolean().default(false),
  learned: z.string().optional().or(z.literal('')),
  applied: z.string().optional().or(z.literal('')),
  applied_project: z.string().optional().or(z.literal('')),
  /** Optional until DB migration adds column */
  image_url: z.string().url().or(z.literal('')).optional(),
})
