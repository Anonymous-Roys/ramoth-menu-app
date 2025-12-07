import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { toast } from 'sonner@2.0.3'
import { LogOut, Check, Package, Users, Clock, Search, UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import type { User as UserType, MealSelection } from '../App'
import logo from '../logo.png'

interface DistributorDashboardProps {
  user: UserType
  selections: MealSelection[]
  onLogout: () => void
  onMarkCollected: (userId: string, date: string) => void
  onFoodReady: () => void
}

export function DistributorDashboard({ 
  user, 
  selections, 
  onLogout, 
  onMarkCollected,
  onFoodReady
}: DistributorDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [foodReady, setFoodReady] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectionFilter, setSelectionFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const handleMarkCollected = (userId: string, date: string) => {
    onMarkCollected(userId, date)
    toast.success('Marked as collected!')
  }

  const handleFoodReady = () => {
    setFoodReady(true)
    onFoodReady()
    toast.success('Food status updated - Ready for collection!')
  }

  const filteredSelections = selections.filter(selection => {
    const matchesSearch = selection.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      selection.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      selection.mealName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSelection = selectionFilter === 'all' ||
      (selectionFilter === 'collected' && selection.collected) ||
      (selectionFilter === 'pending' && !selection.collected)
    
    const matchesDepartment = departmentFilter.length === 0 ||
      departmentFilter.includes(selection.department)
    
    return matchesSearch && matchesSelection && matchesDepartment
  })
  
  const uniqueDepartments = [...new Set(selections.map(s => s.department))].sort()

  const mealGroups = filteredSelections.reduce((acc, selection) => {
    if (!acc[selection.mealName]) {
      acc[selection.mealName] = []
    }
    acc[selection.mealName].push(selection)
    return acc
  }, {} as Record<string, MealSelection[]>)

  const totalSelections = filteredSelections.length
  const collectedCount = filteredSelections.filter(s => s.collected).length
  const pendingCount = totalSelections - collectedCount

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Ramoth Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Ramoth Menu App - Distributor</h2>
                <button 
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.profile_picture} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs sm:text-sm text-gray-600">{user.name}</p>
                </button>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-black font-bold text-lg mb-1 drop-shadow-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-black font-medium drop-shadow-sm">Hello, {user.name} 👋</p>
              </div>
              <div className="text-right">
                <div className="bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-sm text-black font-medium drop-shadow-sm">Current Time</p>
                  <p className="text-xl text-black font-bold drop-shadow-sm">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, department, or meal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2">
                {['all', 'collected', 'pending'].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectionFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectionFilter(filter)}
                    className={`text-xs capitalize ${selectionFilter === filter ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
              
              <div className="flex-1">
                <select
                  value={departmentFilter.length === 0 ? 'all' : departmentFilter[0]}
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setDepartmentFilter([])
                    } else {
                      setDepartmentFilter([e.target.value])
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Departments</option>
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{totalSelections}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Collected</p>
                  <p className="text-2xl font-bold text-green-600">{collectedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Food Status</p>
                    <p className="text-sm font-medium text-purple-600">
                      {foodReady ? 'Ready' : 'Not Ready'}
                    </p>
                  </div>
                </div>
                {!foodReady && (
                  <Button 
                    onClick={handleFoodReady}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Mark Ready
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meal Groups */}
        <div className="space-y-6">
          {Object.entries(mealGroups).map(([mealName, mealSelections]) => (
            <Card key={mealName}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>🍛 {mealName}</span>
                  <Badge variant="secondary">{mealSelections.length} orders</Badge>
                </CardTitle>
                <CardDescription>
                  Manage collections for {mealName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mealSelections.map((selection) => (
                    <Card 
                      key={`${selection.userId}-${selection.date}`}
                      className={`transition-all ${
                        selection.collected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{selection.userName}</h4>
                              <p className="text-sm text-gray-600">{selection.department}</p>
                              <p className="text-xs text-gray-500">Selected at {selection.time}</p>
                            </div>
                            {selection.collected && (
                              <Badge className="bg-green-600">Collected</Badge>
                            )}
                          </div>
                          
                          {!selection.collected && (
                            <Button
                              onClick={() => handleMarkCollected(selection.userId, selection.date)}
                              className="w-full bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Mark Collected
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalSelections === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders for today</h3>
                <p className="text-gray-600">There are no meal selections for today yet.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}