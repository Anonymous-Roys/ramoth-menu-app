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
  const [loginData, setLoginData] = useState({ userId: '' })
  const [forgotIdData, setForgotIdData] = useState({
    first_name: '',
    last_name: '',
    unique_number: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Attempting login with ID:', loginData.userId)
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('generated_id', loginData.userId)
        .single()

      console.log('Supabase response:', { data, error })

      if (error || !data) {
        toast.error(`Login failed: ${error?.message || 'User not found'}`)
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
      } else {
        navigate('/menu')
      }
    } catch (error) {
      toast.error('Login failed')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotId = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('users')
        .select('generated_id, name')
        .eq('first_name', forgotIdData.first_name)
        .eq('last_name', forgotIdData.last_name)
        .eq('unique_number', parseInt(forgotIdData.unique_number))
        .single()

      if (error || !data) {
        toast.error('No user found with these details')
        return
      }

      toast.success(`Your ID is: ${data.generated_id}`)
      setLoginData({ userId: data.generated_id })
    } catch (error) {
      toast.error('Failed to retrieve ID')
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
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter your user ID (e.g., darhin4332)"
                    value={loginData.userId}
                    onChange={(e) => setLoginData({ userId: e.target.value })}
                    required
                  />
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
                    onChange={(e) => setForgotIdData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={forgotIdData.last_name}
                    onChange={(e) => setForgotIdData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unique_number">Unique Number</Label>
                  <Input
                    id="unique_number"
                    placeholder="4-digit number from your ID"
                    value={forgotIdData.unique_number}
                    onChange={(e) => setForgotIdData(prev => ({ ...prev, unique_number: e.target.value }))}
                    required
                  />
                </div>
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