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
    tagline: 'Soft pink, mint & dreamy',
    preview: ['#f9b2d7', '#cfecf3', '#daf9de', '#f6ffdc'],
    bg: 'linear-gradient(135deg, #fdf4f9, #f0fbfc)',
    text: '#5a1a3a',
    border: '#f9b2d7',
  },
  {
    id: 'forge',
    name: '🍂 Forge',
    tagline: 'Forest, terracotta & warm earth',
    preview: ['#607456', '#eee0cc', '#ba6a4c', '#7b2525'],
    bg: 'linear-gradient(135deg, #f7f3ee, #eee0cc)',
    text: '#2e1a0e',
    border: '#ba6a4c',
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
            {isActive && (
              <div
                className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.preview[0] }}
              >
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}

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

            <div className="flex gap-2">
              {theme.preview.map((color, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border border-white/30 shadow-sm"
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
