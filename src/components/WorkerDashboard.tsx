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
  const [isOnSite, setIsOnSite] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [showWeeklyMenu, setShowWeeklyMenu] = useState(false);
  const [dayOffset, setDayOffset] = useState<number>(0); // 0 = today, 1 = tomorrow

  // Company location: 6.2025094, -1.7130153 6.20530, -1.71848 ---6.204614, -1.719546

  //const COMPANY_LAT = 6.204614;
  //const COMPANY_LNG = -1.719546;
  //const RADIUS_METERS = 8000; // Distance radius in meters

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    //checkLocation();

    return () => clearInterval(timer);
  }, []);

  /* const checkLocation = () => {
  if (!('geolocation' in navigator)) {
    setIsOnSite(false);
    toast.error('Geolocation not supported.');
    return;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();

      // 1️⃣ Reject cached / stale location
      if (now - position.timestamp > 30000) {
        setIsOnSite(false);
        toast.error('Cached location detected. Please wait for fresh GPS.');
        return;
      }

      const { latitude, longitude, accuracy } = position.coords;

      // 2️⃣ Reject poor accuracy
      if (accuracy > 100) {
        setIsOnSite(false);
        toast.error(`Low GPS accuracy (${Math.round(accuracy)}m).`);
        return;
      }

      // 3️⃣ Distance check
      const distance = calculateDistance(
        latitude,
        longitude,
        COMPANY_LAT,
        COMPANY_LNG
      );

      setIsOnSite(distance <= RADIUS_METERS);

      if (distance > RADIUS_METERS) {
        toast.error(`You are ${Math.round(distance)}m away from the office.`);
      }

      // 🛑 Stop watching after first valid fix
      navigator.geolocation.clearWatch(watchId);
    },
    () => {
      setIsOnSite(false);
      toast.error('Location permission denied.');
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );
}; */
   
  /* const checkLocation = () => {
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
            toast.error('You are not at the company location. Meal selection is disabled.');
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
  }; */

  /* const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  }; */



  const getTodayMenu = (): DailyMenu | null => {
    const target = new Date();
    target.setDate(target.getDate() + dayOffset);
    const dateStr = target.toISOString().split('T')[0];
    return weeklyMenus.find(menu => menu.date === dateStr) || null;
  };

  const hasSelectedToday = (): boolean => {
    const target = new Date();
    target.setDate(target.getDate() + dayOffset);
    const dateStr = target.toISOString().split('T')[0];
    return selections.some(s => s.userId === user.id && s.date === dateStr);
  };

  const getTodaySelection = (): MealSelection | null => {
    const target = new Date();
    target.setDate(target.getDate() + dayOffset);
    const dateStr = target.toISOString().split('T')[0];
    return selections.find(s => s.userId === user.id && s.date === dateStr) || null;
  };

  const isBeforeDeadline = () => {
    const hours = currentTime.getHours();
    return hours < 23;
  };

  const todayMenu = getTodayMenu();
  const alreadySelected = hasSelectedToday();
  const todaySelection = getTodaySelection();
  const selectedDate = (() => { const d = new Date(); d.setDate(d.getDate() + dayOffset); return d.toISOString().split('T')[0]; })();
  const beforeDeadline = isBeforeDeadline();
  // allow selecting: for today only before deadline; for tomorrow allow anytime while on-site
  //const canSelect = /* isOnSite &&  */(dayOffset === 0 ? beforeDeadline : true);

  const isBefore8PM = currentTime.getHours() < 20;

  const canSelect =
    dayOffset === 0
      ? beforeDeadline          // today → before 8 AM
      : isBefore8PM;            // tomorrow → before 8 PM


  /* const handleMealSelect = (mealId: string, mealName: string) => {
    if (!isBeforeDeadline()) {
      toast.error('Selection deadline has passed (8:00 AM)');
      return;
    }

      const selection: MealSelection = {
        userId: user.id,
        userName: user.name,
        department: user.department,
        mealId,
        mealName,
        date: selectedDate,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      onMealSelection(selection);
      setSelectedMeal(mealId);
      toast.success(`${mealName} selected successfully!`);
  }; */
  const handleMealSelect = (mealId: string, mealName: string) => {
  // ⛔ Only block deadline for TODAY
  if (dayOffset === 0 && !isBeforeDeadline()) {
    toast.error('Selection deadline has passed (8:00 AM)');
    return;
  }

  const selection: MealSelection = {
    userId: user.id,
    userName: user.name,
    department: user.department,
    mealId,
    mealName,
    date: selectedDate,
    time: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  onMealSelection(selection);
  setSelectedMeal(mealId);
  toast.success(`${mealName} selected successfully!`);
};


  /* const handleMealDeselect = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation(); // ✅ prevents double firing due to event bubbling

  if (!isBeforeDeadline()) {
    toast.error('Selection deadline has passed (8:00 AM)');
    return;
  }
    const today = selectedDate;
    if (onMealDeselection) {
      onMealDeselection(user.id, today);
      setSelectedMeal(null);
      toast.success('Meal selection removed successfully!');
    } else {
      toast.error('Meal deselection function not available.');
    }
}; */
  const handleMealDeselect = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();

  // ⛔ Deadline applies ONLY to today
  if (dayOffset === 0 && !isBeforeDeadline()) {
    toast.error('Selection deadline has passed (8:00 AM)');
    return;
  }

  if (onMealDeselection) {
    onMealDeselection(user.id, selectedDate);
    setSelectedMeal(null);
    toast.success('Meal selection removed successfully!');
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
      <NotificationSystem 
        hasSelectedToday={alreadySelected}
        currentTime={currentTime}
        userId={user.id}
      />
      
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
          {/* <Card className={isOnSite ? 'border-blue-200 bg-gray-50' : 'border-red-100 bg-gray-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isOnSite ? 'bg-blue-100' : 'bg-amber-100'}`}>
                  <MapPin className={`w-5 h-5 ${isOnSite ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className={isOnSite ? 'text-blue-600' : 'text-amber-600'}>
                    {isOnSite ? 'On Site ✓' : 'Off Site'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card> */}



          <Card className={beforeDeadline ? 'border-blue-200 bg-gray-50' : 'border-gray-200 bg-gray-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${beforeDeadline ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Clock className={`w-5 h-5 ${beforeDeadline ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Deadline Status</p>
                  <p className={beforeDeadline ? 'text-blue-600' : 'text-gray-600'}>
                    {beforeDeadline ? 'Before 8:00 AM ✓' : 'After 8:00 AM'}
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
              ⏰ Selection deadline has passed. Selections close at 8:00 AM daily.
            </AlertDescription>
          </Alert>
        )}

        {alreadySelected && todaySelection && (
          <Alert className="border-blue-200 bg-blue-50">
            <Check className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div>You selected <strong>{todaySelection.mealName}</strong>.Thank you!</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Today's Meals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                {dayOffset === 0 ? "Today's Meals" : "Tomorrow's Meals"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={dayOffset === 0 ? undefined : 'ghost'}
                  size="sm"
                  onClick={() => setDayOffset(0)}
                >
                  Today
                </Button>
                <Button
                  variant={dayOffset === 1 ? undefined : 'ghost'}
                  size="sm"
                  onClick={() => setDayOffset(1)}
                >
                  Tomorrow
                </Button>
              </div>
            </div>
            {/* <CardDescription>
              {alreadySelected ? 'Click to update your selection (before 8:00 AM)' : `Select your preferred meal for ${selectedDate}`}
            </CardDescription> */}
            <CardDescription>
              {dayOffset === 0
                ? alreadySelected
                  ? 'Click to update your selection (before 8:00 AM)'
                  : `Select your meal for today`
                : 'Select your meal for tomorrow (before 8:00 PM today)'}
            </CardDescription>

          </CardHeader>
          <CardContent>
            {!todayMenu ? (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  No menu available for today. Please contact administration.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {todayMenu.meals.map((meal) => {
                  const isSelected = alreadySelected && todaySelection?.mealId === meal.id;
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
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMealDeselect(e)}
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
                  {/* <ul className="space-y-1 text-sm text-gray-700">
                    <li>🔒 You must be on-site to select</li>
                    <li className="text-amber-600">
                        📌 GPS must be live, accurate, and within 100m of the office.</li>

                    <li>🕒 Selection closes at 8:00 AM</li>
                  </ul> */}
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>🍽️ One meal selection per day</li>
                    <li>🕗 Today’s meal can be selected or changed before 8:00 AM</li>
                    <li>🌙 Tomorrow’s meal must be selected before 8:00 PM today</li>
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