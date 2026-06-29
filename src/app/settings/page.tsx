'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Download, Trash2 } from 'lucide-react'
import { useHabitStore } from '@/lib/store'
import { getAllLogs } from '@/lib/db'

const ACCENT_COLORS = [
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Green', value: '#059669' },
  { label: 'Rose', value: '#db2777' },
  { label: 'Orange', value: '#d97706' },
  { label: 'Cyan', value: '#0891b2' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold tracking-wider text-(--text-muted) uppercase">
      {children}
    </h2>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { habits } = useHabitStore()

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  async function handleExport() {
    const logs = await getAllLogs()
    const data = { habits, logs, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleClearData() {
    if (confirm('Delete ALL habits and logs? This cannot be undone.')) {
      indexedDB.deleteDatabase('habitflow-db')
      window.location.reload()
    }
  }

  function setAccentColor(color: string) {
    document.documentElement.style.setProperty('--accent', color)
    localStorage.setItem('habitflow-accent', color)
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-8 text-2xl font-semibold text-(--text-primary)">
        Settings
      </h1>

      {/* Theme */}
      <div className="mb-4 rounded-2xl border border-stone-100 bg-white p-5 dark:border-stone-800 dark:bg-(--surface-card)">
        <SectionTitle>Appearance</SectionTitle>
        {mounted && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'light', label: 'Light', Icon: Sun },
              { value: 'dark', label: 'Dark', Icon: Moon },
              { value: 'system', label: 'System', Icon: Monitor },
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-all duration-150 ${
                  theme === value
                    ? 'border-(--accent) bg-(--accent-light) font-medium text-(--accent)'
                    : 'border-stone-200 text-(--text-secondary) hover:border-(--accent) dark:border-stone-700'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Accent colour */}
      <div className="mb-4 rounded-2xl border border-stone-100 bg-white p-5 dark:border-stone-800 dark:bg-(--surface-card)">
        <SectionTitle>Accent colour</SectionTitle>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setAccentColor(value)}
              title={label}
              className="h-8 w-8 rounded-full ring-offset-2 transition-transform duration-150 hover:scale-110"
              style={{ backgroundColor: value }}
              aria-label={label}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-(--text-muted)">
          Accent colour resets on page reload. Full persistence coming soon.
        </p>
      </div>

      {/* Stats summary */}
      <div className="mb-4 rounded-2xl border border-stone-100 bg-white p-5 dark:border-stone-800 dark:bg-(--surface-card)">
        <SectionTitle>Your data</SectionTitle>
        <p className="text-sm text-(--text-secondary)">
          {habits.filter((h) => !h.isArchived).length} active habits ·{' '}
          {habits.length} total
        </p>
      </div>

      {/* Export + Clear */}
      <div className="space-y-3 rounded-2xl border border-stone-100 bg-white p-5 dark:border-stone-800 dark:bg-(--surface-card)">
        <SectionTitle>Data management</SectionTitle>
        <button
          onClick={handleExport}
          className="flex w-full items-center gap-3 rounded-xl border border-stone-200 px-4 py-3 text-sm text-(--text-secondary) transition-all duration-150 hover:border-(--accent) hover:text-(--accent) dark:border-stone-700"
        >
          <Download size={16} />
          Export all data as JSON
        </button>
        <button
          onClick={handleClearData}
          className="flex w-full items-center gap-3 rounded-xl border border-red-200 px-4 py-3 text-sm text-red-500 transition-all duration-150 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
        >
          <Trash2 size={16} />
          Clear all data
        </button>
      </div>
    </div>
  )
}
