import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { User } from '../App'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

interface UserManagementProps {
  onUserCreated: () => void
}

export function UserManagement({ onUserCreated }: UserManagementProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    department: '',
    role: 'worker' as 'worker' | 'admin'
  })
  const [isLoading, setIsLoading] = useState(false)

  const generateUserId = (firstName: string, lastName: string, uniqueNumber: number) => {
    const prefix = (firstName.charAt(0) + lastName).toLowerCase()
    return `${prefix}${uniqueNumber}`
  }

  const generateUniqueNumber = () => {
    return Math.floor(Math.random() * 9000) + 1000 // 4-digit number
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const uniqueNumber = generateUniqueNumber()
      const generatedId = generateUserId(formData.first_name, formData.last_name, uniqueNumber)
      const fullName = `${formData.first_name} ${formData.last_name}`

      const { data, error } = await supabase
        .from('users')
        .insert({
          generated_id: generatedId,
          first_name: formData.first_name,
          last_name: formData.last_name,
          name: fullName,
          email: formData.email || null,
          date_of_birth: formData.date_of_birth || null,
          department: formData.department,
          role: formData.role,
          unique_number: uniqueNumber
        })
        .select()
        .single()

      if (error) throw error

      const newUser: User = {
        id: data.id,
        generated_id: data.generated_id,
        first_name: data.first_name,
        last_name: data.last_name,
        name: data.name,
        email: data.email,
        date_of_birth: data.date_of_birth,
        department: data.department,
        role: data.role,
        unique_number: data.unique_number
      }

      onUserCreated()
      toast.success(`User created! ID: ${generatedId}`)
      
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        department: '',
        role: 'worker'
      })
    } catch (error) {
      toast.error('Failed to create user')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="date_of_birth">Date of Birth</Label>
        <Input
          id="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="department">Job Title *</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <div className="flex gap-2">
          {['worker', 'admin', 'distributor'].map((role) => (
            <Button
              key={role}
              type="button"
              variant={formData.role === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, role: role as 'worker' | 'admin' }))}
              className={`capitalize flex-1 ${formData.role === role ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  )
}