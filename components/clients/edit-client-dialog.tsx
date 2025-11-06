"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { clientFormSchema, type ClientFormValues } from "@/lib/validation/client-form"
import { SERVICE_OPTIONS } from "@/lib/clients/service-templates"

const statusOptions = [
  { value: "LEAD", label: "Lead" },
  { value: "ACTIVE", label: "Activo" },
  { value: "PAUSED", label: "En pausa" },
  { value: "CLOSED", label: "Cerrado" },
]

const countryOptions = ["Estados Unidos", "Canada", "Mexico", "Espana", "Argentina", "Chile", "Otro"]

const industryOptions = [
  "Tecnologia",
  "Servicios",
  "Retail",
  "Salud",
  "Educacion",
  "Manufactura",
  "Otro",
]

type EditClientDialogProps = {
  clientId: string
  defaultValues: ClientFormValues
}

export function EditClientDialog({ clientId, defaultValues }: EditClientDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  })

  const onSubmit = async (values: ClientFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo actualizar el cliente")
      }

      toast({
        title: "Cliente actualizado",
        description: `Los datos de ${values.clientName} se guardaron correctamente`,
      })
      setOpen(false)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: error instanceof Error ? error.message : "Ocurrio un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const disabled = isSubmitting || isPending

  return (
    <Dialog open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" />
          Editar cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>Actualiza la informacion del cliente y los servicios asociados.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Briax Labs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacto principal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Ana Gomez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electronico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contacto@cliente.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <Input placeholder="+54 9 11 5555 5555" {...field} />
                    </FormControl>
                    <FormDescription>Opcional, para coordinaciones rapidas.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pais</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un pais" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
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
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industryOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
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
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicios contratados</FormLabel>
                  <div className="grid gap-2 md:grid-cols-2">
                    {SERVICE_OPTIONS.map((service) => {
                      const isChecked = field.value?.includes(service.id)
                      return (
                        <label
                          key={service.id}
                          className="flex items-center gap-3 rounded-md border border-border bg-card/40 px-3 py-2 hover:bg-card"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value ?? []), service.id])
                              } else {
                                field.onChange(field.value?.filter((item) => item !== service.id) ?? [])
                              }
                            }}
                          />
                          <span className="text-sm text-foreground">{service.label}</span>
                        </label>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas internas</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Contexto del cliente, expectativas o informacion previa" {...field} />
                  </FormControl>
                  <FormDescription>Estas notas ayudan a todo el equipo a mantener el contexto actualizado.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={disabled}>
                {disabled ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
