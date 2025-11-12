import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Download, FileText, Calendar } from 'lucide-react';
import type { DailyMenu, MealSelection } from '../App';

interface ReportGeneratorProps {
  selections: MealSelection[];
  weeklyMenus: DailyMenu[];
}

export function ReportGenerator({ selections, weeklyMenus }: ReportGeneratorProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const getSelectionsForDate = (date: string) => {
    return selections.filter(s => s.date === date);
  };

  const getMenuForDate = (date: string) => {
    return weeklyMenus.find(m => m.date === date);
  };

  const generateReport = () => {
    const dateSelections = getSelectionsForDate(selectedDate);
    const menu = getMenuForDate(selectedDate);

    if (!menu) {
      toast.error('No menu found for selected date');
      return '';
    }

    // Group selections by meal
    const mealGroups: { [key: string]: MealSelection[] } = {};
    menu.meals.forEach(meal => {
      mealGroups[meal.name] = dateSelections.filter(s => s.mealName === meal.name);
    });

    // Generate report content
    let report = `DAILY MEAL SELECTION REPORT\n`;
    report += `Company Name: [Company Name Here]\n`;
    report += `Date: ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    report += `Generated At: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n`;
    report += `\n${'='.repeat(80)}\n\n`;

    report += `MENU FOR THE DAY\n`;
    report += `${'-'.repeat(80)}\n`;
    menu.meals.forEach((meal, index) => {
      report += `${index + 1}. ${meal.name}\n`;
      report += `   ${meal.description}\n\n`;
    });

    report += `\n${'='.repeat(80)}\n\n`;

    report += `MEAL SELECTION SUMMARY\n`;
    report += `${'-'.repeat(80)}\n`;
    let totalWorkers = 0;
    menu.meals.forEach(meal => {
      const count = mealGroups[meal.name]?.length || 0;
      totalWorkers += count;
      report += `${meal.name.padEnd(30)} : ${count} workers\n`;
    });
    report += `${'-'.repeat(80)}\n`;
    report += `TOTAL WORKERS: ${totalWorkers}\n`;

    report += `\n${'='.repeat(80)}\n\n`;

    report += `DETAILED BREAKDOWN BY MEAL\n`;
    report += `${'-'.repeat(80)}\n\n`;

    menu.meals.forEach(meal => {
      const mealSelections = mealGroups[meal.name] || [];
      report += `${meal.name.toUpperCase()} (${mealSelections.length} Workers)\n`;
      report += `${'-'.repeat(80)}\n`;
      
      if (mealSelections.length === 0) {
        report += `No selections for this meal\n\n`;
      } else {
        report += `No.  Name${' '.repeat(30)}Job Title${' '.repeat(15)}Time Selected\n`;
        report += `${'-'.repeat(80)}\n`;
        mealSelections.forEach((selection, index) => {
          const no = `${index + 1}.`.padEnd(5);
          const name = selection.userName.padEnd(35);
          const dept = selection.department.padEnd(25);
          report += `${no}${name}${dept}${selection.time}\n`;
        });
        report += `\n`;
      }
    });

    report += `${'='.repeat(80)}\n\n`;

    report += `SUMMARY NOTES\n`;
    report += `${'-'.repeat(80)}\n`;
    report += `Total workers: ${totalWorkers}\n`;
    report += `Deadline: 9:00 AM\n`;
    report += `Late submissions: 0\n`;
    
    if (totalWorkers > 0) {
      const mostSelected = menu.meals.reduce((max, meal) => {
        const count = mealGroups[meal.name]?.length || 0;
        const maxCount = mealGroups[max.name]?.length || 0;
        return count > maxCount ? meal : max;
      });
      report += `Most selected meal: ${mostSelected.name}\n`;
    }

    return report;
  };

  const handleDownloadReport = () => {
    const report = generateReport();
    if (!report) return;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-report-${selectedDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Report downloaded successfully');
  };

  const handlePrintReport = () => {
    const report = generateReport();
    if (!report) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Meal Selection Report</title>');
      printWindow.document.write('<style>body { font-family: monospace; white-space: pre; padding: 20px; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(report);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
      toast.success('Report ready for printing');
    }
  };

  const dateSelections = getSelectionsForDate(selectedDate);
  const menu = getMenuForDate(selectedDate);

  // Group selections by meal for display
  const mealGroups: { [key: string]: MealSelection[] } = {};
  if (menu) {
    menu.meals.forEach(meal => {
      mealGroups[meal.name] = dateSelections.filter(s => s.mealName === meal.name);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Daily Report</CardTitle>
          <CardDescription>
            Select a date to generate and download the meal selection report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-date">Select Date</Label>
            <Input
              id="report-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleDownloadReport}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={!menu || dateSelections.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report (.txt)
            </Button>
            <Button 
              onClick={handlePrintReport}
              variant="outline"
              className="flex-1"
              disabled={!menu || dateSelections.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>

          {!menu && (
            <div className="text-center py-4 text-gray-500">
              No menu configured for selected date
            </div>
          )}

          {menu && dateSelections.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No selections recorded for this date
            </div>
          )}
        </CardContent>
      </Card>

      {menu && dateSelections.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Total Workers</p>
                      <p className="text-3xl mt-1">{dateSelections.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Meal Options</p>
                      <p className="text-3xl mt-1">{menu.meals.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Generated At</p>
                      <p className="text-xl mt-1">
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Meal Breakdown */}
                <div>
                  <h3 className="mb-4">Meal Selection Summary</h3>
                  <div className="space-y-4">
                    {menu.meals.map(meal => {
                      const selections = mealGroups[meal.name] || [];
                      return (
                        <Card key={meal.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{meal.name}</CardTitle>
                              <Badge className="bg-orange-500">{selections.length} workers</Badge>
                            </div>
                            <CardDescription>{meal.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {selections.length === 0 ? (
                              <p className="text-gray-500 text-sm">No selections for this meal</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Time</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selections.map((selection, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell>{selection.userName}</TableCell>
                                      <TableCell>{selection.department}</TableCell>
                                      <TableCell>{selection.time}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
