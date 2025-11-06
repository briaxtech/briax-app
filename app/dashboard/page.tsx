import { Users, FolderOpen, TrendingUp, AlertCircle, Users2, DollarSign } from "lucide-react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back to Agency OS</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Active Clients" value="24" icon={Users} trend={{ value: 12, isPositive: true }} />
        <KPICard label="Active Projects" value="18" icon={FolderOpen} trend={{ value: 8, isPositive: true }} />
        <KPICard label="Monthly Revenue" value="€45,320" icon={DollarSign} trend={{ value: 23, isPositive: true }} />
        <KPICard label="Open Tickets" value="12" icon={AlertCircle} trend={{ value: 5, isPositive: false }} />
        <KPICard label="Active Partners" value="8" icon={Users2} trend={{ value: 3, isPositive: true }} />
        <KPICard label="Partner Revenue" value="€12,450" icon={TrendingUp} trend={{ value: 18, isPositive: true }} />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-3 gap-6">
        <RevenueChart />
        <RecentActivity />
      </div>
    </div>
  )
}
