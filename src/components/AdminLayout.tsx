import { useAuth } from '../contexts/AuthContext'
import { ResponsiveSidebar } from './ResponsiveSidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth()

  // Transform Supabase User to our App User type
  const appUser = user ? {
    id: user.id,
    generated_id: user.user_metadata?.generated_id || '',
    first_name: user.user_metadata?.first_name || '',
    last_name: user.user_metadata?.last_name || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
    email: user.email,
    date_of_birth: user.user_metadata?.date_of_birth,
    department: user.user_metadata?.department || 'Administration',
    role: 'admin' as const,
    unique_number: user.user_metadata?.unique_number || 0
  } : null

  if (!appUser) {
    return null
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ResponsiveSidebar user={appUser} onLogout={handleLogout} />
      
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