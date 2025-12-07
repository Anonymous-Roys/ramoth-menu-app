import { AdminLayout } from '../components/AdminLayout'

export function AdminPage() {
  return <AdminLayout />
}

// Re-export all admin sub-pages
export { AdminDashboardPage } from './admin/AdminDashboardPage'
export { AdminAddMenuPage } from './admin/AdminAddMenuPage'
export { AdminUsersPage } from './admin/AdminUsersPage'
export { AdminDistributorsPage } from './admin/AdminDistributorsPage'
export { AdminDailyReportPage } from './admin/AdminDailyReportPage'