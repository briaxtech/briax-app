"use client"

import { useState } from "react"

import { ProjectCalendar } from "@/components/projects/project-calendar"

import { ProjectCreateDialog } from "./project-create-dialog"

export function ProjectsView() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground mt-2">
            Planifica entregas, registra cambios y mantiene al equipo alineado.
          </p>
        </div>
        <ProjectCreateDialog onCreated={() => setRefreshKey((prev) => prev + 1)} />
      </div>

      <ProjectCalendar refreshToken={refreshKey} />
    </div>
  )
}
