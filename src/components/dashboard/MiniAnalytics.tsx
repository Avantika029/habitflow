'use client'

import { useEffect, useState } from 'react'
import { getAllLogs } from '@/lib/db'
import { useHabitStore, useGamificationStore } from '@/lib/store'
import { useStreaks } from '@/lib/hooks/useHabits'
import { HabitLog } from '@/types'

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

export default function MiniAnalytics() {
  const { habits } = useHabitStore()
  const { totalXP } = useGamificationStore()
  const streaks = useStreaks()
  const [logs, setLogs] = useState<HabitLog[]>([])

  useEffect(() => {
    getAllLogs().then(setLogs)
  }, [])

  const activeHabits = habits.filter((h) => !h.isArchived)
  const last7 = getLast7Days()

  // Completion rate overall
  const totalPossible = logs.length
  const totalDone = logs.filter((l) => l.completed).length
  const completionRate =
    totalPossible === 0 ? 0 : Math.round((totalDone / totalPossible) * 100)

  // This week completions
  const weekDone = logs.filter(
    (l) => last7.includes(l.date) && l.completed
  ).length
  const weekPossible = activeHabits.length * 7

  // Best current streak across all habits
  const bestStreak =
    Object.values(streaks).length > 0 ? Math.max(...Object.values(streaks)) : 0

  // Progress bar fill (0-100)
  const barFill = completionRate
  const barBlocks = 12
  const filledBlocks = Math.round((barFill / 100) * barBlocks)

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white px-3 py-3 dark:border-stone-800 dark:bg-(--surface-card)">
      {/* Header */}
      <p className="text-xs font-semibold text-(--text-primary)">Analytics</p>

      {/* Big percentage */}
      <div className="flex items-end gap-2">
        <p className="text-2xl leading-none font-bold text-(--accent)">
          {completionRate}%
        </p>
        <p className="mb-0.5 text-[10px] text-(--text-muted)">completion</p>
      </div>

      {/* Progress bar blocks */}
      <div className="flex gap-0.5">
        {Array.from({ length: barBlocks }, (_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm transition-colors duration-300"
            style={{
              backgroundColor:
                i < filledBlocks ? 'var(--accent)' : 'var(--surface-hover)',
            }}
          />
        ))}
        <div
          className="h-2 flex-1 rounded-sm"
          style={{ backgroundColor: 'var(--surface-hover)' }}
        />
      </div>

      {/* Stats list */}
      <div className="mt-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <p className="text-[11px] text-(--text-secondary)">
              Current Streak
            </p>
          </div>
          <p className="text-[11px] font-semibold text-(--text-primary)">
            {bestStreak} days
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📈</span>
            <p className="text-[11px] text-(--text-secondary)">
              Completion Rate
            </p>
          </div>
          <p className="text-[11px] font-semibold text-(--text-primary)">
            {completionRate}%
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">✅</span>
            <p className="text-[11px] text-(--text-secondary)">This Week</p>
          </div>
          <p className="text-[11px] font-semibold text-(--text-primary)">
            {weekDone} / {weekPossible}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <p className="text-[11px] text-(--text-secondary)">XP Earned</p>
          </div>
          <p className="text-[11px] font-semibold text-(--accent)">
            +{totalXP}
          </p>
        </div>
      </div>
    </div>
  )
}
