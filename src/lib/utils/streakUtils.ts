import { HabitLog } from '@/types'

// Takes all logs for one habit, returns current streak count
export function calculateStreak(logs: HabitLog[]): number {
  // Only count completed days
  const completedDates = logs
    .filter((l) => l.completed)
    .map((l) => l.date)
    .sort()
    .reverse() // most recent first

  if (completedDates.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < completedDates.length; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    const expectedStr = expected.toISOString().split('T')[0]

    if (completedDates[i] === expectedStr) {
      streak++
    } else {
      // Gap found — streak is broken
      break
    }
  }

  return streak
}

// Returns the longest streak ever achieved
export function calculateLongestStreak(logs: HabitLog[]): number {
  const completedDates = logs
    .filter((l) => l.completed)
    .map((l) => l.date)
    .sort()

  if (completedDates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < completedDates.length; i++) {
    const prev = new Date(completedDates[i - 1])
    const curr = new Date(completedDates[i])
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
}
