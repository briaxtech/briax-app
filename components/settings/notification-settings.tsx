import { AlertTriangle, Mail, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type EscalationContact = {
  name: string
  role: string
  email: string
}

type NotificationSettingsProps = {
  config: {
    providerName: string
    configured: boolean
    fromEmail?: string | null
    ccList: string[]
    escalationContacts: EscalationContact[]
  }
}

export function NotificationSettings({ config }: NotificationSettingsProps) {
  const ccList = config.ccList.filter(Boolean)

  return (
    <Card>
      <CardHeader className="border-b border-border/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Notificaciones y correo</CardTitle>
            <CardDescription>
              Controla los remitentes usados en envíos automáticos y a quiénes copiamos por defecto.
            </CardDescription>
          </div>
          <Badge variant={config.configured ? "secondary" : "destructive"}>
            {config.configured ? `${config.providerName} activo` : "Config pendiente"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="size-4 text-primary" />
              Remitente principal
            </p>
            <p className="mt-2 text-sm text-foreground">{config.fromEmail ?? "Sin definir"}</p>
            <p className="text-xs text-muted-foreground">
              Usamos este correo para todos los avisos de proyectos y tickets.
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 text-amber-500" />
              Copias y fallback
            </p>
            {ccList.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {ccList.map((cc) => (
                  <Badge key={cc} variant="outline">
                    {cc}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No hay destinatarios secundarios configurados.</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Los agregamos automáticamente a cada email.</p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border/60 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Users className="size-4 text-primary" />
            Matriz de escalamiento
          </p>
          {config.escalationContacts.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {config.escalationContacts.map((contact) => (
                <li key={contact.email} className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{contact.name}</span>
                  <Badge variant="secondary">{contact.role}</Badge>
                  <span className="text-muted-foreground">{contact.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Aún no marcamos responsables críticos.</p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Se usan cuando la automatización falla o necesitamos respaldo manual.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
