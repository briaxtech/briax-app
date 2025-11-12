"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  const fetchClients = useCallback(async (query: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/clients${query ? `?${query}` : ""}`, { method: "GET" })
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
    fetchClients(queryString)
  }, [fetchClients, queryString])

  useEffect(() => {
    const handler = () => {
      fetchClients(queryString)
    }
    window.addEventListener("clients:refresh", handler)
    return () => window.removeEventListener("clients:refresh", handler)
  }, [fetchClients, queryString])

  const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("es-ES")
  }

  const renderStateMessage = (message: string, tone: "muted" | "error" = "muted") => (
    <p
      className={`px-6 py-6 text-center text-sm ${
        tone === "muted" ? "text-muted-foreground" : "text-destructive"
      }`}
    >
      {message}
    </p>
  )

  const renderStatusBadge = (client: ClientRow) => (
    <Badge className={statusColors[client.status as keyof typeof statusColors] ?? "bg-muted text-muted-foreground"}>
      {client.statusLabel ?? client.status}
    </Badge>
  )

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      {/* Vista mobile / md */}
      <div className="md:hidden">
        {loading
          ? renderStateMessage("Cargando clientes...")
          : error
            ? renderStateMessage(error, "error")
            : clients.length === 0
              ? renderStateMessage("Todavia no hay clientes registrados.")
              : (
                  <Accordion type="single" collapsible className="divide-y divide-border">
                    {clients.map((client) => (
                      <AccordionItem key={client.id} value={client.id} className="px-4">
                        <AccordionTrigger className="items-center gap-2 py-4 text-left">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{client.name}</p>
                          </div>
                          <div className="ml-auto mr-1 flex items-center">{renderStatusBadge(client)}</div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-sm text-muted-foreground">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Contacto</p>
                              <p className="text-foreground">{client.contactName || "Sin asignar"}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Correo</p>
                              <p className="text-foreground break-all">{client.contactEmail || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fecha de alta</p>
                              <p className="text-foreground">{formatDate(client.createdAt)}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" className="w-full">
                                <Link href={`/clients/${client.id}`}>Ver detalles</Link>
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
      </div>

      {/* Vista de tabla para pantallas grandes */}
      <div
        className="hidden md:block overflow-x-auto"
        aria-label="Tabla de clientes, desliza horizontalmente para ver todas las columnas"
      >
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
                  <td className="px-6 py-4">{renderStatusBadge(client)}</td>
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
