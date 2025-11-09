"use client"

import { useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import type { TeamMember, TeamRole } from "@prisma/client"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const NONE_ROLE_VALUE = "none"

const formSchema = z.object({
  name: z.string().min(2, "Ingrese el nombre completo"),
  email: z.string().email("Correo inválido"),
  roleId: z.string().optional().nullable(),
  phone: z.string().optional(),
  slackHandle: z.string().optional(),
  timezone: z.string().min(2).optional(),
  location: z.string().optional(),
  preferredChannel: z.string().optional(),
  availability: z.string().optional(),
  responsibilitiesText: z.string().optional(),
  focusAreasText: z.string().optional(),
  notes: z.string().optional(),
  isEscalationContact: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

type MemberForForm = Pick<
  TeamMember,
  | "id"
  | "name"
  | "email"
  | "roleId"
  | "timezone"
  | "location"
  | "phone"
  | "slackHandle"
  | "preferredChannel"
  | "availability"
  | "responsibilities"
  | "focusAreas"
  | "notes"
  | "isEscalationContact"
>

type TeamMemberFormProps = {
  roles: Array<Pick<TeamRole, "id" | "name">>
  member?: MemberForForm | null
  onSubmitted?: () => void
}

export function TeamMemberForm({ roles, member, onSubmitted }: TeamMemberFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(member),
  })

  useEffect(() => {
    form.reset(buildDefaultValues(member))
  }, [member, form])

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          name: values.name,
          email: values.email,
          roleId: values.roleId || undefined,
          phone: values.phone || undefined,
          slackHandle: values.slackHandle || undefined,
          timezone: values.timezone || undefined,
          location: values.location || undefined,
          preferredChannel: values.preferredChannel || undefined,
          availability: values.availability || undefined,
          responsibilities: parseList(values.responsibilitiesText),
          focusAreas: parseList(values.focusAreasText),
          notes: values.notes || undefined,
          isEscalationContact: values.isEscalationContact ?? false,
        }

        const isEdit = Boolean(member?.id)
        const endpoint = isEdit ? `/api/team-members/${member?.id}` : "/api/team-members"
        const method = isEdit ? "PATCH" : "POST"

        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error?.message ?? "No pudimos guardar al integrante")
        }

        toast({
          title: isEdit ? "Integrante actualizado" : "Integrante agregado",
          description: "Actualizamos la lista del equipo.",
        })

        router.refresh()
        onSubmitted?.()

        if (!isEdit) {
          form.reset(buildDefaultValues())
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No pudimos guardar al integrante",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card/70 p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Agregar integrante</h3>
        <p className="text-sm text-muted-foreground">
          Completa los datos básicos para sumar a alguien al directorio interno.
        </p>
      </div>

      <Form {...form}>
        <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Ana Demo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ana@briax.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    value={field.value ?? NONE_ROLE_VALUE}
                    onValueChange={(value) => field.onChange(value === NONE_ROLE_VALUE ? null : value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE_ROLE_VALUE}>Sin rol definido</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona horaria</FormLabel>
                  <FormControl>
                    <Input placeholder="America/Argentina/Buenos_Aires" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ciudad, país" {...field} />
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
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+54 11 ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slackHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slack / Chat</FormLabel>
                  <FormControl>
                    <Input placeholder="@usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredChannel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal preferido</FormLabel>
                  <FormControl>
                    <Input placeholder="Email / Slack / Teléfono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disponibilidad</FormLabel>
                  <FormControl>
                    <Input placeholder="09:00 - 18:00 ART" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="responsibilitiesText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsabilidades clave</FormLabel>
                <FormControl>
          <Textarea rows={3} placeholder="Una por línea" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="focusAreasText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Áreas de foco</FormLabel>
                <FormControl>
          <Textarea rows={2} placeholder="Una por línea" {...field} />
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
          <Textarea rows={2} placeholder="Observaciones internas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isEscalationContact"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                <div className="space-y-0.5">
                  <FormLabel>Contacto de escalamiento</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Lo mostramos en la matriz para incidentes críticos.
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : member ? "Guardar cambios" : "Agregar integrante"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

function parseList(value?: string | null) {
  if (!value) return []
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildDefaultValues(member?: MemberForForm | null): FormValues {
  if (!member) {
    return {
      name: "",
      email: "",
      roleId: null,
      phone: "",
      slackHandle: "",
      timezone: "America/Argentina/Buenos_Aires",
      location: "",
      preferredChannel: "",
      availability: "",
      responsibilitiesText: "",
      focusAreasText: "",
      notes: "",
      isEscalationContact: false,
    }
  }

  return {
    name: member.name,
    email: member.email,
    roleId: member.roleId ?? null,
    phone: member.phone ?? "",
    slackHandle: member.slackHandle ?? "",
    timezone: member.timezone ?? "America/Argentina/Buenos_Aires",
    location: member.location ?? "",
    preferredChannel: member.preferredChannel ?? "",
    availability: member.availability ?? "",
    responsibilitiesText: (member.responsibilities ?? []).join("\n"),
    focusAreasText: (member.focusAreas ?? []).join("\n"),
    notes: member.notes ?? "",
    isEscalationContact: member.isEscalationContact,
  }
}
