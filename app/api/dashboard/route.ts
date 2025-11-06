import { NextResponse } from "next/server"
import {
  ClientStatus,
  InvoiceStatus,
  PartnerStatus,
  PayoutStatus,
  ProjectStatus,
  TicketStatus,
} from "@prisma/client"
import { startOfMonth, subMonths } from "date-fns"

import { prisma } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export async function GET() {
  try {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, index) =>
      startOfMonth(subMonths(now, 5 - index)),
    )
    const monthsKey = months.map((date) => `${date.getFullYear()}-${date.getMonth()}`)

    const [activeClients, projects, tickets, invoices, partners, payouts] = await Promise.all([
      prisma.client.count({ where: { status: ClientStatus.ACTIVE } }),
      prisma.project.findMany({
        select: { id: true, name: true, status: true, createdAt: true },
      }),
      prisma.ticket.findMany({
        select: { id: true, status: true, createdAt: true, title: true, client: { select: { name: true } } },
      }),
      prisma.invoice.findMany({
        where: {
          issueDate: { gte: months[0] },
        },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          issueDate: true,
          createdAt: true,
          client: { select: { name: true } },
        },
      }),
      prisma.partner.findMany({
        select: { status: true, createdAt: true, name: true },
      }),
      prisma.partnerPayout.findMany({
        where: {
          payoutDate: { not: null, gte: months[0] },
        },
        select: {
          amount: true,
          payoutDate: true,
          status: true,
          createdAt: true,
          partner: { select: { name: true } },
        },
      }),
    ])

    const activeProjects = projects.filter(
      (project) => project.status !== ProjectStatus.CLOSED,
    ).length

    const monthlyRevenue = invoices
      .filter((invoice) => invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.SENT)
      .filter((invoice) => {
        const issueDate = invoice.issueDate
        return issueDate.getFullYear() === now.getFullYear() && issueDate.getMonth() === now.getMonth()
      })
      .reduce((acc, invoice) => acc + invoice.amount, 0)

    const openTickets = tickets.filter(
      (ticket) => ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED,
    ).length

    const activePartners = partners.filter(
      (partner) => partner.status === PartnerStatus.ACTIVE,
    ).length

    const partnerRevenue = payouts
      .filter((payout) => payout.status === PayoutStatus.PAID)
      .reduce((acc, payout) => acc + payout.amount, 0)

    const revenueByMonth = months.map((date, index) => {
      const key = monthsKey[index]
      const invoiceSum = invoices
        .filter((invoice) => `${invoice.issueDate.getFullYear()}-${invoice.issueDate.getMonth()}` === key)
        .filter(
          (invoice) => invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.SENT,
        )
        .reduce((acc, invoice) => acc + invoice.amount, 0)

      const partnerSum = payouts
        .filter((payout) => payout.payoutDate && `${payout.payoutDate.getFullYear()}-${payout.payoutDate.getMonth()}` === key)
        .filter((payout) => payout.status === PayoutStatus.PAID)
        .reduce((acc, payout) => acc + payout.amount, 0)

      return {
        month: MONTH_LABELS[date.getMonth()],
        revenue: invoiceSum,
        partner: partnerSum,
      }
    })

    const recentActivityRaw = [
      ...projects.map((project) => ({
        type: "project" as const,
        id: project.id,
        title: project.name,
        description: `Estado: ${project.status}`,
        timestamp: project.createdAt,
      })),
      ...tickets.map((ticket) => ({
        type: "ticket" as const,
        id: ticket.id,
        title: ticket.title,
        description: ticket.client ? `Cliente: ${ticket.client.name}` : "Ticket sin cliente",
        timestamp: ticket.createdAt,
      })),
      ...invoices.map((invoice) => ({
        type: "invoice" as const,
        id: invoice.id,
        title: "Factura emitida",
        description: invoice.client ? `Cliente: ${invoice.client.name}` : "Factura sin cliente",
        timestamp: invoice.createdAt,
      })),
      ...partners.map((partner) => ({
        type: "partner" as const,
        id: partner.name,
        title: partner.name,
        description: `Estado: ${partner.status}`,
        timestamp: partner.createdAt,
      })),
    ]

    recentActivityRaw.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    const recentActivity = recentActivityRaw.slice(0, 8).map((item, index) => ({
      id: `${item.type}-${item.id ?? index}`,
      type: item.type,
      title: item.title,
      description: item.description,
      timestamp: item.timestamp.toISOString(),
    }))

    return NextResponse.json({
      kpis: {
        activeClients,
        activeProjects,
        monthlyRevenue,
        openTickets,
        activePartners,
        partnerRevenue,
      },
      revenue: revenueByMonth,
      recentActivity,
    })
  } catch (error) {
    console.error("GET /api/dashboard error:", error)
    return NextResponse.json({ message: "Error al obtener datos del dashboard" }, { status: 500 })
  }
}
