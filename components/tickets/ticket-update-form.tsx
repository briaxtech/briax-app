"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"
import { TicketStatus, TicketUpdateType } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ticketUpdateSchema, type TicketUpdateValues } from "@/lib/validation/ticket-form"

const updateTypeLabels: Record<TicketUpdateType, string> = {
  NOTE: "Nota",
  STATUS_CHANGE: "Cambio de estado",
  INCIDENT: "Incidencia",
}

export function TicketUpdateForm({ ticketId }: { ticketId: string }) {
  const { toast } = useToast()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<TicketUpdateValues>({
    resolver: zodResolver(ticketUpdateSchema),
    defaultValues: {
      type: TicketUpdateType.NOTE,
      message: "",
      public: true,
      notifyClient: true,
    },
  })

  const onSubmit = async (values: TicketUpdateValues) => {
    try {
      setSubmitting(true)
      const response = await fetch(`/api/tickets/${ticketId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo registrar la actualizacion")
      }

      toast({ title: "Actualizacion registrada" })
      form.reset({
        type: TicketUpdateType.NOTE,
        message: "",
        public: true,
        notifyClient: true,
        nextStatus: undefined,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar la actualizacion",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <p className="text-sm font-semibold text-foreground mb-3">Nueva actualizacion</p>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TicketUpdateType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {updateTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Detalle lo que sucedio, pasos siguientes, responsables..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actualizar estado</FormLabel>
                <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value || undefined)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Mantener estado actual" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem key="keep" value="">
                      Mantener estado actual
                    </SelectItem>
                    {Object.values(TicketStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Visible al cliente</p>
              <p className="text-xs text-muted-foreground">Se incluye en la linea de tiempo del portal.</p>
            </div>
            <FormField
              control={form.control}
              name="public"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Notificar cliente</p>
              <p className="text-xs text-muted-foreground">Enviaremos un email con esta actualizacion.</p>
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
          <Button type="submit" disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? "Registrando" : "Enviar actualizacion"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
