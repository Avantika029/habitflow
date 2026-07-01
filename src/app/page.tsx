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
import StatsHeader from '@/components/dashboard/StatsHeader'
import XPBar from '@/components/dashboard/XPBar'
import WeeklyHeatmap from '@/components/dashboard/WeeklyHeatmap'
import AchievementToast from '@/components/dashboard/AchievementToast'
import { Achievement } from '@/lib/store/gamificationStore'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning ☀️'
  if (h < 17) return 'Good afternoon 🌤️'
  return 'Good evening 🌙'
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

  // Show toast when a new achievement is unlocked
  useEffect(() => {
    const latest = achievements
      .filter((a) => a.unlockedAt)
      .sort((a, b) => (b.unlockedAt! > a.unlockedAt! ? 1 : -1))[0]
    if (latest) setToastAchievement(latest)
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

  return (
    <div className="mx-auto max-w-2xl p-6">
      <StatsHeader
        completed={completedCount}
        total={activeHabits.length}
        greeting={getGreeting()}
      />

      <XPBar />

      <WeeklyHeatmap />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeHabits.map((h) => h.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {activeHabits.length === 0 ? (
              <div className="py-20 text-center text-(--text-muted)">
                <p className="mb-3 text-4xl">✨</p>
                <p className="font-medium">No habits yet</p>
                <p className="mt-1 text-sm">
                  Click the + button to add your first habit
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

      <motion.button
        onClick={openCreateHabit}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-8 bottom-8 flex h-14 w-14 items-center justify-center rounded-full bg-(--accent) text-white shadow-lg"
        aria-label="Add habit"
      >
        <Plus size={24} />
      </motion.button>

      <AchievementToast
        achievement={toastAchievement}
        onClose={() => setToastAchievement(null)}
      />
    </div>
  )
}
