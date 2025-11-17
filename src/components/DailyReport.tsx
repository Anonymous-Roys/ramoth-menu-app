import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Download, Users, CheckCircle, XCircle, Search, Calendar } from 'lucide-react'
import jsPDF from 'jspdf'
import logo from '../logo.png'

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
    
    // Add logo
    const img = new Image()
    img.onload = () => {
      // Header background with Ramoth blue
      pdf.setFillColor(37, 99, 235) // Blue-600
      pdf.rect(0, 0, pageWidth, 50, 'F')
      
      // Logo
      pdf.addImage(img, 'PNG', 20, 10, 30, 30)
      
      // Company name and title
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.text('RAMOTH', 60, 25)
      pdf.setFontSize(12)
      pdf.text('Daily Meal Selection Report', 60, 35)
      
      // Date and generation info
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(14)
      pdf.text(`Report Date: ${new Date(selectedDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 20, 70)
      
      pdf.setFontSize(10)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 80)
      
      // Calculate meal breakdown
      const selectedWorkers = workers.filter(w => w.hasSelected)
      // Group workers by department
      const groupedByDepartment = selectedWorkers.reduce((groups, worker) => {
        if (!groups[worker.department]) groups[worker.department] = []
        groups[worker.department].push(worker)
        return groups
      }, {} as Record<string, WorkerReport[]>)

      const mealCounts = selectedWorkers.reduce((acc, worker) => {
        const meal = worker.mealName || 'Unknown'
        acc[meal] = (acc[meal] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Summary box height based on number of meals
      const mealBreakdownLines = Object.keys(mealCounts).length
      const summaryHeight = 40 + (mealBreakdownLines * 10)

      pdf.setFillColor(239, 246, 255)
      pdf.rect(20, 90, pageWidth - 40, summaryHeight, 'F')
      pdf.setDrawColor(37, 99, 235)
      pdf.rect(20, 90, pageWidth - 40, summaryHeight, 'S')

      // Title
      pdf.setFontSize(12)
      pdf.setTextColor(37, 99, 235)
      pdf.text('Meal Breakdown', 25, 105)

      // Meal breakdown list
      let mealYPos = 120
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)

      Object.entries(mealCounts).forEach(([meal, count]) => {
        pdf.text(`• ${meal}: ${count} worker${count !== 1 ? 's' : ''}`, 30, mealYPos)
        mealYPos += 10
      })

      
      // Manual table creation - add more spacing
      let yPos = 90 + summaryHeight + 15
      
      // Table header
      pdf.setFillColor(37, 99, 235) // Blue-600
      pdf.rect(20, yPos, pageWidth - 40, 12, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(11)
      pdf.text('#', 25, yPos + 8)
      pdf.text('Name', 40, yPos + 8)
      pdf.text('Job Title', 85, yPos + 8)
      pdf.text('Meal Selected', 120, yPos + 8)
      pdf.text('Collected', 160, yPos + 8)

      
      yPos += 12
      
      // Table rows
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      
      // Render grouped rows by department
      Object.entries(groupedByDepartment).forEach(([department, workersInDept]) => {
      
      // Department title row
      pdf.setFontSize(12)
      pdf.setTextColor(37, 99, 235) // Blue
      pdf.text(department, 25, yPos + 10)
      yPos += 14

      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)

      workersInDept.forEach((worker, index) => {
        if (yPos > 270) {
          pdf.addPage()
          yPos = 20
        }

        // Row background (alternating)
        if (index % 2 === 1) {
          pdf.setFillColor(248, 250, 252)
          pdf.rect(20, yPos, pageWidth - 40, 10, 'F')
        }

        // Row border
        pdf.setDrawColor(229, 231, 235)
        pdf.rect(20, yPos, pageWidth - 40, 10, 'S')

        // Row content
        pdf.text(worker.name.substring(0, 18), 40, yPos + 7)
        pdf.text(worker.mealName?.substring(0, 15) || '', 120, yPos + 7)

        // Checkbox
        pdf.setDrawColor(0, 0, 0)
        pdf.rect(165, yPos + 2, 6, 6, 'S')

        yPos += 10
      })

      // Add spacing after each department
      yPos += 8
    })

      
      // Footer
      const finalY = yPos + 10
      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128) // Gray-500
      pdf.text('Ramoth Menu Management System', pageWidth / 2, finalY + 10, { align: 'center' })
      
      // Save PDF
      const fileName = `ramoth-meal-report-${selectedDate}.pdf`
      pdf.save(fileName)
      toast.success('Report downloaded successfully!')
    }
    
    img.src = logo
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