import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Camera, Save, ArrowLeft } from 'lucide-react'
import { User } from '../App'
import { profileService } from '../lib/profileService'
import { toast } from 'sonner'

export function ProfilePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    department: '',
    phone: '',
    email: '',
    profilePicture: ''
  })

  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      navigate('/login')
      return
    }
    
    const currentUser: User = JSON.parse(userData)
    setUser(currentUser)
    setFormData({
      department: currentUser.department || '',
      phone: currentUser.phone || '',
      email: currentUser.email || '',
      profilePicture: currentUser.profilePicture || ''
    })
  }, [navigate])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size must be less than 3MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      
      // Additional size check for base64 string
      if (base64String.length > 4 * 1024 * 1024) {
        toast.error('Processed image is too large. Please use a smaller image.')
        return
      }
      
      setFormData(prev => ({
        ...prev,
        profilePicture: base64String
      }))
      toast.success('Image uploaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      const result = await profileService.updateProfile(user.generated_id, {
        department: formData.department,
        phone: formData.phone,
        email: formData.email,
        profile_picture: formData.profilePicture
      })

      if (result.success) {
        // Update localStorage
        const updatedUser = {
          ...user,
          department: formData.department,
          phone: formData.phone,
          email: formData.email,
          profilePicture: formData.profilePicture
        }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile save error:', error)
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/admin')
    } else if (user?.role === 'worker') {
      navigate('/worker')
    } else if (user?.role === 'distributor') {
      navigate('/distributor')
    } else {
      navigate('/login')
    }
  }

  if (!user) return null

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Update your personal information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.profilePicture} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center space-y-2">
                <Label htmlFor="profile-picture" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Camera className="w-4 h-4 mr-2" />
                      Change Picture
                    </span>
                  </Button>
                </Label>
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">Max size: 3MB • JPG, PNG, GIF</p>
              </div>
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={user.name}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="uniqueId">Unique ID</Label>
                <Input
                  id="uniqueId"
                  value={user.generated_id}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                disabled
                className="bg-gray-100"
              />
            </div>

            {/* Editable fields */}
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter your department"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={handleBack}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}