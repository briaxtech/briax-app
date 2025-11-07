"use client"

import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, Eye, EyeOff, Link as LinkIcon, Loader2, Plus, Shield, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { clientAccessFormSchema, type ClientAccessFormValues } from "@/lib/validation/client-access-form"

interface ClientAccess {
  id: string
  service: string
  username: string | null
  password: string | null
  url: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface ClientAccessSectionProps {
  clientId: string
  initialAccesses: ClientAccess[]
}

export function ClientAccessSection({ clientId, initialAccesses }: ClientAccessSectionProps) {
  const { toast } = useToast()
  const [accesses, setAccesses] = useState<ClientAccess[]>(initialAccesses)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const form = useForm<ClientAccessFormValues>({
    resolver: zodResolver(clientAccessFormSchema),
    defaultValues: {
      service: "",
      username: "",
      password: "",
      url: "",
      notes: "",
    },
  })

  const sanitizedPayload = useCallback((values: ClientAccessFormValues) => {
    const trim = (value?: string | null) => value?.trim() || undefined

    return {
      service: values.service.trim(),
      username: trim(values.username),
      password: values.password?.length ? values.password : undefined,
      url: trim(values.url),
      notes: trim(values.notes),
    }
  }, [])

  const onSubmit = async (values: ClientAccessFormValues) => {
    try {
      setSubmitting(true)
      const response = await fetch(`/api/clients/${clientId}/accesses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedPayload(values)),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo guardar el acceso")
      }

      const body = await response.json()
      const access: ClientAccess = body.access

      setAccesses((prev) => [access, ...prev])
      setRevealedIds((prev) => ({ ...prev, [access.id]: false }))
      form.reset()

      toast({
        title: "Acceso guardado",
        description: `Se guardaron las credenciales para ${access.service}`,
      })
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "Ocurrio un error inesperado",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (accessId: string) => {
    try {
      setDeletingId(accessId)
      const response = await fetch(`/api/clients/${clientId}/accesses/${accessId}`, { method: "DELETE" })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo eliminar el acceso")
      }
      setAccesses((prev) => prev.filter((access) => access.id !== accessId))
      toast({
        title: "Acceso eliminado",
        description: "La credencial se elimino correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: error instanceof Error ? error.message : "Ocurrio un error inesperado",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = async (value: string | null) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      toast({ title: "Copiado", description: "La contrasena se copio al portapapeles." })
    } catch {
      toast({ title: "No se pudo copiar", description: "Intenta nuevamente." })
    }
  }

  const emptyState = useMemo(
    () => (
      <Card className="border-dashed">
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Shield className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Todavia no cargaste accesos para este cliente.</p>
          <p className="text-xs text-muted-foreground">Guarda credenciales clave como Google Workspace, hosting, n8n, etc.</p>
        </div>
      </Card>
    ),
    [],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[380px,minmax(0,1fr)]">
      <Card className="p-4 border-border bg-card/60">
        <div className="flex items-center gap-2 pb-4">
          <Shield className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Nuevo acceso</p>
            <p className="text-xs text-muted-foreground">Centraliza credenciales sensibles por cliente.</p>
          </div>
        </div>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicio o cuenta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Google Workspace, Hostinger, n8n" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario@cliente.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrasena</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://portal.cliente.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Notas sobre MFA, recuperacion o instrucciones especiales" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? "Guardando" : "Guardar acceso"}
            </Button>
          </form>
        </Form>
      </Card>

      <div className="space-y-4">
        {accesses.length === 0
          ? emptyState
          : accesses.map((access) => {
              const visible = revealedIds[access.id]
              return (
                <Card key={access.id} className="p-4 border-border bg-card/60">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{access.service}</p>
                        {access.username ? <p className="text-sm text-muted-foreground">{access.username}</p> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {access.password ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleReveal(access.id)}
                              title={visible ? "Ocultar" : "Mostrar"}
                            >
                              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(access.password)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(access.id)}
                          disabled={deletingId === access.id}
                        >
                          {deletingId === access.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {access.password ? (
                      <p className="font-mono text-sm text-foreground">
                        {visible ? access.password : "••••••••••"}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin contrasena almacenada</p>
                    )}

                    {access.url ? (
                      <a
                        className="mt-2 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                        href={access.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Abrir panel
                      </a>
                    ) : null}

                    {access.notes ? <p className="mt-2 text-sm text-muted-foreground">{access.notes}</p> : null}

                    <p className="mt-3 text-xs text-muted-foreground">
                      Actualizado: {new Date(access.updatedAt).toLocaleString("es-ES")}
                    </p>
                  </div>
                </Card>
              )
            })}
      </div>
    </div>
  )
}
