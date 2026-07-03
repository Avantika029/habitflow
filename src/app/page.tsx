'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
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
import QuickStats from '@/components/dashboard/QuickStats'
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
  const { achievements } = useGamificationStore()
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
    const latest = achievements
      .filter((a) => a.unlockedAt)
      .sort((a, b) => (b.unlockedAt! > a.unlockedAt! ? 1 : -1))[0]
    if (!latest) return
    const timer = setTimeout(() => setToastAchievement(latest), 0)
    return () => clearTimeout(timer)
  }, [achievements])

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

  const remaining = activeHabits.length - completedCount
  const pct =
    activeHabits.length === 0
      ? 0
      : Math.round((completedCount / activeHabits.length) * 100)

  return (
    <div className="h-screen overflow-hidden p-4">
      {/*
        12-column grid, 6 rows
        Each card specifies exactly which columns and rows it occupies
      */}
      <div
        className="h-full gap-3"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'auto auto auto auto 1fr auto',
        }}
      >
        {/* ── ROW 1: Greeting (col 1-5) + Quick stats (col 6-8) + Analytics (col 9-12) ── */}

        {/* Greeting */}
        <div
          className="flex flex-col justify-center"
          style={{ gridColumn: '1 / 5', gridRow: '1' }}
        >
          <h1 className="text-xl font-bold text-(--text-primary)">
            {getGreeting()}
          </h1>
          <p className="mt-0.5 text-xs text-(--text-muted)">{getDate()}</p>
        </div>

        {/* Progress ring + summary */}
        <div
          className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3 dark:border-stone-800 dark:bg-(--surface-card)"
          style={{ gridColumn: '5 / 9', gridRow: '1' }}
        >
          {/* Ring */}
          <div className="relative h-12 w-12 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="var(--surface-hover)"
                strokeWidth="5"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 18}
                initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 18 * (1 - pct / 100),
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-(--text-primary)">
              {pct}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-(--text-primary)">
              {completedCount} / {activeHabits.length} done
            </p>
            <p className="text-xs text-(--text-muted)">
              {remaining === 0 ? 'All complete! 🎉' : `${remaining} left today`}
            </p>
          </div>
        </div>

        {/* Mini analytics — header row */}
        <div style={{ gridColumn: '9 / 13', gridRow: '1' }}>
          <MiniAnalytics />
        </div>

        {/* ── ROW 2: New Habit btn + XP bar + Weather + Calendar header ── */}

        {/* New habit + XP */}
        <div
          className="flex flex-col gap-2"
          style={{ gridColumn: '1 / 5', gridRow: '2' }}
        >
          <motion.button
            onClick={openCreateHabit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-(--accent) py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={14} /> New Habit
          </motion.button>
          <XPBar />
        </div>

        {/* Weather */}
        <div style={{ gridColumn: '5 / 9', gridRow: '2' }}>
          <WeatherWidget />
        </div>

        {/* Quick stats */}
        <div style={{ gridColumn: '9 / 13', gridRow: '2' }}>
          <QuickStats
            completedToday={completedCount}
            totalToday={activeHabits.length}
          />
        </div>

        {/* ── ROW 3-5: Habits list (col 1-8) + right widgets (col 9-12) ── */}

        {/* Today's habits — spans rows 3,4,5 */}
        <div
          className="scrollbar-hide flex flex-col gap-2 overflow-y-auto"
          style={{ gridColumn: '1 / 9', gridRow: '3 / 6' }}
        >
          <p className="shrink-0 text-xs font-semibold tracking-wide text-(--text-muted) uppercase">
            {"Today's Habits"}
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeHabits.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {activeHabits.length === 0 ? (
                  <div className="py-12 text-center text-(--text-muted)">
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

        {/* Heatmap — col 9-12 row 3 */}
        <div style={{ gridColumn: '9 / 13', gridRow: '3' }}>
          <WeeklyHeatmap />
        </div>

        {/* Mini calendar — col 9-12 row 4 */}
        <div style={{ gridColumn: '9 / 13', gridRow: '4' }}>
          <MiniCalendar />
        </div>

        {/* Should try — col 9-12 row 5 */}
        <div style={{ gridColumn: '9 / 13', gridRow: '5' }}>
          <SuggestedHabits />
        </div>

        {/* ── ROW 6: Motivation banner (col 1-8) + nothing right ── */}

        {/* Motivation */}
        <div
          className="flex items-center gap-3 rounded-2xl bg-(--accent-light) p-3"
          style={{ gridColumn: '1 / 9', gridRow: '6' }}
        >
          <span className="text-2xl">🌟</span>
          <div>
            <p className="text-sm font-semibold text-(--accent)">
              {completedCount === activeHabits.length && activeHabits.length > 0
                ? 'All done! You crushed it today 🎉'
                : 'Keep it up!'}
            </p>
            <p className="text-xs text-(--accent) opacity-70">
              {remaining === 0
                ? 'Take a moment to celebrate your consistency'
                : `${remaining} habit${remaining > 1 ? 's' : ''} remaining — you can do it!`}
            </p>
          </div>
        </div>

        {/* Empty right bottom */}
        <div style={{ gridColumn: '9 / 13', gridRow: '6' }} />
      </div>

      <AchievementToast
        achievement={toastAchievement}
        onClose={() => setToastAchievement(null)}
      />
    </div>
  )
}
