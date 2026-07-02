'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Flame,
  Trophy,
  Calendar,
  Target,
  Pencil,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useHabitStore, useUIStore } from '@/lib/store'
import { getLogsForHabit } from '@/lib/db'
import { HabitLog } from '@/types'
import {
  calculateStreak,
  calculateLongestStreak,
} from '@/lib/utils/streakUtils'
import { todayISO } from '@/lib/utils/dateUtils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getLast6Weeks(): string[][] {
  const weeks: string[][] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - 41)
  start.setDate(start.getDate() - start.getDay())
  const current = new Date(start)
  while (current <= today) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      week.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

export default function HabitDetailClient() {
  const params = useParams()
  const router = useRouter()
  const { habits, todayLogs, toggleHabit, loadHabits, loadTodayLogs } =
    useHabitStore()
  const { openEditHabit } = useUIStore()
  const [logs, setLogs] = useState<HabitLog[]>([])
  const today = todayISO()

  const habitId = params.id as string
  const habit = habits.find((h) => h.id === habitId)

  useEffect(() => {
    loadHabits()
    loadTodayLogs()
  }, [loadHabits, loadTodayLogs])

  useEffect(() => {
    if (habitId) getLogsForHabit(habitId).then(setLogs)
  }, [habitId])

  const currentStreak = useMemo(() => calculateStreak(logs), [logs])
  const longestStreak = useMemo(() => calculateLongestStreak(logs), [logs])
  const totalCompletions = useMemo(
    () => logs.filter((l) => l.completed).length,
    [logs]
  )
  const completionRate = useMemo(() => {
    if (logs.length === 0) return 0
    return Math.round((totalCompletions / logs.length) * 100)
  }, [logs, totalCompletions])

  const todayLog = todayLogs.find(
    (l) => l.habitId === habitId && l.date === today
  )
  const completedToday = todayLog?.completed ?? false
  const weeks = getLast6Weeks()

  function getCell(date: string) {
    if (date > today) return 'future'
    const log = logs.find((l) => l.date === date && l.completed)
    return log ? 'done' : 'missed'
  }

  if (!habit) {
    return (
      <div className="mx-auto max-w-xl p-6 py-20 text-center">
        <p className="mb-3 text-4xl">🔍</p>
        <p className="text-(--text-muted)">Habit not found</p>
        <button
          onClick={() => router.push('/habits')}
          className="mt-4 text-sm text-(--accent) hover:underline"
        >
          Back to habits
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:bg-(--surface-hover)"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: habit.color + '22' }}
            >
              {habit.icon}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-(--text-primary)">
                {habit.name}
              </h1>
              <p className="text-xs text-(--text-muted)">{habit.category}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => openEditHabit(habit.id)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:bg-(--surface-hover)"
        >
          <Pencil size={16} />
        </button>
      </div>

      {/* Complete today button */}
      <motion.button
        onClick={() => toggleHabit(habit.id, today)}
        whileTap={{ scale: 0.97 }}
        className={clsx(
          'mb-6 w-full rounded-2xl py-3.5 text-sm font-semibold transition-all duration-200',
          completedToday
            ? 'border-2 border-(--accent) bg-(--accent-light) text-(--accent)'
            : 'bg-(--accent) text-white'
        )}
      >
        {completedToday ? '✓ Completed today' : 'Mark as done today'}
      </motion.button>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {[
          {
            icon: <Flame size={16} />,
            label: 'Current streak',
            value: `${currentStreak} days`,
            color: '#d97706',
          },
          {
            icon: <Trophy size={16} />,
            label: 'Best streak',
            value: `${longestStreak} days`,
            color: '#7c3aed',
          },
          {
            icon: <Target size={16} />,
            label: 'Completion rate',
            value: `${completionRate}%`,
            color: '#059669',
          },
          {
            icon: <Calendar size={16} />,
            label: 'Total done',
            value: `${totalCompletions}`,
            color: '#2563eb',
          },
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)"
          >
            <div
              className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: color + '22', color }}
            >
              {icon}
            </div>
            <p className="text-xs text-(--text-muted)">{label}</p>
            <p className="text-lg font-bold text-(--text-primary)">{value}</p>
          </div>
        ))}
      </div>

      {/* Mini heatmap */}
      <div className="mb-6 rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
        <h2 className="mb-3 text-sm font-semibold text-(--text-primary)">
          Last 6 weeks
        </h2>
        <div className="flex gap-1">
          <div className="mr-1 flex flex-col gap-1">
            {WEEKDAYS.map((d, i) => (
              <div
                key={i}
                className="flex h-3 w-3 items-center justify-center text-[9px] text-(--text-muted)"
              >
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((date, di) => {
                const cell = getCell(date)
                const isToday = date === today
                return (
                  <motion.div
                    key={di}
                    whileHover={{ scale: 1.4 }}
                    title={date}
                    className="h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor:
                        cell === 'future'
                          ? 'transparent'
                          : cell === 'done'
                            ? habit.color
                            : 'var(--surface-hover)',
                      outline: isToday ? `1.5px solid ${habit.color}` : 'none',
                      outlineOffset: '1px',
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Recent history */}
      <div className="rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
        <h2 className="mb-3 text-sm font-semibold text-(--text-primary)">
          Recent history
        </h2>
        {logs.length === 0 ? (
          <p className="py-4 text-center text-sm text-(--text-muted)">
            No history yet — complete this habit to start tracking
          </p>
        ) : (
          <div className="space-y-2">
            {[...logs]
              .sort((a, b) => (b.date > a.date ? 1 : -1))
              .slice(0, 14)
              .map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between border-b border-stone-50 py-1.5 last:border-0 dark:border-stone-800"
                >
                  <span className="text-sm text-(--text-secondary)">
                    {new Date(log.date + 'T00:00:00').toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      }
                    )}
                  </span>
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      log.completed
                        ? 'bg-(--accent-light) text-(--accent)'
                        : 'bg-red-50 text-red-400'
                    )}
                  >
                    {log.completed ? '✓ Done' : 'Missed'}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
