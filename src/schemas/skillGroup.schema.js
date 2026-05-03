import { z } from 'zod'

export const skillGroupSchema = z.object({
  group_name: z.string().min(1),
  icon_class: z.string().optional().or(z.literal('')),
  display_order: z.number().int().default(0),
})
