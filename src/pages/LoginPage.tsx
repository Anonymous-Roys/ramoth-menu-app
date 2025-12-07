import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { User } from '../App'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [loginData, setLoginData] = useState({ userId: '' })
  const [forgotIdData, setForgotIdData] = useState({
    first_name: '',
    last_name: '',
    unique_number: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')

    // Input validation
    if (!loginData.userId.trim()) {
      setLoginError('Please enter your user ID')
      setIsLoading(false)
      return
    }

    if (loginData.userId.length < 5) {
      setLoginError('User ID must be at least 5 characters')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('generated_id', loginData.userId.trim())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setLoginError('User ID not found. Please check your ID or use "Forgot ID" tab.')
        } else {
          setLoginError('Connection error. Please try again.')
        }
        return
      }

      if (!data) {
        setLoginError('User not found. Please check your ID.')
        return
      }

      const user: User = {
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

      localStorage.setItem('currentUser', JSON.stringify(user))
      toast.success(`Welcome back, ${user.name}!`)
      
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'distributor') {
        navigate('/distributor')
      } else {
        navigate('/menu')
      }
    } catch (error) {
      setLoginError('Network error. Please check your connection and try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotId = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setForgotError('')

    // Input validation
    if (!forgotIdData.first_name.trim() || !forgotIdData.last_name.trim()) {
      setForgotError('Please enter both first and last name')
      setIsLoading(false)
      return
    }

    if (!forgotIdData.unique_number || forgotIdData.unique_number.length !== 4) {
      setForgotError('Please enter the 4-digit unique number')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('generated_id, name')
        .eq('first_name', forgotIdData.first_name.trim())
        .eq('last_name', forgotIdData.last_name.trim())
        .eq('unique_number', parseInt(forgotIdData.unique_number))
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setForgotError('No user found with these details. Please check your information.')
        } else {
          setForgotError('Connection error. Please try again.')
        }
        return
      }

      toast.success(`Your ID is: ${data.generated_id}`)
      setLoginData({ userId: data.generated_id })
      setForgotError('')
    } catch (error) {
      setForgotError('Network error. Please check your connection and try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowOnboarding = () => {
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="forgot">Forgot ID</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    id="userId"
                    placeholder="Enter your user ID (e.g., darhin4332)"
                    onKeyDown={(e) => {
                      if (e.key === " ") e.preventDefault();
                    }}
                    value={loginData.userId}
                    onChange={(e) => {
                      setLoginData({ userId: e.target.value })
                      setLoginError('')
                    }}
                    className={loginError ? 'border-red-500' : ''}
                    required
                  />
                  {loginError && (
                    <p className="text-red-500 text-sm mt-1">{loginError}</p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="forgot">
              <form onSubmit={handleForgotId} className="space-y-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={forgotIdData.first_name}
                    onChange={(e) => {
                      setForgotIdData(prev => ({ ...prev, first_name: e.target.value }))
                      setForgotError('')
                    }}
                    className={forgotError ? 'border-red-500' : ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={forgotIdData.last_name}
                    onChange={(e) => {
                      setForgotIdData(prev => ({ ...prev, last_name: e.target.value }))
                      setForgotError('')
                    }}
                    className={forgotError ? 'border-red-500' : ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unique_number">Unique Number</Label>
                  <Input
                    id="unique_number"
                    placeholder="4-digit number from your ID"
                    maxLength={4}
                    value={forgotIdData.unique_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setForgotIdData(prev => ({ ...prev, unique_number: value }))
                      setForgotError('')
                    }}
                    className={forgotError ? 'border-red-500' : ''}
                    required
                  />
                </div>
                {forgotError && (
                  <p className="text-red-500 text-sm">{forgotError}</p>
                )}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Retrieving...' : 'Get My ID'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center">
            <Button variant="link" onClick={handleShowOnboarding}>
              View App Tour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}