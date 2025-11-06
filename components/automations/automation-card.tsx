import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AutomationCardProps {
  id: string
  name: string
  type: string
  status: string
  clientName: string
  description?: string
  workflowUrl?: string
}

const typeLabels = {
  N8N: "n8n",
  MAKE: "Make",
  ZAPIER: "Zapier",
  CUSTOM: "Custom",
  VOICE_AGENT: "Voice Agent",
  EMAIL_AGENT: "Email Agent",
  API_INTEGRATION: "API",
}

const statusColors = {
  DEVELOPMENT: "bg-blue-500/20 text-blue-400",
  TESTING: "bg-yellow-500/20 text-yellow-400",
  ACTIVE: "bg-green-500/20 text-green-400",
  PAUSED: "bg-orange-500/20 text-orange-400",
  ARCHIVED: "bg-gray-500/20 text-gray-400",
}

export function AutomationCard({ id, name, type, status, clientName, description, workflowUrl }: AutomationCardProps) {
  return (
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <Badge className={statusColors[status as keyof typeof statusColors]}>{status.replace(/_/g, " ")}</Badge>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {clientName} • {typeLabels[type as keyof typeof typeLabels] || type}
      </p>

      {description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>}

      <div className="flex gap-2">
        {workflowUrl && (
          <Button variant="outline" size="sm" className="gap-2 flex-1 bg-transparent">
            <ExternalLink className="w-4 h-4" />
            Workflow
          </Button>
        )}
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          View Details
        </Button>
      </div>
    </Card>
  )
}
