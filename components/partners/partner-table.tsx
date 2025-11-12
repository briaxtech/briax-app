"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MoreHorizontal } from "lucide-react"

interface PartnerRow {
  id: string
  name: string
  type: string
  typeLabel: string
  status: string
  statusLabel: string
  referralsCount: number
  totalRevenue: number
  commissionsPaid: number
  commissionsPending: number
}

const typeColors: Record<string, string> = {
  AGENCY: "bg-purple-500/20 text-purple-400",
  FREELANCER: "bg-blue-500/20 text-blue-400",
  AFFILIATE: "bg-green-500/20 text-green-400",
  INTERNAL_SALES: "bg-orange-500/20 text-orange-400",
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400",
  PAUSED: "bg-yellow-500/20 text-yellow-400",
  INACTIVE: "bg-gray-500/20 text-gray-400",
}

const formatCurrency = (value: number) =>
  `EUR ${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`

export function PartnerTable() {
  const [partners, setPartners] = useState<PartnerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  const fetchPartners = useCallback(async (query: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/partners${query ? `?${query}` : ""}`, { method: "GET" })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo obtener la lista de socios")
      }
      const body = await response.json()
      setPartners(body.partners ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al cargar socios")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPartners(queryString)
  }, [fetchPartners, queryString])

  useEffect(() => {
    const handler = () => fetchPartners(queryString)
    window.addEventListener("partners:refresh", handler)
    return () => window.removeEventListener("partners:refresh", handler)
  }, [fetchPartners, queryString])

  const stateMessage = (message: string, tone: "muted" | "error" = "muted") => (
    <p
      className={`px-6 py-6 text-center text-sm ${
        tone === "muted" ? "text-muted-foreground" : "text-destructive"
      }`}
    >
      {message}
    </p>
  )

  const renderTypeBadge = (partner: PartnerRow) => (
    <Badge className={typeColors[partner.type] ?? "bg-muted text-muted-foreground"}>{partner.typeLabel}</Badge>
  )

  const renderStatusBadge = (partner: PartnerRow) => (
    <Badge className={statusColors[partner.status] ?? "bg-muted text-muted-foreground"}>{partner.statusLabel}</Badge>
  )

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <div className="md:hidden">
        {loading
          ? stateMessage("Cargando socios...")
          : error
            ? stateMessage(error, "error")
            : partners.length === 0
              ? stateMessage("No hay socios registrados.")
              : (
                  <Accordion type="single" collapsible className="divide-y divide-border">
                    {partners.map((partner) => (
                      <AccordionItem key={partner.id} value={partner.id} className="px-4">
                        <AccordionTrigger className="items-center gap-2 py-4 text-left">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{partner.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{partner.typeLabel}</p>
                          </div>
                          <div className="ml-auto mr-1 flex items-center">{renderStatusBadge(partner)}</div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-sm text-muted-foreground">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-foreground">
                              <span className="text-xs uppercase tracking-wide text-muted-foreground">Referidos</span>
                              <span className="font-medium">{partner.referralsCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-foreground">
                              <span className="text-xs uppercase tracking-wide text-muted-foreground">Ingresos</span>
                              <span className="font-medium">{formatCurrency(partner.totalRevenue)}</span>
                            </div>
                            <div className="flex items-center justify-between text-green-400">
                              <span className="text-xs uppercase tracking-wide text-muted-foreground">Pagado</span>
                              <span className="font-semibold">{formatCurrency(partner.commissionsPaid)}</span>
                            </div>
                            <div className="flex items-center justify-between text-yellow-400">
                              <span className="text-xs uppercase tracking-wide text-muted-foreground">Pendiente</span>
                              <span className="font-semibold">{formatCurrency(partner.commissionsPending)}</span>
                            </div>
                            <Button asChild variant="outline" className="w-full">
                              <Link href={`/partners/${partner.id}`}>Ver detalles</Link>
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Socio</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tipo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Referidos</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ingresos generados</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Pagado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Pendiente</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  Cargando socios...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-sm text-destructive">
                  {error}
                </td>
              </tr>
            ) : partners.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  No hay socios registrados.
                </td>
              </tr>
            ) : (
              partners.map((partner) => (
                <tr key={partner.id} className="border-b border-border hover:bg-sidebar-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/partners/${partner.id}`}
                      className="text-foreground font-medium hover:text-primary transition-colors"
                    >
                      {partner.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{renderTypeBadge(partner)}</td>
                  <td className="px-6 py-4">{renderStatusBadge(partner)}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{partner.referralsCount}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{formatCurrency(partner.totalRevenue)}</td>
                  <td className="px-6 py-4 text-sm text-green-400">{formatCurrency(partner.commissionsPaid)}</td>
                  <td className="px-6 py-4 text-sm text-yellow-400">{formatCurrency(partner.commissionsPending)}</td>
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
