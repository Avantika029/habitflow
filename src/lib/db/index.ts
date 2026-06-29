import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Habit, HabitLog, UserSettings, UserProgress } from '@/types'

// Define the shape of the entire database
interface HabitFlowDB extends DBSchema {
  habits: {
    key: string
    value: Habit
    indexes: { 'by-order': number; 'by-category': string }
  }
  logs: {
    key: string
    value: HabitLog
    indexes: { 'by-habit': string; 'by-date': string }
  }
  settings: {
    key: string
    value: UserSettings
  }
  progress: {
    key: string
    value: UserProgress
  }
}

// Singleton — one DB connection shared across the whole app
let dbInstance: IDBPDatabase<HabitFlowDB> | null = null

export async function getDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<HabitFlowDB>('habitflow-db', 1, {
    upgrade(db) {
      // Habits store
      if (!db.objectStoreNames.contains('habits')) {
        const habitStore = db.createObjectStore('habits', { keyPath: 'id' })
        habitStore.createIndex('by-order', 'order')
        habitStore.createIndex('by-category', 'category')
      }
      // Logs store
      if (!db.objectStoreNames.contains('logs')) {
        const logStore = db.createObjectStore('logs', { keyPath: 'id' })
        logStore.createIndex('by-habit', 'habitId')
        logStore.createIndex('by-date', 'date')
      }
      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' })
      }
      // Progress store
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}

// ─── Habit helpers ────────────────────────────────────────────────

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB()
  const habits = await db.getAllFromIndex('habits', 'by-order')
  return habits
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.put('habits', habit)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('habits', id)
}

// ─── Log helpers ──────────────────────────────────────────────────

export async function getLogsForDate(date: string): Promise<HabitLog[]> {
  const db = await getDB()
  return db.getAllFromIndex('logs', 'by-date', date)
}

export async function getLogsForHabit(habitId: string): Promise<HabitLog[]> {
  const db = await getDB()
  return db.getAllFromIndex('logs', 'by-habit', habitId)
}

export async function saveLog(log: HabitLog): Promise<void> {
  const db = await getDB()
  await db.put('logs', log)
}

// ─── Settings helpers ─────────────────────────────────────────────

export async function getSettings(): Promise<UserSettings | undefined> {
  const db = await getDB()
  return db.get('settings', 'user-settings')
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', {
    ...settings,
    id: 'user-settings',
  } as UserSettings & { id: string })
}
// Add this function at the bottom of the file:
export async function getLogsForMonth(
  year: number,
  month: number
): Promise<HabitLog[]> {
  const db = await getDB()
  const allLogs = await db.getAll('logs')
  return allLogs.filter((log) => {
    const d = new Date(log.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
}
export async function getAllLogs(): Promise<HabitLog[]> {
  const db = await getDB()
  return db.getAll('logs')
}
