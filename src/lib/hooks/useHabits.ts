'use client'

import { useEffect, useState } from 'react'
import { useHabitStore } from '@/lib/store'
import { getLogsForHabit } from '@/lib/db'
import { calculateStreak } from '@/lib/utils/streakUtils'

// Returns a map of habitId -> current streak count
export function useStreaks() {
  const { habits } = useHabitStore()
  const [streaks, setStreaks] = useState<Record<string, number>>({})

  useEffect(() => {
    async function loadStreaks() {
      const result: Record<string, number> = {}
      await Promise.all(
        habits.map(async (habit) => {
          const logs = await getLogsForHabit(habit.id)
          result[habit.id] = calculateStreak(logs)
        })
      )
      setStreaks(result)
    }
    if (habits.length > 0) loadStreaks()
  }, [habits])

  return streaks
}
