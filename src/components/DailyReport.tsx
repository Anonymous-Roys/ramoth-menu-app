import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { Download, Users, CheckCircle, XCircle, Search, Calendar } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import jsPDF from 'jspdf'
import { DataService, WorkerReport } from '../lib/dataService'
import { useGlobalState } from '../lib/globalState'
import logo from '../logo.png'

export function DailyReport() {
  const { dashboardStats, refreshData } = useGlobalState()
  const [allWorkers, setAllWorkers] = useState<WorkerReport[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectionFilter, setSelectionFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchDailyReport()
  }, [selectedDate])

  const fetchDailyReport = async () => {
    setIsLoading(true)
    try {
      const report = await DataService.fetchDailyReport(selectedDate)
      setAllWorkers(report)
      await refreshData(selectedDate)
    } catch (error) {
      toast.error('Failed to fetch daily report')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredWorkers = allWorkers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.department.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSelection = selectionFilter === 'all' ||
      (selectionFilter === 'selected' && worker.hasSelected) ||
      (selectionFilter === 'not-selected' && !worker.hasSelected)
    
    const matchesDepartment = departmentFilter.length === 0 ||
      departmentFilter.includes(worker.department)
    
    return matchesSearch && matchesSelection && matchesDepartment
  })
  
  const uniqueDepartments = [...new Set(allWorkers.map(w => w.department))].sort()

  const stats = {
    total: dashboardStats.totalWorkers,
    selected: dashboardStats.todaySelections,
    notSelected: dashboardStats.totalWorkers - dashboardStats.todaySelections
  }

  const generatePDF = () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.width
    
    // Add logo
    const img = new Image()
    img.onload = () => {
      // Header background with Ramoth blue
      pdf.setFillColor(37, 99, 235) // Blue-600
      pdf.rect(0, 0, pageWidth, 30, 'F')
      
      // Logo
      pdf.addImage(img, 'PNG', 10, 5, 15, 15)
      
      // Company name and title
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.text('RAMOTH', 30, 10)
      pdf.setFontSize(8)
      pdf.text('Daily Meal Selection Report', 30, 18)
      
      // Date and generation info
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(8)
      pdf.text(`Report Date: ${new Date(selectedDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 15, 35)
      
      pdf.setFontSize(8)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 120, 35)
      
      // Calculate meal breakdown
      const selectedWorkers = allWorkers.filter(w => w.hasSelected)
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
      const summaryHeight = 18 + (mealBreakdownLines)

      pdf.setFillColor(239, 246, 255)
      pdf.rect(15, 40, pageWidth - 40, summaryHeight, 'F')
      pdf.setDrawColor(37, 99, 235)
      pdf.rect(15, 40, pageWidth - 40, summaryHeight, 'S')

      // Title
      pdf.setFontSize(12)
      pdf.setTextColor(37, 99, 235)
      pdf.text('Meal Breakdown', 25, 45)

      // Meal breakdown list
      let mealYPos = 50
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)

      Object.entries(mealCounts).forEach(([meal, count]) => {
        pdf.text(`• ${meal}: ${count} worker${count !== 1 ? 's' : ''}`, 25, mealYPos)
        mealYPos += 6
      })

      
      // Manual table creation - add more spacing
      let yPos = 25 + summaryHeight + 15
      
      // Table header
      /* pdf.setFillColor(37, 99, 235) // Blue-600
      pdf.rect(20, yPos, pageWidth - 40, 12, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(11)
      pdf.text('#', 25, yPos + 8)
      pdf.text('Name', 40, yPos + 8)
      pdf.text('Job Title', 85, yPos + 8)
      pdf.text('Meal Selected', 120, yPos + 8)
      pdf.text('Collected', 160, yPos + 8)
      
      yPos += 12 */
      
      // Table rows
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      
      // Render grouped rows by department
      Object.entries(groupedByDepartment).forEach(([department, workersInDept]) => {
      
      // Department title row
      pdf.setFontSize(10)
      pdf.setTextColor(37, 99, 235) // Blue
      pdf.text(department, 25, yPos + 10)
      yPos += 15

      pdf.setFontSize(8)
      pdf.setTextColor(0, 0, 0)

// Render workers in rows of 2
for (let i = 0; i < workersInDept.length; i += 2) {
  if (yPos > 270) {
    pdf.addPage()
    yPos = 10
  }

  const w1 = workersInDept[i]
  const w2 = workersInDept[i + 1]
  //const w3 = workersInDept[i + 2]

  // Column positions
  const col1X = 25
  const col2X = 110
  //const col3X = 135

  // Row background
  pdf.setFillColor(250, 250, 250)
  pdf.rect(20, yPos, pageWidth - 40, 6, 'F')

  // Draw vertical lines for column separation
  pdf.setDrawColor(200) // light gray
  pdf.line(col2X - 5, yPos, col2X - 5, yPos + 6)
  //pdf.line(col3X - 5, yPos, col3X - 5, yPos + 6)
  

  // Worker 1
  if (w1) {
    pdf.text(w1.name.substring(0, 18), col1X, yPos + 2)
    pdf.text(w1.mealName?.substring(0, 15) || '', col1X + 35, yPos + 2)
    //pdf.rect(20, yPos, pageWidth - 40, 12, 'S')
  }

  // Worker 2
  if (w2) {
    pdf.text(w2.name.substring(0, 18), col2X, yPos + 2)
    pdf.text(w2.mealName?.substring(0, 15) || '', col2X + 35, yPos + 2)
  }

  /* // Worker 3
  if (w3) {
    pdf.text(w3.name.substring(0, 18), col3X, yPos + 2)
    pdf.text(w3.mealName?.substring(0, 15) || '', col3X + 35, yPos + 2)
  } */

  yPos += 5
}

      // Add spacing after each department
      //yPos += 1
    })

      
      /* // Footer
      const finalY = yPos + 10
      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128) // Gray-500
      pdf.text('Ramoth Menu Management System', pageWidth / 2, finalY + 10, { align: 'center' }) */
      
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
          {/* <CardTitle className="flex items-center gap-2">
            📊 Daily Meal Selection Report
          </CardTitle> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
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
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2">
                {['all', 'selected', 'not-selected'].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectionFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectionFilter(filter)}
                    className={`text-xs ${selectionFilter === filter ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  >
                    {filter === 'all' ? 'All' : filter === 'selected' ? 'Selected' : 'Not Selected'}
                  </Button>
                ))}
              </div>
              
              <div className="flex-1">
                <Select
                  value={departmentFilter.length === 0 ? 'all' : departmentFilter.join(',')}
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setDepartmentFilter([])
                    } else {
                      const dept = value
                      setDepartmentFilter(prev => 
                        prev.includes(dept) 
                          ? prev.filter(d => d !== dept)
                          : [...prev, dept]
                      )
                    }
                  }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWorkers.map((worker) => (
                <div key={worker.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${worker.hasSelected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="font-medium text-sm">{worker.name}</p>
                  </div>
                  <p className="text-xs text-gray-600 mb-2" title={worker.department}>{worker.department}</p>
                  {worker.hasSelected ? (
                    <div>
                      <Badge className="bg-green-600 text-xs">{worker.mealName}</Badge>
                      <p className="text-xs text-gray-500 mt-1">at {worker.selectionTime}</p>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="text-xs">No Selection</Badge>
                  )}
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