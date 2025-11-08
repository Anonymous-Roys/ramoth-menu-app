import { UserManagement } from '../../components/UserManagement'
import { UserList } from '../../components/UserList'

export function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1>👥 User Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserManagement onUserCreated={() => window.location.reload()} />
        <UserList />
      </div>
    </div>
  )
}