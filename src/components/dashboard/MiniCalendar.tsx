'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { todayISO } from '@/lib/utils/dateUtils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
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

export default function MiniCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const today = todayISO()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function isoForDay(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
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

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--surface-hover)"
        >
          <ChevronLeft size={12} />
        </button>
        <p className="text-xs font-semibold text-(--text-primary)">
          {MONTHS[month]} {year}
        </p>
        <button
          onClick={nextMonth}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--surface-hover)"
        >
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium text-(--text-muted)"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {blanks.map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {days.map((d) => {
          const iso = isoForDay(d)
          const isToday = iso === today
          const isFuture = iso > today
          return (
            <div
              key={d}
              className={clsx(
                'flex h-6 items-center justify-center rounded-lg text-[11px]',
                isToday && 'bg-(--accent) font-bold text-white',
                !isToday &&
                  !isFuture &&
                  'cursor-pointer text-(--text-secondary) hover:bg-(--surface-hover)',
                isFuture && 'text-(--text-muted) opacity-40'
              )}
            >
              {d}
            </div>
          )
        })}
      </div>
    </div>
  )
}
