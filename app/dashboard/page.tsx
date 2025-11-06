"use client"

import { useEffect, useMemo, useState } from "react"
import { Users, FolderOpen, DollarSign, AlertCircle, Users2, TrendingUp } from "lucide-react"

import { KPICard } from "@/components/dashboard/kpi-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { AssistantWidget } from "@/components/ai/assistant-widget"

interface DashboardResponse {
  kpis: {
    activeClients: number
    activeProjects: number
    monthlyRevenue: number
    openTickets: number
    activePartners: number
    partnerRevenue: number
  }
  revenue: Array<{ month: string; revenue: number; partner: number }>
  recentActivity: Array<{ id: string; type: string; title: string; description: string; timestamp: string }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard", { method: "GET", cache: "no-store" })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body?.message ?? "No se pudo obtener los datos del dashboard")
        }
        const body = (await response.json()) as DashboardResponse
        setData(body)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado al cargar el dashboard")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const kpis = useMemo(() => data?.kpis ?? null, [data])
  const revenue = data?.revenue ?? []
  const recentActivity = data?.recentActivity ?? []

  const formatNumber = (value: number, currency = false) => {
    const formatted = new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: currency ? 2 : 0,
      maximumFractionDigits: currency ? 2 : 0,
    }).format(value)
    return currency ? `EUR ${formatted}` : formatted
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel</h1>
        <p className="text-muted-foreground mt-2">
          Resumen general del estado de clientes, proyectos y operaciones.
        </p>
      </div>

      {/* Indicadores clave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard label="Clientes activos" value={kpis ? formatNumber(kpis.activeClients) : "..."} icon={Users} />
        <KPICard
          label="Proyectos activos"
          value={kpis ? formatNumber(kpis.activeProjects) : "..."}
          icon={FolderOpen}
        />
        <KPICard label="Ingresos mensuales" value={kpis ? formatNumber(kpis.monthlyRevenue, true) : "..."} icon={DollarSign} />
        <KPICard
          label="Tickets abiertos"
          value={kpis ? formatNumber(kpis.openTickets) : "..."}
          icon={AlertCircle}
        />
        <KPICard
          label="Socios activos"
          value={kpis ? formatNumber(kpis.activePartners) : "..."}
          icon={Users2}
        />
        <KPICard label="Ingresos via socios" value={kpis ? formatNumber(kpis.partnerRevenue, true) : "..."} icon={TrendingUp} />
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Graficos y actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={revenue} loading={loading} />
        <RecentActivity items={recentActivity} loading={loading} />
      </div>

      <AssistantWidget />
    </div>
  )
}
