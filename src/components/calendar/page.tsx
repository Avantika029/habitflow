'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useHabitStore } from '@/lib/store'
import { getLogsForMonth } from '@/lib/db'
import { HabitLog } from '@/types'
import { todayISO } from '@/lib/utils/dateUtils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function CalendarPage() {
  const { habits, loadHabits } = useHabitStore()
  const today = todayISO()
  const now = new Date()

  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  useEffect(() => {
    getLogsForMonth(year, month).then(setLogs)
  }, [year, month])

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function isoForDay(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function logsForDay(iso: string) {
    return logs.filter((l) => l.date === iso)
  }

  function completionRate(iso: string) {
    const dayLogs = logsForDay(iso)
    const active = habits.filter((h) => !h.isArchived)
    if (active.length === 0) return 0
    const done = dayLogs.filter((l) => l.completed).length
    return done / active.length
  }

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else setMonth((m) => m + 1)
  }

  // Habits for the selected date detail panel
  const selectedLogs = selectedDate ? logsForDay(selectedDate) : []
  const activeHabits = habits.filter((h) => !h.isArchived)

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Month navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:bg-(--surface-hover)"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-(--text-primary)">
          {MONTHS[month]} {year}
        </h1>
        <button
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:bg-(--surface-hover)"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar card */}
      <div className="mb-4 rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-xs font-medium text-(--text-muted)"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={`b${i}`} />
          ))}
          {days.map((d) => {
            const iso = isoForDay(d)
            const rate = completionRate(iso)
            const isToday = iso === today
            const isSelected = iso === selectedDate
            const isFuture = iso > today
            const hasActivity = logsForDay(iso).length > 0

            return (
              <motion.button
                key={d}
                onClick={() =>
                  setSelectedDate(iso === selectedDate ? null : iso)
                }
                whileTap={{ scale: 0.9 }}
                disabled={isFuture}
                className={clsx(
                  'relative flex flex-col items-center justify-center',
                  'h-10 rounded-xl text-sm transition-all duration-150',
                  isSelected && 'ring-2 ring-(--accent)',
                  isToday && !isSelected && 'bg-(--accent-light) font-semibold',
                  !isToday &&
                    !isSelected &&
                    !isFuture &&
                    'hover:bg-(--surface-hover)',
                  isFuture && 'cursor-default opacity-30',
                  isToday ? 'text-(--accent)' : 'text-(--text-primary)'
                )}
              >
                {d}
                {hasActivity && (
                  <div
                    className="absolute bottom-1 h-1 w-1 rounded-full"
                    style={{
                      backgroundColor:
                        rate === 1
                          ? '#059669'
                          : rate > 0.5
                            ? '#d97706'
                            : '#dc2626',
                    }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex gap-4 text-xs text-(--text-muted)">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" /> All done
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" /> Partial
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" /> Missed
        </div>
      </div>

      {/* Day detail panel */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--text-primary)">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </h2>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-(--text-muted) hover:text-(--text-primary)"
              >
                <X size={14} />
              </button>
            </div>

            {activeHabits.length === 0 ? (
              <p className="text-sm text-(--text-muted)">
                No habits created yet.
              </p>
            ) : (
              <div className="space-y-2">
                {activeHabits.map((habit) => {
                  const log = selectedLogs.find(
                    (l) => l.habitId === habit.id && l.completed
                  )
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center gap-3 py-1.5"
                    >
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                        style={{ backgroundColor: habit.color + '22' }}
                      >
                        {habit.icon}
                      </div>
                      <span
                        className={clsx(
                          'flex-1 text-sm',
                          log
                            ? 'font-medium text-(--text-primary)'
                            : 'text-(--text-muted) line-through'
                        )}
                      >
                        {habit.name}
                      </span>
                      <span
                        className={clsx(
                          'text-xs font-medium',
                          log ? 'text-emerald-500' : 'text-(--text-muted)'
                        )}
                      >
                        {log ? '✓ Done' : 'Missed'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
