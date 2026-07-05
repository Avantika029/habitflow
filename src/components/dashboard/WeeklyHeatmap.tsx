'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getAllLogs } from '@/lib/db'
import { useHabitStore } from '@/lib/store'
import { HabitLog } from '@/types'

function getLast16Weeks(): string[][] {
  const weeks: string[][] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - 111)
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

export default function WeeklyHeatmap() {
  const { habits } = useHabitStore()
  const [logs, setLogs] = useState<HabitLog[]>([])
  const weeks = getLast16Weeks()
  const monthLabels = getMonthLabels(weeks)
  const today = new Date().toISOString().split('T')[0]
  const activeHabits = habits.filter((h) => !h.isArchived)

  useEffect(() => {
    getAllLogs().then(setLogs)
  }, [])

  function getRate(date: string): number {
    if (date > today) return -1
    if (activeHabits.length === 0) return 0
    const dayLogs = logs.filter((l) => l.date === date && l.completed)
    return dayLogs.length / activeHabits.length
  }

  function getCellColor(rate: number): string {
    if (rate < 0) return 'transparent'
    if (rate === 0) return 'var(--surface-hover)'
    if (rate < 0.34) return 'var(--accent)33'
    if (rate < 0.67) return 'var(--accent)77'
    if (rate < 1) return 'var(--accent)aa'
    return 'var(--accent)'
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-stone-100 bg-white px-3 py-2 dark:border-stone-800 dark:bg-(--surface-card)">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[11px] font-semibold text-(--text-primary)">
          Activity
        </p>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-(--text-muted)">Less</span>
          {[
            'var(--surface-hover)',
            'var(--accent)33',
            'var(--accent)77',
            'var(--accent)aa',
            'var(--accent)',
          ].map((c, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: c }}
            />
          ))}
          <span className="text-[9px] text-(--text-muted)">More</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="mb-0.5 ml-4 flex gap-0.5">
        {weeks.map((_, i) => {
          const label = monthLabels.find((m) => m.col === i)
          return (
            <div
              key={i}
              className="flex-1 truncate text-[8px] text-(--text-muted)"
            >
              {label?.label ?? ''}
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div className="flex flex-1 gap-0.5">
        {/* Day labels */}
        <div
          className="mr-0.5 flex flex-col justify-between"
          style={{ paddingTop: 1, paddingBottom: 1 }}
        >
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div
              key={i}
              className="text-[8px] leading-none text-(--text-muted)"
            >
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-1 flex-col gap-0.5">
            {week.map((date, di) => {
              const rate = getRate(date)
              const isToday = date === today
              return (
                <motion.div
                  key={di}
                  whileHover={{ scale: 1.4 }}
                  title={`${date} — ${rate < 0 ? 'future' : rate === 0 ? 'no activity' : Math.round(rate * 100) + '%'}`}
                  className="flex-1 rounded-sm"
                  style={{
                    backgroundColor: getCellColor(rate),
                    outline: isToday ? '1.5px solid var(--accent)' : 'none',
                    outlineOffset: '1px',
                    minHeight: 8,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
