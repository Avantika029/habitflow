'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Check, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import confetti from 'canvas-confetti'
import { Habit, HabitLog } from '@/types'
import { useHabitStore, useUIStore, useGamificationStore } from '@/lib/store'
import { todayISO } from '@/lib/utils/dateUtils'
import { getXPForCompletion } from '@/lib/utils/xpUtils'
import { calculateStreak } from '@/lib/utils/streakUtils'
import { getLogsForHabit, getAllLogs } from '@/lib/db'

interface HabitCardProps {
  habit: Habit
  log?: HabitLog
  streak: number
}

export default function HabitCard({ habit, log, streak }: HabitCardProps) {
  const { toggleHabit, removeHabit } = useHabitStore()
  const { openEditHabit } = useUIStore()
  const completed = log?.completed ?? false
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleToggle() {
    const wasCompleted = completed
    await toggleHabit(habit.id, todayISO())

    if (!wasCompleted) {
      // Fire confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: [habit.color, '#a78bfa', '#34d399', '#fbbf24'],
        scalar: 0.9,
      })

      // Award XP
      const { addXP, checkAchievements } = useGamificationStore.getState()
      addXP(getXPForCompletion(habit.difficulty))

      // Check achievements
      const logs = await getLogsForHabit(habit.id)
      const streak = calculateStreak(logs)
      const allLogs = await getAllLogs()
      const totalCompletions = allLogs.filter((l) => l.completed).length
      checkAchievements({ totalCompletions, longestStreak: streak })
    }
  }

  async function handleDelete() {
    if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
      await removeHabit(habit.id)
    }
    setMenuOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx(
        'relative flex items-center gap-4 rounded-2xl border p-4',
        'bg-white transition-all duration-200 dark:bg-(--surface-card)',
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

      {/* Streak counter */}
      {streak > 0 && (
        <div className="flex items-center gap-1 text-orange-500">
          <Flame size={14} />
          <span className="text-xs font-semibold">{streak}</span>
        </div>
      )}

      {/* Three-dot menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--surface-hover)"
          aria-label="Options"
        >
          <MoreVertical size={14} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute top-8 right-0 z-20 min-w-32 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-700 dark:bg-(--surface-card)">
              <button
                onClick={() => {
                  openEditHabit(habit.id)
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-(--text-secondary) transition-colors hover:bg-(--surface-hover)"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Completion toggle */}
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
