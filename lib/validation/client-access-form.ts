import { z } from "zod"

const optionalUrl = z
  .string()
  .trim()
  .url({ message: "Ingresa un enlace valido" })
  .or(z.literal(""))
  .optional()

export const clientAccessFormSchema = z.object({
  service: z
    .string()
    .trim()
    .min(2, { message: "Ingresa un nombre para el acceso" })
    .max(80, { message: "El nombre debe tener menos de 80 caracteres" }),
  username: z
    .string()
    .trim()
    .max(120, { message: "El usuario debe tener menos de 120 caracteres" })
    .optional(),
  password: z
    .string()
    .max(120, { message: "La contrasena debe tener menos de 120 caracteres" })
    .optional(),
  url: optionalUrl,
  notes: z
    .string()
    .trim()
    .max(500, { message: "Las notas deben tener menos de 500 caracteres" })
    .optional(),
})

export type ClientAccessFormValues = z.infer<typeof clientAccessFormSchema>
