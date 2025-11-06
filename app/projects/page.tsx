import { Button } from "@/components/ui/button"
import { ProjectTable } from "@/components/projects/project-table"
import { Plus } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-2">Manage all active and completed projects</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Project Table */}
      <ProjectTable />
    </div>
  )
}
