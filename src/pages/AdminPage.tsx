import { useState, useEffect } from 'react'
import { AdminDashboard } from '../components/AdminDashboard'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User, DailyMenu, MealSelection } from '../App'

export function AdminPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [weeklyMenus, setWeeklyMenus] = useState<DailyMenu[]>([])
  const [selections, setSelections] = useState<MealSelection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      navigate('/login')
      return
    }
    
    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      navigate('/menu')
      return
    }
    
    setCurrentUser(user)
    fetchMenus()
  }, [navigate])

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

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const updateWeeklyMenus = (menus: DailyMenu[]) => {
    setWeeklyMenus(menus)
  }

  if (!currentUser || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menus...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminDashboard
      user={currentUser}
      weeklyMenus={weeklyMenus}
      selections={selections}
      onLogout={handleLogout}
      onUpdateMenus={updateWeeklyMenus}
    />
  )
}