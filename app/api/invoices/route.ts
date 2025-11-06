import { NextRequest, NextResponse } from "next/server"
import { InvoiceStatus } from "@prisma/client"

import { prisma } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  PAID: "Pagada",
  OVERDUE: "Vencida",
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const statusFilter = searchParams.get("status") as InvoiceStatus | null

    const invoices = await prisma.invoice.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        client: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { issueDate: "desc" },
    })

    return NextResponse.json({
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        number: invoice.id.slice(0, 6).toUpperCase(),
        clientName: invoice.client?.name ?? "Sin cliente",
        projectName: invoice.project?.name ?? null,
        amount: invoice.amount,
        currency: invoice.currency,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        statusLabel: statusLabels[invoice.status],
      })),
    })
  } catch (error) {
    console.error("GET /api/invoices error:", error)
    return NextResponse.json({ message: "Error al obtener facturas" }, { status: 500 })
  }
}
