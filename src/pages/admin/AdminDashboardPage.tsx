import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { UtensilsCrossed } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { MealSelection } from '../../App'

export function AdminDashboardPage() {
  const [totalWorkers, setTotalWorkers] = useState(0)
  const [recentSelections, setRecentSelections] = useState<MealSelection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch workers count from your users table
      const { data: workers, error: workersError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'worker')

      if (workersError) throw workersError
      setTotalWorkers(workers?.length || 0)

      // Fetch recent selections with user data
      const { data: selectionsData, error: selectionsError } = await supabase
        .from('selections')
        .select(`
          *,
          users!inner(name, department)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (selectionsError) throw selectionsError

      const formattedSelections: MealSelection[] = selectionsData?.map(selection => ({
        userId: selection.user_id,
        userName: selection.users.name,
        department: selection.users.department,
        mealId: selection.meal_id,
        mealName: selection.meal_name,
        date: selection.date,
        time: new Date(selection.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      })) || []

      setRecentSelections(formattedSelections)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const todaySelections = recentSelections.filter(s => s.date === new Date().toISOString().split('T')[0])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            👨💼 Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate('/admin/addmenu')} 
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            ➕ Add Weekly Menu
          </Button>
          <Button 
            onClick={() => navigate('/admin/dailyreport')} 
            variant="outline"
          >
            📄 Daily Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm font-medium">Workers Selected</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">{todaySelections.length}</p>
            <p className="text-sm text-blue-100 mt-1">Total selections today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">{totalWorkers}</p>
            <p className="text-sm text-orange-100 mt-1">Registered workers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm font-medium">Current Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-green-100 mt-1">Deadline: 9:00 AM</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm font-medium">Selection Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">
              {totalWorkers > 0 ? ((todaySelections.length / totalWorkers) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-purple-100 mt-1">Today's rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Selections */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Selections</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchDashboardData}
              className="text-blue-600 hover:text-blue-700"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentSelections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No selections yet</p>
              <p className="text-sm mt-2">Selections will appear here as workers choose their meals</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentSelections.map((selection, index) => (
                <div 
                  key={`${selection.userId}-${selection.date}-${index}`} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="font-medium text-gray-900">{selection.userName}</p>
                    <p className="text-sm text-gray-600">{selection.department}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium text-blue-600">{selection.mealName}</p>
                    <p className="text-sm text-gray-500">{selection.date} at {selection.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}