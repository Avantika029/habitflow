// ─── Enums (fixed sets of options) ───────────────────────────────

export type HabitFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'interval'
  | 'custom'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Priority = 'low' | 'medium' | 'high'

export type MoodLevel = 'terrible' | 'bad' | 'okay' | 'good' | 'great'

export type EnergyLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high'

// ─── Schedule (when a habit repeats) ─────────────────────────────

export interface ScheduleConfig {
  frequency: HabitFrequency
  // For weekly: which days (0=Sun, 1=Mon … 6=Sat)
  weekdays?: number[]
  // For interval: every X days
  intervalDays?: number
  // For custom: specific dates as ISO strings
  customDates?: string[]
  // Reminder times e.g. ["08:00", "21:00"]
  reminderTimes?: string[]
}

// ─── Core Habit object ────────────────────────────────────────────

export interface Habit {
  id: string // Unique ID (we'll generate with crypto.randomUUID)
  name: string // e.g. "Morning run"
  description?: string // Optional longer note
  icon: string // Emoji or icon name e.g. "🏃"
  color: string // Hex color e.g. "#7c3aed"
  category: string // e.g. "Fitness", "Study"
  tags: string[] // e.g. ["health", "morning"]
  priority: Priority
  difficulty: Difficulty
  schedule: ScheduleConfig
  targetCount: number // How many times per period (usually 1)
  unit?: string // e.g. "minutes", "pages", "glasses"
  motivationalQuote?: string
  startDate: string // ISO date string e.g. "2026-01-01"
  endDate?: string // Optional end date
  isArchived: boolean
  isPinned: boolean
  order: number // For drag-and-drop reordering
  createdAt: string
  updatedAt: string
}

// ─── Log (one completion record per day) ─────────────────────────

export interface HabitLog {
  id: string
  habitId: string // Links back to a Habit
  date: string // ISO date string e.g. "2026-06-27"
  completed: boolean
  count: number // How many times completed (for countable habits)
  note?: string // Optional note for that day
  mood?: MoodLevel
  energy?: EnergyLevel
  completedAt?: string // Exact timestamp when completed
}

// ─── Streak data ──────────────────────────────────────────────────

export interface StreakData {
  habitId: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate?: string
  totalCompletions: number
  completionRate: number // 0 to 1 (percentage as decimal)
}

// ─── Achievement / Badge ──────────────────────────────────────────

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string // Undefined means not yet unlocked
  xpReward: number
}

// ─── User settings ────────────────────────────────────────────────

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  firstDayOfWeek: 'sunday' | 'monday'
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  reducedMotion: boolean
  showCompletedHabits: boolean
  defaultView: 'dashboard' | 'list' | 'calendar'
  onboardingComplete: boolean
}

// ─── Gamification ─────────────────────────────────────────────────

export interface UserProgress {
  xp: number
  level: number
  xpToNextLevel: number
  achievements: Achievement[]
  totalHabitsCreated: number
  totalCompletions: number
  longestStreakEver: number
}
