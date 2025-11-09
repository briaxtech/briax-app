"use client"

import { useState } from "react"
import { Clock, MessageSquare, ShieldAlert } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

type PreferenceDefinition = {
  id: string
  label: string
  description: string
  icon: typeof Clock
  defaultEnabled: boolean
  impact: string
}

const preferenceDefinitions: PreferenceDefinition[] = [
  {
    id: "daily-digest",
    label: "Resumen diario al equipo",
    description: "Enviamos un resumen con tickets abiertos, compromisos y bloqueos relevantes.",
    icon: Clock,
    defaultEnabled: true,
    impact: "Opera antes de las 8 AM según la zona horaria de cada responsable.",
  },
  {
    id: "incident-alerts",
    label: "Alertas críticas por chat",
    description: "Cualquier incidente marcado como 'INCIDENT' dispara una alerta a Slack y correo.",
    icon: ShieldAlert,
    defaultEnabled: true,
    impact: "Escala automáticamente a Dirección si pasan 30 minutos sin actualización.",
  },
  {
    id: "handoff-reminders",
    label: "Recordatorio de handoff",
    description: "Si un ticket cambia de estado y no hay responsable nuevo, avisamos al Project Manager.",
    icon: MessageSquare,
    defaultEnabled: false,
    impact: "Minimiza huecos al cambiar entre desarrollo y soporte.",
  },
]

export function AutomationPreferences() {
  const { toast } = useToast()
  const [preferences, setPreferences] = useState(
    () => preferenceDefinitions.map((pref) => ({ ...pref, enabled: pref.defaultEnabled })),
  )
  const [saving, setSaving] = useState(false)

  const togglePreference = (id: string, value: boolean) => {
    setPreferences((prev) => prev.map((pref) => (pref.id === id ? { ...pref, enabled: value } : pref)))
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSaving(false)
    toast({
      title: "Preferencias guardadas",
      description: "Aplicaremos los cambios en los próximos minutos.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatizaciones operativas</CardTitle>
        <CardDescription>Activa los recordatorios y alertas que mantienen alineado al equipo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preferences.map((pref) => {
          const Icon = pref.icon
          return (
            <div key={pref.id} className="flex items-start gap-4 rounded-xl border border-border px-4 py-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="size-4" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-sm">{pref.label}</p>
                    <p className="text-sm text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch checked={pref.enabled} onCheckedChange={(value) => togglePreference(pref.id, value)} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{pref.impact}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleSave} disabled={saving} variant="secondary">
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </CardFooter>
    </Card>
  )
}
