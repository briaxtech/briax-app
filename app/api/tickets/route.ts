import { NextRequest, NextResponse } from "next/server"
import { TicketPriority, TicketStatus } from "@prisma/client"

import { prisma } from "@/lib/db"

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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const statusFilter = searchParams.get("status") as TicketStatus | null
    const priorityFilter = searchParams.get("priority") as TicketPriority | null

    const tickets = await prisma.ticket.findMany({
      where: {
        status: statusFilter ?? undefined,
        priority: priorityFilter ?? undefined,
      },
      include: {
        client: { select: { name: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        clientName: ticket.client?.name ?? "Sin cliente",
        status: ticket.status,
        statusLabel: statusLabels[ticket.status],
        priority: ticket.priority,
        priorityLabel: priorityLabels[ticket.priority],
        assigneeName: ticket.assignee?.name ?? "Sin asignar",
        createdAt: ticket.createdAt,
      })),
    })
  } catch (error) {
    console.error("GET /api/tickets error:", error)
    return NextResponse.json({ message: "Error al obtener tickets" }, { status: 500 })
  }
}
