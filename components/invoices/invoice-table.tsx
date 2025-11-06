"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

interface Invoice {
  id: string
  number: string
  clientName: string
  amount: string
  currency: string
  issueDate: string
  dueDate: string
  status: string
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-001",
    clientName: "TechCorp Inc",
    amount: "5,000",
    currency: "EUR",
    issueDate: "2024-03-01",
    dueDate: "2024-03-31",
    status: "PAID",
  },
  {
    id: "2",
    number: "INV-002",
    clientName: "StartupXYZ",
    amount: "3,500",
    currency: "EUR",
    issueDate: "2024-03-05",
    dueDate: "2024-04-05",
    status: "SENT",
  },
  {
    id: "3",
    number: "INV-003",
    clientName: "Enterprise Solutions",
    amount: "8,000",
    currency: "EUR",
    issueDate: "2024-02-15",
    dueDate: "2024-03-15",
    status: "OVERDUE",
  },
  {
    id: "4",
    number: "INV-004",
    clientName: "TechCorp Inc",
    amount: "2,200",
    currency: "EUR",
    issueDate: "2024-03-10",
    dueDate: "2024-04-10",
    status: "DRAFT",
  },
]

const statusColors = {
  DRAFT: "bg-gray-500/20 text-gray-400",
  SENT: "bg-blue-500/20 text-blue-400",
  PAID: "bg-green-500/20 text-green-400",
  OVERDUE: "bg-red-500/20 text-red-400",
}

export function InvoiceTable() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Invoice</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Issue Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Due Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockInvoices.map((invoice) => (
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
                <td className="px-6 py-4">
                  <span className="text-foreground font-medium">
                    {invoice.amount} {invoice.currency}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.issueDate}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.dueDate}</td>
                <td className="px-6 py-4">
                  <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>{invoice.status}</Badge>
                </td>
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
