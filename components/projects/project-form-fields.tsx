"use client"

import type { UseFormReturn } from "react-hook-form"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PROJECT_TYPE_LABELS } from "@/lib/projects/constants"
import type { ProjectFormOption } from "@/hooks/use-project-form-options"
import type { ProjectFormValues } from "@/lib/validation/project-form"

type ProjectFormFieldsProps = {
  form: UseFormReturn<ProjectFormValues>
  clientOptions: ProjectFormOption[]
  managerOptions: ProjectFormOption[]
  disabled?: boolean
}

const typeOptions = Object.entries(PROJECT_TYPE_LABELS)
const UNASSIGNED_MANAGER_VALUE = "__unassigned__"

function formatInputDate(value: Date | null | undefined) {
  if (!value) return ""
  const iso = value.toISOString()
  return iso.slice(0, 10)
}

function parseDate(value: string) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function ProjectFormFields({ form, clientOptions, managerOptions, disabled = false }: ProjectFormFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Nombre del proyecto</FormLabel>
            <FormControl>
              <Input placeholder="Ej. Sitio web corporativo" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clientId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente</FormLabel>
            <FormControl>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={disabled || clientOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.length === 0 ? (
                    <SelectItem value="-" disabled>
                      Sin clientes disponibles
                    </SelectItem>
                  ) : (
                    clientOptions.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span>{client.label}</span>
                          {client.meta ? <span className="text-xs text-muted-foreground">{client.meta}</span> : null}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="managerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Responsable</FormLabel>
            <FormControl>
              <Select
                value={field.value ?? UNASSIGNED_MANAGER_VALUE}
                onValueChange={(value) => field.onChange(value === UNASSIGNED_MANAGER_VALUE ? null : value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_MANAGER_VALUE}>Sin asignar</SelectItem>
                  {managerOptions.length === 0 ? (
                    <SelectItem value="-" disabled>
                      Sin opciones disponibles
                    </SelectItem>
                  ) : (
                    managerOptions.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        <div className="flex flex-col">
                          <span>{manager.label}</span>
                          {manager.meta ? <span className="text-xs text-muted-foreground">{manager.meta}</span> : null}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Inicio estimado</FormLabel>
            <FormControl>
              <Input
                type="date"
                value={formatInputDate(field.value)}
                onChange={(event) => field.onChange(parseDate(event.target.value))}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dueDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Entrega comprometida</FormLabel>
            <FormControl>
              <Input
                type="date"
                value={formatInputDate(field.value)}
                onChange={(event) => field.onChange(parseDate(event.target.value))}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Descripcion</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notas relevantes, alcance, hitos acordados, etc."
                rows={4}
                {...field}
                value={field.value ?? ""}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
