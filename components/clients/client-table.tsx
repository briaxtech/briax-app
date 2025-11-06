"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

interface ClientRow {
  id: string
  name: string
  contactName: string | null
  contactEmail: string | null
  status: string
  statusLabel: string
  createdAt: string
}

const statusColors = {
  LEAD: "bg-blue-500/20 text-blue-400",
  ACTIVE: "bg-green-500/20 text-green-400",
  PAUSED: "bg-yellow-500/20 text-yellow-400",
  CLOSED: "bg-red-500/20 text-red-400",
}

export function ClientTable() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/clients", { method: "GET" })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo obtener la lista de clientes")
      }
      const body = await response.json()
      setClients(body.clients ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al cargar clientes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    const handler = () => {
      fetchClients()
    }
    window.addEventListener("clients:refresh", handler)
    return () => window.removeEventListener("clients:refresh", handler)
  }, [fetchClients])

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
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Contacto</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Correo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Fecha de alta</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  Cargando clientes...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-sm text-destructive">
                  {error}
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  Todavia no hay clientes registrados.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-b border-border hover:bg-sidebar-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-foreground font-medium hover:text-primary transition-colors"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{client.contactName || "-"}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{client.contactEmail || "-"}</td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[client.status as keyof typeof statusColors] ?? "bg-muted text-muted-foreground"}>
                      {client.statusLabel ?? client.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(client.createdAt)}</td>
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
