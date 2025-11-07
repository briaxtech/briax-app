import { TicketPriority, TicketSource, TicketStatus, TicketUpdateType, TicketWatcherType } from "@prisma/client"
import { z } from "zod"

export const ticketWatcherSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().max(120).optional(),
  type: z.nativeEnum(TicketWatcherType).default(TicketWatcherType.CLIENT),
})

export const ticketFormSchema = z.object({
  title: z.string().min(3, { message: "El titulo es obligatorio" }),
  description: z.string().min(10, { message: "Describe el contexto del ticket" }),
  status: z.nativeEnum(TicketStatus).optional().default(TicketStatus.NEW),
  priority: z.nativeEnum(TicketPriority).optional().default(TicketPriority.MEDIUM),
  source: z.nativeEnum(TicketSource).optional().default(TicketSource.MANUAL),
  clientId: z.string().trim().min(1).optional(),
  projectId: z.string().trim().min(1).optional(),
  assigneeId: z.string().trim().min(1).optional(),
  serviceArea: z.string().trim().max(120).optional(),
  environment: z.string().trim().max(120).optional(),
  notifyClient: z.boolean().optional().default(true),
  dueAt: z.coerce.date().optional(),
  watchers: z.array(ticketWatcherSchema).optional(),
})

export type TicketFormValues = z.infer<typeof ticketFormSchema>

export const ticketUpdateSchema = z.object({
  type: z.nativeEnum(TicketUpdateType).default(TicketUpdateType.NOTE),
  message: z.string().min(3, { message: "Describe la actualizacion" }),
  public: z.boolean().optional().default(true),
  notifyClient: z.boolean().optional().default(true),
  nextStatus: z.nativeEnum(TicketStatus).optional(),
})

export type TicketUpdateValues = z.infer<typeof ticketUpdateSchema>
