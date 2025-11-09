"use client"

import { useMemo, useState } from "react"
import { Clock, Mail, MapPin, MessageSquare, Phone, Search, ChevronDown } from "lucide-react"
import type { TeamMember, TeamRole } from "@prisma/client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TeamMemberDialog } from "@/components/settings/team-member-dialog"

const ROLE_FILTER_ALL = "all"

type DirectoryMember = TeamMember & {
  role: Pick<TeamRole, "id" | "name" | "color"> | null
}

type TeamDirectoryProps = {
  members: DirectoryMember[]
  roles: Array<Pick<TeamRole, "id" | "name" | "color">>
}

export function TeamDirectory({ members, roles }: TeamDirectoryProps) {
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>(ROLE_FILTER_ALL)

  const normalizedQuery = query.trim().toLowerCase()

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (roleFilter !== ROLE_FILTER_ALL && member.role?.id !== roleFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const haystack = [
        member.name,
        member.email,
        member.role?.name,
        member.location,
        member.timezone,
        (member.focusAreas ?? []).join(" "),
        (member.responsibilities ?? []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [members, normalizedQuery, roleFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, foco o rol"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="w-full md:w-60">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ROLE_FILTER_ALL}>Todos los roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No encontramos integrantes con ese criterio. Restablecé los filtros para ver todo el equipo.
        </div>
      ) : (
        <Accordion type="multiple" className="rounded-xl border border-border bg-card">
          {filteredMembers.map((member) => (
            <AccordionItem key={member.id} value={member.id} className="group/row">
              <AccordionTrigger
                showIcon={false}
                className="flex w-full items-center gap-4 rounded-none border-none bg-transparent px-4 py-3 text-left text-base font-medium transition-colors hover:bg-muted/80 hover:no-underline dark:hover:bg-muted/30"
              >
                <div className="flex flex-1 flex-wrap items-center gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <p className="font-semibold text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
                    {member.role ? (
                      <RoleBadge role={member.role} />
                    ) : (
                      <Badge variant="outline">Sin rol</Badge>
                    )}
                    {member.isEscalationContact && (
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                        Escalación
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <TeamMemberDialog
                    roles={roles}
                    member={member}
                    mode="edit"
                    trigger={
                      <Button asChild variant="ghost" size="sm" className="text-xs font-medium">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.stopPropagation()
                            }
                          }}
                          className="outline-none"
                        >
                          Editar
                        </span>
                      </Button>
                    }
                  />
                  <span className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-200 group-data-[state=open]/row:rotate-180 group-hover:bg-muted/30 group-hover:border-border/70">
                    <ChevronDown className="size-4 text-current" strokeWidth={1.8} />
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4 rounded-lg border border-border/70 bg-background/80 p-4 text-sm sm:grid-cols-2">
                  <InfoLine icon={MapPin} label="Ubicación" value={formatLocation(member)} />
                  <InfoLine icon={Clock} label="Horario" value={member.availability ?? "Por definir"} />
                  <InfoLine icon={Phone} label="Contacto" value={member.phone ?? "No registrado"} />
                  <InfoLine icon={Mail} label="Preferencia" value={member.preferredChannel ?? "Email"} />
                  {member.slackHandle && (
                    <InfoLine icon={MessageSquare} label="Slack" value={member.slackHandle} />
                  )}
                </div>

                {member.responsibilities?.length ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Responsabilidades clave
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {member.responsibilities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {member.focusAreas?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.focusAreas.map((area) => (
                      <Badge key={area} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {member.notes && (
                  <p className="mt-4 rounded-lg border border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                    {member.notes}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}

type RoleBadgeProps = {
  role: Pick<TeamRole, "name" | "color">
}

function RoleBadge({ role }: RoleBadgeProps) {
  const backgroundColor = hexToRgba(role.color ?? "#334155", 0.15)
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
      style={{
        borderColor: role.color ?? "#cbd5f5",
        backgroundColor,
        color: role.color ?? "#334155",
      }}
    >
      <span
        className="inline-block size-2 rounded-full"
        style={{ backgroundColor: role.color ?? "#94a3b8" }}
      />
      {role.name}
    </span>
  )
}

type InfoLineProps = {
  icon: typeof Mail
  label: string
  value: string
}

function InfoLine({ icon: Icon, label, value }: InfoLineProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 size-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={cn("text-sm text-foreground")}>{value}</span>
      </div>
    </div>
  )
}

function formatLocation(member: DirectoryMember) {
  if (member.location) {
    return `${member.location} · ${member.timezone?.replace(/_/g, " ") ?? ""}`.trim()
  }
  return member.timezone?.replace(/_/g, " ") ?? "Sin datos"
}

function hexToRgba(hex: string, alpha: number) {
  const sanitized = hex?.replace("#", "") ?? ""
  const full = sanitized.length === 3 ? sanitized.split("").map((char) => char + char).join("") : sanitized
  const parsed = parseInt(full, 16)
  const fallback = parseInt("2563EB", 16)
  const bigint = Number.isNaN(parsed) ? fallback : parsed
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
