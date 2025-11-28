import { useState, useEffect } from 'react'
import { DistributorDashboard } from '../components/DistributorDashboard'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User, MealSelection } from '../App'

export function DistributorPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selections, setSelections] = useState<MealSelection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      navigate('/login')
      return
    }
    
    const user = JSON.parse(userData)
    if (user.role !== 'distributor') {
      navigate('/login')
      return
    }
    
    setCurrentUser(user)
    fetchTodaySelections()
  }, [navigate])

  const fetchTodaySelections = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('selections')
        .select('*, users(name, department)')
        .eq('date', today)

      if (error) throw error

      const todaySelections: MealSelection[] = data.map(selection => ({
        userId: selection.user_id,
        userName: selection.users?.name || 'Unknown',
        department: selection.users?.department || 'Unknown',
        mealId: selection.meal_id,
        mealName: selection.meal_name,
        date: selection.date,
        time: new Date(selection.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        collected: selection.collected || false
      }))

      setSelections(todaySelections)
    } catch (error) {
      console.error('Failed to fetch selections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const handleMarkCollected = async (userId: string, date: string) => {
    try {
      const { error } = await supabase
        .from('selections')
        .update({ collected: true })
        .eq('user_id', userId)
        .eq('date', date)

      if (error) throw error

      setSelections(prev => 
        prev.map(s => 
          s.userId === userId && s.date === date 
            ? { ...s, collected: true }
            : s
        )
      )
    } catch (error) {
      console.error('Failed to mark as collected:', error)
    }
  }

  const handleFoodReady = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('food_status')
        .upsert({ 
          date: today, 
          ready: true,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to update food status:', error)
    }
  }

  if (!currentUser || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DistributorDashboard
      user={currentUser}
      selections={selections}
      onLogout={handleLogout}
      onMarkCollected={handleMarkCollected}
      onFoodReady={handleFoodReady}
    />
  )
}