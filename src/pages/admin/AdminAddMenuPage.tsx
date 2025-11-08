import { WeeklyMenuManager } from '../../components/WeeklyMenuManager'
import { DailyMenu } from '../../App'

interface AdminAddMenuPageProps {
  weeklyMenus: DailyMenu[]
  onUpdateMenus: (menus: DailyMenu[]) => void
}

export function AdminAddMenuPage({ weeklyMenus, onUpdateMenus }: AdminAddMenuPageProps) {
  return (
    <div className="space-y-6">
      <h1>🗓️ Add Weekly Menu</h1>
      <WeeklyMenuManager
        weeklyMenus={weeklyMenus}
        onUpdateMenus={onUpdateMenus}
      />
    </div>
  )
}