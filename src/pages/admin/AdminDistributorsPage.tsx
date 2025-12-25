import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { toast } from 'sonner@2.0.3'
import { Plus, Trash2, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { User } from '../../App'

export function AdminDistributorsPage() {
  const [distributors, setDistributors] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newDistributor, setNewDistributor] = useState({
    firstName: '',
    lastName: '',
    department: ''
  })

  useEffect(() => {
    fetchDistributors()
  }, [])

  const fetchDistributors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'distributor')
        .order('name')

      if (error) throw error

      const distributorUsers: User[] = data.map(user => ({
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

      setDistributors(distributorUsers)
    } catch (error) {
      console.error('Failed to fetch distributors:', error)
      toast.error('Failed to load distributors')
    } finally {
      setIsLoading(false)
    }
  }

  const generateDistributorId = (firstName: string, lastName: string, uniqueNumber: number): string => {
    return `d${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}${uniqueNumber.toString().padStart(4, '0')}`
  }

  const handleAddDistributor = async () => {
    if (!newDistributor.firstName || !newDistributor.lastName || !newDistributor.department) {
      toast.error('Please fill in all fields')
      return
    }

    setIsAdding(true)
    try {
      // Generate unique number
      const { data: existingUsers } = await supabase
        .from('users')
        .select('unique_number')
        .order('unique_number', { ascending: false })
        .limit(1)

      const nextUniqueNumber = existingUsers && existingUsers.length > 0 
        ? existingUsers[0].unique_number + 1 
        : 1001

      const generatedId = generateDistributorId(
        newDistributor.firstName, 
        newDistributor.lastName, 
        nextUniqueNumber
      )

      const distributorData = {
        generated_id: generatedId,
        first_name: newDistributor.firstName,
        last_name: newDistributor.lastName,
        name: `${newDistributor.firstName} ${newDistributor.lastName}`,
        department: newDistributor.department,
        role: 'distributor',
        unique_number: nextUniqueNumber,
        is_active: true
      }

      const { error } = await supabase
        .from('users')
        .insert(distributorData)

      if (error) throw error

      toast.success(`Distributor added successfully! ID: ${generatedId}`)
      setNewDistributor({ firstName: '', lastName: '', department: '' })
      fetchDistributors()
    } catch (error: any) {
      console.error('Failed to add distributor:', error)
      const errorMessage = error?.message || 'Unknown error occurred'
      toast.error(`Failed to add distributor: ${errorMessage}`)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteDistributor = async (distributorId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete distributor ${name}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', distributorId)

      if (error) throw error

      toast.success('Distributor deleted successfully')
      fetchDistributors()
    } catch (error) {
      console.error('Failed to delete distributor:', error)
      toast.error('Failed to delete distributor')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Distributors</h1>
          <p className="text-gray-600">Manage food distributors</p>
        </div>
      </div>

      {/* Add New Distributor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Distributor
          </CardTitle>
          <CardDescription>
            Create a new distributor account with auto-generated ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={newDistributor.firstName}
                onChange={(e) => setNewDistributor(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={newDistributor.lastName}
                onChange={(e) => setNewDistributor(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={newDistributor.department}
                onChange={(e) => setNewDistributor(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Enter department"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              onClick={handleAddDistributor} 
              disabled={isAdding}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAdding ? 'Adding...' : 'Add Distributor'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Distributors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Current Distributors ({distributors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {distributors.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No distributors yet</h3>
              <p className="text-gray-600">Add your first distributor to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {distributors.map((distributor) => (
                <Card key={distributor.id} className="border-green-200">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{distributor.name}</h4>
                          <p className="text-sm text-gray-600">{distributor.department}</p>
                          <p className="text-xs text-green-600 font-mono">ID: {distributor.generated_id}</p>
                        </div>
                        <Button
                          onClick={() => handleDeleteDistributor(distributor.id, distributor.name)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}