"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useProjectFormOptions } from "@/hooks/use-project-form-options"
import { projectFormSchema, type ProjectFormValues } from "@/lib/validation/project-form"
import type { ProjectCalendarEntry } from "@/lib/projects/types"
import { PROJECT_TYPE_LABELS } from "@/lib/projects/constants"

import { ProjectFormFields } from "./project-form-fields"

type ProjectCreateDialogProps = {
  onCreated?: (project: ProjectCalendarEntry) => void
}

const projectTypeKeys = Object.keys(PROJECT_TYPE_LABELS)

export function ProjectCreateDialog({ onCreated }: ProjectCreateDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      type: (projectTypeKeys[0] ?? "website") as ProjectFormValues["type"],
      clientId: "",
      managerId: null,
      description: "",
      startDate: null,
      dueDate: null,
    },
  })

  const { clients, managers, loading: loadingOptions, reload } = useProjectFormOptions(open)

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        type: (projectTypeKeys[0] ?? "website") as ProjectFormValues["type"],
        clientId: "",
        managerId: null,
        description: "",
        startDate: null,
        dueDate: null,
      })
    }
  }, [open, form])

  const disableSubmit = useMemo(
    () => isSubmitting || loadingOptions || clients.length === 0,
    [clients.length, isSubmitting, loadingOptions],
  )

  const handleSubmit = async (values: ProjectFormValues) => {
    if (!values.dueDate) {
      form.setError("dueDate", { message: "Define una fecha de entrega" })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo crear el proyecto")
      }

      const body = await response.json()
      const project = body?.project as ProjectCalendarEntry | undefined

      toast({
        title: "Proyecto creado",
        description: `Registramos ${values.name}`,
      })

      setOpen(false)
      form.reset({
        name: "",
        type: (projectTypeKeys[0] ?? "website") as ProjectFormValues["type"],
        clientId: "",
        managerId: null,
        description: "",
        startDate: null,
        dueDate: null,
      })
      if (project) {
        onCreated?.(project)
      }
    } catch (error) {
      toast({
        title: "Error al crear el proyecto",
        description: error instanceof Error ? error.message : "Ocurrio un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && setOpen(next)}>
      <DialogTrigger asChild>
        <Button className="gap-2 border border-border bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/80">
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>Define los datos principales para comenzar a trabajar con el equipo.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 sm:pr-0">
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground -mt-2">
                Necesitas tener al menos un cliente activo para crear un proyecto.{" "}
                <button type="button" className="text-primary underline" onClick={reload}>
                  Volver a cargar
                </button>
              </p>
            ) : null}

            <Form {...form}>
              <form className="space-y-6 pb-4" onSubmit={form.handleSubmit(handleSubmit)}>
                <ProjectFormFields
                  form={form}
                  clientOptions={clients}
                  managerOptions={managers}
                  disabled={isSubmitting || loadingOptions || clients.length === 0}
                />
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={disableSubmit}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Crear proyecto
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
