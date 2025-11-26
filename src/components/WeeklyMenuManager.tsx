import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';
import { Plus, Save, Calendar as CalendarIcon, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DailyMenu, MealOption } from '../App';

interface WeeklyMenuManagerProps {
  weeklyMenus: DailyMenu[];
  onUpdateMenus: (menus: DailyMenu[]) => void;
}

interface WeeklyMenuInput {
  [date: string]: MealOption[];
}

export function WeeklyMenuManager({ weeklyMenus, onUpdateMenus }: WeeklyMenuManagerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [weeklyInput, setWeeklyInput] = useState<WeeklyMenuInput>(() => {
    const today = new Date();
    const initialData: WeeklyMenuInput = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existingMenu = weeklyMenus.find(m => m.date === dateStr);
      initialData[dateStr] = existingMenu?.meals || [
        { id: '1', name: '', description: '' },
        { id: '2', name: '', description: '' },
        { id: '3', name: '', description: '' }
      ];
    }
    
    return initialData;
  });

  const getDayName = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getFormattedDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleMealChange = (date: string, mealIndex: number, field: 'name' | 'description', value: string) => {
    setWeeklyInput(prev => ({
      ...prev,
      [date]: prev[date].map((meal, idx) => 
        idx === mealIndex ? { ...meal, [field]: value } : meal
      )
    }));
  };

  const handleAddMealOption = (date: string) => {
    setWeeklyInput(prev => ({
      ...prev,
      [date]: [...prev[date], { id: Date.now().toString(), name: '', description: '' }]
    }));
  };

  const handleSaveMenu = async () => {
    setIsSaving(true);
    const newMenus: DailyMenu[] = [];
    let hasError = false;

    Object.entries(weeklyInput).forEach(([date, meals]) => {
      const validMeals = meals.filter(m => m.name.trim() !== '');
      
      if (validMeals.length > 0 && validMeals.length < 2) {
        hasError = true;
        toast.error(`${getDayName(date)} ${getFormattedDate(date)}: At least 2 meal options required`);
      }
      
      if (validMeals.length >= 2) {
        newMenus.push({
          date,
          meals: validMeals.map((m, idx) => ({
            id: `${date}-${idx}`,
            name: m.name,
            description: m.description
          }))
        });
      }
    });

    if (hasError) {
      setIsSaving(false);
      return;
    }

    try {
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Delete existing menus for these dates
      const dates = newMenus.map(m => m.date);
      await supabase
        .from('menus')
        .delete()
        .in('date', dates);

      // Insert new menus
      const menuInserts = newMenus.map(menu => ({
        date: menu.date,
        meals: menu.meals,
        created_by: currentUser.id
      }));

      const { error } = await supabase
        .from('menus')
        .insert(menuInserts);

      if (error) throw error;

      onUpdateMenus([...weeklyMenus.filter(m => !dates.includes(m.date)), ...newMenus]);
      toast.success('Weekly menu saved successfully');
    } catch (error) {
      toast.error('Failed to save menu');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplate = () => {
    const template: MealOption[] = [
      { id: '1', name: 'Jollof Rice', description: 'Served with chicken and salad' },
      { id: '2', name: 'Fried Rice', description: 'Served with beef and vegetables' },
      { id: '3', name: 'Banku & Okro', description: 'Served with fish' }
    ];

    setWeeklyInput(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        updated[date] = template.map(m => ({ ...m }));
      });
      return updated;
    });

    toast.success('Template loaded for all days');
  };

  const handleDeleteMenu = async (date: string) => {
    if (!confirm(`Delete menu for ${getDayName(date)} ${getFormattedDate(date)}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('date', date);

      if (error) throw error;

      setWeeklyInput(prev => ({
        ...prev,
        [date]: [
          { id: '1', name: '', description: '' },
          { id: '2', name: '', description: '' },
          { id: '3', name: '', description: '' }
        ]
      }));

      onUpdateMenus(weeklyMenus.filter(m => m.date !== date));
      toast.success('Menu deleted successfully');
    } catch (error) {
      toast.error('Failed to delete menu');
      console.error(error);
    }
  };

  const handleRemoveMeal = (date: string, mealIndex: number) => {
    setWeeklyInput(prev => ({
      ...prev,
      [date]: prev[date].filter((_, idx) => idx !== mealIndex)
    }));
  };

  const dates = Object.keys(weeklyInput).sort();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <div className='font-black text-xl py-4 my-4 text-center align-middle w-full'>
              <strong>🗓️ Add Weekly Menu</strong>
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex md:gap-4">
              <Button onClick={handleLoadTemplate} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Load Template
              </Button>
              <Button 
                onClick={handleSaveMenu} 
                className="bg-blue-600 hover:bg-blue-700" 
                size="sm"
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Menu'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Day</TableHead>
                  <TableHead>Meals</TableHead>
                  <TableHead className="w-20">+Add</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dates.map((date) => {
                  const meals = weeklyInput[date];
                  return (
                    <TableRow key={date}>
                      <TableCell>
                        <div>
                          <p>{getDayName(date)}</p>
                          <p className="text-sm text-gray-500">{getFormattedDate(date)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {meals.map((meal, idx) => (
                            <div key={idx} className="space-y-2 p-3 border rounded-lg relative">
                              <Input
                                placeholder="Meal name"
                                value={meal.name}
                                onChange={(e) => handleMealChange(date, idx, 'name', e.target.value)}
                                className="text-sm"
                              />
                              <Input
                                placeholder="Description"
                                value={meal.description}
                                onChange={(e) => handleMealChange(date, idx, 'description', e.target.value)}
                                className="text-sm"
                              />
                              {meals.length > 2 && (
                                <Button
                                  onClick={() => handleRemoveMeal(date, idx)}
                                  variant="ghost"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleAddMealOption(date)}
                            variant="ghost"
                            size="sm"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteMenu(date)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div> */}

          <div className="w-full">
  {/* Desktop Table */}
  <div className="hidden md:block overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-32">Day</TableHead>
          <TableHead>Meals</TableHead>
          <TableHead className="w-20">+Add</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {dates.map((date) => {
          const meals = weeklyInput[date];

          return (
            <TableRow key={date}>
              <TableCell>
                <div>
                  <p>{getDayName(date)}</p>
                  <p className="text-sm text-gray-500">{getFormattedDate(date)}</p>
                </div>
              </TableCell>

              <TableCell>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meals.map((meal, idx) => (
                    <div
                      key={idx}
                      className="space-y-2 p-3 border rounded-lg relative bg-white"
                    >
                      <Input
                        placeholder="Meal name"
                        value={meal.name}
                        onChange={(e) =>
                          handleMealChange(date, idx, "name", e.target.value)
                        }
                        className="text-sm"
                      />

                      <Input
                        placeholder="Description"
                        value={meal.description}
                        onChange={(e) =>
                          handleMealChange(
                            date,
                            idx,
                            "description",
                            e.target.value
                          )
                        }
                        className="text-sm"
                      />

                      {meals.length > 2 && (
                        <Button
                          onClick={() => handleRemoveMeal(date, idx)}
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex gap-1">
                  <Button
                    onClick={() => handleAddMealOption(date)}
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => handleDeleteMenu(date)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>

  {/* Mobile Cards */}
  <div className="md:hidden space-y-4">
    {dates.map((date) => {
      const meals = weeklyInput[date];

      return (
        <div
          key={date}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          {/* Day Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium">{getDayName(date)}</p>
              <p className="text-sm text-gray-500">
                {getFormattedDate(date)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleAddMealOption(date)}
                variant="ghost"
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => handleDeleteMenu(date)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Meal Inputs */}
          <div className="space-y-4">
            {meals.map((meal, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border bg-gray-50 relative"
              >
                <Input
                  placeholder="Meal name"
                  value={meal.name}
                  onChange={(e) =>
                    handleMealChange(date, idx, "name", e.target.value)
                  }
                  className="text-sm"
                />

                <Input
                  placeholder="Description"
                  value={meal.description}
                  onChange={(e) =>
                    handleMealChange(date, idx, "description", e.target.value)
                  }
                  className="text-sm mt-2"
                />

                {meals.length > 2 && (
                  <Button
                    onClick={() => handleRemoveMeal(date, idx)}
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
</div>


          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="mb-2">💡 Tips</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Each day should have at least 2 meal options</li>
              <li>• Use the "Load Template" button to quickly populate all days with default meals</li>
              <li>• Leave fields empty if no meal is available for that day</li>
              <li>• Changes are saved when you click "Save Menu"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Editing Period</p>
                <p>Next 7 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Save className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Menus</p>
                <p>{weeklyMenus.length} Configured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Meal Options</p>
                <p>2-3 per day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
