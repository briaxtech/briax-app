import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { ProjectCalendar } from "@/components/projects/project-calendar"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground mt-2">Planifica entregas, registra cambios y mantiene al equipo alineado.</p>
        </div>
        <Button className="gap-2" variant="outline">
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </Button>
      </div>

      <ProjectCalendar />
    </div>
  )
}
