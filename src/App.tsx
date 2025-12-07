import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { OnboardingPage } from './pages/OnboardingPage'
import { LoginPage } from './pages/LoginPage'
import { MenuPage } from './pages/MenuPage'
import { 
  AdminPage, 
  AdminDashboardPage, 
  AdminAddMenuPage, 
  AdminUsersPage, 
  AdminDistributorsPage, 
  AdminDailyReportPage 
} from './pages/AdminPage'
import { DistributorPage } from './pages/DistributorPage'
import { ProfilePage } from './components/ProfilePage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/sonner'

// Type definitions
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
  phone?: string
  profilePicture?: string
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

// Main App Routes Component
function AppRoutes() {
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true'
  const currentUser = localStorage.getItem('currentUser')

  // Determine initial route based on user state
  const getInitialRoute = () => {
    if (currentUser) {
      const user = JSON.parse(currentUser)
      if (user.role === 'admin') return '/admin'
      if (user.role === 'distributor') return '/distributor'
      return '/menu'
    }
    return hasSeenOnboarding ? '/login' : '/onboarding'
  }

  return (
    <Routes>
      {/* Root route - redirect based on user state */}
      <Route 
        path="/" 
        element={<Navigate to={getInitialRoute()} replace />} 
      />

      {/* Public routes */}
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Worker routes */}
      <Route 
        path="/menu" 
        element={
          <ProtectedRoute requiredRole="worker">
            <MenuPage />
          </ProtectedRoute>
        } 
      />

      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="addmenu" element={<AdminAddMenuPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="distributors" element={<AdminDistributorsPage />} />
        <Route path="dailyreport" element={<AdminDailyReportPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Distributor routes */}
      <Route 
        path="/distributor" 
        element={
          <ProtectedRoute requiredRole="distributor">
            <DistributorPage />
          </ProtectedRoute>
        } 
      />

      {/* Profile routes - accessible by all authenticated users */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Main App Component
export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ramoth-ui-theme">
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-center" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}