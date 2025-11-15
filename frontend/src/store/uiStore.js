import { create } from 'zustand';

export const useUIStore = create((set) => ({
  focusMode: false,
  selectedList: null,
  filterTag: null,
  filterStatus: 'todo',
  searchQuery: '',
  sidebarCollapsed: false,
  advancedFilters: {
    energyLevel: null,
    effortRange: null,
    location: null,
    mood: null,
    deadlineHorizon: null,
    hasDueDate: null,
    hasSubSteps: null,
    hasLinks: null
  },

  setFocusMode: (focusMode) => set({ focusMode }),
  setSelectedList: (selectedList) => set({ selectedList }),
  setFilterTag: (filterTag) => set({ filterTag }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setAdvancedFilters: (filters) => set({ advancedFilters: filters }),
  resetAdvancedFilters: () => set({
    advancedFilters: {
      energyLevel: null,
      effortRange: null,
      location: null,
      mood: null,
      deadlineHorizon: null,
      hasDueDate: null,
      hasSubSteps: null,
      hasLinks: null
    }
  }),
}));
