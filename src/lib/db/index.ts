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

// Singleton — cache the PROMISE, not the resolved instance. If getDB() is
// called multiple times before the first openDB() resolves (which happens
// on initial mount, since several components/stores call it in parallel
// effects), every caller now awaits the same in-flight open instead of
// each triggering its own — preventing duplicate connections and the
// "connection is closing" race.
//
// IMPORTANT: a resolved connection can still die later — either because
// something in the app explicitly calls db.close() (e.g. "Clear all data"
// in Settings, via closeDB() below), or because the browser itself closes
// the connection out from under us. If we don't react to that, dbPromise
// keeps pointing at a dead connection forever, and every future
// getAllHabits()/getAllLogs() throws "InvalidStateError: connection is
// closing" until a hard refresh.
//
// Fix: whenever the underlying connection fires 'close', null out
// dbPromise so the very next getDB() call transparently opens a fresh one.
let dbPromise: Promise<IDBPDatabase<HabitFlowDB>> | null = null

export function getDB(): Promise<IDBPDatabase<HabitFlowDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HabitFlowDB>('habitflow-db', 1, {
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
      blocking() {
        // Fires when another connection (a second tab, or a
        // deleteDatabase()/version-upgrade request) is waiting on THIS
        // connection to close. Without this handler, that other request
        // just hangs indefinitely instead of proceeding. We close our own
        // connection to unblock it — the 'close' listener below (attached
        // once the promise resolves) will reset dbPromise so this tab
        // transparently reopens a fresh connection next time it needs one.
        dbPromise?.then((db) => db.close())
      },
      terminated() {
        // Fires if the browser itself kills the connection (rare, but
        // happens e.g. under memory pressure). Reset so we reopen next call.
        console.warn(
          '[db] connection terminated unexpectedly — will reopen on next call'
        )
        dbPromise = null
      },
    })

    // idb's returned db object is a thin wrapper around the native
    // IDBDatabase. Listen for the native 'close' event, which fires both
    // when the browser force-closes it AND when our own code calls
    // db.close() (directly, or via the blocking() handler above, or via
    // closeDB() below). Whichever path triggers it, reset the singleton.
    dbPromise
      .then((db) => {
        db.addEventListener('close', () => {
          console.warn(
            '[db] connection closed — resetting singleton so next getDB() reopens'
          )
          dbPromise = null
        })
      })
      .catch(() => {
        // openDB itself failed — reset so the next call retries from
        // scratch instead of every future getDB() awaiting a permanently
        // rejected promise.
        dbPromise = null
      })
  }

  return dbPromise
}

// Call this instead of reaching for db.close() directly anywhere else in
// the app (e.g. in Settings "Clear all data"). It closes the connection
// AND resets the singleton in one step, then awaits that reset actually
// happening, so callers can safely follow up with deleteDatabase() or a
// page reload without racing an in-flight connection teardown.
export async function closeDB(): Promise<void> {
  if (!dbPromise) return
  const db = await dbPromise
  db.close()
  dbPromise = null
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
