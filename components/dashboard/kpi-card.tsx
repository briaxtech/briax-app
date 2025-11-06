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
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-3 ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>
              {trend.isPositive ? "+" : "-"}
              {trend.value}% frente al mes anterior
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  )
}
