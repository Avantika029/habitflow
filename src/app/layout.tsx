import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/ui/Providers'
import Sidebar from '@/components/ui/Sidebar'
import HabitModal from '@/components/habits/HabitModal'
import ThemeInitializer from '@/components/ui/ThemeInitializer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HabitFlow — Build Better Habits',
  description: 'A premium habit tracker to build your best life',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* Restores saved theme from localStorage on every load */}
          <ThemeInitializer />
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-(--surface-bg) transition-colors duration-300">
              {children}
            </main>
          </div>
          <HabitModal />
        </Providers>
      </body>
    </html>
  )
}
