'use client'

import { useHabitStore } from '@/lib/store'
import { useGamificationStore } from '@/lib/store'
import { Zap, Flame, CheckSquare } from 'lucide-react'

interface Props {
  completedToday: number
  totalToday: number
}

export default function QuickStats({ completedToday, totalToday }: Props) {
  const { habits } = useHabitStore()
  const { level, totalXP } = useGamificationStore()
  const pct =
    totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100)

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-2xl bg-(--accent-light) p-3 text-center">
        <CheckSquare size={16} className="mx-auto mb-1 text-(--accent)" />
        <p className="text-lg font-bold text-(--accent)">{pct}%</p>
        <p className="text-[10px] text-(--accent) opacity-70">Today</p>
      </div>
      <div className="rounded-2xl bg-orange-50 p-3 text-center dark:bg-orange-950/30">
        <Flame size={16} className="mx-auto mb-1 text-orange-500" />
        <p className="text-lg font-bold text-orange-500">
          {habits.filter((h) => !h.isArchived).length}
        </p>
        <p className="text-[10px] text-orange-500 opacity-70">Habits</p>
      </div>
      <div className="rounded-2xl bg-violet-50 p-3 text-center dark:bg-violet-950/30">
        <Zap size={16} className="mx-auto mb-1 text-violet-500" />
        <p className="text-lg font-bold text-violet-500">Lv{level}</p>
        <p className="text-[10px] text-violet-500 opacity-70">{totalXP} XP</p>
      </div>
    </div>
  )
}
