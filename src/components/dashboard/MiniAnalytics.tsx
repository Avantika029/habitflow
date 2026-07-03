'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { getAllLogs } from '@/lib/db'
import { useHabitStore } from '@/lib/store'
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
  const [logs, setLogs] = useState<HabitLog[]>([])

  useEffect(() => {
    getAllLogs().then(setLogs)
  }, [])

  const activeHabits = habits.filter((h) => !h.isArchived)
  const last7 = getLast7Days()

  const data = last7.map((date) => {
    const dayLogs = logs.filter((l) => l.date === date && l.completed)
    const pct =
      activeHabits.length === 0
        ? 0
        : Math.round((dayLogs.length / activeHabits.length) * 100)
    const d = new Date(date + 'T00:00:00')
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      pct,
    }
  })

  const avg = Math.round(data.reduce((s, d) => s + d.pct, 0) / 7)

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-semibold text-(--text-primary)">Analytics</p>
        <span className="text-xs font-bold text-emerald-500">+{avg}%</span>
      </div>
      <p className="mb-3 text-xs text-(--text-muted)">7-day completion avg</p>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={data} barSize={14}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, '']}
            contentStyle={{
              background: 'var(--surface-card)',
              border: '0.5px solid var(--border)',
              borderRadius: '8px',
              fontSize: '11px',
            }}
          />
          <Bar dataKey="pct" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
