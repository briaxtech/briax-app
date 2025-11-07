"use client"

import Link from "next/link"
import { Calendar, Mail, UserRound } from "lucide-react"
import { TicketPriority, TicketStatus, TicketWatcherType } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const statusStyles: Record<TicketStatus, string> = {
  NEW: "bg-blue-500/15 text-blue-500",
  IN_PROGRESS: "bg-purple-500/15 text-purple-500",
  WAITING_CLIENT: "bg-amber-500/15 text-amber-500",
  RESOLVED: "bg-emerald-500/15 text-emerald-500",
  CLOSED: "bg-slate-500/20 text-slate-400",
}

const priorityStyles: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-600",
  CRITICAL: "bg-red-100 text-red-600",
}

const watcherTypeStyles: Record<TicketWatcherType, string> = {
  CLIENT: "bg-emerald-500/15 text-emerald-500",
  INTERNAL: "bg-slate-500/15 text-slate-500",
}

type TicketDetailHeaderProps = {
  ticket: {
    id: string
    ticketNumber: number
    title: string
    status: TicketStatus
    priority: TicketPriority
    serviceArea?: string | null
    environment?: string | null
    client?: { id: string; name: string | null }
    assignee?: { id: string; name: string | null; email: string | null } | null
    watchers: Array<{ id: string; name: string | null; email: string; type: TicketWatcherType }>
  }
}

export function TicketDetailHeader({ ticket }: TicketDetailHeaderProps) {
  return (
    <Card className="border-border bg-card/70 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Ticket #{ticket.ticketNumber}</p>
          <h1 className="text-3xl font-bold text-foreground">{ticket.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge className={cn("uppercase tracking-wide", statusStyles[ticket.status])}>{ticket.status}</Badge>
            <Badge className={cn("uppercase tracking-wide", priorityStyles[ticket.priority])}>{ticket.priority}</Badge>
            {ticket.serviceArea ? <Badge variant="secondary">{ticket.serviceArea}</Badge> : null}
            {ticket.environment ? <Badge variant="outline">{ticket.environment}</Badge> : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            {ticket.assignee?.name ?? "Sin asignar"}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {ticket.client ? (
              <Link href={`/clients/${ticket.client.id}`} className="text-primary">
                {ticket.client.name}
              </Link>
            ) : (
              "Sin cliente"
            )}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Actualizado automaticamente
          </div>
        </div>
      </div>
      <div className="mt-6 border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground mb-2">Notificaciones</p>
        <div className="flex flex-wrap gap-2">
          {ticket.watchers.length === 0
            ? "Sin suscriptores"
            : ticket.watchers.map((watcher) => (
                <Badge key={watcher.id} className={cn("text-xs", watcherTypeStyles[watcher.type])}>
                  {watcher.name ?? watcher.email} · {watcher.type === "CLIENT" ? "Cliente" : "Interno"}
                </Badge>
              ))}
        </div>
      </div>
    </Card>
  )
}
