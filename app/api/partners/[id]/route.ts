import { NextResponse } from "next/server"
import { PartnerStatus, PartnerType } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"

const paramsSchema = z.object({
  id: z.string().min(1),
})

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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = paramsSchema.parse(params)

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        referrals: {
          orderBy: { createdAt: "desc" },
          include: {
            client: { select: { name: true } },
            project: { select: { name: true } },
          },
        },
        payouts: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!partner) {
      return NextResponse.json({ message: "Socio no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      partner: {
        id: partner.id,
        name: partner.name,
        type: partner.type,
        typeLabel: typeLabels[partner.type],
        status: partner.status,
        statusLabel: statusLabels[partner.status],
        contactName: partner.contactName,
        contactEmail: partner.contactEmail,
        contactPhone: partner.contactPhone,
        trackingCode: partner.trackingCode,
        baseCommissionRate: partner.baseCommissionRate,
        notes: partner.notes,
        createdAt: partner.createdAt,
      },
      referrals: partner.referrals.map((referral) => ({
        id: referral.id,
        clientName: referral.client?.name ?? "Sin cliente",
        projectName: referral.project?.name ?? "Sin proyecto",
        status: referral.status,
        commissionRate: referral.commissionRate,
        commissionBase: referral.commissionBase,
        commissionAmount: referral.commissionAmount,
        currency: referral.currency,
        notes: referral.notes,
        createdAt: referral.createdAt,
      })),
      payouts: partner.payouts.map((payout) => ({
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        payoutDate: payout.payoutDate,
        method: payout.method,
        notes: payout.notes,
        createdAt: payout.createdAt,
      })),
    })
  } catch (error) {
    console.error(`GET /api/partners/${params?.id} error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Identificador invalido" }, { status: 400 })
    }
    return NextResponse.json({ message: "Error al obtener el socio" }, { status: 500 })
  }
}
