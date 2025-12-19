import { useState } from 'react'
import { UserManagement } from '../../components/UserManagement'
import { UserList } from '../../components/UserList'
import { Button } from '../../components/ui/button'
import { useGlobalState } from '../../lib/globalState'
import { Plus, X } from 'lucide-react'

export function AdminUsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUserCreated = () => {
    setIsModalOpen(false)
    setRefreshKey(prev => prev + 1)
    // Invalidate cache when new user is created
    const { invalidateCache } = useGlobalState.getState()
    invalidateCache()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between w-full text-center">
        <h1 className='font-bold text-xl'>User management</h1>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New User</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <UserManagement onUserCreated={handleUserCreated} />
          </div>
        </div>
      )}
      
      <UserList key={refreshKey} />
    </div>
  )
}