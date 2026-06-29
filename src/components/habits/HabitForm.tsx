'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { habitSchema, HabitFormValues } from '@/lib/validators/habitSchema'
import { useHabitStore, useUIStore } from '@/lib/store'
import { Habit } from '@/types'
import { todayISO } from '@/lib/utils/dateUtils'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const EMOJI_OPTIONS = [
  '🏃',
  '💪',
  '📚',
  '🧘',
  '💧',
  '🥗',
  '😴',
  '✍️',
  '🎯',
  '🎨',
  '🎵',
  '💻',
  '🌱',
  '🧹',
  '💊',
  '☕',
  '🚴',
  '🏊',
  '🧠',
  '❤️',
  '🌞',
  '📝',
  '🔥',
  '⭐',
]

const COLOR_OPTIONS = [
  '#7c3aed',
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#0891b2',
  '#65a30d',
]

const CATEGORIES = [
  'Fitness',
  'Study',
  'Mindfulness',
  'Health',
  'Productivity',
  'Finance',
  'Social',
  'Creative',
  'Other',
]

export default function HabitForm({
  existingHabit,
}: {
  existingHabit?: Habit
}) {
  const { addHabit, updateHabit, habits } = useHabitStore()
  const { closeCreateHabit, closeEditHabit } = useUIStore()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      icon: existingHabit?.icon ?? '🎯',
      color: existingHabit?.color ?? '#7c3aed',
      priority: existingHabit?.priority ?? 'medium',
      difficulty: existingHabit?.difficulty ?? 'medium',
      frequency: existingHabit?.schedule.frequency ?? 'daily',
      intervalDays: existingHabit?.schedule.intervalDays,
      targetCount: existingHabit?.targetCount ?? 1,
      category: existingHabit?.category ?? 'Other',
      name: existingHabit?.name ?? '',
      description: existingHabit?.description ?? '',
      motivationalQuote: existingHabit?.motivationalQuote ?? '',
    },
  })

  const selectedIcon = useWatch({ control, name: 'icon' })
  const selectedColor = useWatch({ control, name: 'color' })
  const selectedFrequency = useWatch({ control, name: 'frequency' })

  async function onSubmit(values: HabitFormValues) {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: values.name,
      description: values.description,
      icon: values.icon,
      color: values.color,
      category: values.category,
      tags: [],
      priority: values.priority,
      difficulty: values.difficulty,
      schedule: {
        frequency: values.frequency,
        // Store intervalDays when "Every X days" is selected
        intervalDays:
          values.frequency === 'interval' ? values.intervalDays : undefined,
      },
      targetCount: values.targetCount,
      unit: values.unit,
      motivationalQuote: values.motivationalQuote,
      startDate: todayISO(),
      isArchived: false,
      isPinned: false,
      order: habits.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (existingHabit) {
      await updateHabit({
        ...newHabit,
        id: existingHabit.id,
        createdAt: existingHabit.createdAt,
      })
      closeEditHabit()
    } else {
      await addHabit(newHabit)
      closeCreateHabit()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Icon picker */}
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-(--text-secondary) uppercase">
          Icon
        </p>
        <div className="grid grid-cols-8 gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              type="button"
              key={emoji}
              onClick={() => setValue('icon', emoji)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all duration-100 ${
                selectedIcon === emoji
                  ? 'scale-110 border-(--accent) bg-(--accent-light)'
                  : 'border-transparent hover:bg-(--surface-hover)'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        {errors.icon && (
          <p className="mt-1 text-xs text-red-500">{errors.icon.message}</p>
        )}
      </div>

      {/* Colour picker */}
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-(--text-secondary) uppercase">
          Colour
        </p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              type="button"
              key={color}
              onClick={() => setValue('color', color)}
              className={`h-8 w-8 rounded-full transition-all duration-100 ${
                selectedColor === color
                  ? 'scale-125 ring-2 ring-(--accent) ring-offset-2'
                  : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      {/* Name */}
      <Input
        label="Habit name"
        placeholder="e.g. Morning run, Read 20 pages..."
        error={errors.name?.message}
        {...register('name')}
      />

      {/* Description */}
      <Input
        label="Description (optional)"
        placeholder="Why does this habit matter to you?"
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Category + Frequency row */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Category"
          error={errors.category?.message}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          {...register('category')}
        />
        <Select
          label="Frequency"
          error={errors.frequency?.message}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'interval', label: 'Every X days' },
          ]}
          {...register('frequency')}
        />
      </div>

      {/* Interval input — only shown when "Every X days" is selected */}
      {selectedFrequency === 'interval' && (
        <Input
          label="Repeat every X days"
          type="number"
          placeholder="e.g. 3"
          hint="Enter how many days between each repeat"
          error={errors.intervalDays?.message}
          {...register('intervalDays', { valueAsNumber: true })}
        />
      )}

      {/* Priority + Difficulty row */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Priority"
          error={errors.priority?.message}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          {...register('priority')}
        />
        <Select
          label="Difficulty"
          error={errors.difficulty?.message}
          options={[
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
          ]}
          {...register('difficulty')}
        />
      </div>

      {/* Motivational quote */}
      <Input
        label="Motivational quote (optional)"
        placeholder="A quote that keeps you going..."
        error={errors.motivationalQuote?.message}
        {...register('motivationalQuote')}
      />

      {/* Preview + Submit */}
      <div className="flex items-center gap-3 border-t border-stone-100 pt-2 dark:border-stone-800">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: selectedColor + '22' }}
        >
          {selectedIcon}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-(--accent) py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving...'
            : existingHabit
              ? 'Update habit'
              : 'Create habit'}
        </button>
      </div>
    </form>
  )
}
