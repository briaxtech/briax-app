import { z } from "zod"

export const clientFormSchema = z.object({
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  contactName: z.string().min(2, "Ingresa un contacto valido"),
  contactEmail: z.string().email("Correo invalido"),
  phone: z.string().optional(),
  country: z.string().min(1, "Selecciona un pais"),
  industry: z.string().min(1, "Selecciona un sector"),
  status: z.enum(["LEAD", "ACTIVE", "PAUSED", "CLOSED"]),
  services: z.array(z.string()).min(1, "Selecciona al menos un servicio"),
  notes: z.string().max(500, "Maximo 500 caracteres").optional(),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>
