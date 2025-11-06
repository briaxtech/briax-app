"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

const data = [
  { month: "Jan", revenue: 4000, partner: 2400 },
  { month: "Feb", revenue: 3000, partner: 1398 },
  { month: "Mar", revenue: 2000, partner: 9800 },
  { month: "Apr", revenue: 2780, partner: 3908 },
  { month: "May", revenue: 1890, partner: 4800 },
  { month: "Jun", revenue: 2390, partner: 3800 },
]

export function RevenueChart() {
  return (
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm col-span-2">
      <h3 className="text-lg font-semibold text-foreground mb-6">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "0.5rem",
            }}
          />
          <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="partner" stroke="var(--secondary)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
