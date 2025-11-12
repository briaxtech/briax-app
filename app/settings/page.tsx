import { prisma } from "@/lib/db"
import { SettingsSummaryCards } from "@/components/settings/settings-summary-cards"
import { SettingsTabs, type SettingsRoleWithCounts, type SettingsTeamMember, type SettingsTeamRole } from "@/components/settings/settings-tabs"
import type { TeamMember, TeamRole } from "@prisma/client"

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

  const serializedTeamMembers = teamMembers.map(serializeTeamMember)
  const serializedTeamRoles = teamRoles.map(serializeTeamRole)
  const serializedRoleWithCounts: SettingsRoleWithCounts[] = roleWithCounts.map((role) => ({
    ...serializeTeamRole(role),
    memberCount: role.memberCount,
  }))

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Centraliza la información del equipo y los parámetros operativos del panel.
        </p>
      </header>

      <SettingsSummaryCards stats={stats} />

      <SettingsTabs
        teamMembers={serializedTeamMembers}
        teamRoles={serializedTeamRoles}
        roleWithCounts={serializedRoleWithCounts}
        notificationConfig={notificationConfig}
      />
    </div>
  )
}

function serializeTeamMember(member: TeamMember & { role: TeamRole | null }): SettingsTeamMember {
  return {
    ...member,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
    role: member.role ? serializeTeamRole(member.role) : null,
  }
}

function serializeTeamRole(role: TeamRole): SettingsTeamRole {
  return {
    ...role,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  }
}
