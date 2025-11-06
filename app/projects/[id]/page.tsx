import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectStatusTimeline } from "@/components/projects/project-status-timeline"
import { Calendar, User, DollarSign } from "lucide-react"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const timelineSteps = [
    { id: "1", status: "DISCOVERY", label: "Discovery", completed: true },
    { id: "2", status: "IN_PROGRESS", label: "In Progress", completed: true },
    { id: "3", status: "REVIEW", label: "Review", completed: false },
    { id: "4", status: "PRODUCTION", label: "Production", completed: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Website Redesign</h1>
          <p className="text-muted-foreground mt-2">Project ID: {params.id}</p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400">IN PROGRESS</Badge>
      </div>

      {/* Project Info Card */}
      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <div className="grid grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Client</p>
              <p className="text-foreground font-medium">TechCorp Inc</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Due Date</p>
              <p className="text-foreground font-medium">Apr 15, 2024</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Manager</p>
              <p className="text-foreground font-medium">John Manager</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Budget</p>
              <p className="text-foreground font-medium">€15,000</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-6">Project Timeline</h3>
        <ProjectStatusTimeline steps={timelineSteps} />
      </Card>

      {/* Description & Details */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 border-border bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Description</h3>
          <p className="text-muted-foreground leading-relaxed">
            Complete redesign of TechCorp's corporate website with modern design patterns, improved user experience, and
            mobile responsiveness. This includes new landing page, services section, and client portal integration.
          </p>
        </Card>

        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tickets</p>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Invoices</p>
              <p className="text-2xl font-bold text-foreground">3</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Days Left</p>
              <p className="text-2xl font-bold text-foreground">22</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
