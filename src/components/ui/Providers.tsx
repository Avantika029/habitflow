'use client'

import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// next-themes renders an inline <script> tag to set the theme class
// before hydration, preventing a flash of the wrong theme. React 19 warns
// whenever ANY component renders a <script> tag directly — this specific
// warning is a known false positive for next-themes (confirmed upstream:
// pacocoursey/next-themes#385, #387; shadcn-ui/ui#10104). The script still
// works correctly; only the console warning is spurious. next-themes
// hasn't shipped a fix (unmaintained since March 2025), so we filter just
// this one message in development rather than waiting on upstream.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag')
    ) {
      return
    }
    originalConsoleError.apply(console, args)
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
