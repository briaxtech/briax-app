"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

interface InvoiceRow {
  id: string
  number: string
  clientName: string
  projectName: string | null
  amount: number
  currency: string
  issueDate: string
  dueDate: string | null
  status: string
  statusLabel: string
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400",
  SENT: "bg-blue-500/20 text-blue-400",
  PAID: "bg-green-500/20 text-green-400",
  OVERDUE: "bg-red-500/20 text-red-400",
}

export function InvoiceTable() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/invoices", { method: "GET" })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se pudo obtener la lista de facturas")
      }
      const body = await response.json()
      setInvoices(body.invoices ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al cargar facturas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const formatDate = (value: string | null) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("es-ES")
  }

  const formatAmount = (amount: number, currency: string) =>
    `${currency} ${new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Factura</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Proyecto</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Importe</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Emision</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Vencimiento</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  Cargando facturas...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-sm text-destructive">
                  {error}
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-sm text-muted-foreground">
                  No hay facturas registradas.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border hover:bg-sidebar-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-foreground font-medium hover:text-primary transition-colors"
                    >
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.clientName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.projectName ?? "-"}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{formatAmount(invoice.amount, invoice.currency)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(invoice.issueDate)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(invoice.dueDate)}</td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[invoice.status] ?? "bg-muted text-muted-foreground"}>
                      {invoice.statusLabel}
                    </Badge>
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
