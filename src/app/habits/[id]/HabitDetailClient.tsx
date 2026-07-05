'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Flame,
  Trophy,
  Target,
  CheckSquare,
  Pencil,
  Zap,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useHabitStore, useUIStore, useGamificationStore } from '@/lib/store'
import { getLogsForHabit } from '@/lib/db'
import { HabitLog } from '@/types'
import {
  calculateStreak,
  calculateLongestStreak,
} from '@/lib/utils/streakUtils'
import { todayISO } from '@/lib/utils/dateUtils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getLast8Weeks(): string[][] {
  const weeks: string[][] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - 55)
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

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  bg: string
}

function StatCard({ icon, label, value, color, bg }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3 dark:border-stone-800 dark:bg-(--surface-card)">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: bg, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="mb-0.5 text-[10px] leading-none text-(--text-muted)">
          {label}
        </p>
        <p className="text-lg leading-none font-bold text-(--text-primary)">
          {value}
        </p>
      </div>
    </div>
  )
}

export default function HabitDetailClient() {
  const params = useParams()
  const router = useRouter()
  const { habits, todayLogs, toggleHabit, loadHabits, loadTodayLogs } =
    useHabitStore()
  const { openEditHabit } = useUIStore()
  const { achievements } = useGamificationStore()
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
  const weeks = getLast8Weeks()
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt)

  const recentHistory = [...logs]
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .slice(0, 6)

  function getCell(date: string) {
    if (date > today) return 'future'
    return logs.find((l) => l.date === date && l.completed) ? 'done' : 'missed'
  }

  if (!habit) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-4xl">🔍</p>
          <p className="mb-3 text-sm text-(--text-muted)">Habit not found</p>
          <button
            onClick={() => router.push('/habits')}
            className="text-xs text-(--accent) hover:underline"
          >
            Back to habits
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        padding: '10px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'auto auto 1fr auto',
          gap: '8px',
        }}
      >
        {/* ── ROW 1: Header ── */}
        <div
          style={{ gridColumn: '1 / 13', gridRow: '1' }}
          className="flex items-center gap-2"
        >
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-stone-100 bg-white text-(--text-secondary) transition-colors hover:bg-(--surface-hover) dark:border-stone-800 dark:bg-(--surface-card)"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-stone-100 bg-white px-3 py-2 dark:border-stone-800 dark:bg-(--surface-card)">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: habit.color + '22' }}
            >
              {habit.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-(--text-primary)">
                {habit.name}
              </p>
              <p className="text-[10px] text-(--text-muted)">
                {habit.category} · {habit.difficulty} ·{' '}
                {habit.schedule.frequency}
              </p>
            </div>
            {currentStreak > 0 && (
              <div className="flex shrink-0 items-center gap-1 text-orange-500">
                <Flame size={13} />
                <span className="text-xs font-bold">{currentStreak}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => openEditHabit(habit.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--accent-light) text-(--accent) transition-opacity hover:opacity-80"
          >
            <Pencil size={13} />
          </button>

          <motion.button
            onClick={() => toggleHabit(habit.id, today)}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            className={clsx(
              'shrink-0 rounded-2xl px-4 py-2 text-xs font-semibold transition-all',
              completedToday
                ? 'border-2 border-(--accent) bg-(--accent-light) text-(--accent)'
                : 'bg-(--accent) text-white shadow-md'
            )}
          >
            {completedToday ? '✓ Done today' : 'Mark done'}
          </motion.button>
        </div>

        {/* ── ROW 2: 4 stat cards ── */}

        <div style={{ gridColumn: '1 / 4', gridRow: '2' }}>
          <StatCard
            icon={<Flame size={15} />}
            label="Current streak"
            value={`${currentStreak}d`}
            color="#d97706"
            bg="#d9780622"
          />
        </div>
        <div style={{ gridColumn: '4 / 7', gridRow: '2' }}>
          <StatCard
            icon={<Trophy size={15} />}
            label="Best streak"
            value={`${longestStreak}d`}
            color="#7c3aed"
            bg="#7c3aed22"
          />
        </div>
        <div style={{ gridColumn: '7 / 10', gridRow: '2' }}>
          <StatCard
            icon={<Target size={15} />}
            label="Completion"
            value={`${completionRate}%`}
            color="#059669"
            bg="#05966922"
          />
        </div>
        <div style={{ gridColumn: '10 / 13', gridRow: '2' }}>
          <StatCard
            icon={<CheckSquare size={15} />}
            label="Total done"
            value={`${totalCompletions}`}
            color="#2563eb"
            bg="#2563eb22"
          />
        </div>

        {/* ── ROW 3: Heatmap + Recent + Achievements ── */}

        {/* Heatmap */}
        <div
          className="flex flex-col rounded-2xl border border-stone-100 bg-white p-3 dark:border-stone-800 dark:bg-(--surface-card)"
          style={{ gridColumn: '1 / 9', gridRow: '3' }}
        >
          <p className="mb-2 shrink-0 text-[11px] font-semibold tracking-wide text-(--text-muted) uppercase">
            Activity — last 8 weeks
          </p>
          <div className="flex flex-1 gap-0.5">
            <div
              className="mr-1 flex flex-col justify-between"
              style={{ paddingBlock: 1 }}
            >
              {WEEKDAYS.map((d, i) => (
                <div key={i} className="text-[8px] text-(--text-muted)">
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-1 flex-col gap-0.5">
                {week.map((date, di) => {
                  const cell = getCell(date)
                  const isToday = date === today
                  return (
                    <motion.div
                      key={di}
                      whileHover={{ scale: 1.3 }}
                      title={date}
                      className="flex-1 rounded-sm"
                      style={{
                        backgroundColor:
                          cell === 'future'
                            ? 'transparent'
                            : cell === 'done'
                              ? habit.color
                              : 'var(--surface-hover)',
                        outline: isToday
                          ? `1.5px solid ${habit.color}`
                          : 'none',
                        outlineOffset: '1px',
                        minHeight: 8,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex shrink-0 items-center justify-end gap-1">
            <span className="text-[8px] text-(--text-muted)">Less</span>
            {[
              'var(--surface-hover)',
              habit.color + '44',
              habit.color + '88',
              habit.color,
            ].map((c, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: c }}
              />
            ))}
            <span className="text-[8px] text-(--text-muted)">More</span>
          </div>
        </div>

        {/* Recent + Achievements */}
        <div
          style={{ gridColumn: '9 / 13', gridRow: '3' }}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-1 flex-col rounded-2xl border border-stone-100 bg-white p-3 dark:border-stone-800 dark:bg-(--surface-card)">
            <p className="mb-2 shrink-0 text-[11px] font-semibold tracking-wide text-(--text-muted) uppercase">
              Recent
            </p>
            {recentHistory.length === 0 ? (
              <p className="text-[10px] text-(--text-muted)">No activity yet</p>
            ) : (
              <div className="flex flex-col gap-1">
                {recentHistory.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-2 rounded-xl bg-(--surface-hover) px-2 py-1"
                  >
                    <span
                      className={clsx(
                        'shrink-0 text-[10px] font-bold',
                        log.completed ? 'text-emerald-500' : 'text-red-400'
                      )}
                    >
                      {log.completed ? '✓' : '✗'}
                    </span>
                    <p className="truncate text-[10px] text-(--text-secondary)">
                      {new Date(log.date + 'T00:00:00').toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col rounded-2xl border border-stone-100 bg-white p-3 dark:border-stone-800 dark:bg-(--surface-card)">
            <p className="mb-2 shrink-0 text-[11px] font-semibold tracking-wide text-(--text-muted) uppercase">
              Badges
            </p>
            {unlockedAchievements.length === 0 ? (
              <p className="text-[10px] text-(--text-muted)">
                Complete habits to unlock badges
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {unlockedAchievements.map((a) => (
                  <div
                    key={a.id}
                    title={a.description}
                    className="flex items-center gap-1 rounded-lg bg-(--accent-light) px-2 py-1"
                  >
                    <span className="text-xs">{a.icon}</span>
                    <span className="text-[10px] font-medium text-(--accent)">
                      {a.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 4: Motivation banner ── */}
        <div
          className="flex items-center gap-4 rounded-2xl px-4 py-2.5"
          style={{
            gridColumn: '1 / 13',
            gridRow: '4',
            background: `linear-gradient(135deg, ${habit.color}18, ${habit.color}33)`,
            border: `1px solid ${habit.color}30`,
          }}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: habit.color }}
          >
            <Zap size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-(--text-primary)">
              {currentStreak > 0
                ? `${currentStreak} day streak! 🔥`
                : 'Start your streak today!'}
            </p>
            <p className="text-[10px] text-(--text-muted)">
              {completionRate >= 80
                ? 'Outstanding consistency — keep going!'
                : completionRate >= 50
                  ? 'Good progress — push for 80%!'
                  : 'Every completion counts. Build the habit.'}
            </p>
          </div>
          <div className="w-32 shrink-0">
            <div className="mb-1 flex justify-between text-[9px] text-(--text-muted)">
              <span>Completion</span>
              <span>{completionRate}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/40">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: habit.color }}
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
