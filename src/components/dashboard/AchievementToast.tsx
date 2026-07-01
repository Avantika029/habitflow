'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Achievement } from '@/lib/store/gamificationStore'

interface Props {
  achievement: Achievement | null
  onClose: () => void
}

export default function AchievementToast({ achievement, onClose }: Props) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
          onAnimationComplete={() => {
            setTimeout(onClose, 3000)
          }}
          className="fixed bottom-24 left-1/2 z-50 flex min-w-64 -translate-x-1/2 items-center gap-3 rounded-2xl border border-stone-100 bg-white px-5 py-4 shadow-2xl dark:border-stone-800 dark:bg-(--surface-card)"
        >
          <span className="text-3xl">{achievement.icon}</span>
          <div>
            <p className="text-xs font-semibold tracking-wide text-(--accent) uppercase">
              Achievement Unlocked!
            </p>
            <p className="text-sm font-bold text-(--text-primary)">
              {achievement.title}
            </p>
            <p className="text-xs text-(--text-muted)">
              {achievement.description}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
