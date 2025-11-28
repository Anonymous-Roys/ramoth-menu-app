import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'worker' | 'admin' | 'distributor'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const userData = localStorage.getItem('currentUser')
  
  if (!userData) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const user = JSON.parse(userData)
    if (user.role !== requiredRole) {
      return <Navigate to={
        user.role === 'admin' ? '/admin' : 
        user.role === 'distributor' ? '/distributor' : 
        '/menu'
      } replace />
    }
  }

  return <>{children}</>
}