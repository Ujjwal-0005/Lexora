import { create } from 'zustand'

export const useFilterStore = create((set) => ({
  // Lawyer filters
  specialization: [],
  regionId: '',
  minRating: 0,
  maxFee: 30000,
  searchQuery: '',
  sortBy: 'average_rating',
  sortOrder: 'desc',

  // Actions
  setSpecialization: (specialization) => set({ specialization }),
  setRegionId: (regionId) => set({ regionId }),
  setMinRating: (minRating) => set({ minRating }),
  setMaxFee: (maxFee) => set({ maxFee }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  resetFilters: () => set({
    specialization: [],
    regionId: '',
    minRating: 0,
    maxFee: 30000,
    searchQuery: '',
    sortBy: 'average_rating',
    sortOrder: 'desc',
  }),

  // Dark mode
  darkMode: localStorage.getItem('darkMode') === 'true',
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode
    localStorage.setItem('darkMode', newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { darkMode: newMode }
  }),
  initDarkMode: () => set(() => {
    const saved = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved === null ? prefersDark : saved === 'true'

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { darkMode: isDark }
  }),
}))
