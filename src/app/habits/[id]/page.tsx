import HabitDetailClient from './HabitDetailClient'

export function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function HabitDetailPage() {
  return <HabitDetailClient />
}
