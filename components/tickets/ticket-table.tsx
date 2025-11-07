"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CalendarClock, MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface TicketRow {
  id: string
  ticketNumber: number
  title: string
  clientName: string
  status: string
  statusLabel: string
  priority: string
  priorityLabel: string
  assigneeName: string
  sourceLabel: string
  serviceArea?: string | null
  environment?: string | null
  dueAt?: string | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-400",
  IN_PROGRESS: "bg-purple-500/20 text-purple-400",
  WAITING_CLIENT: "bg-yellow-500/20 text-yellow-400",
  RESOLVED: "bg-green-500/20 text-green-400",
  CLOSED: "bg-gray-500/20 text-gray-400",
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-500/20 text-gray-400",
  MEDIUM: "bg-blue-500/20 text-blue-400",
  HIGH: "bg-orange-500/20 text-orange-400",
  CRITICAL: "bg-red-500/20 text-red-400",
}

export function TicketTable() {
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  const fetchTickets = useCallback(async (query: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tickets${query ? `?${query}` : ""}`, { method: "GET" })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo obtener la lista de tickets")
      }
      const body = await response.json()
      setTickets(body.tickets ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al cargar tickets")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets(queryString)
  }, [fetchTickets, queryString])

  useEffect(() => {
    const handler = () => fetchTickets(queryString)
    window.addEventListener("tickets:refresh", handler)
    return () => window.removeEventListener("tickets:refresh", handler)
  }, [fetchTickets, queryString])

  const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("es-ES")
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ticket</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Prioridad</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Origen</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Asignado a</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Entrega</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  Cargando tickets...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-sm text-destructive">
                  {error}
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  No hay tickets registrados.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-border hover:bg-sidebar-accent/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-muted-foreground">#{ticket.ticketNumber}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="text-foreground font-medium hover:text-primary transition-colors"
                    >
                      {ticket.title}
                    </Link>
                    {ticket.serviceArea ? (
                      <p className="text-xs text-muted-foreground">
                        {ticket.serviceArea}
                        {ticket.environment ? ` · ${ticket.environment}` : ""}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{ticket.clientName}</td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[ticket.status] ?? "bg-muted text-muted-foreground"}>
                      {ticket.statusLabel}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={priorityColors[ticket.priority] ?? "bg-muted text-muted-foreground"}>
                      {ticket.priorityLabel}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{ticket.sourceLabel}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{ticket.assigneeName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {ticket.dueAt ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" />
                        {formatDate(ticket.dueAt)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
