'use client'

import { useHabitStore, useUIStore } from '@/lib/store'
import { Plus } from 'lucide-react'

const SUGGESTIONS = [
  { icon: '🧘', name: 'Morning meditation', category: 'Mindfulness' },
  { icon: '📚', name: 'Read 20 pages', category: 'Study' },
  { icon: '💧', name: 'Drink 8 glasses', category: 'Health' },
  { icon: '🏃', name: 'Evening walk', category: 'Fitness' },
  { icon: '✍️', name: 'Journal entry', category: 'Creative' },
  { icon: '😴', name: 'Sleep by 11pm', category: 'Health' },
]

export default function SuggestedHabits() {
  const { habits } = useHabitStore()
  const { openCreateHabit } = useUIStore()

  // Only show suggestions for habits the user doesn't have yet
  const existing = habits.map((h) => h.name.toLowerCase())
  const filtered = SUGGESTIONS.filter(
    (s) => !existing.includes(s.name.toLowerCase())
  ).slice(0, 3)

  if (filtered.length === 0) return null

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-(--text-primary)">
          Should try! 💡
        </p>
      </div>
      <div className="space-y-2">
        {filtered.map((s) => (
          <div
            key={s.name}
            className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-(--surface-hover)"
          >
            <span className="text-lg">{s.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-(--text-primary)">{s.name}</p>
              <p className="text-xs text-(--text-muted)">{s.category}</p>
            </div>
            <button
              onClick={openCreateHabit}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-(--accent-light) text-(--accent) opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Plus size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
