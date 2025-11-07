import { NextRequest, NextResponse } from "next/server"
import { Prisma, TicketPriority, TicketSource, TicketStatus, TicketUpdateType, TicketWatcherType } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { notifyTicketClients } from "@/lib/tickets/notifications"
import { ticketFormSchema } from "@/lib/validation/ticket-form"

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

const sourceLabels: Record<TicketSource, string> = {
  MANUAL: "Manual",
  AUTOMATION: "Automatizacion",
  CLIENT_PORTAL: "Portal cliente",
  MONITORING: "Monitoreo",
}

const querySchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  clientId: z.string().optional(),
  assigneeId: z.string().optional(),
  source: z.string().optional(),
  search: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const parsedQuery = querySchema.parse({
      status: searchParams.get("status") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      clientId: searchParams.get("clientId") ?? undefined,
      assigneeId: searchParams.get("assigneeId") ?? undefined,
      source: searchParams.get("source") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    })

    const statuses = parsedQuery.status?.split(",").filter(Boolean) as TicketStatus[] | undefined
    const priorities = parsedQuery.priority?.split(",").filter(Boolean) as TicketPriority[] | undefined
    const sources = parsedQuery.source?.split(",").filter(Boolean) as TicketSource[] | undefined

    const where: Prisma.TicketWhereInput = {
      status: statuses?.length ? { in: statuses } : undefined,
      priority: priorities?.length ? { in: priorities } : undefined,
      source: sources?.length ? { in: sources } : undefined,
      clientId: parsedQuery.clientId || undefined,
      assigneeId: parsedQuery.assigneeId || undefined,
      ...(parsedQuery.search
        ? {
            OR: [
              { title: { contains: parsedQuery.search, mode: "insensitive" } },
              { description: { contains: parsedQuery.search, mode: "insensitive" } },
              { client: { name: { contains: parsedQuery.search, mode: "insensitive" } } },
            ],
          }
        : undefined),
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        client: { select: { name: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        clientName: ticket.client?.name ?? "Sin cliente",
        status: ticket.status,
        statusLabel: statusLabels[ticket.status],
        priority: ticket.priority,
        priorityLabel: priorityLabels[ticket.priority],
        source: ticket.source,
        sourceLabel: sourceLabels[ticket.source],
        serviceArea: ticket.serviceArea,
        environment: ticket.environment,
        assigneeName: ticket.assignee?.name ?? "Sin asignar",
        dueAt: ticket.dueAt,
        createdAt: ticket.createdAt,
      })),
    })
  } catch (error) {
    console.error("GET /api/tickets error:", error)
    return NextResponse.json({ message: "Error al obtener tickets" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = ticketFormSchema.parse(await req.json())

    const client = payload.clientId
      ? await prisma.client.findUnique({ where: { id: payload.clientId }, select: { id: true, contactEmail: true, contactName: true, name: true } })
      : null

    if (payload.clientId && !client) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }

    const project = payload.projectId ? await prisma.project.findUnique({ where: { id: payload.projectId }, select: { id: true, clientId: true } }) : null
    if (payload.projectId && !project) {
      return NextResponse.json({ message: "Proyecto no encontrado" }, { status: 404 })
    }

    const watchersFromClient =
      client?.contactEmail && payload.notifyClient !== false
        ? [
            {
              type: TicketWatcherType.CLIENT,
              email: client.contactEmail,
              name: client.contactName ?? client.name,
            },
          ]
        : []

    const watcherPayload = [...(payload.watchers ?? []), ...watchersFromClient]
    const dedupedWatchers = Array.from(new Map(watcherPayload.map((watcher) => [watcher.email.toLowerCase(), watcher])).values())

    const ticket = await prisma.ticket.create({
      data: {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        source: payload.source,
        serviceArea: payload.serviceArea,
        environment: payload.environment,
        notifyClient: payload.notifyClient ?? true,
        dueAt: payload.dueAt,
        clientId: payload.clientId ?? null,
        projectId: payload.projectId ?? null,
        assigneeId: payload.assigneeId ?? null,
        watchers:
          dedupedWatchers.length > 0
            ? {
                create: dedupedWatchers.map((watcher) => ({
                  email: watcher.email,
                  name: watcher.name,
                  type: watcher.type ?? TicketWatcherType.CLIENT,
                })),
              }
            : undefined,
      },
    })

    const initialUpdate = await prisma.ticketUpdate.create({
      data: {
        ticketId: ticket.id,
        type: TicketUpdateType.NOTE,
        message: payload.description,
        public: true,
        notifyClient: payload.notifyClient ?? true,
        nextStatus: payload.status,
      },
    })

    if (payload.notifyClient !== false) {
      await notifyTicketClients(ticket.id, initialUpdate)
    }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error("POST /api/tickets error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: "Error al crear ticket" }, { status: 500 })
  }
}
