'use client'

import { motion } from 'framer-motion'
import { useGamificationStore } from '@/lib/store'
import { Zap } from 'lucide-react'

export default function XPBar() {
  const { totalXP, level, levelProgress, xpToNextLevel } =
    useGamificationStore()

  return (
    <div className="mb-4 rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--accent)">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-(--text-primary)">
            Level {level}
          </span>
        </div>
        <span className="text-xs text-(--text-muted)">
          {xpToNextLevel} XP to next level
        </span>
      </div>

      {/* XP progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--accent-gradient)' }}
          initial={{ width: 0 }}
          animate={{ width: `${levelProgress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <p className="mt-1 text-xs text-(--text-muted)">
        {totalXP} total XP earned
      </p>
    </div>
  )
}
