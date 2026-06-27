'use client'

import { motion } from 'framer-motion'

interface StatsHeaderProps {
  completed: number
  total: number
  greeting: string
}

export default function StatsHeader({
  completed,
  total,
  greeting,
}: StatsHeaderProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const r = 30
  const circ = 2 * Math.PI * r
  const dash = circ * (pct / 100)

  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-6 dark:border-stone-800 dark:bg-(--surface-card)">
      <div>
        <h1 className="text-xl font-semibold text-(--text-primary)">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          {completed} of {total} habits done today
        </p>
      </div>

      {/* Progress ring */}
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-stone-100 dark:text-stone-800"
            strokeWidth="8"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-(--text-primary)">
          {pct}%
        </span>
      </div>
    </div>
  )
}
