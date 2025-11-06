import { NextRequest, NextResponse } from "next/server"
import { PartnerStatus, PartnerType, PayoutStatus } from "@prisma/client"

import { prisma } from "@/lib/db"

const typeLabels: Record<PartnerType, string> = {
  AGENCY: "Agencia",
  FREELANCER: "Freelancer",
  AFFILIATE: "Afiliado",
  INTERNAL_SALES: "Venta interna",
}

const statusLabels: Record<PartnerStatus, string> = {
  ACTIVE: "Activo",
  PAUSED: "En pausa",
  INACTIVE: "Inactivo",
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const statusFilter = searchParams.get("status") as PartnerStatus | null

    const partners = await prisma.partner.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        referrals: {
          select: { commissionAmount: true, commissionBase: true, status: true },
        },
        payouts: {
          select: { amount: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      partners: partners.map((partner) => {
        const totalRevenue = partner.referrals.reduce(
          (acc, referral) => acc + (referral.commissionBase ?? 0),
          0,
        )
        const commissionsPaid = partner.payouts
          .filter((payout) => payout.status === PayoutStatus.PAID)
          .reduce((acc, payout) => acc + payout.amount, 0)
        const commissionsPending = partner.payouts
          .filter((payout) => payout.status !== PayoutStatus.PAID)
          .reduce((acc, payout) => acc + payout.amount, 0)

        return {
          id: partner.id,
          name: partner.name,
          type: partner.type,
          typeLabel: typeLabels[partner.type],
          status: partner.status,
          statusLabel: statusLabels[partner.status],
          referralsCount: partner.referrals.length,
          totalRevenue,
          commissionsPaid,
          commissionsPending,
        }
      }),
    })
  } catch (error) {
    console.error("GET /api/partners error:", error)
    return NextResponse.json({ message: "Error al obtener socios" }, { status: 500 })
  }
}
