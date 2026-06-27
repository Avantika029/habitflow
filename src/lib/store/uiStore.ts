import { create } from 'zustand'

interface UIStore {
  // Modal states
  isCreateHabitOpen: boolean
  editingHabitId: string | null
  isSidebarOpen: boolean

  // Actions
  openCreateHabit: () => void
  closeCreateHabit: () => void
  openEditHabit: (id: string) => void
  closeEditHabit: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>()((set) => ({
  isCreateHabitOpen: false,
  editingHabitId: null,
  isSidebarOpen: true,

  openCreateHabit: () => set({ isCreateHabitOpen: true }),
  closeCreateHabit: () => set({ isCreateHabitOpen: false }),
  openEditHabit: (id) => set({ editingHabitId: id }),
  closeEditHabit: () => set({ editingHabitId: null }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}))
