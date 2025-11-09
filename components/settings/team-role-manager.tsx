"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import type { TeamRole } from "@prisma/client"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const roleSchema = z.object({
  name: z.string().min(2, "Ingresa un nombre"),
  color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Color inválido"),
})

type FormValues = z.infer<typeof roleSchema>

export type RoleWithCount = TeamRole & { memberCount: number }

type TeamRoleManagerProps = {
  roles: RoleWithCount[]
}

export function TeamRoleManager({ roles }: TeamRoleManagerProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      color: "#2563EB",
    },
  })

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/team-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error?.message ?? "No pudimos crear el rol")
        }
        toast({ title: "Rol creado" })
        form.reset({ name: "", color: "#2563EB" })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No pudimos guardar el rol",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card/70 p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Roles del equipo</h3>
        <p className="text-sm text-muted-foreground">
          Define etiquetas y colores para organizar al equipo.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no configuraste roles.</p>
        ) : (
          roles.map((role) => <RoleRow key={role.id} role={role} />)
        )}
      </div>

      <div className="mt-5 border-t border-border/70 pt-4">
        <p className="text-sm font-semibold">Nuevo rol</p>
        <Form {...form}>
          <form className="mt-3 space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        className="h-10 w-16 p-1"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                      <Input
                        placeholder="#2563EB"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Crear rol"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

function RoleRow({ role }: { role: RoleWithCount }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/70 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span
          className="inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold uppercase"
          style={{ borderColor: role.color, color: role.color }}
        >
          {role.name.slice(0, 2)}
        </span>
        <div>
          <p className="font-medium text-foreground">{role.name}</p>
          <p className="text-xs text-muted-foreground">{role.memberCount} integrantes</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          className="border px-2 py-0.5 text-xs"
          style={{
            borderColor: role.color,
            backgroundColor: hexWithAlpha(role.color, 0.15),
            color: role.color,
          }}
        >
          {role.color.toUpperCase()}
        </Badge>
        <EditRoleDialog role={role} />
        <DeleteRoleDialog role={role} />
      </div>
    </div>
  )
}

function hexWithAlpha(color: string, alpha: number) {
  const sanitized = color?.replace("#", "") ?? ""
  const full = sanitized.length === 3 ? sanitized.split("").map((char) => char + char).join("") : sanitized
  const parsed = parseInt(full, 16)
  const fallback = parseInt("2563EB", 16)
  const bigint = Number.isNaN(parsed) ? fallback : parsed
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function EditRoleDialog({ role }: { role: RoleWithCount }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: role.name, color: role.color },
  })

  const handleUpdate = (values: FormValues) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/team-roles/${role.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error?.message ?? "No pudimos actualizar el rol")
        }
        toast({ title: "Rol actualizado" })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No pudimos actualizar el rol",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar rol</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(handleUpdate)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input
                      type="color"
                      className="h-10 w-16 p-1"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteRoleDialog({ role }: { role: RoleWithCount }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isDeleting, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/team-roles/${role.id}`, { method: "DELETE" })
        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error?.message ?? "No pudimos eliminar el rol")
        }
        toast({ title: "Rol eliminado" })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No pudimos eliminar el rol",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Borrar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar {role.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {role.memberCount > 0
              ? "Este rol tiene integrantes asociados, los miembros quedarán sin rol."
              : "Podrás volver a crearlo más adelante si lo necesitás."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
