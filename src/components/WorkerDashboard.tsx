import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { LogOut, MapPin, Clock, Check, AlertCircle, UtensilsCrossed, Calendar, User } from 'lucide-react';
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
  onMealSelection 
}: WorkerDashboardProps) {
  const [isOnSite, setIsOnSite] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [showWeeklyMenu, setShowWeeklyMenu] = useState(false);

  // Company location: 6.2025094, -1.7130153
  const COMPANY_LAT = 6.2025094;
  const COMPANY_LNG = -1.7130153;
  const RADIUS_METERS = 10000;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    checkLocation();

    return () => clearInterval(timer);
  }, []);

  const checkLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            COMPANY_LAT,
            COMPANY_LNG
          );
          
          setIsOnSite(distance <= RADIUS_METERS);
          
          if (distance > RADIUS_METERS) {
            toast.error('You are not at the company location. For demo purposes, selection is still allowed.');
          }
        },
        () => {
          // For demo, allow access even if GPS fails
          setIsOnSite(true);
          toast.info('GPS verification simulated for demo');
        }
      );
    } else {
      setIsOnSite(true);
      toast.info('GPS verification simulated for demo');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };



  const getTodayMenu = (): DailyMenu | null => {
    const today = new Date().toISOString().split('T')[0];
    return weeklyMenus.find(menu => menu.date === today) || null;
  };

  const hasSelectedToday = (): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return selections.some(s => s.userId === user.id && s.date === today);
  };

  const getTodaySelection = (): MealSelection | null => {
    const today = new Date().toISOString().split('T')[0];
    return selections.find(s => s.userId === user.id && s.date === today) || null;
  };

  const isBeforeDeadline = () => {
    const hours = currentTime.getHours();
    return hours < 12;
  };

  const handleMealSelect = (mealId: string, mealName: string) => {
    if (!isBeforeDeadline()) {
      toast.error('Selection deadline has passed (12:00 PM)');
      return;
    }

    const isUpdate = alreadySelected;
    const message = isUpdate 
      ? `Are you sure you want to update your selection to ${mealName}?`
      : `Are you sure you want to select ${mealName}?`;

    if (window.confirm(message)) {
      const selection: MealSelection = {
        userId: user.id,
        userName: user.name,
        department: user.department,
        mealId,
        mealName,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      onMealSelection(selection);
      setSelectedMeal(mealId);
      toast.success(isUpdate ? `Selection updated to ${mealName}!` : `${mealName} selected successfully!`);
    }
  };

  const handleMealDeselect = () => {
    if (!isBeforeDeadline()) {
      toast.error('Selection deadline has passed (12:00 PM)');
      return;
    }

    if (window.confirm('Are you sure you want to remove your meal selection?')) {
      const today = new Date().toISOString().split('T')[0];
      if (onMealDeselection) {
        onMealDeselection(user.id, today);
      }
      setSelectedMeal(null);
      toast.success('Meal selection removed successfully!');
    }
  };

  if (showWeeklyMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Ramoth Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Ramoth Menu App</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{user.name}</p>
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

        <div className="max-w-7xl mx-auto p-4">
          <WeeklyMenuView 
            weeklyMenus={weeklyMenus} 
            onBack={() => setShowWeeklyMenu(false)} 
          />
        </div>
      </div>
    );
  }

  const todayMenu = getTodayMenu();
  const alreadySelected = hasSelectedToday();
  const todaySelection = getTodaySelection();
  const beforeDeadline = isBeforeDeadline();
  const canSelect = isOnSite && beforeDeadline;
  // const canSelect = true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Notification System */}
      <NotificationSystem 
        hasSelectedToday={alreadySelected}
        currentTime={currentTime}
        userId={user.id}
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Ramoth Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Ramoth Menu App</h2>
                <p className="text-xs sm:text-sm text-gray-600">{user.name}</p>
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

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white mb-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-blue-100">Hello, {user.name} 👋</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-sm text-blue-100">Current Time</p>
                  <p className="text-xl">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={isOnSite ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isOnSite ? 'bg-green-100' : 'bg-red-100'}`}>
                  <MapPin className={`w-5 h-5 ${isOnSite ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className={isOnSite ? 'text-green-600' : 'text-red-600'}>
                    {isOnSite ? 'On Site ✓' : 'Off Site'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>



          <Card className={beforeDeadline ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${beforeDeadline ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Clock className={`w-5 h-5 ${beforeDeadline ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Deadline Status</p>
                  <p className={beforeDeadline ? 'text-blue-600' : 'text-gray-600'}>
                    {beforeDeadline ? 'Before 12:00 PM ✓' : 'After 12:00 PM'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={alreadySelected ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${alreadySelected ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <Check className={`w-5 h-5 ${alreadySelected ? 'text-green-600' : 'text-orange-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Selection Status</p>
                  <p className={alreadySelected ? 'text-green-600' : 'text-orange-600'}>
                    {alreadySelected ? 'Complete ✓' : 'Pending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {!beforeDeadline && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⏰ Selection deadline has passed. Selections close at 12:00 PM daily.
            </AlertDescription>
          </Alert>
        )}

        {alreadySelected && todaySelection && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ You selected <strong>{todaySelection.mealName}</strong>. Thank you!
            </AlertDescription>
          </Alert>
        )}

        {/* Today's Meals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🍛 Today's Meals
            </CardTitle>
            <CardDescription>
              {alreadySelected ? 'Click to update your selection (before 12:00 PM)' : 'Select your preferred meal'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!todayMenu ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No menu available for today. Please contact administration.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {todayMenu.meals.map((meal) => {
                  const isSelected = alreadySelected && todaySelection?.mealId === meal.id;
                  return (
                    <Card 
                      key={meal.id} 
                      className={`transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-md' 
                          : canSelect
                          ? 'hover:border-blue-400 hover:shadow-md cursor-pointer'
                          : 'opacity-60'
                      }`}
                      onClick={() => canSelect && handleMealSelect(meal.id, meal.name)}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4>{meal.name}</h4>
                            {isSelected && (
                              <Badge className="bg-green-600">Selected</Badge>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMealDeselect();
                              }}
                              variant="outline"
                              className="w-full border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Deselect
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="mb-2">Selection Requirements</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>🔒 You must be on-site to select</li>
                    <li>🕒 Selection closes at 12:00 PM</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-2">Need Help?</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
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
