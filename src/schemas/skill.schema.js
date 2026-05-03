import { z } from 'zod'

export const skillSchema = z.object({
  skill_group_id: z.string().uuid(),
  name: z.string().min(1),
  proficiency: z.number().int().min(0).max(100),
  icon_class: z.string().optional().or(z.literal('')),
  level: z.string().optional().or(z.literal('')),
  details: z.array(z.string()).default([]),
  related_project_id: z.preprocess((v) => (v === '' || v === undefined ? null : v), z.string().uuid().nullable().optional()),
  display_order: z.number().int().default(0),
})
