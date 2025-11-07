import { NextRequest, NextResponse } from "next/server"
import { TicketStatus } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/current-user"
import { notifyTicketClients } from "@/lib/tickets/notifications"
import { ticketUpdateSchema } from "@/lib/validation/ticket-form"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const payload = ticketUpdateSchema.parse(await req.json())

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, notifyClient: true },
    })

    if (!ticket) {
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 })
    }

    const update = await prisma.ticketUpdate.create({
      data: {
        ticketId: ticket.id,
        type: payload.type,
        message: payload.message,
        public: payload.public,
        notifyClient: payload.notifyClient,
        nextStatus: payload.nextStatus ?? undefined,
        previousStatus: ticket.status,
        authorId: user.id,
        authorName: user.name,
        authorEmail: user.email,
      },
      include: {
        author: { select: { name: true, email: true } },
      },
    })

    if (payload.nextStatus && payload.nextStatus !== ticket.status) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: payload.nextStatus,
          closedAt: payload.nextStatus === TicketStatus.CLOSED ? new Date() : undefined,
        },
      })
    }

    if (payload.notifyClient && ticket.notifyClient) {
      await notifyTicketClients(ticket.id, update)
    }

    return NextResponse.json({ update })
  } catch (error) {
    console.error(`POST /api/tickets/${params.id}/updates error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: "No se pudo registrar la actualizacion" }, { status: 500 })
  }
}
