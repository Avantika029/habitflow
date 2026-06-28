'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore, useHabitStore } from '@/lib/store'
import HabitForm from './HabitForm'

export default function HabitModal() {
  const {
    isCreateHabitOpen,
    closeCreateHabit,
    editingHabitId,
    closeEditHabit,
  } = useUIStore()
  const { habits } = useHabitStore()

  const isOpen = isCreateHabitOpen || editingHabitId !== null
  const editingHabit = editingHabitId
    ? habits.find((h) => h.id === editingHabitId)
    : undefined

  function handleClose() {
    closeCreateHabit()
    closeEditHabit()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-(--surface-card)"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-(--text-primary)">
                  {editingHabit ? 'Edit habit' : 'New habit'}
                </h2>
                <p className="mt-0.5 text-xs text-(--text-muted)">
                  {editingHabit
                    ? 'Update your habit details'
                    : 'Build something worth keeping'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-(--text-muted) transition-colors hover:bg-(--surface-hover)"
              >
                <X size={16} />
              </button>
            </div>
            <HabitForm existingHabit={editingHabit} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
