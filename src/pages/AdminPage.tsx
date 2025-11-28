import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { AdminDashboardPage } from './admin/AdminDashboardPage'
import { AdminAddMenuPage } from './admin/AdminAddMenuPage'
import { AdminUsersPage } from './admin/AdminUsersPage'
import { AdminDistributorsPage } from './admin/AdminDistributorsPage'
import { AdminDailyReportPage } from './admin/AdminDailyReportPage'

export function AdminPage() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboardPage />} />
        <Route path="/addmenu" element={<AdminAddMenuPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/distributors" element={<AdminDistributorsPage />} />
        <Route path="/dailyreport" element={<AdminDailyReportPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  )
}