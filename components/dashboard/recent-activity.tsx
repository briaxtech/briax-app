import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ActivityItem {
  id: string
  type: "ticket" | "project" | "invoice" | "referral"
  title: string
  description: string
  timestamp: string
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "ticket",
    title: "Ticket #123 Resolved",
    description: "Website redesign issue closed",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "project",
    title: "Project Started",
    description: "E-commerce automation for TechCorp",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "invoice",
    title: "Invoice Paid",
    description: "INV-001 received payment",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    type: "referral",
    title: "New Referral",
    description: "Partner generated new lead",
    timestamp: "2 days ago",
  },
]

const typeColors = {
  ticket: "bg-blue-500/20 text-blue-400",
  project: "bg-purple-500/20 text-purple-400",
  invoice: "bg-green-500/20 text-green-400",
  referral: "bg-orange-500/20 text-orange-400",
}

export function RecentActivity() {
  return (
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
            <Badge className={typeColors[activity.type]}>{activity.type}</Badge>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
