import { useState, useEffect } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { LogOut, LayoutDashboard, Calendar, FileText, Settings, Menu, X, Users, User as UserIcon } from 'lucide-react'
import { User } from '../App'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import logo from '../logo.png'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get user from localStorage
  const userData = localStorage.getItem('currentUser')
  
  if (!userData) {
    navigate('/login')
    return null
  }
  
  const user: User = JSON.parse(userData)
  
  if (user.role !== 'admin') {
    navigate('/login')
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Add Menu', icon: Calendar, path: '/admin/addmenu' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Daily Report', icon: FileText, path: '/admin/dailyreport' },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  // Close sidebar when clicking on overlay or pressing ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Always visible on all screens */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              id="menu-button"
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2 shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <img 
              src={logo} 
              alt="Ramoth Logo" 
              className="w-8 h-8 object-contain shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-medium text-gray-900 text-sm md:text-base truncate">Ramoth Admin</h1>
              <p className="text-xs text-gray-600 truncate">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleNavigation('/admin/profile')}
              className="hidden md:flex items-center gap-3 mr-4 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="text-xs">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.department}</p>
              </div>
            </button>
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              size="sm"
              className="p-2 shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Overlay - Shows when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Hidden by default, shows when sidebarOpen is true */}
      <aside 
        id="sidebar"
        className={`
          fixed top-0 left-0 h-full w-64 bg-white z-50 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-2xl
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img 
                src={logo} 
                alt="Ramoth Logo" 
                className="w-10 h-10 object-contain shrink-0" 
              />
              <div className="min-w-0">
                <h2 className="font-medium text-gray-900 text-sm truncate">Ramoth Menu App</h2>
                <p className="text-xs text-gray-600 truncate">Admin Panel</p>
              </div>
            </div>
            <Button
              onClick={() => setSidebarOpen(false)}
              variant="ghost"
              size="sm"
              className="p-1 shrink-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        duration-200 text-sm
                        ${isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 shrink-0">
            <button 
              onClick={() => handleNavigation('/admin/profile')}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3 w-full hover:bg-gray-100 transition-colors"
            >
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-gray-900 truncate text-sm">{user.name}</p>
                <p className="text-xs text-gray-600 truncate">{user.department}</p>
              </div>
            </button>
            <Button 
              onClick={handleLogout} 
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
      
      {/* Main Content Area */}
      <main className="w-full min-h-screen">
        {/* Content wrapper with padding for header */}
        <div className="pt-16 md:pt-20">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}