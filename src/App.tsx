import { useState, useEffect } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { LoginScreen } from './components/LoginScreen';
import { WorkerDashboard } from './components/WorkerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export type UserRole = 'worker' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
}

export interface MealOption {
  id: string;
  name: string;
  description: string;
}

export interface DailyMenu {
  date: string;
  meals: MealOption[];
}

export interface MealSelection {
  userId: string;
  userName: string;
  department: string;
  mealId: string;
  mealName: string;
  date: string;
  time: string;
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [weeklyMenus, setWeeklyMenus] = useState<DailyMenu[]>([]);
  const [selections, setSelections] = useState<MealSelection[]>([]);

  // Check if user has seen onboarding before
  useEffect(() => {
    const seen = localStorage.getItem('hasSeenOnboarding');
    if (seen === 'true') {
      setShowOnboarding(false);
      setHasSeenOnboarding(true);
    }
  }, []);

  // Initialize with sample weekly menus
  useEffect(() => {
    const today = new Date();
    const sampleMenus: DailyMenu[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      sampleMenus.push({
        date: date.toISOString().split('T')[0],
        meals: [
          {
            id: `meal-${i}-1`,
            name: 'Jollof Rice',
            description: 'Served with chicken and salad'
          },
          {
            id: `meal-${i}-2`,
            name: 'Fried Rice',
            description: 'Served with beef and vegetables'
          },
          {
            id: `meal-${i}-3`,
            name: 'Banku & Okro',
            description: 'Served with fish'
          }
        ]
      });
    }
    
    setWeeklyMenus(sampleMenus);
  }, []);

  const handleOnboardingComplete = (dontShowAgain: boolean) => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    if (dontShowAgain) {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    toast.success(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast.info('Logged out successfully');
  };

  const handleMealSelection = (selection: MealSelection) => {
    setSelections(prev => [...prev, selection]);
  };

  const updateWeeklyMenus = (menus: DailyMenu[]) => {
    setWeeklyMenus(menus);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  // Show onboarding if user hasn't seen it
  if (showOnboarding && !hasSeenOnboarding) {
    return (
      <>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
        <Toaster position="top-center" />
      </>
    );
  }

  // Show login if no user is logged in
  if (!currentUser) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} onShowOnboarding={handleShowOnboarding} />
        <Toaster position="top-center" />
      </>
    );
  }

  // Show onboarding if requested from login screen
  if (showOnboarding && hasSeenOnboarding) {
    return (
      <>
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
        <Toaster position="top-center" />
      </>
    );
  }

  // Show appropriate dashboard based on user role
  return (
    <>
      {currentUser.role === 'worker' ? (
        <WorkerDashboard
          user={currentUser}
          weeklyMenus={weeklyMenus}
          selections={selections}
          onLogout={handleLogout}
          onMealSelection={handleMealSelection}
        />
      ) : (
        <AdminDashboard
          user={currentUser}
          weeklyMenus={weeklyMenus}
          selections={selections}
          onLogout={handleLogout}
          onUpdateMenus={updateWeeklyMenus}
        />
      )}
      <Toaster position="top-center" />
    </>
  );
}
