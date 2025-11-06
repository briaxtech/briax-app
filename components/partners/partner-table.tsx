"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

interface Partner {
  id: string
  name: string
  type: string
  status: string
  referrals: number
  totalRevenue: string
  commissionsPaid: string
  commissionsPending: string
}

const mockPartners: Partner[] = [
  {
    id: "1",
    name: "Tech Solutions Agency",
    type: "AGENCY",
    status: "ACTIVE",
    referrals: 12,
    totalRevenue: "€150,000",
    commissionsPaid: "€15,000",
    commissionsPending: "€2,500",
  },
  {
    id: "2",
    name: "Sarah Freelance",
    type: "FREELANCER",
    status: "ACTIVE",
    referrals: 8,
    totalRevenue: "€85,000",
    commissionsPaid: "€8,500",
    commissionsPending: "€1,200",
  },
  {
    id: "3",
    name: "Digital Growth Partners",
    type: "AGENCY",
    status: "ACTIVE",
    referrals: 5,
    totalRevenue: "€65,000",
    commissionsPaid: "€6,500",
    commissionsPending: "€800",
  },
  {
    id: "4",
    name: "John Affiliate",
    type: "AFFILIATE",
    status: "PAUSED",
    referrals: 3,
    totalRevenue: "€35,000",
    commissionsPaid: "€3,500",
    commissionsPending: "€0",
  },
]

const typeColors = {
  AGENCY: "bg-purple-500/20 text-purple-400",
  FREELANCER: "bg-blue-500/20 text-blue-400",
  AFFILIATE: "bg-green-500/20 text-green-400",
  INTERNAL_SALES: "bg-orange-500/20 text-orange-400",
}

const statusColors = {
  ACTIVE: "bg-green-500/20 text-green-400",
  PAUSED: "bg-yellow-500/20 text-yellow-400",
  INACTIVE: "bg-gray-500/20 text-gray-400",
}

export function PartnerTable() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Partner</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Referrals</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Total Revenue</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Paid</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Pending</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockPartners.map((partner) => (
              <tr key={partner.id} className="border-b border-border hover:bg-sidebar-accent/30 transition-colors">
                <td className="px-6 py-4">
                  <Link
                    href={`/partners/${partner.id}`}
                    className="text-foreground font-medium hover:text-primary transition-colors"
                  >
                    {partner.name}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <Badge className={typeColors[partner.type as keyof typeof typeColors]}>{partner.type}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className={statusColors[partner.status as keyof typeof statusColors]}>{partner.status}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-foreground font-medium">{partner.referrals}</td>
                <td className="px-6 py-4 text-sm text-foreground font-medium">{partner.totalRevenue}</td>
                <td className="px-6 py-4 text-sm text-green-400">{partner.commissionsPaid}</td>
                <td className="px-6 py-4 text-sm text-yellow-400">{partner.commissionsPending}</td>
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
