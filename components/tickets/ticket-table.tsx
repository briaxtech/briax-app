"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

interface Ticket {
  id: string
  title: string
  clientName: string
  status: string
  priority: string
  assignee?: string
  createdAt: string
}

const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "Homepage design review needed",
    clientName: "TechCorp Inc",
    status: "WAITING_CLIENT",
    priority: "HIGH",
    assignee: "John Dev",
    createdAt: "2024-03-10",
  },
  {
    id: "2",
    title: "Mobile responsiveness issue",
    clientName: "StartupXYZ",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    assignee: "Sarah Dev",
    createdAt: "2024-03-08",
  },
  {
    id: "3",
    title: "API integration bug",
    clientName: "Enterprise Solutions",
    status: "NEW",
    priority: "MEDIUM",
    createdAt: "2024-03-12",
  },
  {
    id: "4",
    title: "Database optimization needed",
    clientName: "TechCorp Inc",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignee: "Mike Dev",
    createdAt: "2024-03-05",
  },
]

const statusColors = {
  NEW: "bg-blue-500/20 text-blue-400",
  IN_PROGRESS: "bg-purple-500/20 text-purple-400",
  WAITING_CLIENT: "bg-yellow-500/20 text-yellow-400",
  RESOLVED: "bg-green-500/20 text-green-400",
  CLOSED: "bg-gray-500/20 text-gray-400",
}

const priorityColors = {
  LOW: "bg-gray-500/20 text-gray-400",
  MEDIUM: "bg-blue-500/20 text-blue-400",
  HIGH: "bg-orange-500/20 text-orange-400",
  CRITICAL: "bg-red-500/20 text-red-400",
}

export function TicketTable() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ticket</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Priority</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Assignee</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Created</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockTickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-border hover:bg-sidebar-accent/30 transition-colors">
                <td className="px-6 py-4">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="text-foreground font-medium hover:text-primary transition-colors"
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{ticket.clientName}</td>
                <td className="px-6 py-4">
                  <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                    {ticket.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                    {ticket.priority}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{ticket.assignee || "Unassigned"}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{ticket.createdAt}</td>
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
