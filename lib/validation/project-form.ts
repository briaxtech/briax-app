import { z } from "zod"

import { PROJECT_TYPE_LABELS } from "@/lib/projects/constants"

const projectTypeKeys = Object.keys(PROJECT_TYPE_LABELS) as [
  keyof typeof PROJECT_TYPE_LABELS,
  ...(keyof typeof PROJECT_TYPE_LABELS)[],
]

const nullableDateField = z
  .union([z.coerce.date(), z.null()])
  .optional()
  .transform((value) => (value instanceof Date ? value : null))

const dueDateField = z
  .union([z.coerce.date(), z.null()])
  .transform((value) => (value instanceof Date ? value : null))
  .refine((value): value is Date => value instanceof Date, {
    message: "Define una fecha de entrega",
  })

export const projectFormSchema = z.object({
  name: z.string().trim().min(3, { message: "Ingresa un nombre descriptivo" }),
  type: z.enum(projectTypeKeys, { required_error: "Selecciona un tipo de proyecto" }),
  clientId: z.string().trim().min(1, { message: "Selecciona un cliente" }),
  managerId: z
    .string()
    .trim()
    .min(1, { message: "Selecciona un responsable" })
    .optional()
    .nullable(),
  description: z
    .string()
    .trim()
    .max(2000, { message: "Maximo 2000 caracteres" })
    .optional()
    .nullable(),
  startDate: nullableDateField,
  dueDate: dueDateField,
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>
