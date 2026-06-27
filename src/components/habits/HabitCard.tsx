'use client'

import { motion } from 'framer-motion'
import { Flame, Check } from 'lucide-react'
import { clsx } from 'clsx'
import { Habit, HabitLog } from '@/types'
import { useHabitStore } from '@/lib/store'
import { todayISO } from '@/lib/utils/dateUtils'

interface HabitCardProps {
  habit: Habit
  log?: HabitLog
  streak: number
}

export default function HabitCard({ habit, log, streak }: HabitCardProps) {
  const { toggleHabit } = useHabitStore()
  const completed = log?.completed ?? false

  async function handleToggle() {
    await toggleHabit(habit.id, todayISO())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx(
        'relative flex items-center gap-4 rounded-2xl border p-4',
        'bg-white dark:bg-(--surface-card)',
        'transition-all duration-200',
        completed
          ? 'border-(--accent) bg-(--accent-light) dark:bg-(--accent-light)'
          : 'border-stone-100 hover:border-stone-300 dark:border-stone-800'
      )}
    >
      {/* Icon */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: habit.color + '22' }}
      >
        {habit.icon}
      </div>

      {/* Name + category */}
      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            'truncate text-sm font-medium',
            completed
              ? 'text-(--text-muted) line-through'
              : 'text-(--text-primary)'
          )}
        >
          {habit.name}
        </p>
        <p className="mt-0.5 text-xs text-(--text-muted)">{habit.category}</p>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-1 text-orange-500">
          <Flame size={14} />
          <span className="text-xs font-semibold">{streak}</span>
        </div>
      )}

      {/* Toggle button */}
      <motion.button
        onClick={handleToggle}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full border-2',
          'shrink-0 transition-colors duration-200',
          completed
            ? 'border-(--accent) bg-(--accent)'
            : 'border-stone-300 hover:border-(--accent) dark:border-stone-600'
        )}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {completed && (
          <Check size={14} className="text-white" strokeWidth={3} />
        )}
      </motion.button>
    </motion.div>
  )
}
