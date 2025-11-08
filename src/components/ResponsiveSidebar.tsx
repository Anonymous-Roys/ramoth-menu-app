import { useState } from 'react'
import { Button } from './ui/button'
import { LogOut, UtensilsCrossed, LayoutDashboard, Calendar, FileText, Settings, Menu, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { User } from '../App'

interface ResponsiveSidebarProps {
  user: User
  onLogout: () => void
}

export function ResponsiveSidebar({ user, onLogout }: ResponsiveSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Add Menu', icon: Calendar, path: '/admin/addmenu' },
    { label: 'Users', icon: Settings, path: '/admin/users' },
    { label: 'Daily Report', icon: FileText, path: '/admin/dailyreport' },
    { label: 'Reports', icon: FileText, path: '/admin/reports' },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="bg-blue-600 p-2 rounded-lg">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-600">{user.name}</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:shadow-none md:border-r md:border-gray-200 md:flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Menu App</h2>
                <p className="text-sm text-gray-600">Admin Panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
              <div className="bg-gray-200 p-2 rounded-lg">
                <Settings className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-600 truncate">{user.department}</p>
              </div>
            </div>
            <Button 
              onClick={onLogout} 
              variant="outline" 
              className="w-full"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}