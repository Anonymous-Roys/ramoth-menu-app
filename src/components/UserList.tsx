import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { User } from '../App'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Copy, Search, Trash2, Edit, Filter, UserCheck, UserX, Eye, EyeOff } from 'lucide-react'

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all') // 'all', 'active', 'inactive'
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.generated_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      )
    }
    
    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const userList: User[] = data.map(user => ({
        id: user.id,
        generated_id: user.generated_id,
        first_name: user.first_name,
        last_name: user.last_name,
        name: user.name,
        email: user.email,
        date_of_birth: user.date_of_birth,
        department: user.department,
        role: user.role,
        unique_number: user.unique_number,
        is_active: user.is_active ?? true
      }))

      setUsers(userList)
    } catch (error) {
      toast.error('Failed to fetch users')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('ID copied to clipboard')
  }

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      if (error) throw error
      setUsers(prev => prev.filter(user => user.id !== userId))
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Failed to delete user')
      console.error(error)
    }
  }

  const toggleUserActive = async (user: User) => {
    const newActiveStatus = !user.is_active
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: newActiveStatus })
        .eq('id', user.id)

      if (error) throw error

      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, is_active: newActiveStatus } : u
      ))
      
      toast.success(`User ${newActiveStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error('Failed to update user status')
      console.error(error)
    }
  }

  const updateUser = async (updatedUser: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.name,
          department: updatedUser.department,
          email: updatedUser.email,
          is_active: updatedUser.is_active
        })
        .eq('id', updatedUser.id)

      if (error) throw error

      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ))
      setEditingUser(null)
      toast.success('User updated successfully')
    } catch (error) {
      toast.error('Failed to update user')
      console.error(error)
    }
  }

  if (isLoading) {
    return <div className="py-8 text-center">Loading users...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Input
              placeholder="Search users by name, ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Role:</span>
              </div>
              {['all', 'worker', 'admin', 'distributor'].map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                  className={`capitalize ${roleFilter === role ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  {role === 'all' ? 'All Roles' : role === 'worker' ? 'Workers' : role === 'admin' ? 'Admins' : 'Distributors'}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Status:</span>
              </div>
              {['all', 'active', 'inactive'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={`capitalize ${statusFilter === status ? 
                    status === 'active' ? 'bg-green-600 hover:bg-green-700' : 
                    status === 'inactive' ? 'bg-red-600 hover:bg-red-700' : 
                    'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  {status === 'all' ? 'All Status' : status === 'active' ? 
                    <><UserCheck className="w-3 h-3 mr-1" /> Active</> : 
                    <><UserX className="w-3 h-3 mr-1" /> Inactive</>}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 overflow-y-auto max-h-96">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 space-y-2 border rounded-lg">
              {editingUser?.id === user.id ? (
                <div className="space-y-3">
                  <Input
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    placeholder="Name"
                  />
                  <Input
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                    placeholder="Job Title"
                  />
                  <Input
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    placeholder="Email"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`active-${editingUser.id}`}
                      checked={editingUser.is_active ?? true}
                      onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`active-${editingUser.id}`} className="text-sm font-medium text-gray-900">
                      Active
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateUser(editingUser)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        user.role === 'admin' ? 'default' : 
                        user.role === 'distributor' ? 'destructive' : 'secondary'
                      }>
                        {user.role}
                      </Badge>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 font-mono text-sm bg-gray-100 rounded">
                      {user.generated_id}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(user.generated_id)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {user.email && (
                    <p className="text-sm text-gray-600">{user.email}</p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Unique Number: {user.unique_number}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingUser(user)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={user.is_active ? "destructive" : "default"}
                        onClick={() => toggleUserActive(user)}
                        className="flex items-center gap-1"
                      >
                        {user.is_active ? (
                          <><EyeOff className="w-3 h-3" /> Deactivate</>
                        ) : (
                          <><Eye className="w-3 h-3" /> Activate</>
                        )}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteUser(user.id, user.name)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {filteredUsers.length === 0 && !isLoading && (
            <div className="py-8 text-center text-gray-500">
              No users found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}