'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getAllLogs } from '@/lib/db'
import { useHabitStore } from '@/lib/store'
import { HabitLog } from '@/types'

function getLast12Weeks(): string[][] {
  const weeks: string[][] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from 83 days ago (12 weeks) aligned to Sunday
  const start = new Date(today)
  start.setDate(today.getDate() - 83)
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay())

  let current = new Date(start)
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

function getMonthLabels(weeks: string[][]): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, i) => {
    const d = new Date(week[0] + 'T00:00:00')
    const month = d.getMonth()
    if (month !== lastMonth) {
      labels.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        col: i,
      })
      lastMonth = month
    }
  })
  return labels
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function WeeklyHeatmap() {
  const { habits } = useHabitStore()
  const [logs, setLogs] = useState<HabitLog[]>([])
  const weeks = getLast12Weeks()
  const monthLabels = getMonthLabels(weeks)
  const today = new Date().toISOString().split('T')[0]
  const activeHabits = habits.filter((h) => !h.isArchived)

  useEffect(() => {
    getAllLogs().then(setLogs)
  }, [])

  function getRate(date: string): number {
    if (date > today) return -1 // future
    if (activeHabits.length === 0) return 0
    const dayLogs = logs.filter((l) => l.date === date && l.completed)
    return dayLogs.length / activeHabits.length
  }

  function getCellColor(rate: number): string {
    if (rate < 0) return 'transparent' // future
    if (rate === 0) return 'var(--surface-hover)'
    if (rate < 0.34) return 'var(--accent)33'
    if (rate < 0.67) return 'var(--accent)77'
    if (rate < 1) return 'var(--accent)aa'
    return 'var(--accent)'
  }

  function getTooltip(date: string, rate: number): string {
    if (rate < 0) return ''
    if (rate === 0) return `${date} — no completions`
    return `${date} — ${Math.round(rate * 100)}% completed`
  }

  return (
    <div className="mb-4 rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
      <h2 className="mb-3 text-sm font-semibold text-(--text-primary)">
        Activity — last 12 weeks
      </h2>

      {/* Month labels */}
      <div className="mb-1 ml-6 flex gap-1">
        {weeks.map((_, i) => {
          const label = monthLabels.find((m) => m.col === i)
          return (
            <div
              key={i}
              className="w-3 shrink-0 text-[9px] text-(--text-muted)"
            >
              {label?.label ?? ''}
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="mr-1 flex flex-col gap-1">
          {DAYS.map((d, i) => (
            <div
              key={i}
              className="flex h-3 w-3 items-center justify-center text-[9px] text-(--text-muted)"
            >
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date, di) => {
              const rate = getRate(date)
              const isToday = date === today
              return (
                <motion.div
                  key={di}
                  whileHover={{ scale: 1.4 }}
                  title={getTooltip(date, rate)}
                  className="h-3 w-3 cursor-default rounded-sm transition-colors duration-200"
                  style={{
                    backgroundColor: getCellColor(rate),
                    outline: isToday ? '1.5px solid var(--accent)' : 'none',
                    outlineOffset: '1px',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[10px] text-(--text-muted)">Less</span>
        {[
          'var(--surface-hover)',
          'var(--accent)33',
          'var(--accent)77',
          'var(--accent)aa',
          'var(--accent)',
        ].map((c, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: c }}
          />
        ))}
        <span className="text-[10px] text-(--text-muted)">More</span>
      </div>
    </div>
  )
}
