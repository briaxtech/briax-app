import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { ProjectCalendar } from "@/components/projects/project-calendar"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground mt-2">Planifica entregas, registra cambios y mantiene al equipo alineado.</p>
        </div>
        <Button className="gap-2 border border-border bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/80">
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </Button>
      </div>

      <ProjectCalendar />
    </div>
  )
}
