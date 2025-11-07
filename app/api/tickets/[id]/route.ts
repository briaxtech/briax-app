import { NextRequest, NextResponse } from "next/server"
import { TicketPriority, TicketStatus, TicketWatcherType } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { ticketWatcherSchema } from "@/lib/validation/ticket-form"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const statusLabels: Record<TicketStatus, string> = {
  NEW: "Nuevo",
  IN_PROGRESS: "En progreso",
  WAITING_CLIENT: "Esperando cliente",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
}

const priorityLabels: Record<TicketPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Critica",
}

const patchSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  assigneeId: z.string().optional(),
  serviceArea: z.string().optional(),
  environment: z.string().optional(),
  dueAt: z.coerce.date().optional().nullable(),
  notifyClient: z.boolean().optional(),
  watchers: z.array(ticketWatcherSchema).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, contactEmail: true, contactName: true } },
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        watchers: true,
        updates: {
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        statusLabel: statusLabels[ticket.status],
        priority: ticket.priority,
        priorityLabel: priorityLabels[ticket.priority],
        source: ticket.source,
        serviceArea: ticket.serviceArea,
        environment: ticket.environment,
        notifyClient: ticket.notifyClient,
        dueAt: ticket.dueAt,
        closedAt: ticket.closedAt,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        client: ticket.client,
        project: ticket.project,
        assignee: ticket.assignee,
        watchers: ticket.watchers,
        updates: ticket.updates.map((update) => ({
          id: update.id,
          type: update.type,
          message: update.message,
          public: update.public,
          notifyClient: update.notifyClient,
          previousStatus: update.previousStatus,
          nextStatus: update.nextStatus,
          createdAt: update.createdAt,
          author: update.author ? { name: update.author.name, email: update.author.email } : update.authorName ? { name: update.authorName, email: update.authorEmail } : null,
        })),
      },
    })
  } catch (error) {
    console.error(`GET /api/tickets/${params.id} error:`, error)
    return NextResponse.json({ message: "Error al obtener el ticket" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = patchSchema.parse(await req.json())

    await prisma.ticket.update({
      where: { id: params.id },
      data: {
        status: payload.status ?? undefined,
        priority: payload.priority ?? undefined,
        assigneeId: payload.assigneeId ?? undefined,
        serviceArea: payload.serviceArea ?? undefined,
        environment: payload.environment ?? undefined,
        notifyClient: payload.notifyClient ?? undefined,
        dueAt: payload.dueAt ?? undefined,
      },
    })

    if (payload.watchers && payload.watchers.length > 0) {
      const existingRecords = await prisma.ticketWatcher.findMany({
        where: { ticketId: params.id },
        select: { email: true },
      })
      const existing = new Set(existingRecords.map((watcher) => watcher.email.toLowerCase()))
      const newWatchers = payload.watchers.filter((watcher) => !existing.has(watcher.email.toLowerCase()))

      if (newWatchers.length > 0) {
        await prisma.ticketWatcher.createMany({
          data: newWatchers.map((watcher) => ({
            ticketId: params.id,
            email: watcher.email,
            name: watcher.name,
            type: watcher.type ?? TicketWatcherType.CLIENT,
          })),
        })
      }
    }

    const refreshed = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        project: true,
        assignee: true,
        watchers: true,
      },
    })

    if (!refreshed) {
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ ticket: refreshed })
  } catch (error) {
    console.error(`PATCH /api/tickets/${params.id} error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: "No se pudo actualizar el ticket" }, { status: 500 })
  }
}
