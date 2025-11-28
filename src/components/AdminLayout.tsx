import { useNavigate } from 'react-router-dom'
import { ResponsiveSidebar } from './ResponsiveSidebar'
import { User } from '../App'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ResponsiveSidebar user={user} onLogout={handleLogout} />
      
      {/* Main Content */}
      <main className="flex-1 md:ml-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Mobile spacing to account for fixed header */}
          <div className="md:hidden h-16"></div>
          {children}
        </div>
      </main>
    </div>
  )
}