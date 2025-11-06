import { Button } from "@/components/ui/button"
import { AutomationCard } from "@/components/automations/automation-card"
import { Plus } from "lucide-react"

const mockAutomations = [
  {
    id: "1",
    name: "Customer Email Workflow",
    type: "N8N",
    status: "ACTIVE",
    clientName: "TechCorp Inc",
    description: "Automated email campaigns triggered by customer actions",
    workflowUrl: "https://n8n.example.com/workflow/1",
  },
  {
    id: "2",
    name: "Lead Scoring Bot",
    type: "CUSTOM",
    status: "ACTIVE",
    clientName: "StartupXYZ",
    description: "AI-powered lead qualification and scoring",
  },
  {
    id: "3",
    name: "Slack Notifications",
    type: "ZAPIER",
    status: "DEVELOPMENT",
    clientName: "Enterprise Solutions",
    description: "Real-time Slack alerts for critical events",
  },
  {
    id: "4",
    name: "Voice Support Agent",
    type: "VOICE_AGENT",
    status: "TESTING",
    clientName: "TechCorp Inc",
    description: "AI voice agent for customer support calls",
  },
  {
    id: "5",
    name: "Data Sync Pipeline",
    type: "MAKE",
    status: "ACTIVE",
    clientName: "Enterprise Solutions",
    description: "Daily data synchronization between systems",
  },
  {
    id: "6",
    name: "Email Marketing",
    type: "EMAIL_AGENT",
    status: "PAUSED",
    clientName: "StartupXYZ",
    description: "Automated email marketing and follow-ups",
  },
]

export default function AutomationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automations</h1>
          <p className="text-muted-foreground mt-2">Manage all automations and AI agents</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Automation
        </Button>
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-3 gap-6">
        {mockAutomations.map((automation) => (
          <AutomationCard key={automation.id} {...automation} />
        ))}
      </div>
    </div>
  )
}
