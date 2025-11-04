import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Download, Users, CheckCircle, XCircle, Search, Calendar } from 'lucide-react'
import jsPDF from 'jspdf'

interface WorkerReport {
  id: string
  name: string
  department: string
  hasSelected: boolean
  mealName?: string
  selectionTime?: string
}

export function DailyReport() {
  const [workers, setWorkers] = useState<WorkerReport[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchDailyReport()
  }, [selectedDate])

  const fetchDailyReport = async () => {
    setIsLoading(true)
    try {
      // Get all workers
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, name, department, role')
        .eq('role', 'worker')

      if (usersError) throw usersError

      // Get selections for the selected date
      const { data: selections, error: selectionsError } = await supabase
        .from('selections')
        .select('user_id, meal_name, created_at')
        .eq('date', selectedDate)

      if (selectionsError) throw selectionsError

      // Combine data
      const report: WorkerReport[] = allUsers.map(user => {
        const selection = selections?.find(s => s.user_id === user.id)
        return {
          id: user.id,
          name: user.name,
          department: user.department,
          hasSelected: !!selection,
          mealName: selection?.meal_name,
          selectionTime: selection ? new Date(selection.created_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : undefined
        }
      })

      setWorkers(report)
    } catch (error) {
      toast.error('Failed to fetch daily report')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: workers.length,
    selected: workers.filter(w => w.hasSelected).length,
    notSelected: workers.filter(w => !w.hasSelected).length
  }

  const generatePDF = () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.width
    
    // Header
    pdf.setFontSize(20)
    pdf.text('Daily Meal Selection Report', pageWidth / 2, 20, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.text(`Date: ${new Date(selectedDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, pageWidth / 2, 30, { align: 'center' })
    
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' })
    
    // Stats
    pdf.setFontSize(14)
    pdf.text('Summary:', 20, 60)
    pdf.setFontSize(11)
    pdf.text(`Total Workers: ${stats.total}`, 20, 70)
    pdf.text(`Selected Meals: ${stats.selected}`, 20, 80)
    pdf.text(`Not Selected: ${stats.notSelected}`, 20, 90)
    pdf.text(`Selection Rate: ${((stats.selected / stats.total) * 100).toFixed(1)}%`, 20, 100)
    
    // Workers who selected
    let yPos = 120
    pdf.setFontSize(14)
    pdf.text('Workers Who Selected:', 20, yPos)
    yPos += 10
    
    pdf.setFontSize(10)
    const selectedWorkers = workers.filter(w => w.hasSelected)
    selectedWorkers.forEach((worker, index) => {
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }
      pdf.text(`${index + 1}. ${worker.name} (${worker.department}) - ${worker.mealName} at ${worker.selectionTime}`, 20, yPos)
      yPos += 8
    })
    
    // Workers who didn't select
    if (stats.notSelected > 0) {
      yPos += 10
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }
      
      pdf.setFontSize(14)
      pdf.text('Workers Who Did Not Select:', 20, yPos)
      yPos += 10
      
      pdf.setFontSize(10)
      const notSelectedWorkers = workers.filter(w => !w.hasSelected)
      notSelectedWorkers.forEach((worker, index) => {
        if (yPos > 270) {
          pdf.addPage()
          yPos = 20
        }
        pdf.text(`${index + 1}. ${worker.name} (${worker.department})`, 20, yPos)
        yPos += 8
      })
    }
    
    // Save PDF
    const fileName = `meal-report-${selectedDate}.pdf`
    pdf.save(fileName)
    toast.success('Report downloaded successfully!')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Daily Meal Selection Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Search Workers</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <Button onClick={generatePDF} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export PDF Report
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Workers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.selected}</p>
                <p className="text-sm text-gray-600">Selected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.notSelected}</p>
                <p className="text-sm text-gray-600">Not Selected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{((stats.selected / stats.total) * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Selection Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workers List */}
      <Card>
        <CardHeader>
          <CardTitle>Workers Report ({filteredWorkers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading report...</div>
          ) : (
            <div className="space-y-2">
              {filteredWorkers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${worker.hasSelected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-sm text-gray-600">{worker.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {worker.hasSelected ? (
                      <div>
                        <Badge className="bg-green-600 mb-1">{worker.mealName}</Badge>
                        <p className="text-xs text-gray-500">at {worker.selectionTime}</p>
                      </div>
                    ) : (
                      <Badge variant="secondary">No Selection</Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredWorkers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No workers found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}