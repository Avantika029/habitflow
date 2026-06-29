'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react'
import { clsx } from 'clsx'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'My Habits', icon: CheckSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <aside
      className="flex h-screen w-64 shrink-0 flex-col border-r transition-colors duration-300"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--accent)">
          <Sparkles size={18} className="text-white" />
        </div>
        <span className="text-lg font-semibold text-(--text-primary)">
          HabitFlow
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 px-3">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150',
                active
                  ? 'bg-(--accent) font-medium text-white'
                  : 'text-(--text-secondary) hover:bg-(--surface-hover)'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Dark mode toggle */}
      <div
        className="border-t p-4"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--text-secondary) transition-all duration-150 hover:bg-(--surface-hover)"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        )}
      </div>
    </aside>
  )
}
