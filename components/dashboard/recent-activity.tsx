"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const typeColors: Record<string, string> = {
  ticket: "bg-blue-500/20 text-blue-400",
  project: "bg-purple-500/20 text-purple-400",
  invoice: "bg-green-500/20 text-green-400",
  partner: "bg-orange-500/20 text-orange-400",
}

const typeLabels: Record<string, string> = {
  ticket: "Ticket",
  project: "Proyecto",
  invoice: "Factura",
  partner: "Socio",
}

interface RecentActivityItem {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
}

interface RecentActivityProps {
  items: RecentActivityItem[]
  loading?: boolean
}

const formatRelative = (timestamp: string) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return "-"

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return "Hace instantes"
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Hace ${diffHours} h`
  const diffDays = Math.floor(diffHours / 24)
  return `Hace ${diffDays} d`
}

export function RecentActivity({ items, loading }: RecentActivityProps) {
  const activity = items.slice(0, 6)

  return (
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-foreground mb-6">Actividad reciente</h3>
      <div className="space-y-4">
        {loading && activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cargando actividad...</p>
        ) : activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay actividad registrada recientemente.</p>
        ) : (
          activity.map((item) => (
            <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
              <Badge className={typeColors[item.type] ?? "bg-muted text-muted-foreground"}>
                {typeLabels[item.type] ?? item.type}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatRelative(item.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
