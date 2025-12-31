import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { LogOut, MapPin, Clock, Check, AlertCircle, UtensilsCrossed, Calendar, User, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { WeeklyMenuView } from './WeeklyMenuView';
import { NotificationSystem } from './NotificationSystem';
import type { User as UserType, DailyMenu, MealSelection } from '../App';
import logo from '../logo.png';



interface WorkerDashboardProps {
  user: UserType;
  weeklyMenus: DailyMenu[];
  selections: MealSelection[];
  onLogout: () => void;
  onMealSelection: (selection: MealSelection) => void;
  onMealDeselection?: (userId: string, date: string) => void;
}

export function WorkerDashboard({ 
  user, 
  weeklyMenus, 
  selections, 
  onLogout, 
  onMealSelection,
  onMealDeselection // ✅ include this prop
}: WorkerDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [showWeeklyMenu, setShowWeeklyMenu] = useState(false);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);



  const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

  const getTomorrowMenu = (): DailyMenu | null => {
  const tomorrow = getTomorrowDate();
  return weeklyMenus.find(menu => menu.date === tomorrow) || null;
};



  const hasSelectedTomorrow = (): boolean => {
  const tomorrow = getTomorrowDate();
  return selections.some(s => s.userId === user.id && s.date === tomorrow);
};


  const getTomorrowSelection = (): MealSelection | null => {
  const tomorrow = getTomorrowDate();
  return selections.find(s => s.userId === user.id && s.date === tomorrow) || null;
};


  const isBeforeDeadline = () => {
    const hours = currentTime.getHours();
    return hours < 18.5;
  };

  const alreadySelected = hasSelectedTomorrow();
  const tomorrowMenu = getTomorrowMenu();
  const tomorrowSelection = getTomorrowSelection();
  const beforeDeadline = isBeforeDeadline();
  const canSelect = beforeDeadline;

  const handleMealSelect = (mealId: string, mealName: string) => {
    if (!isBeforeDeadline()) {
      toast.error('Selection deadline has passed (6:30 PM)');
      return;
    }

      const selection: MealSelection = {
        userId: user.id,
        userName: user.name,
        department: user.department,
        mealId,
        mealName,
        date: getTomorrowDate(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      onMealSelection(selection);
      setSelectedMeal(mealId);
      toast.success(`${mealName} selected successfully!`);
  };

  const handleMealDeselect = (e: React.MouseEvent) => {
  e.stopPropagation(); // ✅ prevents double firing due to event bubbling

  if (!isBeforeDeadline()) {
    toast.error('Selection deadline has passed (6:30 PM)');
    return;
  }
    const tomorrow = getTomorrowDate();
    if (onMealDeselection) {
      onMealDeselection(user.id, tomorrow);
      setSelectedMeal(null);
      toast.success('Meal selection removed successfully!');
    } else {
      toast.error('Meal deselection function not available.');
    }
};



  if (showWeeklyMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="bg-white border-b shadow-sm">
          <div className="px-4 py-4 mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Ramoth Logo" className="object-contain w-8 h-8 sm:w-10 sm:h-10" />
                <div>
                  <h2 className="text-lg font-semibold sm:text-xl">Ramoth Menu App</h2>
                  <p className="text-xs text-gray-600 sm:text-sm">{user.name}</p>
                </div>
              </div>
              <Button onClick={onLogout} variant="outline" size="sm" className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button onClick={onLogout} variant="outline" size="sm" className="sm:hidden">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 mx-auto max-w-7xl">
          <WeeklyMenuView 
            weeklyMenus={weeklyMenus} 
            onBack={() => setShowWeeklyMenu(false)} 
          />
        </div>
      </div>
    );
  }

  
  // const canSelect = true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Notification System */}
      {/* <NotificationSystem 
        hasSelectedToday={alreadySelected}
        currentTime={currentTime}
        userId={user.id}
      /> */}
      
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Ramoth Logo" className="object-contain w-8 h-8 sm:w-10 sm:h-10" />
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">Ramoth Menu App</h2>
                <button 
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center gap-2 p-1 transition-colors rounded hover:bg-gray-100"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-gray-600 sm:text-sm">{user.name}</p>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button onClick={() => setShowWeeklyMenu(true)} variant="outline" size="sm" className="hidden sm:flex">
                <Calendar className="w-4 h-4 mr-2" />
                Weekly Menu
              </Button>
              <Button onClick={() => setShowWeeklyMenu(true)} variant="outline" size="sm" className="sm:hidden">
                <Calendar className="w-4 h-4" />
              </Button>
              <Button onClick={onLogout} variant="outline" size="sm" className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button onClick={onLogout} variant="outline" size="sm" className="sm:hidden">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl p-4 mx-auto space-y-6 bg-gray-50">
        {/* Welcome Banner */}
        <Card className="text-black border-0 shadow-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-2xl font-semibold text-black">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-gray-600">Hello, {user.name} 👋</p>
              </div>
              <div className="text-right">
                <div className="px-4 py-2 bg-gray-300 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-black-100">Current Time</p>
                  <p className="text-xl">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className={beforeDeadline ? 'border-blue-200 bg-gray-50' : 'border-gray-200 bg-gray-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${beforeDeadline ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Clock className={`w-5 h-5 ${beforeDeadline ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Deadline Status</p>
                  <p className={beforeDeadline ? 'text-blue-600' : 'text-gray-600'}>
                    {beforeDeadline ? 'Before 6:30 PM ✓' : 'After 6:30 PM'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={alreadySelected ? 'border-blue-200 bg-gray-50' : 'border-gray-200 bg-gray-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${alreadySelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Check className={`w-5 h-5 ${alreadySelected ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Selection Status</p>
                  <p className={alreadySelected ? 'text-blue-600' : 'text-gray-600'}>
                    {alreadySelected ? 'Complete ✓' : 'Pending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {!beforeDeadline && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              ⏰ Selection deadline has passed. Selections close at 6:30 PM daily.
            </AlertDescription>
          </Alert>
        )}

        {alreadySelected && tomorrowSelection && (
          <Alert className="border-blue-200 bg-blue-50">
            <Check className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div>You selected <strong>{tomorrowSelection.mealName}</strong>.Thank you!</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tomorrow's Meals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            Tomorrow&apos;s Meals
            </CardTitle>
            <CardDescription>
              {alreadySelected ? 'Click to update your selection (before 6:30 PM)' : 'Select your preferred meal'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!tomorrowMenu ? (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  No menu available for tomorrow. Please contact administration.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {tomorrowMenu.meals.map((meal) => {
                  const isSelected = alreadySelected && tomorrowSelection?.mealId === meal.id;
                  return (
                    <Card 
                      key={meal.id} 
                      className={`transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : canSelect
                          ? 'hover:border-blue-400 hover:shadow-md cursor-pointer'
                          : 'opacity-60'
                      }`}
                      onClick={() => canSelect && handleMealSelect(meal.id, meal.name)}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between font-semibold">
                            <h4>{meal.name}</h4>
                            {isSelected && (
                              <Badge className="bg-blue-600">Selected</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{meal.description}</p>
                          {canSelect && !isSelected && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMealSelect(meal.id, meal.name);
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              Select Meal
                            </Button>
                          )}
                          {canSelect && isSelected && (
                            <Button
                              onClick={handleMealDeselect}
                              variant="outline"
                              className="w-full text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="mb-2">Selection Requirements</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>🕒 Selection closes at 6:30 PM</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-2">Need Help?</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>📧 Contact HR for issues</li>
                    <li>🍽️ One meal selection per day</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}