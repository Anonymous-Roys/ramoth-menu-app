import { useState, useEffect } from 'react'
import { WorkerDashboard } from '../components/WorkerDashboard'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User, DailyMenu, MealSelection } from '../App'
import { toast } from 'sonner';


export function MenuPage() {
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
    if (user.role !== 'worker') {
      navigate('/admin')
      return
    }
    
    setCurrentUser(user)
    fetchMenus()
    fetchSelections(user.id)
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
    }
  }

  const fetchSelections = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('selections')
        .select('*, users(name, department)')
        .eq('user_id', userId)

      if (error) throw error

      const userSelections: MealSelection[] = data.map(selection => ({
        userId: selection.user_id,
        userName: selection.users?.name || 'Unknown',
        department: selection.users?.department || 'Unknown',
        mealId: selection.meal_id,
        mealName: selection.meal_name,
        date: selection.date,
        time: new Date(selection.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }))

      setSelections(userSelections)
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

  const handleMealSelection = async (selection: MealSelection) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Check if user already has a selection for today
      const { data: existingSelection } = await supabase
        .from('selections')
        .select('id')
        .eq('user_id', selection.userId)
        .eq('date', today)
        .single()

      if (existingSelection) {
        // Update existing selection
        const { error } = await supabase
          .from('selections')
          .update({
            meal_id: selection.mealId,
            meal_name: selection.mealName,
            created_at: new Date().toISOString()
          })
          .eq('id', existingSelection.id)

        if (error) throw error
        
        // Update local state
        setSelections(prev => 
          prev.map(s => 
            s.userId === selection.userId && s.date === today
              ? { ...s, mealId: selection.mealId, mealName: selection.mealName }
              : s
          )
        )
      } else {
        // Insert new selection
        const { error } = await supabase
          .from('selections')
          .insert({
            user_id: selection.userId,
            meal_id: selection.mealId,
            meal_name: selection.mealName,
            date: selection.date,
            location: null
          })

        if (error) throw error
        
        setSelections(prev => [...prev, selection])
      }
    } catch (error) {
      console.error('Failed to save selection:', error)
    }
  }

  const handleMealDeselection = async (userId: string, date: string) => {
  try {
    const { error } = await supabase
      .from('selections')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    if (error) throw error;

    setSelections(prev => prev.filter(s => !(s.userId === userId && s.date === date)));
    toast.success('Meal selection removed successfully!');
  } catch (error) {
    console.error('Failed to remove selection:', error);
    toast.error('Failed to remove meal selection. Please try again.');
  }
};




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
  <WorkerDashboard
  user={currentUser}
  weeklyMenus={weeklyMenus}
  selections={selections}
  onLogout={handleLogout}
  onMealSelection={handleMealSelection}
  onMealDeselection={handleMealDeselection} // ✅ correct casing & name
/>

);
}