import { create } from 'zustand'
import { DataService, DashboardStats } from './dataService'
import { MealSelection } from '../App'

interface GlobalState {
  // Data
  dashboardStats: DashboardStats
  recentSelections: MealSelection[]
  selectionsForDate: MealSelection[]
  lastFetch: string | null
  
  // Loading states
  isLoading: boolean
  
  // Actions
  fetchDashboardData: (date: string, force?: boolean) => Promise<void>
  fetchSelectionsForDate: (date: string, force?: boolean) => Promise<void>
  refreshData: (date?: string) => Promise<void>
  invalidateCache: () => void
}

export const useGlobalState = create<GlobalState>((set, get) => ({
  // Initial state
  dashboardStats: { totalWorkers: 0, todaySelections: 0, totalSelections: 0, selectionRate: 0 },
  recentSelections: [],
  selectionsForDate: [],
  lastFetch: null,
  isLoading: false,

  // Fetch dashboard data
  fetchDashboardData: async (date: string, force = false) => {
    const state = get()
    const cacheKey = `dashboard-${date}`
    
    if (!force && state.lastFetch === cacheKey) {
      return // Use cached data
    }
    
    set({ isLoading: true })
    try {
      const [dashboardStats, recentSelectionsData] = await Promise.all([
        DataService.fetchDashboardStats(date),
        DataService.fetchRecentSelections(5)
      ])
      
      set({ 
        dashboardStats, 
        recentSelections: recentSelectionsData,
        lastFetch: cacheKey,
        isLoading: false 
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      set({ isLoading: false })
    }
  },

  // Fetch selections for specific date
  fetchSelectionsForDate: async (date: string, force = false) => {
    const state = get()
    const cacheKey = `selections-${date}`
    
    if (!force && state.lastFetch?.includes(date)) {
      return // Use cached data
    }
    
    try {
      const selections = await DataService.fetchSelectionsForDate(date)
      set({ selectionsForDate: selections })
    } catch (error) {
      console.error('Failed to fetch selections for date:', error)
    }
  },

  // Refresh all data (force refresh)
  refreshData: async (date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0]
    await Promise.all([
      get().fetchDashboardData(targetDate, true),
      get().fetchSelectionsForDate(targetDate, true)
    ])
  },

  // Invalidate cache
  invalidateCache: () => {
    set({ lastFetch: null })
  }
}))