import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { UtensilsCrossed, User, Lock } from 'lucide-react';
import type { User as UserType, UserRole } from '../App';

interface LoginScreenProps {
  onLogin: (user: UserType) => void;
  onShowOnboarding: () => void;
}

export function LoginScreen({ onLogin, onShowOnboarding }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) return;
    
    // Mock login - in production this would authenticate with backend
    const user: UserType = {
      id: selectedRole === 'admin' ? 'admin-1' : `worker-${Date.now()}`,
      name: selectedRole === 'admin' ? 'Admin User' : 'Miriam Aryeetey',
      email,
      department: selectedRole === 'admin' ? 'Administration' : 'IT',
      role: selectedRole
    };
    
    onLogin(user);
  };

  const handleQuickLogin = (role: UserRole) => {
    const user: UserType = {
      id: role === 'admin' ? 'admin-1' : `worker-${Date.now()}`,
      name: role === 'admin' ? 'Admin User' : 'Miriam Aryeetey',
      email: role === 'admin' ? 'admin@company.com' : 'miriam.aryeetey@company.com',
      department: role === 'admin' ? 'Administration' : 'IT',
      role
    };
    
    onLogin(user);
  };

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg">
                <UtensilsCrossed className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle>Company Menu App</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Sign in as {selectedRole === 'admin' ? 'Admin' : 'Worker'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email / Staff ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="your.email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="text-blue-600 hover:underline"
                >
                  ← Back
                </button>
                <button type="button" className="text-gray-600 hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                Login
              </Button>

              {/* Demo Quick Login */}
              <div className="pt-4 border-t">
                <p className="text-xs text-center text-gray-500 mb-2">Demo Mode</p>
                <Button
                  type="button"
                  onClick={() => handleQuickLogin(selectedRole)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Quick Login (Demo)
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              © Company Name
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle>Company Menu App</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select your meal with ease
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-4 text-center">Ready to get started?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:border-blue-400 transition-all hover:shadow-md"
                onClick={() => handleRoleSelect('worker')}
              >
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <h4 className="mb-2">Login as Worker</h4>
                  <p className="text-sm text-gray-600">Select your daily meal</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-orange-400 transition-all hover:shadow-md"
                onClick={() => handleRoleSelect('admin')}
              >
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <UtensilsCrossed className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                  <h4 className="mb-2">Login as Admin</h4>
                  <p className="text-sm text-gray-600">Manage menus & reports</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onShowOnboarding}
              className="text-sm"
            >
              View introduction again
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            © Company Name
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
