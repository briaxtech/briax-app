import { prisma } from "@/lib/db"
import { TeamDirectory } from "@/components/settings/team-directory"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { AutomationPreferences } from "@/components/settings/automation-preferences"
import { SettingsSummaryCards } from "@/components/settings/settings-summary-cards"
import { TeamRoleManager } from "@/components/settings/team-role-manager"
import { TeamMemberDialog } from "@/components/settings/team-member-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function SettingsPage() {
  const [teamMembers, teamRoles] = await Promise.all([
    prisma.teamMember.findMany({
      include: { role: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.teamRole.findMany({ orderBy: { createdAt: "asc" } }),
  ])

  const roleWithCounts = teamRoles.map((role) => ({
    ...role,
    memberCount: teamMembers.filter((member) => member.roleId === role.id).length,
  }))

  const stats = {
    totalMembers: teamMembers.length,
    rolesConfigured: teamRoles.length,
    timezoneCoverage: new Set(teamMembers.map((member) => member.timezone)).size,
    notificationsConfigured: Boolean(process.env.RESEND_API_KEY && process.env.PROJECT_NOTIFICATIONS_FROM),
    fromEmail: process.env.PROJECT_NOTIFICATIONS_FROM ?? null,
  }

  const ccList = (process.env.PROJECT_NOTIFICATIONS_CC ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const notificationConfig = {
    providerName: "Resend",
    configured: stats.notificationsConfigured,
    fromEmail: stats.fromEmail,
    ccList,
    escalationContacts: teamMembers
      .filter((member) => member.isEscalationContact)
      .map((member) => ({
        name: member.name,
        role: member.role?.name ?? "Sin rol",
        email: member.email,
      })),
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Centraliza la información del equipo y los parámetros operativos del panel.
        </p>
      </header>

      <SettingsSummaryCards stats={stats} />

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 rounded-xl bg-muted/50 p-2">
          <TabsTrigger className="flex-1" value="team">
            Equipo
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="roles">
            Roles
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="notifications">
            Notificaciones
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="automations">
            Automatizaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Equipo interno</h2>
              <p className="text-sm text-muted-foreground">
                Consulta responsables, focos y datos de contacto para coordinar acciones o enviar avisos.
              </p>
            </div>
            <TeamMemberDialog
              roles={teamRoles}
              mode="create"
              trigger={
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Nuevo integrante
                </Button>
              }
            />
          </div>
          <TeamDirectory members={teamMembers} roles={teamRoles} />
        </TabsContent>

        <TabsContent value="roles">
          <TeamRoleManager roles={roleWithCounts} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings config={notificationConfig} />
        </TabsContent>

        <TabsContent value="automations">
          <AutomationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  )
}
