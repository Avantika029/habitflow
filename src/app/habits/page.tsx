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
          gridTemplateRows: 'auto auto auto 1fr',
          gap: '8px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text-primary)">
              My Habits
            </h1>
            <p className="text-xs text-(--text-muted)">
              {habits.filter((h) => !h.isArchived).length} active habits
            </p>
          </div>
          <motion.button
            onClick={openCreateHabit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 rounded-xl bg-(--accent) px-4 py-2 text-xs font-medium text-white hover:opacity-90"
          >
            <Plus size={13} /> New Habit
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-(--text-muted)"
          />
          <input
            type="text"
            placeholder="Search habits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pr-4 pl-8 text-xs text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent) dark:border-stone-700 dark:bg-(--surface-card)"
          />
        </div>

        {/* Category filter + archived toggle */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1.5 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-lg px-3 py-1 text-[11px] font-medium whitespace-nowrap transition-all duration-150 ${
                  activeCategory === cat
                    ? 'bg-(--accent) text-white'
                    : 'border border-stone-200 bg-white text-(--text-secondary) hover:border-(--accent) dark:border-stone-700 dark:bg-(--surface-card)'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowArchived((v) => !v)}
            className={`flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1 text-[11px] font-medium transition-all ${
              showArchived
                ? 'border-(--accent) bg-(--accent) text-white'
                : 'border-stone-200 bg-white text-(--text-secondary) dark:border-stone-700 dark:bg-(--surface-card)'
            }`}
          >
            <SlidersHorizontal size={11} />
            {showArchived ? 'Archived' : 'Archive'}
          </button>
        </div>

        {/* Habit grid */}
        <div className="scrollbar-hide overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-(--text-muted)">
              <p className="mb-2 text-3xl">🔍</p>
              <p className="text-sm font-medium">
                {search ? 'No habits match your search' : 'No habits here yet'}
              </p>
              {!search && (
                <button
                  onClick={openCreateHabit}
                  className="mt-2 text-xs text-(--accent) hover:underline"
                >
                  Create your first habit
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((habit) => {
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
