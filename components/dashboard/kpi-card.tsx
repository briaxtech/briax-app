import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface KPICardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function KPICard({ label, value, icon: Icon, trend }: KPICardProps) {
  return (
    <Card className="p-4 border-border bg-card/50 backdrop-blur-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <p className="text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-3 ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>
              {trend.isPositive ? "+" : "-"}
              {trend.value}% frente al mes anterior
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 sm:h-14 sm:w-14">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  )
}
