import { notFound } from "next/navigation"

import { prisma } from "@/lib/db"
import { Card } from "@/components/ui/card"
import { TicketDetailHeader } from "@/components/tickets/ticket-detail-header"
import { TicketTimeline } from "@/components/tickets/ticket-timeline"
import { TicketUpdateForm } from "@/components/tickets/ticket-update-form"

export const revalidate = 0

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, contactEmail: true, contactName: true } },
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
      watchers: true,
      updates: {
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!ticket) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <TicketDetailHeader ticket={ticket} />

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-border bg-card/70 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Linea de tiempo</p>
              <p className="text-xs text-muted-foreground">Seguimiento y comunicaciones del ticket.</p>
            </div>
          </div>
          <TicketTimeline updates={ticket.updates} />
        </Card>

        <div className="space-y-4">
          <TicketUpdateForm ticketId={ticket.id} />
          <Card className="border-border bg-card/70 p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Contexto</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{ticket.description}</p>
            {ticket.project ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Proyecto asociado: <span className="text-foreground font-medium">{ticket.project.name}</span>
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  )
}
