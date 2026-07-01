import { Difficulty } from '@/types'

// XP earned per completion based on difficulty
export function getXPForCompletion(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 10
    case 'medium':
      return 20
    case 'hard':
      return 35
    default:
      return 10
  }
}

// Total XP needed to reach a given level
export function xpForLevel(level: number): number {
  return level * 100
}

// Calculate level from total XP
export function getLevelFromXP(totalXP: number): number {
  let level = 1
  let xpNeeded = xpForLevel(level)
  while (totalXP >= xpNeeded) {
    totalXP -= xpNeeded
    level++
    xpNeeded = xpForLevel(level)
  }
  return level
}

// XP progress within current level (0 to 1)
export function getLevelProgress(totalXP: number): number {
  let level = 1
  let remaining = totalXP
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level++
  }
  return remaining / xpForLevel(level)
}

// XP remaining to next level
export function getXPToNextLevel(totalXP: number): number {
  let level = 1
  let remaining = totalXP
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level++
  }
  return xpForLevel(level) - remaining
}
