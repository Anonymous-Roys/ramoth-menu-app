import { useState, useEffect } from 'react'
import { WeeklyMenuManager } from '../../components/WeeklyMenuManager'
import { DailyMenu } from '../../App'
import { supabase } from '../../lib/supabase'

export function AdminAddMenuPage() {
  const [weeklyMenus, setWeeklyMenus] = useState<DailyMenu[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error

      const menus: DailyMenu[] = data.map(menu => ({
        date: menu.date,
        meals: menu.meals
      }))

      setWeeklyMenus(menus)
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateMenus = (menus: DailyMenu[]) => {
    setWeeklyMenus(menus)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1>🗓️ Add Weekly Menu</h1>
      <WeeklyMenuManager
        weeklyMenus={weeklyMenus}
        onUpdateMenus={handleUpdateMenus}
      />
    </div>
  )
}