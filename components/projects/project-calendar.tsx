"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getProjectStatusLabel } from "@/lib/projects/constants"

import { ProjectDetailDrawer } from "./project-detail-drawer"

const statusColors: Record<string, string> = {
  DISCOVERY: "border-blue-500/40 bg-blue-500/10 text-blue-500",
  IN_PROGRESS: "border-purple-500/40 bg-purple-500/10 text-purple-500",
  REVIEW: "border-yellow-500/40 bg-yellow-500/10 text-yellow-500",
  PRODUCTION: "border-green-500/40 bg-green-500/10 text-green-500",
  PAUSED: "border-orange-500/40 bg-orange-500/10 text-orange-500",
  CLOSED: "border-gray-500/40 bg-gray-500/10 text-gray-500",
}

type ProjectCalendarEntry = {
  id: string
  name: string
  clientName: string
  clientEmail: string | null
  type: string
  rawType: string
  status: string
  statusLabel: string
  startDate: string | null
  dueDate: string | null
  managerName: string
  managerEmail: string | null
  createdAt: string
}

export function ProjectCalendar() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [projects, setProjects] = useState<ProjectCalendarEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectCalendarEntry | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { toast } = useToast()

  const fetchProjects = useCallback(
    async (month: Date) => {
      try {
        setLoading(true)
        const from = startOfMonth(month).toISOString()
        const to = endOfMonth(month).toISOString()
        const response = await fetch(`/api/projects?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body?.message ?? "No se pudo obtener los proyectos")
        }
        const body = await response.json()
        setProjects(body.projects ?? [])
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error inesperado al cargar proyectos"
        setError(message)
        toast({ title: "Error", description: message })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    fetchProjects(currentMonth)
  }, [currentMonth, fetchProjects])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const projectsByDate = useMemo(() => {
    const map = new Map<string, ProjectCalendarEntry[]>()
    projects.forEach((project) => {
      if (!project.dueDate) return
      const dateKey = format(new Date(project.dueDate), "yyyy-MM-dd")
      const list = map.get(dateKey) ?? []
      list.push(project)
      map.set(dateKey, list)
    })
    return map
  }, [projects])

  const handleSelectProject = (project: ProjectCalendarEntry) => {
    setSelectedProjectId(project.id)
    setSelectedProject(project)
    setDrawerOpen(true)
  }

  useEffect(() => {
    if (!selectedProjectId) return
    const current = projects.find((item) => item.id === selectedProjectId)
    if (current) {
      setSelectedProject(current)
    } else {
      setSelectedProject(null)
      setSelectedProjectId(null)
      setDrawerOpen(false)
    }
  }, [projects, selectedProjectId])

  const handleUpdated = (projectId: string, updates: Partial<ProjectCalendarEntry>) => {
    const normalizedUpdates: Partial<ProjectCalendarEntry> = { ...updates }
    if (updates.status) {
      normalizedUpdates.statusLabel = getProjectStatusLabel(updates.status)
    }
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? { ...project, ...normalizedUpdates } : project)),
    )
    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => (prev ? { ...prev, ...normalizedUpdates } : prev))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Calendario de proyectos</h2>
            <p className="text-sm text-muted-foreground">
              Visualiza entregas, estados y registra actualizaciones.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            Mes anterior
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Mes siguiente
          </Button>
          <Button variant="outline" onClick={() => fetchProjects(currentMonth)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{format(currentMonth, "MMMM yyyy", { locale: es })}</h3>
      </div>

      {error && (
        <Card className="p-4 border-destructive/40 bg-destructive/10 text-sm text-destructive">
          {error}
        </Card>
      )}

      <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
        {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((day) => (
          <div key={day} className="px-2 py-1 text-center font-semibold uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const dateKey = format(day, "yyyy-MM-dd")
          const entries = projectsByDate.get(dateKey) ?? []
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false

          return (
            <div
              key={dateKey}
              className={cn(
                "rounded-lg border border-border bg-card/40 p-2 transition-colors",
                !isCurrentMonth && "opacity-40",
                isSelected && "border-primary shadow-sm",
              )}
              onClick={() => setSelectedDate(day)}
              role="button"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{format(day, "d")}</span>
                {entries.length > 0 && (
                  <span className="text-[10px] font-medium text-primary">{entries.length} proyectos</span>
                )}
              </div>
              <div className="space-y-2">
                {entries.slice(0, 3).map((project) => (
                  <button
                    key={project.id}
                    className={cn(
                      "w-full rounded-md border px-2 py-1 text-left text-xs",
                      statusColors[project.status] ?? "border-muted text-muted-foreground",
                    )}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleSelectProject(project)
                    }}
                  >
                    <p className="font-semibold leading-tight">{project.name}</p>
                    <p className="text-[10px] leading-tight">{project.statusLabel}</p>
                  </button>
                ))}
                {entries.length > 3 && (
                  <p className="text-[10px] text-muted-foreground">+{entries.length - 3} mas</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ProjectDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        project={selectedProject}
        onProjectUpdated={handleUpdated}
      />
    </div>
  )
}
