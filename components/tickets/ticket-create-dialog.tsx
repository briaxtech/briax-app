"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { TicketPriority, TicketSource, TicketStatus } from "@prisma/client"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ticketFormSchema, type TicketFormValues } from "@/lib/validation/ticket-form"

type TicketDialogFormValues = TicketFormValues & { ccEmails?: string }

type Option = { id: string; label: string; meta?: string }

export function TicketCreateDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Option[]>([])
  const [projects, setProjects] = useState<Array<Option & { clientId: string | null }>>([])
  const [users, setUsers] = useState<Option[]>([])

  const dialogSchema = useMemo(() => ticketFormSchema.extend({ ccEmails: z.string().optional() }), [])

  const form = useForm<TicketDialogFormValues>({
    resolver: zodResolver(dialogSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.NEW,
      source: TicketSource.MANUAL,
      notifyClient: true,
      ccEmails: "",
    },
  })

  useEffect(() => {
    if (!open) return
    const fetchOptions = async () => {
      try {
        const [clientsRes, projectsRes, usersRes] = await Promise.all([fetch("/api/clients"), fetch("/api/projects"), fetch("/api/users")])
        const clientsBody = await clientsRes.json()
        const projectsBody = await projectsRes.json()
        const usersBody = await usersRes.json()
        setClients(
          (clientsBody.clients ?? []).map((client: { id: string; name: string; contactName?: string }) => ({
            id: client.id,
            label: client.name,
            meta: client.contactName,
          })),
        )
        setProjects(
          (projectsBody.projects ?? []).map(
            (project: { id: string; name: string; clientId?: string | null; clientName?: string }) => ({
              id: project.id,
              label: project.name,
              clientId: project.clientId ?? null,
              meta: project.clientName ?? undefined,
            }),
          ),
        )
        setUsers(
          (usersBody.users ?? []).map((user: { id: string; name: string; email: string }) => ({
            id: user.id,
            label: user.name,
            meta: user.email,
          })),
        )
      } catch (error) {
        console.error("No se pudieron cargar las opciones", error)
      }
    }
    fetchOptions()
  }, [open])

  const selectedClient = form.watch("clientId")
  const filteredProjects = useMemo(() => {
    if (!selectedClient) return projects
    return projects.filter((project) => project.clientId === selectedClient)
  }, [projects, selectedClient])

  const onSubmit = async (values: TicketDialogFormValues) => {
    try {
      setLoading(true)
      const extraWatchers =
        values?.["ccEmails"]
          ?.split(",")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
          .map((email) => ({ email })) ?? []

      const payload = {
        ...values,
        watchers: extraWatchers,
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo crear el ticket")
      }

      toast({ title: "Ticket creado", description: `Registramos ${values.title}` })
      form.reset({
        title: "",
        description: "",
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.NEW,
        source: TicketSource.MANUAL,
        clientId: undefined,
        projectId: undefined,
        serviceArea: "",
        environment: "",
        notifyClient: true,
        ccEmails: "",
      })
      setOpen(false)
      window.dispatchEvent(new Event("tickets:refresh"))
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el ticket",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && setOpen(next)}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Registrar ticket</DialogTitle>
          <DialogDescription>Describe el incidente o solicitud para que el equipo pueda priorizarlo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titulo</FormLabel>
                    <FormControl>
                      <Input placeholder="Bug en checkout" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servicio / modulo</FormLabel>
                    <FormControl>
                      <Input placeholder="Checkout, CRM, n8n..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Cuéntanos qué sucede, pasos de reproduccion, adjuntos, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proyecto</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={filteredProjects.length === 0}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={filteredProjects.length === 0 ? "Sin proyectos" : "Selecciona un proyecto"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TicketPriority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TicketStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TicketSource).map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FormField
                control={form.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entorno</FormLabel>
                    <FormControl>
                      <Input placeholder="Produccion, QA..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignado (opcional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un miembro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.label} {user.meta ? `· ${user.meta}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Vence (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" onChange={(event) => form.setValue("dueAt", event.target.value ? new Date(event.target.value) : undefined)} />
                </FormControl>
              </FormItem>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Notificar al cliente</p>
                <p className="text-xs text-muted-foreground">Enviaremos un email automático con la creación del ticket.</p>
              </div>
              <FormField
                control={form.control}
                name="notifyClient"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormItem>
              <FormLabel>Copiar (emails separados por coma)</FormLabel>
              <FormControl>
                <Input placeholder="cliente@correo.com, soporte@cliente.com" {...form.register("ccEmails" as any)} />
              </FormControl>
            </FormItem>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Guardando" : "Crear ticket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
