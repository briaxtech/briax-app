import { AlertTriangle, Globe, Mail, Users } from "lucide-react"

import { Card } from "@/components/ui/card"

type SettingsSummaryCardsProps = {
  stats: {
    totalMembers: number
    rolesConfigured: number
    timezoneCoverage: number
    notificationsConfigured: boolean
    fromEmail?: string | null
  }
}

export function SettingsSummaryCards({ stats }: SettingsSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        icon={Users}
        label="Integrantes activos"
        primary={stats.totalMembers.toString()}
        helper="Personas con acceso al panel"
      />
      <SummaryCard
        icon={Globe}
        label="Cobertura por husos"
        primary={`${stats.timezoneCoverage}`}
        helper="Zonas horarias representadas"
      />
      <SummaryCard
        icon={Mail}
        label="Remitente por defecto"
        primary={stats.fromEmail ?? "Sin definir"}
        helper={stats.notificationsConfigured ? "Resend listo para envíos" : "Config pendiente"}
      />
      <SummaryCard
        icon={AlertTriangle}
        label="Roles configurados"
        primary={`${stats.rolesConfigured}`}
        helper="Roles disponibles en el directorio"
      />
    </div>
  )
}

type SummaryCardProps = {
  icon: typeof Users
  label: string
  primary: string
  helper: string
}

function SummaryCard({ icon: Icon, label, primary, helper }: SummaryCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className="text-2xl font-semibold text-foreground">{primary}</p>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </Card>
  )
}
