'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const { toggleHabit, removeHabit } = useHabitStore()
  const { openEditHabit } = useUIStore()
  const completed = log?.completed ?? false
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    const wasCompleted = completed
    await toggleHabit(habit.id, todayISO())

    const { addXP, checkAchievements } = useGamificationStore.getState()

    if (!wasCompleted) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: [habit.color, '#a78bfa', '#34d399', '#fbbf24'],
        scalar: 0.9,
      })
      addXP(getXPForCompletion(habit.difficulty))
      const logs = await getLogsForHabit(habit.id)
      const streak = calculateStreak(logs)
      const allLogs = await getAllLogs()
      const totalCompletions = allLogs.filter((l) => l.completed).length
      checkAchievements({ totalCompletions, longestStreak: streak })
    } else {
      // Remove XP when unchecking
      addXP(-getXPForCompletion(habit.difficulty))
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
      await removeHabit(habit.id)
    }
    setMenuOpen(false)
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    openEditHabit(habit.id)
    setMenuOpen(false)
  }

  function handleMenuToggle(e: React.MouseEvent) {
    e.stopPropagation()
    // Calculate position so menu always appears fully visible
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      right: window.innerWidth - rect.right,
    })
    setMenuOpen((o) => !o)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={() => router.push(`/habits/detail?id=${habit.id}`)}
        className={clsx(
          'relative flex cursor-pointer items-center gap-3 rounded-2xl border p-3',
          'bg-white transition-all duration-200 dark:bg-(--surface-card)',
          completed
            ? 'border-(--accent) bg-(--accent-light) dark:bg-(--accent-light)'
            : 'border-stone-100 hover:border-stone-300 dark:border-stone-800'
        )}
      >
        {/* Icon */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
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
          <p className="mt-0.5 truncate text-xs text-(--text-muted)">
            {habit.category}
          </p>
        </div>

        {/* Streak counter */}
        {streak > 0 && (
          <div className="flex shrink-0 items-center gap-0.5 text-orange-500">
            <Flame size={12} />
            <span className="text-xs font-semibold">{streak}</span>
          </div>
        )}

        {/* Three-dot menu button */}
        <button
          onClick={handleMenuToggle}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--surface-hover)"
          aria-label="Options"
        >
          <MoreVertical size={13} />
        </button>

        {/* Completion toggle */}
        <motion.button
          onClick={handleToggle}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          className={clsx(
            'flex h-7 w-7 items-center justify-center rounded-full border-2',
            'shrink-0 transition-colors duration-200',
            completed
              ? 'border-(--accent) bg-(--accent)'
              : 'border-stone-300 hover:border-(--accent) dark:border-stone-600'
          )}
          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {completed && (
            <Check size={12} className="text-white" strokeWidth={3} />
          )}
        </motion.button>
      </motion.div>

      {/* Menu rendered in portal-style fixed position — never clipped */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(false)
            }}
          />
          <div
            className="fixed z-50 min-w-36 rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-stone-700 dark:bg-(--surface-card)"
            style={{
              top: menuPos.top,
              right: menuPos.right,
            }}
          >
            <button
              onClick={handleEdit}
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
    </>
  )
}
