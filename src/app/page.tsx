'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Flame, Zap, CheckSquare } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useHabitStore, useUIStore, useGamificationStore } from '@/lib/store'
import { useStreaks } from '@/lib/hooks/useHabits'
import { todayISO } from '@/lib/utils/dateUtils'
import SortableHabitCard from '@/components/habits/SortableHabitCard'
import XPBar from '@/components/dashboard/XPBar'
import WeeklyHeatmap from '@/components/dashboard/WeeklyHeatmap'
import AchievementToast from '@/components/dashboard/AchievementToast'
import WeatherWidget from '@/components/dashboard/WeatherWidget'
import SuggestedHabits from '@/components/dashboard/SuggestedHabits'
import MiniAnalytics from '@/components/dashboard/MiniAnalytics'
import MiniCalendar from '@/components/dashboard/MiniCalendar'
import { Achievement } from '@/lib/store/gamificationStore'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning ☀️'
  if (h < 17) return 'Good afternoon 🌤️'
  return 'Good evening 🌙'
}

function getDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const { habits, todayLogs, loadHabits, loadTodayLogs, reorderHabits } =
    useHabitStore()
  const { openCreateHabit } = useUIStore()
  const { achievements, markToastShown, level, totalXP } =
    useGamificationStore()
  const streaks = useStreaks()
  const today = todayISO()
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(
    null
  )

  useEffect(() => {
    loadHabits()
    loadTodayLogs()
  }, [loadHabits, loadTodayLogs])

  useEffect(() => {
    const unshown = achievements.find((a) => a.unlockedAt && !a.toastShown)
    if (!unshown) return
    const timer = setTimeout(() => {
      setToastAchievement(unshown)
      markToastShown(unshown.id)
    }, 0)
    return () => clearTimeout(timer)
  }, [achievements, markToastShown])

  const activeHabits = useMemo(
    () => habits.filter((h) => !h.isArchived),
    [habits]
  )

  const completedCount = useMemo(
    () =>
      todayLogs.filter(
        (l) => l.completed && activeHabits.some((h) => h.id === l.habitId)
      ).length,
    [todayLogs, activeHabits]
  )

  const pct =
    activeHabits.length === 0
      ? 0
      : Math.round((completedCount / activeHabits.length) * 100)

  const remaining = activeHabits.length - completedCount

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = activeHabits.findIndex((h) => h.id === active.id)
    const newIndex = activeHabits.findIndex((h) => h.id === over.id)
    reorderHabits(arrayMove(activeHabits, oldIndex, newIndex))
  }

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        gap: '10px',
      }}
    >
      {/* ══ LEFT COLUMN ══ */}
      <div
        style={{
          width: '220px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Greeting */}
        <div className="shrink-0">
          <h1 className="text-base leading-tight font-bold text-(--text-primary)">
            {getGreeting()}
          </h1>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">{getDate()}</p>
        </div>

        {/* New Habit button */}
        <motion.button
          onClick={openCreateHabit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-(--accent) py-2 text-xs font-medium text-white hover:opacity-90"
        >
          <Plus size={12} /> New Habit
        </motion.button>

        {/* Quick stats */}
        <div className="grid shrink-0 grid-cols-3 gap-1.5">
          <div className="rounded-xl border border-stone-100 bg-white p-2 text-center dark:border-stone-800 dark:bg-(--surface-card)">
            <CheckSquare size={10} className="mx-auto mb-0.5 text-(--accent)" />
            <p className="text-xs font-bold text-(--accent)">{pct}%</p>
            <p className="text-[9px] text-(--text-muted)">Today</p>
          </div>
          <div className="rounded-xl border border-stone-100 bg-white p-2 text-center dark:border-stone-800 dark:bg-(--surface-card)">
            <Flame size={10} className="mx-auto mb-0.5 text-orange-500" />
            <p className="text-xs font-bold text-orange-500">
              {activeHabits.length}
            </p>
            <p className="text-[9px] text-(--text-muted)">Habits</p>
          </div>
          <div className="rounded-xl border border-stone-100 bg-white p-2 text-center dark:border-stone-800 dark:bg-(--surface-card)">
            <Zap size={10} className="mx-auto mb-0.5 text-violet-500" />
            <p className="text-xs font-bold text-violet-500">Lv{level}</p>
            <p className="text-[9px] text-(--text-muted)">{totalXP}xp</p>
          </div>
        </div>

        {/* Weather */}
        <div className="shrink-0">
          <WeatherWidget />
        </div>

        {/* XP bar */}
        <div className="shrink-0">
          <XPBar />
        </div>

        {/* Analytics — fills remaining space */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <MiniAnalytics />
        </div>
      </div>

      {/* ══ CENTER COLUMN — Today's Habits ══ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Progress header */}
        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-stone-100 bg-white px-4 py-2.5 dark:border-stone-800 dark:bg-(--surface-card)">
          <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
            <svg width="44" height="44" className="-rotate-90">
              <circle
                cx="22"
                cy="22"
                r="16"
                fill="none"
                stroke="var(--surface-hover)"
                strokeWidth="4"
              />
              <motion.circle
                cx="22"
                cy="22"
                r="16"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 16}
                initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 16 * (1 - pct / 100),
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-(--text-primary)">
              {pct}%
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-(--text-primary)">
              {"Today's Habits"}
            </p>
            <p className="text-xs text-(--text-muted)">
              {completedCount}/{activeHabits.length} done
              {remaining > 0
                ? ` · ${remaining} remaining`
                : ' · All complete! 🎉'}
            </p>
          </div>
        </div>

        {/* Habits card — fills all remaining space */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white dark:border-stone-800 dark:bg-(--surface-card)">
          {/* Fixed sub-header */}
          <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-2 dark:border-stone-800">
            <p className="text-[10px] font-semibold tracking-wide text-(--text-muted) uppercase">
              Habit list
            </p>
            <p className="text-[10px] text-(--text-muted)">Drag to reorder</p>
          </div>

          {/* Scrollable list */}
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeHabits.map((h) => h.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {activeHabits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-(--text-muted)">
                      <p className="mb-2 text-3xl">✨</p>
                      <p className="text-sm font-medium">No habits yet</p>
                      <p className="mt-1 text-xs">
                        Click New Habit to get started
                      </p>
                    </div>
                  ) : (
                    activeHabits.map((habit) => {
                      const log = todayLogs.find(
                        (l) => l.habitId === habit.id && l.date === today
                      )
                      return (
                        <SortableHabitCard
                          key={habit.id}
                          habit={habit}
                          log={log}
                          streak={streaks[habit.id] ?? 0}
                        />
                      )
                    })
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Motivation banner */}
        <div
          className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5"
          style={{
            background:
              'linear-gradient(135deg, var(--accent), var(--accent-light))',
          }}
        >
          <span className="shrink-0 text-base">🌟</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">
              {completedCount === activeHabits.length && activeHabits.length > 0
                ? 'All done! You crushed it today 🎉'
                : 'Keep it up!'}
            </p>
            <p className="truncate text-[10px] text-white/80">
              {remaining > 0
                ? `${remaining} habit${remaining > 1 ? 's' : ''} remaining — you can do it!`
                : activeHabits.length > 0
                  ? 'Take a moment to celebrate your consistency'
                  : 'Create your first habit to get started'}
            </p>
          </div>
        </div>
      </div>

      {/* ══ RIGHT COLUMN ══ */}
      <div
        style={{
          width: '240px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Calendar */}
        <div className="shrink-0">
          <MiniCalendar />
        </div>

        {/* Heatmap — fills remaining space */}
        <div className="min-h-0 flex-1">
          <WeeklyHeatmap />
        </div>

        {/* Suggested habits */}
        <div className="shrink-0">
          <SuggestedHabits />
        </div>
      </div>

      <AchievementToast
        achievement={toastAchievement}
        onClose={() => setToastAchievement(null)}
      />
    </div>
  )
}
