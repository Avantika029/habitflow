import { z } from 'zod'

export const habitSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less'),

  description: z
    .string()
    .max(200, 'Description must be 200 characters or less')
    .optional(),

  icon: z.string().min(1, 'Please pick an icon'),

  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),

  category: z.string().min(1, 'Category is required'),

  priority: z.enum(['low', 'medium', 'high']),

  difficulty: z.enum(['easy', 'medium', 'hard']),

  frequency: z.enum(['daily', 'weekly', 'monthly', 'interval', 'custom']),

  intervalDays: z
    .number()
    .min(1, 'Must be at least 1 day')
    .max(365, 'Must be 365 days or less')
    .optional(),

  targetCount: z.number().min(1, 'Target must be at least 1').max(100),

  unit: z.string().optional(),

  motivationalQuote: z.string().max(150).optional(),
})

export type HabitFormValues = z.infer<typeof habitSchema>
