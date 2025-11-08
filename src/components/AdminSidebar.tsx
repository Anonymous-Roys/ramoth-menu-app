import { useState } from 'react'
import { Button } from './ui/button'
import { LogOut, UtensilsCrossed, LayoutDashboard, Calendar, FileText, Settings, Menu, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { User } from '../App'
import logo from '../logo.png'

interface AdminSidebarProps {
  user: User
  onLogout: () => void
}

export function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'addmenu', label: 'Add Menu', icon: Calendar, path: '/admin/addmenu' },
    { id: 'users', label: 'Users', icon: Settings, path: '/admin/users' },
    { id: 'dailyreport', label: 'Daily Report', icon: FileText, path: '/admin/dailyreport' },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:bg-gray-100 p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <img src={logo} alt="Ramoth Logo" className="w-8 h-8 object-contain" />
            <div>
              <h2 className="font-semibold text-gray-900">Ramoth Admin</h2>
              <p className="text-xs text-gray-600">{user.name}</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" size="sm" className="text-xs px-2 py-1">
            <LogOut className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Ramoth Logo" className="w-10 h-10 object-contain bg-white/20 backdrop-blur-sm p-2 rounded-xl" />
                <div>
                  <h3 className="text-white">Ramoth Menu App</h3>
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

            <nav className="space-y-2 flex-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-lg'
                        : 'text-blue-100 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6 border-t border-blue-600 mt-auto">
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
      </div>
    </>
  )
}