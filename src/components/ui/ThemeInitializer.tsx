'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store'

// Runs once on app load — restores saved theme from localStorage
export default function ThemeInitializer() {
  const { appTheme } = useThemeStore()

  useEffect(() => {
    if (appTheme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', appTheme)
    }
  }, [appTheme])

  return null // renders nothing — just runs the effect
}
