'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import { useHabitStore, useUIStore } from '@/lib/store'
import { useStreaks } from '@/lib/hooks/useHabits'
import { todayISO } from '@/lib/utils/dateUtils'
import HabitCard from '@/components/habits/HabitCard'

const CATEGORIES = [
  'All',
  'Fitness',
  'Study',
  'Mindfulness',
  'Health',
  'Productivity',
  'Finance',
  'Social',
  'Creative',
  'Other',
]

export default function HabitsPage() {
  const { habits, todayLogs, loadHabits, loadTodayLogs } = useHabitStore()
  const { openCreateHabit } = useUIStore()
  const streaks = useStreaks()
  const today = todayISO()

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadHabits()
    loadTodayLogs()
  }, [loadHabits, loadTodayLogs])

  const filtered = useMemo(() => {
    return habits.filter((h) => {
      const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        activeCategory === 'All' || h.category === activeCategory
      const matchesArchived = showArchived ? h.isArchived : !h.isArchived
      return matchesSearch && matchesCategory && matchesArchived
    })
  }, [habits, search, activeCategory, showArchived])

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-(--text-primary)">
            My Habits
          </h1>
          <p className="mt-1 text-sm text-(--text-muted)">
            {habits.filter((h) => !h.isArchived).length} active habits
          </p>
        </div>
        <button
          onClick={openCreateHabit}
          className="flex items-center gap-2 rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> New habit
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-(--text-muted)"
        />
        <input
          type="text"
          placeholder="Search habits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pr-4 pl-9 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent) dark:border-stone-700 dark:bg-(--surface-card)"
        />
      </div>

      {/* Category filter tabs */}
      <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
              activeCategory === cat
                ? 'bg-(--accent) text-white'
                : 'border border-stone-200 bg-white text-(--text-secondary) hover:border-(--accent) dark:border-stone-700 dark:bg-(--surface-card)'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Archived toggle */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
            showArchived
              ? 'border-(--accent) bg-(--accent) text-white'
              : 'border-stone-200 bg-white text-(--text-secondary) dark:border-stone-700 dark:bg-(--surface-card)'
          }`}
        >
          <SlidersHorizontal size={12} />
          {showArchived ? 'Showing archived' : 'Show archived'}
        </button>
      </div>

      {/* Habit list */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-(--text-muted)">
            <p className="mb-3 text-4xl">🔍</p>
            <p className="font-medium">
              {search ? 'No habits match your search' : 'No habits here yet'}
            </p>
            {!search && (
              <button
                onClick={openCreateHabit}
                className="mt-3 text-sm text-(--accent) hover:underline"
              >
                Create your first habit
              </button>
            )}
          </div>
        ) : (
          filtered.map((habit) => {
            const log = todayLogs.find(
              (l) => l.habitId === habit.id && l.date === today
            )
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HabitCard
                  habit={habit}
                  log={log}
                  streak={streaks[habit.id] ?? 0}
                />
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
