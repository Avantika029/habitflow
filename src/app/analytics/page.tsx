'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useHabitStore } from '@/lib/store'
import { getAllLogs } from '@/lib/db'
import { HabitLog } from '@/types'
import { calculateLongestStreak } from '@/lib/utils/streakUtils'

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function shortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

interface StatCardProps {
  label: string
  value: string | number
  emoji: string
  color: string
}

function StatCard({ label, value, emoji, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: color + '22' }}
      >
        {emoji}
      </div>
      <div>
        <p className="text-xs text-(--text-muted)">{label}</p>
        <p className="text-xl font-bold text-(--text-primary)">{value}</p>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { habits, loadHabits } = useHabitStore()
  const [logs, setLogs] = useState<HabitLog[]>([])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])
  useEffect(() => {
    getAllLogs().then(setLogs)
  }, [])

  const last7 = getLast7Days()
  const activeHabits = habits.filter((h) => !h.isArchived)

  // Build chart data — % of habits completed each day
  const chartData = last7.map((date) => {
    const dayLogs = logs.filter((l) => l.date === date && l.completed)
    const pct =
      activeHabits.length === 0
        ? 0
        : Math.round((dayLogs.length / activeHabits.length) * 100)
    return { date: shortDate(date), pct }
  })

  // Total completions ever
  const totalCompletions = logs.filter((l) => l.completed).length

  // Best streak across all habits
  const bestStreak = activeHabits.reduce((best, habit) => {
    const habitLogs = logs.filter((l) => l.habitId === habit.id)
    return Math.max(best, calculateLongestStreak(habitLogs))
  }, 0)

  // Most consistent habit (highest completion count)
  const topHabit = activeHabits.reduce<{ name: string; count: number } | null>(
    (top, habit) => {
      const count = logs.filter(
        (l) => l.habitId === habit.id && l.completed
      ).length
      if (!top || count > top.count) return { name: habit.name, count }
      return top
    },
    null
  )

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-(--text-primary)">
        Analytics
      </h1>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total completions"
          value={totalCompletions}
          emoji="✅"
          color="#059669"
        />
        <StatCard
          label="Best streak ever"
          value={`${bestStreak} days`}
          emoji="🔥"
          color="#d97706"
        />
        <StatCard
          label="Most consistent"
          value={topHabit?.name ?? '—'}
          emoji="⭐"
          color="#7c3aed"
        />
      </div>

      {/* 7-day bar chart */}
      <div className="rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
        <h2 className="mb-4 text-sm font-semibold text-(--text-primary)">
          Last 7 days — completion %
        </h2>
        {totalCompletions === 0 ? (
          <div className="py-12 text-center text-(--text-muted)">
            <p className="mb-2 text-3xl">📊</p>
            <p className="text-sm">Complete some habits to see your chart</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--surface-hover)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Completed']}
                contentStyle={{
                  background: 'var(--surface-card)',
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="pct" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
