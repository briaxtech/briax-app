import { notFound } from "next/navigation"
import { PartnerStatus, PartnerType, PayoutStatus, PartnerReferralStatus } from "@prisma/client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

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

const referralStatusLabels: Record<PartnerReferralStatus, string> = {
  PENDING: "Pendiente",
  WON: "Ganado",
  LOST: "Perdido",
}

const payoutStatusLabels: Record<PayoutStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  CANCELLED: "Cancelado",
}

const statusColors: Record<PartnerStatus, string> = {
  ACTIVE: "bg-green-500/20 text-green-400",
  PAUSED: "bg-yellow-500/20 text-yellow-400",
  INACTIVE: "bg-gray-500/20 text-gray-400",
}

const formatCurrency = (amount: number, currency: string) =>
  `${currency} ${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`

const formatDate = (value: Date | null) => {
  if (!value) return "-"
  return value.toLocaleDateString("es-ES")
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

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
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{partner.name}</h1>
        <p className="text-muted-foreground mt-2">Socio ID: {partner.id}</p>
      </div>

      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Detail label="Correo electronico" value={partner.contactEmail ?? "Sin definir"} />
          <Detail label="Telefono" value={partner.contactPhone ?? "Sin definir"} />
          <Detail label="Codigo de seguimiento" value={partner.trackingCode ?? "Sin definir"} />
          <Detail
            label="Alta"
            value={formatDate(partner.createdAt)}
          />
          <Detail
            label="Comision base"
            value={
              partner.baseCommissionRate != null
                ? `${partner.baseCommissionRate.toFixed(2)}%`
                : "Sin definir"
            }
          />
          <Detail label="Tipo" value={typeLabels[partner.type]} />
        </div>
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-3">
            <Badge className={statusColors[partner.status]}>{statusLabels[partner.status]}</Badge>
            {partner.notes ? <p className="text-sm text-muted-foreground">{partner.notes}</p> : null}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Referidos</h3>
          <div className="space-y-4">
            {partner.referrals.length === 0 ? (
              <EmptyCopy>No se registraron referidos para este socio.</EmptyCopy>
            ) : (
              partner.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="p-4 rounded-md border border-border hover:bg-sidebar-accent/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{referral.client?.name ?? "Sin cliente"}</p>
                      <p className="text-xs text-muted-foreground">{referral.project?.name ?? "Sin proyecto"}</p>
                    </div>
                    <Badge>{referralStatusLabels[referral.status]}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Comision: {referral.commissionRate ? `${referral.commissionRate.toFixed(2)}%` : "-"}</span>
                    <span>Monto: {referral.commissionAmount ? formatCurrency(referral.commissionAmount, referral.currency ?? "EUR") : "-"}</span>
                    <span>Base: {referral.commissionBase ? formatCurrency(referral.commissionBase, referral.currency ?? "EUR") : "-"}</span>
                    <span>Creado: {formatDate(referral.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Pagos</h3>
          <div className="space-y-4">
            {partner.payouts.length === 0 ? (
              <EmptyCopy>Aun no se registraron pagos.</EmptyCopy>
            ) : (
              partner.payouts.map((payout) => (
                <div key={payout.id} className="p-4 rounded-md border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(payout.amount, payout.currency)}
                    </p>
                    <Badge>{payoutStatusLabels[payout.status]}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Metodo: {payout.method ?? "No informado"}</span>
                    <span>Pago: {formatDate(payout.payoutDate)}</span>
                    <span>Creado: {formatDate(payout.createdAt)}</span>
                    <span>Notas: {payout.notes ?? "-"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  )
}

function EmptyCopy({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}
