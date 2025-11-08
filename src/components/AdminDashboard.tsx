import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LogOut, UtensilsCrossed, LayoutDashboard, Calendar, FileText, Settings, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WeeklyMenuManager } from './WeeklyMenuManager';
import { ReportGenerator } from './ReportGenerator';
import { UserManagement } from './UserManagement';
import { UserList } from './UserList';
import { DailyReport } from './DailyReport';
import type { User, DailyMenu, MealSelection } from '../App';

interface AdminDashboardProps {
  user: User;
  weeklyMenus: DailyMenu[];
  selections: MealSelection[];
  onLogout: () => void;
  onUpdateMenus: (menus: DailyMenu[]) => void;
}

export function AdminDashboard({
  user,
  weeklyMenus,
  selections,
  onLogout,
  onUpdateMenus
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'menu' | 'reports' | 'users' | 'daily-report'>('dashboard');
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [recentSelections, setRecentSelections] = useState<MealSelection[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total workers
      const { data: workers, error: workersError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'worker');

      if (workersError) throw workersError;
      setTotalWorkers(workers?.length || 0);

      // Fetch recent selections with user data
      const { data: selectionsData, error: selectionsError } = await supabase
        .from('selections')
        .select(`
          *,
          users!inner(name, department)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (selectionsError) throw selectionsError;

      const formattedSelections: MealSelection[] = selectionsData?.map(selection => ({
        userId: selection.user_id,
        userName: selection.users.name,
        department: selection.users.department,
        mealId: selection.meal_id,
        mealName: selection.meal_name,
        date: selection.date,
        time: new Date(selection.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      })) || [];

      setRecentSelections(formattedSelections);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const getTodaySelections = () => {
    const today = new Date().toISOString().split('T')[0];
    return recentSelections.filter(s => s.date === today);
  };

  const todaySelections = getTodaySelections();

  // Calculate meal breakdown
  const getMealBreakdown = () => {
    const breakdown: { [key: string]: number } = {};
    todaySelections.forEach(s => {
      breakdown[s.mealName] = (breakdown[s.mealName] || 0) + 1;
    });
    return breakdown;
  };

  const mealBreakdown = getMealBreakdown();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Add Menu', icon: Calendar },
    { id: 'users', label: 'Users', icon: Settings },
    { id: 'daily-report', label: 'Daily Report', icon: FileText },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:block`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white">Menu App</h3>
                <p className="text-sm text-blue-200">Admin Panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeView === item.id
                      ? 'bg-white text-blue-700 shadow-lg'
                      : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-blue-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm">{user.name}</p>
              <p className="text-xs text-blue-200">{user.department}</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm border-b md:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2>Admin Dashboard</h2>
                <p className="text-sm text-gray-600">{user.name}</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>



        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            {activeView === 'dashboard' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1>👨‍💼 Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setActiveView('menu')} className="bg-orange-600 hover:bg-orange-700">
                      ➕ Add Weekly Menu
                    </Button>
                    <Button onClick={() => setActiveView('reports')} variant="outline">
                      📄 Daily Reports
                    </Button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div>
                  <h3 className="mb-4">📊 Summary — Today</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Workers Selected</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl">{todaySelections.length}</p>
                        <p className="text-sm text-blue-100 mt-1">Total selections today</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Total Workers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl">{totalWorkers}</p>
                        <p className="text-sm text-orange-100 mt-1">Registered workers</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Current Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl">
                          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-green-100 mt-1">Deadline: 9:00 AM</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Weekly Menus</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl">{weeklyMenus.length}</p>
                        <p className="text-sm text-purple-100 mt-1">Configured menus</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Meal Breakdown */}
                {Object.keys(mealBreakdown).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Meal Breakdown</CardTitle>
                      <CardDescription>Number of workers who selected each meal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(mealBreakdown).map(([meal, count]) => (
                          <div key={meal} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                              </div>
                              <span>{meal}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{count}</span>
                              <span className="text-gray-600">workers</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Selections */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Selections</CardTitle>
                    <CardDescription>Latest meal selections from workers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentSelections.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No selections yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentSelections.slice(0, 10).map((selection, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-medium">{selection.userName}</p>
                              <p className="text-sm text-gray-600">{selection.department}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{selection.mealName}</p>
                              <p className="text-sm text-gray-600">{selection.date} at {selection.time}</p>
                            </div>
                          </div>
                        ))}
                        {recentSelections.length > 10 && (
                          <p className="text-sm text-gray-600 text-center pt-2">
                            +{recentSelections.length - 10} more selections
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeView === 'menu' && (
              <WeeklyMenuManager
                weeklyMenus={weeklyMenus}
                onUpdateMenus={onUpdateMenus}
              />
            )}

            {activeView === 'reports' && (
              <ReportGenerator
                selections={selections}
                weeklyMenus={weeklyMenus}
              />
            )}

            {activeView === 'users' && (
              <div className="space-y-6">
                <h1>👥 User Management</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <UserManagement onUserCreated={() => window.location.reload()} />
                  <UserList />
                </div>
              </div>
            )}

            {activeView === 'daily-report' && (
              <div className="space-y-6">
                <h1>📈 Daily Report</h1>
                <DailyReport />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
