import { NextRequest, NextResponse } from "next/server"
import { PartnerStatus, PartnerType, PayoutStatus, Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

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
    const typeFilter = searchParams.get("type") as PartnerType | null
    const searchValue = searchParams.get("search")?.trim()

    const where: Prisma.PartnerWhereInput = {}

    if (statusFilter) {
      where.status = statusFilter
    }
    if (typeFilter) {
      where.type = typeFilter
    }
    if (searchValue && searchValue.length > 0) {
      where.name = { contains: searchValue, mode: "insensitive" }
    }

    const partners = await prisma.partner.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
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
