"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

import { Card } from "@/components/ui/card"

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number; partner: number }>
  loading?: boolean
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const chartData = data.length > 0 ? data : [{ month: "Sin datos", revenue: 0, partner: 0 }]

  return (
    <Card className="col-span-1 border-border bg-card/50 p-6 backdrop-blur-sm lg:col-span-2">
      <h3 className="text-lg font-semibold text-foreground mb-6">Tendencia de ingresos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "0.5rem",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Ingresos totales"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            strokeOpacity={loading ? 0.4 : 1}
          />
          <Line
            type="monotone"
            dataKey="partner"
            name="Ingresos por socios"
            stroke="var(--secondary)"
            strokeWidth={2}
            dot={false}
            strokeOpacity={loading ? 0.4 : 1}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
