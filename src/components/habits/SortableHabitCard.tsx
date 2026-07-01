'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Habit, HabitLog } from '@/types'
import HabitCard from './HabitCard'

interface Props {
  habit: Habit
  log?: HabitLog
  streak: number
}

export default function SortableHabitCard({ habit, log, streak }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none rounded-lg p-1.5 text-(--text-muted) transition-colors hover:bg-(--surface-hover) hover:text-(--text-secondary) active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      {/* Actual habit card */}
      <div className="flex-1">
        <HabitCard habit={habit} log={log} streak={streak} />
      </div>
    </div>
  )
}
