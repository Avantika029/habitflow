'use client'

import { useEffect, useMemo } from 'react'
import { useHabitStore } from '@/lib/store'
import { todayISO } from '@/lib/utils/dateUtils'
import HabitCard from '@/components/habits/HabitCard'
import StatsHeader from '@/components/dashboard/StatsHeader'
import { Plus } from 'lucide-react'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning ☀️'
  if (h < 17) return 'Good afternoon 🌤️'
  return 'Good evening 🌙'
}

export default function DashboardPage() {
  const { habits, todayLogs, loadHabits, loadTodayLogs } = useHabitStore()
  const today = todayISO()

  useEffect(() => {
    loadHabits()
    loadTodayLogs()
  }, [loadHabits, loadTodayLogs])

  const activeHabits = useMemo(
    () => habits.filter((h) => !h.isArchived),
    [habits]
  )

  const completedCount = useMemo(
    () => todayLogs.filter((l) => l.completed).length,
    [todayLogs]
  )

  return (
    <div className="mx-auto max-w-2xl p-6">
      <StatsHeader
        completed={completedCount}
        total={activeHabits.length}
        greeting={getGreeting()}
      />

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
              <HabitCard key={habit.id} habit={habit} log={log} streak={0} />
            )
          })
        )}
      </div>

      {/* Floating add button */}
      <button
        className="fixed right-8 bottom-8 flex h-14 w-14 items-center justify-center rounded-full bg-(--accent) text-white shadow-lg transition-transform duration-200 hover:scale-110"
        aria-label="Add habit"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
