import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppTheme = 'default' | 'bloom' | 'forge'

interface ThemeStore {
  appTheme: AppTheme
  setAppTheme: (theme: AppTheme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      appTheme: 'default',
      setAppTheme: (theme) => {
        // Apply data-theme attribute to html element immediately
        if (theme === 'default') {
          document.documentElement.removeAttribute('data-theme')
        } else {
          document.documentElement.setAttribute('data-theme', theme)
        }
        set({ appTheme: theme })
      },
    }),
    { name: 'habitflow-theme' }
  )
)
