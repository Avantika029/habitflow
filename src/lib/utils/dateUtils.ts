// Returns today as "YYYY-MM-DD" — the format we store everywhere
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

// Formats a stored ISO date for display e.g. "Jun 27"
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
