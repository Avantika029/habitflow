'use client'

import { useThemeStore, AppTheme } from '@/lib/store'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

const THEMES: {
  id: AppTheme
  name: string
  tagline: string
  preview: string[]
  bg: string
  text: string
  border: string
}[] = [
  {
    id: 'default',
    name: 'Classic',
    tagline: 'Clean and neutral',
    preview: ['#7c3aed', '#ede9fe', '#fafaf9', '#1c1917'],
    bg: '#fafaf9',
    text: '#1c1917',
    border: '#e7e5e4',
  },
  {
    id: 'bloom',
    name: '🌸 Bloom',
    tagline: 'Soft, warm & feminine',
    preview: ['#db2777', '#f472b6', '#fce7f3', '#fff5f9'],
    bg: 'linear-gradient(135deg, #fff5f9, #fce7f3)',
    text: '#9d174d',
    border: '#fbcfe8',
  },
  {
    id: 'forge',
    name: '⚡ Forge',
    tagline: 'Bold, sharp & powerful',
    preview: ['#4f46e5', '#818cf8', '#1e1b4b', '#0d0b1e'],
    bg: 'linear-gradient(135deg, #0d0b1e, #1e1b4b)',
    text: '#a5b4fc',
    border: '#3730a3',
  },
]

export default function ThemePicker() {
  const { appTheme, setAppTheme } = useThemeStore()

  return (
    <div className="grid grid-cols-1 gap-3">
      {THEMES.map((theme) => {
        const isActive = appTheme === theme.id
        return (
          <motion.button
            key={theme.id}
            onClick={() => setAppTheme(theme.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200"
            style={{
              background: theme.bg,
              borderColor: isActive ? theme.preview[0] : theme.border,
            }}
          >
            {/* Active checkmark */}
            {isActive && (
              <div
                className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.preview[0] }}
              >
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}

            {/* Theme name + tagline */}
            <p
              className="mb-0.5 text-sm font-semibold"
              style={{ color: theme.text }}
            >
              {theme.name}
            </p>
            <p
              className="mb-3 text-xs opacity-70"
              style={{ color: theme.text }}
            >
              {theme.tagline}
            </p>

            {/* Colour swatch row */}
            <div className="flex gap-2">
              {theme.preview.map((color, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
