import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { UtensilsCrossed } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGlobalState } from '../../lib/globalState'

export function AdminDashboardPage() {
  const { dashboardStats, recentSelections, isLoading, fetchDashboardData } = useGlobalState()
  const navigate = useNavigate()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    fetchDashboardData(today)
  }, [])



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
        <div className="flex gap-3 ml-auto">
          <Button 
            onClick={() => navigate('/admin/addmenu')} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 text-sm"
          >
            ➕ Add Menu
          </Button>
          <Button 
            onClick={() => navigate('/admin/dailyreport')} 
            variant="outline"
            className="px-3 py-2 text-sm"
          >
            📄 Reports
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
            <p className="text-3xl font-bold">{dashboardStats.todaySelections}</p>
            <p className="text-sm text-blue-100 mt-1">Total selections today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">{dashboardStats.totalWorkers}</p>
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
              {dashboardStats.selectionRate.toFixed(1)}%
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
              onClick={() => fetchDashboardData(new Date().toISOString().split('T')[0])}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                {recentSelections.map((selection, index) => (
                  <div 
                    key={`${selection.userId}-${selection.date}-${index}`} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="mb-2">
                      <p className="font-medium text-gray-900 text-sm">{selection.userName}</p>
                      <p className="text-xs text-gray-600">{selection.department}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600">{selection.mealName}</p>
                      <p className="text-xs text-gray-500">{selection.date} at {selection.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button 
                  onClick={() => navigate('/admin/dailyreport')}
                  variant="outline"
                  size="sm"
                >
                  View More
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}