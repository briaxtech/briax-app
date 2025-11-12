"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ClipboardList } from "lucide-react"

import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { PROJECT_STATUS_OPTIONS, PROJECT_TYPE_LABELS, getProjectStatusLabel } from "@/lib/projects/constants"
import type { ProjectCalendarEntry } from "@/lib/projects/types"
import { useProjectFormOptions } from "@/hooks/use-project-form-options"
import { projectFormSchema, type ProjectFormValues } from "@/lib/validation/project-form"

import { ProjectFormFields } from "./project-form-fields"

const statusColors: Record<string, string> = {
  DISCOVERY: "bg-blue-500/20 text-blue-500",
  IN_PROGRESS: "bg-purple-500/20 text-purple-500",
  REVIEW: "bg-yellow-500/20 text-yellow-500",
  PRODUCTION: "bg-green-500/20 text-green-500",
  PAUSED: "bg-orange-500/20 text-orange-500",
  CLOSED: "bg-gray-500/20 text-gray-500",
}

const statusOrder = PROJECT_STATUS_OPTIONS.map((option) => option.value)

function buildTimeline(currentStatus: string) {
  const currentIndex = Math.max(statusOrder.indexOf(currentStatus), 0)
  const isPaused = currentStatus === "PAUSED"

  return statusOrder.map((status, index) => ({
    status,
    label: getProjectStatusLabel(status),
    completed: !isPaused && index <= currentIndex,
    current: index === currentIndex,
  }))
}

type ProjectDetailResponse = {
  project: {
    id: string
    name: string
    type: string
    description: string | null
    status: string
    statusLabel: string
    startDate: string | null
    dueDate: string | null
    client: { id: string; name: string } | null
    manager: { id: string; name: string } | null
    timeline: Array<{ status: string; label: string; completed: boolean; current: boolean }>
  }
  tickets: Array<{ id: string; title: string; status: string; createdAt: string }>
  invoices: Array<{ id: string; amount: number; currency: string; status: string; issueDate: string }>
  updates: Array<{
    id: string
    type: string
    title: string | null
    message: string
    authorName: string | null
    authorEmail: string | null
    notifyTeam: boolean
    createdAt: string
  }>
}

const projectTypeKeys = Object.keys(PROJECT_TYPE_LABELS)
const defaultProjectType = (projectTypeKeys[0] ?? "website") as ProjectFormValues["type"]

function mapDetailToFormValues(project: ProjectDetailResponse["project"] | null | undefined): ProjectFormValues {
  return {
    name: project?.name ?? "",
    type: (project?.type ?? defaultProjectType) as ProjectFormValues["type"],
    clientId: project?.client?.id ?? "",
    managerId: project?.manager?.id ?? null,
    description: project?.description ?? "",
    startDate: project?.startDate ? new Date(project.startDate) : null,
    dueDate: project?.dueDate ? new Date(project.dueDate) : null,
  }
}

type ProjectDetailDrawerProps = {
  project: ProjectCalendarEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdated: (projectId: string, updates: Partial<ProjectCalendarEntry>) => void
}

export function ProjectDetailDrawer({ project, open, onOpenChange, onProjectUpdated }: ProjectDetailDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [savingDetails, setSavingDetails] = useState(false)
  const [detail, setDetail] = useState<ProjectDetailResponse | null>(null)
  const [statusForm, setStatusForm] = useState({
    status: project?.status ?? "DISCOVERY",
    note: "",
    notifyTeam: true,
  })
  const [noteForm, setNoteForm] = useState({
    title: "",
    message: "",
    notifyTeam: false,
  })
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: mapDetailToFormValues(null),
  })
  const {
    clients: fetchedClients,
    managers: fetchedManagers,
    loading: formOptionsLoading,
    reload: reloadFormOptions,
  } = useProjectFormOptions(open)
  const { toast } = useToast()

  useEffect(() => {
    if (!project) {
      setStatusForm({ status: "DISCOVERY", note: "", notifyTeam: true })
      setNoteForm({ title: "", message: "", notifyTeam: false })
      return
    }

    setStatusForm({ status: project.status, note: "", notifyTeam: true })
    setNoteForm({ title: "", message: "", notifyTeam: false })
  }, [project?.id])

  useEffect(() => {
    if (!project || !open) {
      setDetail(null)
      return
    }

    const controller = new AbortController()
    const load = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${project.id}`, { signal: controller.signal })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body?.message ?? "No se pudo obtener el proyecto")
        }
        const body = (await response.json()) as ProjectDetailResponse
        setDetail(body)
        setStatusForm((prev) => ({ ...prev, status: body.project.status }))
      } catch (err) {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : "Error inesperado"
        toast({ title: "Error", description: message })
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => controller.abort()
  }, [project, open, toast])

  useEffect(() => {
    if (!detail?.project) {
      projectForm.reset(mapDetailToFormValues(null))
      return
    }
    projectForm.reset(mapDetailToFormValues(detail.project))
  }, [detail?.project, projectForm])

  const timeline = useMemo(() => {
    if (detail?.project.timeline) {
      return detail.project.timeline
    }
    return buildTimeline(statusForm.status)
  }, [detail, statusForm.status])

  const updates = useMemo(() => detail?.updates ?? [], [detail])

  const clientOptions = useMemo(() => {
    const currentClient = detail?.project?.client
    if (!currentClient) {
      return fetchedClients
    }
    const exists = fetchedClients.some((client) => client.id === currentClient.id)
    if (exists) {
      return fetchedClients
    }
    return [
      {
        id: currentClient.id,
        label: currentClient.name,
      },
      ...fetchedClients,
    ]
  }, [fetchedClients, detail?.project?.client])

  const managerOptions = useMemo(() => {
    const currentManager = detail?.project?.manager
    if (!currentManager) {
      return fetchedManagers
    }
    const exists = fetchedManagers.some((manager) => manager.id === currentManager.id)
    if (exists) {
      return fetchedManagers
    }
    return [
      {
        id: currentManager.id,
        label: currentManager.name,
      },
      ...fetchedManagers,
    ]
  }, [fetchedManagers, detail?.project?.manager])

  const formatDate = (iso: string | null) => {
    if (!iso) return "-"
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSaveDetails = async (values: ProjectFormValues) => {
    if (!project) return
    if (!values.dueDate) {
      projectForm.setError("dueDate", { message: "Define una fecha de entrega" })
      return
    }
    try {
      setSavingDetails(true)
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo actualizar el proyecto")
      }
      const payload = await response.json()
      if (payload?.project) {
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                project: {
                  ...prev.project,
                  ...payload.project,
                },
              }
            : prev,
        )
        projectForm.reset(mapDetailToFormValues(payload.project))
      }
      const updatedCalendar = payload?.calendarEntry as ProjectCalendarEntry | undefined
      if (updatedCalendar) {
        onProjectUpdated(project.id, updatedCalendar)
      }
      toast({ title: "Proyecto actualizado", description: "Guardamos los datos principales." })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado"
      toast({ title: "Error", description: message })
    } finally {
      setSavingDetails(false)
    }
  }

  const handleSaveStatus = async () => {
    if (!project) return
    try {
      setSavingStatus(true)
      const response = await fetch(`/api/projects/${project.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusForm.status,
          note: statusForm.note || undefined,
          notifyTeam: statusForm.notifyTeam,
        }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo actualizar el estado")
      }
      const payload = await response.json()
      const updatedStatus = payload?.project?.status ?? statusForm.status
      const updatedStatusLabel = payload?.project?.statusLabel ?? getProjectStatusLabel(updatedStatus)

      toast({ title: "Estado actualizado" })
      setStatusForm((prev) => ({ ...prev, status: updatedStatus, note: "" }))
      onProjectUpdated(project.id, { status: updatedStatus, statusLabel: updatedStatusLabel })
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              project: {
                ...prev.project,
                status: updatedStatus,
                statusLabel: updatedStatusLabel,
                timeline: payload?.project?.timeline ?? buildTimeline(updatedStatus),
              },
              updates: payload?.update ? [payload.update, ...prev.updates] : prev.updates,
            }
          : prev,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado"
      toast({ title: "Error", description: message })
    } finally {
      setSavingStatus(false)
    }
  }

  const handleSaveNote = async () => {
    if (!project) return
    if (noteForm.message.trim().length === 0) {
      toast({ title: "Agrega un mensaje", description: "La nota no puede estar vacia." })
      return
    }
    try {
      setSavingNote(true)
      const response = await fetch(`/api/projects/${project.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: noteForm.title ? "MILESTONE" : "NOTE",
          title: noteForm.title || undefined,
          message: noteForm.message,
          notifyTeam: noteForm.notifyTeam,
        }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo registrar la nota")
      }
      const body = await response.json()
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              updates: body.update ? [body.update, ...prev.updates] : prev.updates,
            }
          : prev,
      )
      setNoteForm({ title: "", message: "", notifyTeam: false })
      toast({ title: "Nota registrada" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado"
      toast({ title: "Error", description: message })
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto my-2 w-full max-w-[min(100%,36rem)] sm:my-4 sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {project?.name ?? "Selecciona un proyecto"}
          </DialogTitle>
          <DialogDescription>
            Gestiona el estado, registra notas y mantiene al equipo informado.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <div className="max-h-[calc(90vh-5rem)] sm:max-h-[calc(90vh-6rem)] overflow-y-auto px-1 pb-4 sm:px-0 sm:pb-0">
            {!project ? (
              <p className="text-sm text-muted-foreground">Elige un proyecto en el calendario para ver los detalles.</p>
            ) : loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : detail ? (
              <div className="space-y-6 pb-6">
                <section className="rounded-lg border border-border bg-card/40 p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard label="Cliente" value={project.clientName} />
                    <InfoCard label="Responsable" value={project.managerName} />
                    <InfoCard label="Fecha inicio" value={formatDate(project.startDate)} />
                    <InfoCard label="Fecha limite" value={formatDate(project.dueDate)} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Estado actual</p>
                    <Badge className={cn("mt-2 text-sm", statusColors[project.status] ?? "bg-muted text-muted-foreground")}>
                      {detail.project.statusLabel}
                    </Badge>
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-card/40 p-4 space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Datos del proyecto</h3>
                      <p className="text-xs text-muted-foreground">
                        Actualiza la informacion principal y mantene alineado el calendario.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={reloadFormOptions}
                      disabled={formOptionsLoading}
                    >
                      {formOptionsLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                      Refrescar listas
                    </Button>
                  </div>
                  <Form {...projectForm}>
                    <form className="space-y-4" onSubmit={projectForm.handleSubmit(handleSaveDetails)}>
                      <ProjectFormFields
                        form={projectForm}
                        clientOptions={clientOptions}
                        managerOptions={managerOptions}
                        disabled={formOptionsLoading || savingDetails || !detail?.project}
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => projectForm.reset(mapDetailToFormValues(detail?.project))}
                          disabled={savingDetails || !detail?.project}
                        >
                          Revertir
                        </Button>
                        <Button type="submit" disabled={savingDetails || formOptionsLoading || !detail?.project}>
                          {savingDetails ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Guardar cambios
                        </Button>
                      </div>
                    </form>
                  </Form>
                </section>

                <section className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Linea de tiempo</h3>
                  <div className="flex flex-wrap gap-2">
                    {timeline.map((step) => (
                      <div
                        key={step.status}
                        className={cn(
                          "rounded-full border px-4 py-1 text-xs font-medium",
                          step.current
                            ? "border-primary bg-primary/10 text-primary"
                            : step.completed
                              ? "border-primary/40 bg-primary/10 text-primary/80"
                              : "border-muted bg-muted/30 text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-card/40 p-4 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Actualizar estado</h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="md:col-span-1">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nuevo estado</Label>
                        <Select
                          value={statusForm.status}
                          onValueChange={(value) => setStatusForm((prev) => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROJECT_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nota (opcional)</Label>
                        <Textarea
                          rows={3}
                          placeholder="Describe brevemente el cambio de estado"
                          value={statusForm.note}
                          onChange={(event) => setStatusForm((prev) => ({ ...prev, note: event.target.value }))}
                        />
                        <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={statusForm.notifyTeam}
                            onChange={(event) => setStatusForm((prev) => ({ ...prev, notifyTeam: event.target.checked }))}
                          />
                          Notificar al equipo por correo
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSaveStatus} disabled={savingStatus}>
                        {savingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar estado
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Registrar nota</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Titulo (opcional)</Label>
                        <Input
                          placeholder="Ej. Reunion con el cliente"
                          value={noteForm.title}
                          onChange={(event) => setNoteForm((prev) => ({ ...prev, title: event.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Compartir con el equipo
                        </Label>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <input
                            type="checkbox"
                            checked={noteForm.notifyTeam}
                            onChange={(event) => setNoteForm((prev) => ({ ...prev, notifyTeam: event.target.checked }))}
                          />
                          Enviar correo al equipo involucrado
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Detalle</Label>
                      <Textarea
                        rows={4}
                        placeholder="Describe avances, bloqueos o acuerdos relevantes"
                        value={noteForm.message}
                        onChange={(event) => setNoteForm((prev) => ({ ...prev, message: event.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSaveNote} disabled={savingNote}>
                        {savingNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar nota
                      </Button>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Actualizaciones recientes
                  </h3>
                  <div className="grid gap-3">
                    {updates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aun no se registraron actualizaciones para este proyecto.
                      </p>
                    ) : (
                      updates.map((update) => (
                        <div key={update.id} className="rounded-md border border-border bg-card/40 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{update.title ?? update.type}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(update.createdAt)}</p>
                            </div>
                            {update.notifyTeam ? <Badge variant="outline">Notificado</Badge> : null}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{update.message}</p>
                          {update.authorName ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Registrado por {update.authorName}
                              {update.authorEmail ? ` (${update.authorEmail})` : ""}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pudimos cargar la informacion del proyecto.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card/40 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
