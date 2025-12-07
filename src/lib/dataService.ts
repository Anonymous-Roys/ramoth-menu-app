import { supabase } from './supabase'
import type { User, MealSelection } from '../App'

export interface DashboardStats {
  totalWorkers: number
  todaySelections: number
  totalSelections: number
  selectionRate: number
}

export interface WorkerReport {
  id: string
  name: string
  department: string
  hasSelected: boolean
  mealName?: string
  selectionTime?: string
  collected?: boolean
}

// Global data fetching service to ensure consistency
export class DataService {
  // Fetch all workers (excluding admin and distributor roles)
  static async fetchWorkers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .not('role', 'in', '("admin","distributor")')
      .order('name')

    if (error) throw error

    return data.map(user => ({
      id: user.id,
      generated_id: user.generated_id,
      first_name: user.first_name,
      last_name: user.last_name,
      name: user.name,
      email: user.email,
      date_of_birth: user.date_of_birth,
      department: user.department,
      role: user.role,
      unique_number: user.unique_number
    }))
  }

  // Fetch selections for a specific date (only for workers, not admin/distributor)
  static async fetchSelectionsForDate(date: string): Promise<MealSelection[]> {
    const { data, error } = await supabase
      .from('selections')
      .select(`
        *,
        users!inner(name, department, role)
      `)
      .eq('date', date)
      .not('users.role', 'in', '("admin","distributor")')

    if (error) throw error

    return data.map(selection => ({
      userId: selection.user_id,
      userName: selection.users.name,
      department: selection.users.department,
      mealId: selection.meal_id,
      mealName: selection.meal_name,
      date: selection.date,
      time: new Date(selection.created_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      collected: selection.collected || false
    }))
  }

  // Fetch recent selections (for admin dashboard, only workers)
  static async fetchRecentSelections(limit: number = 5): Promise<MealSelection[]> {
    const { data, error } = await supabase
      .from('selections')
      .select(`
        *,
        users!inner(name, department, role)
      `)
      .not('users.role', 'in', '("admin","distributor")')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data.map(selection => ({
      userId: selection.user_id,
      userName: selection.users.name,
      department: selection.users.department,
      mealId: selection.meal_id,
      mealName: selection.meal_name,
      date: selection.date,
      time: new Date(selection.created_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      collected: selection.collected || false
    }))
  }

  // Generate dashboard statistics
  static async fetchDashboardStats(date?: string): Promise<DashboardStats> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    console.log('fetchDashboardStats - targetDate:', targetDate)
    
    const [workers, selections] = await Promise.all([
      this.fetchWorkers(),
      this.fetchSelectionsForDate(targetDate)
    ])

    console.log('fetchDashboardStats - workers:', workers.length)
    console.log('fetchDashboardStats - selections:', selections.length)
    console.log('fetchDashboardStats - selections data:', selections)

    return {
      totalWorkers: workers.length,
      todaySelections: selections.length,
      totalSelections: selections.length,
      selectionRate: workers.length > 0 ? (selections.length / workers.length) * 100 : 0
    }
  }

  // Generate daily report data
  static async fetchDailyReport(date: string): Promise<WorkerReport[]> {
    console.log('fetchDailyReport - date:', date)
    
    const [workers, selections] = await Promise.all([
      this.fetchWorkers(),
      this.fetchSelectionsForDate(date)
    ])

    console.log('fetchDailyReport - workers:', workers.length)
    console.log('fetchDailyReport - selections:', selections.length)
    console.log('fetchDailyReport - selections data:', selections)

    const report = workers.map(worker => {
      const selection = selections.find(s => s.userId === worker.id)
      return {
        id: worker.id,
        name: worker.name,
        department: worker.department,
        hasSelected: !!selection,
        mealName: selection?.mealName,
        selectionTime: selection?.time,
        collected: selection?.collected
      }
    })

    const selectedCount = report.filter(w => w.hasSelected).length
    console.log('fetchDailyReport - selected workers:', selectedCount)

    return report
  }
}