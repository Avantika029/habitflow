import { create } from 'zustand'
import { Habit, HabitLog } from '@/types'
import {
  getAllHabits,
  saveHabit,
  deleteHabit,
  saveLog,
  getLogsForDate,
} from '@/lib/db'

interface HabitStore {
  // Data
  habits: Habit[]
  todayLogs: HabitLog[]
  isLoading: boolean

  // Actions
  loadHabits: () => Promise<void>
  addHabit: (habit: Habit) => Promise<void>
  updateHabit: (habit: Habit) => Promise<void>
  removeHabit: (id: string) => Promise<void>
  reorderHabits: (habits: Habit[]) => Promise<void>
  loadTodayLogs: () => Promise<void>
  toggleHabit: (habitId: string, date: string) => Promise<void>
}

export const useHabitStore = create<HabitStore>()((set, get) => ({
  habits: [],
  todayLogs: [],
  isLoading: false,

  loadHabits: async () => {
    set({ isLoading: true })
    const habits = await getAllHabits()
    set({ habits, isLoading: false })
  },

  addHabit: async (habit) => {
    await saveHabit(habit)
    set((state) => ({ habits: [...state.habits, habit] }))
  },

  updateHabit: async (habit) => {
    await saveHabit(habit)
    set((state) => ({
      habits: state.habits.map((h) => (h.id === habit.id ? habit : h)),
    }))
  },

  removeHabit: async (id) => {
    await deleteHabit(id)
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }))
  },

  reorderHabits: async (habits) => {
    set({ habits })
    await Promise.all(habits.map((h, i) => saveHabit({ ...h, order: i })))
  },

  loadTodayLogs: async () => {
    const today = new Date().toISOString().split('T')[0]
    const logs = await getLogsForDate(today)
    set({ todayLogs: logs })
  },

  toggleHabit: async (habitId, date) => {
    const { todayLogs } = get()
    const existing = todayLogs.find(
      (l) => l.habitId === habitId && l.date === date
    )

    const log: HabitLog = existing
      ? { ...existing, completed: !existing.completed }
      : {
          id: crypto.randomUUID(),
          habitId,
          date,
          completed: true,
          count: 1,
          completedAt: new Date().toISOString(),
        }

    await saveLog(log)
    set((state) => ({
      todayLogs: existing
        ? state.todayLogs.map((l) => (l.id === log.id ? log : l))
        : [...state.todayLogs, log],
    }))
  },
}))
