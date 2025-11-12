"use client"

import { useState, type ComponentProps } from "react"
import type { TeamMember, TeamRole } from "@prisma/client"
import { Plus } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import { TeamDirectory } from "@/components/settings/team-directory"
import { TeamMemberDialog } from "@/components/settings/team-member-dialog"
import { TeamRoleManager } from "@/components/settings/team-role-manager"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { AutomationPreferences } from "@/components/settings/automation-preferences"

export type SettingsTeamRole = Omit<TeamRole, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}

export type SettingsTeamMember = Omit<TeamMember, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
  role: SettingsTeamRole | null
}

export type SettingsRoleWithCounts = SettingsTeamRole & { memberCount: number }

type SettingsTabsProps = {
  teamMembers: SettingsTeamMember[]
  teamRoles: SettingsTeamRole[]
  roleWithCounts: SettingsRoleWithCounts[]
  notificationConfig: ComponentProps<typeof NotificationSettings>["config"]
}

const TAB_OPTIONS = [
  { value: "team", label: "Equipo" },
  { value: "roles", label: "Roles" },
  { value: "notifications", label: "Notificaciones" },
  { value: "automations", label: "Automatizaciones" },
]

export function SettingsTabs({ teamMembers, teamRoles, roleWithCounts, notificationConfig }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("team")
  const directoryMembers = teamMembers as React.ComponentProps<typeof TeamDirectory>["members"]
  const directoryRoles = teamRoles.map(({ id, name, color }) => ({ id, name, color })) as React.ComponentProps<
    typeof TeamDirectory
  >["roles"]
  const managerRoles = roleWithCounts as React.ComponentProps<typeof TeamRoleManager>["roles"]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="sm:hidden space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sección</p>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una sección" />
          </SelectTrigger>
          <SelectContent>
            {TAB_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block overflow-x-auto pb-1">
        <TabsList className="w-full min-w-[24rem] flex-nowrap gap-2 rounded-xl bg-muted/50 p-2">
          {TAB_OPTIONS.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="flex-none rounded-lg px-4 py-2 text-sm sm:flex-1"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="team" className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Equipo interno</h2>
            <p className="text-sm text-muted-foreground">
              Consulta responsables, focos y datos de contacto para coordinar acciones o enviar avisos.
            </p>
          </div>
          <TeamMemberDialog
            roles={teamRoles.map(({ id, name }) => ({ id, name }))}
            mode="create"
            trigger={
              <Button className="gap-2">
                <Plus className="size-4" />
                Nuevo integrante
              </Button>
            }
          />
        </div>
        <TeamDirectory members={directoryMembers} roles={directoryRoles} />
      </TabsContent>

      <TabsContent value="roles">
        <TeamRoleManager roles={managerRoles} />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationSettings config={notificationConfig} />
      </TabsContent>

      <TabsContent value="automations">
        <AutomationPreferences />
      </TabsContent>
    </Tabs>
  )
}
