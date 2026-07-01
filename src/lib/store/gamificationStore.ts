import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getLevelFromXP,
  getLevelProgress,
  getXPToNextLevel,
} from '@/lib/utils/xpUtils'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-completion',
    icon: '🌱',
    title: 'First Step',
    description: 'Complete your first habit',
  },
  {
    id: 'streak-3',
    icon: '🔥',
    title: 'On Fire',
    description: 'Reach a 3-day streak',
  },
  {
    id: 'streak-7',
    icon: '⚡',
    title: 'Week Warrior',
    description: 'Reach a 7-day streak',
  },
  {
    id: 'streak-30',
    icon: '👑',
    title: 'Habit Royalty',
    description: 'Reach a 30-day streak',
  },
  {
    id: 'level-5',
    icon: '⭐',
    title: 'Rising Star',
    description: 'Reach level 5',
  },
  {
    id: 'level-10',
    icon: '🏆',
    title: 'Champion',
    description: 'Reach level 10',
  },
  {
    id: 'completions-10',
    icon: '💪',
    title: 'Getting Strong',
    description: 'Complete 10 habits total',
  },
  {
    id: 'completions-50',
    icon: '🚀',
    title: 'Momentum',
    description: 'Complete 50 habits total',
  },
  {
    id: 'completions-100',
    icon: '💎',
    title: 'Diamond Habit',
    description: 'Complete 100 habits total',
  },
]

interface GamificationStore {
  totalXP: number
  achievements: Achievement[]
  addXP: (amount: number) => void
  checkAchievements: (opts: {
    totalCompletions: number
    longestStreak: number
  }) => Achievement | null
  level: number
  levelProgress: number
  xpToNextLevel: number
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      achievements: ALL_ACHIEVEMENTS,
      level: 1,
      levelProgress: 0,
      xpToNextLevel: 100,

      addXP: (amount) => {
        const newXP = get().totalXP + amount
        set({
          totalXP: newXP,
          level: getLevelFromXP(newXP),
          levelProgress: getLevelProgress(newXP),
          xpToNextLevel: getXPToNextLevel(newXP),
        })
      },

      checkAchievements: ({ totalCompletions, longestStreak }) => {
        const { achievements, level } = get()
        const conditions: Record<string, boolean> = {
          'first-completion': totalCompletions >= 1,
          'streak-3': longestStreak >= 3,
          'streak-7': longestStreak >= 7,
          'streak-30': longestStreak >= 30,
          'level-5': level >= 5,
          'level-10': level >= 10,
          'completions-10': totalCompletions >= 10,
          'completions-50': totalCompletions >= 50,
          'completions-100': totalCompletions >= 100,
        }

        let newlyUnlocked: Achievement | null = null

        const updated = achievements.map((a) => {
          if (!a.unlockedAt && conditions[a.id]) {
            newlyUnlocked = { ...a, unlockedAt: new Date().toISOString() }
            return newlyUnlocked
          }
          return a
        })

        if (newlyUnlocked) set({ achievements: updated })
        return newlyUnlocked
      },
    }),
    { name: 'habitflow-gamification' }
  )
)
