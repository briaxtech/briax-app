"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

interface Client {
  id: string
  name: string
  contactName?: string
  contactEmail?: string
  status: string
  createdAt: string
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "TechCorp Inc",
    contactName: "John Smith",
    contactEmail: "john@techcorp.com",
    status: "ACTIVE",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "StartupXYZ",
    contactName: "Sarah Johnson",
    contactEmail: "sarah@startupxyz.com",
    status: "LEAD",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Enterprise Solutions",
    contactName: "Mike Davis",
    contactEmail: "mike@enterprise.com",
    status: "ACTIVE",
    createdAt: "2024-01-10",
  },
]

const statusColors = {
  LEAD: "bg-blue-500/20 text-blue-400",
  ACTIVE: "bg-green-500/20 text-green-400",
  PAUSED: "bg-yellow-500/20 text-yellow-400",
  CLOSED: "bg-red-500/20 text-red-400",
}

export function ClientTable() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockClients.map((client) => (
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
                  <Badge className={statusColors[client.status as keyof typeof statusColors]}>{client.status}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{client.createdAt}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
