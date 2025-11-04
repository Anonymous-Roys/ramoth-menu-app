import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ArrowLeft, Calendar } from 'lucide-react';
import type { DailyMenu } from '../App';

interface WeeklyMenuViewProps {
  weeklyMenus: DailyMenu[];
  onBack: () => void;
}

export function WeeklyMenuView({ weeklyMenus, onBack }: WeeklyMenuViewProps) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get next 7 days of menus
  const nextWeekMenus = weeklyMenus
    .filter(menu => menu.date >= today)
    .slice(0, 7)
    .sort((a, b) => a.date.localeCompare(b.date));

  const getDayName = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getFormattedDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Today's Menu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Weekly Menu</CardTitle>
              <CardDescription>View meals for the entire week</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {nextWeekMenus.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No weekly menu available yet</p>
              <p className="text-sm mt-2">Please contact administration</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Day</TableHead>
                    <TableHead>Meal Option 1</TableHead>
                    <TableHead>Meal Option 2</TableHead>
                    <TableHead>Meal Option 3</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nextWeekMenus.map((menu) => {
                    const isToday = menu.date === today;
                    return (
                      <TableRow key={menu.date} className={isToday ? 'bg-blue-50' : ''}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{getDayName(menu.date)}</span>
                              {isToday && <Badge className="bg-blue-600">Today</Badge>}
                            </div>
                            <span className="text-sm text-gray-500">{getFormattedDate(menu.date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {menu.meals[0] ? (
                            <div>
                              <p>{menu.meals[0].name}</p>
                              <p className="text-sm text-gray-600">{menu.meals[0].description}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {menu.meals[1] ? (
                            <div>
                              <p>{menu.meals[1].name}</p>
                              <p className="text-sm text-gray-600">{menu.meals[1].description}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {menu.meals[2] ? (
                            <div>
                              <p>{menu.meals[2].name}</p>
                              <p className="text-sm text-gray-600">{menu.meals[2].description}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="mb-2">Important Information</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Menu is subject to change based on availability</li>
            <li>• Make your selection before 9:00 AM daily</li>
            <li>• Contact HR for dietary requirements or allergies</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
