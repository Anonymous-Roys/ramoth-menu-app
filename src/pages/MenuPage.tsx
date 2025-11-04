import { useState, useEffect } from 'react'
import { WorkerDashboard } from '../components/WorkerDashboard'
import { useNavigate } from 'react-router-dom'
import { User, DailyMenu, MealSelection } from '../App'

export function MenuPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [weeklyMenus, setWeeklyMenus] = useState<DailyMenu[]>([])
  const [selections, setSelections] = useState<MealSelection[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      navigate('/login')
      return
    }
    
    const user = JSON.parse(userData)
    if (user.role !== 'worker') {
      navigate('/admin')
      return
    }
    
    setCurrentUser(user)

    // Initialize sample menus
    const today = new Date()
    const sampleMenus: DailyMenu[] = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      sampleMenus.push({
        date: date.toISOString().split('T')[0],
        meals: [
          {
            id: `meal-${i}-1`,
            name: 'Jollof Rice',
            description: 'Served with chicken and salad'
          },
          {
            id: `meal-${i}-2`,
            name: 'Fried Rice',
            description: 'Served with beef and vegetables'
          },
          {
            id: `meal-${i}-3`,
            name: 'Banku & Okro',
            description: 'Served with fish'
          }
        ]
      })
    }
    
    setWeeklyMenus(sampleMenus)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const handleMealSelection = (selection: MealSelection) => {
    setSelections(prev => [...prev, selection])
  }

  if (!currentUser) {
    return null
  }

  return (
    <WorkerDashboard
      user={currentUser}
      weeklyMenus={weeklyMenus}
      selections={selections}
      onLogout={handleLogout}
      onMealSelection={handleMealSelection}
    />
  )
}