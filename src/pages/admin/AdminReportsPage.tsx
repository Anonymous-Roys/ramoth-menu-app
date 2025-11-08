import { ReportGenerator } from '../../components/ReportGenerator'
import { DailyMenu, MealSelection } from '../../App'

interface AdminReportsPageProps {
  selections: MealSelection[]
  weeklyMenus: DailyMenu[]
}

export function AdminReportsPage({ selections, weeklyMenus }: AdminReportsPageProps) {
  return (
    <div className="space-y-6">
      <h1>📄 Reports</h1>
      <ReportGenerator
        selections={selections}
        weeklyMenus={weeklyMenus}
      />
    </div>
  )
}