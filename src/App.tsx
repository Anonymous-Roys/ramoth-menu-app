import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { OnboardingPage } from './pages/OnboardingPage'
import { LoginPage } from './pages/LoginPage'
import { MenuPage } from './pages/MenuPage'
import { AdminPage } from './pages/AdminPage'
import { DistributorPage } from './pages/DistributorPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/sonner'

export type UserRole = 'worker' | 'admin' | 'distributor' | null

export interface User {
  id: string
  generated_id: string
  first_name: string
  last_name: string
  name: string
  email?: string
  date_of_birth?: string
  department: string
  role: UserRole
  unique_number: number
}

export interface MealOption {
  id: string
  name: string
  description: string
}

export interface DailyMenu {
  date: string
  meals: MealOption[]
}

export interface MealSelection {
  userId: string
  userName: string
  department: string
  mealId: string
  mealName: string
  date: string
  time: string
  collected?: boolean
}

function AppRoutes() {
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true'
  const currentUser = localStorage.getItem('currentUser')

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          currentUser ? (
            <Navigate to={
              JSON.parse(currentUser).role === 'admin' ? '/admin' : 
              JSON.parse(currentUser).role === 'distributor' ? '/distributor' : 
              '/menu'
            } replace />
          ) : hasSeenOnboarding ? (
            <Navigate to="/login" replace />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        } 
      />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/menu" 
        element={
          <ProtectedRoute requiredRole="worker">
            <MenuPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/distributor" 
        element={
          <ProtectedRoute requiredRole="distributor">
            <DistributorPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-center" />
      </Router>
    </AuthProvider>
  )
}
