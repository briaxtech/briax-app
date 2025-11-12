import type { Prisma } from "@prisma/client"

import { getProjectStatusLabel, getProjectTypeLabel } from "@/lib/projects/constants"
import type { ProjectCalendarEntry } from "@/lib/projects/types"

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    client: { select: { id: true; name: true; contactEmail: true } }
    manager: { select: { id: true; name: true; email: true } }
  }
}>

export function projectToCalendarEntry(project: ProjectWithRelations): ProjectCalendarEntry {
  return {
    id: project.id,
    clientId: project.clientId,
    name: project.name,
    clientName: project.client?.name ?? "Sin cliente",
    clientEmail: project.client?.contactEmail ?? null,
    type: getProjectTypeLabel(project.type),
    rawType: project.type,
    status: project.status,
    statusLabel: getProjectStatusLabel(project.status),
    startDate: project.startDate,
    dueDate: project.dueDate,
    managerName: project.manager?.name ?? "No asignado",
    managerEmail: project.manager?.email ?? null,
    createdAt: project.createdAt,
  }
}
