import { NextRequest, NextResponse } from "next/server"
import { Prisma, ProjectStatus } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getProjectStatusLabel, PROJECT_STATUS_ORDER } from "@/lib/projects/constants"
import { projectToCalendarEntry } from "@/lib/projects/mappers"
import { projectFormSchema } from "@/lib/validation/project-form"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const paramsSchema = z.object({
  id: z.string().min(1),
})

const statusOrder = PROJECT_STATUS_ORDER as readonly ProjectStatus[]

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  let projectId: string | null = null
  try {
    const resolvedParams = await context.params
    const { id } = paramsSchema.parse(resolvedParams)
    projectId = id

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },
        tickets: {
          orderBy: { createdAt: "desc" },
          include: { client: { select: { name: true } } },
        },
        invoices: {
          orderBy: { issueDate: "desc" },
          include: { client: { select: { name: true } } },
        },
        updates: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ message: "Proyecto no encontrado" }, { status: 404 })
    }

    const currentStatusIndex = Math.max(
      statusOrder.findIndex((status) => status === project.status),
      0,
    )

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        type: project.type,
        description: project.description,
        status: project.status,
        statusLabel: getProjectStatusLabel(project.status),
        startDate: project.startDate,
        dueDate: project.dueDate,
        client: project.client,
        manager: project.manager,
        timeline: statusOrder.map((status, index) => ({
          status,
          label: getProjectStatusLabel(status),
          completed:
            index < currentStatusIndex ||
            (project.status === ProjectStatus.CLOSED && status === ProjectStatus.CLOSED),
          current: index === currentStatusIndex,
        })),
      },
      tickets: project.tickets,
      invoices: project.invoices,
      updates: project.updates,
    })
  } catch (error) {
    console.error(`GET /api/projects/${projectId ?? "unknown"} error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Identificador invalido" }, { status: 400 })
    }
    return NextResponse.json({ message: "Error al obtener el proyecto" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  let projectId: string | null = null
  try {
    const resolvedParams = await context.params
    const { id } = paramsSchema.parse(resolvedParams)
    projectId = id

    const payload = await req.json()
    const data = projectFormSchema.parse(payload)

    const dueDate = data.dueDate!

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        description: data.description && data.description.length > 0 ? data.description : null,
        clientId: data.clientId,
        managerId: data.managerId ?? null,
        startDate: data.startDate ?? null,
        dueDate,
      },
      include: {
        client: { select: { id: true, name: true, contactEmail: true } },
        manager: { select: { id: true, name: true, email: true } },
      },
    })

    const currentStatusIndex = Math.max(statusOrder.indexOf(updatedProject.status), 0)

    return NextResponse.json({
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        type: updatedProject.type,
        description: updatedProject.description,
        status: updatedProject.status,
        statusLabel: getProjectStatusLabel(updatedProject.status),
        startDate: updatedProject.startDate,
        dueDate: updatedProject.dueDate,
        client: updatedProject.client
          ? { id: updatedProject.client.id, name: updatedProject.client.name }
          : null,
        manager: updatedProject.manager
          ? { id: updatedProject.manager.id, name: updatedProject.manager.name }
          : null,
        timeline: statusOrder.map((status, index) => ({
          status,
          label: getProjectStatusLabel(status),
          completed:
            index < currentStatusIndex ||
            (updatedProject.status === ProjectStatus.CLOSED && status === ProjectStatus.CLOSED),
          current: index === currentStatusIndex,
        })),
      },
      calendarEntry: projectToCalendarEntry(updatedProject),
    })
  } catch (error) {
    console.error(`PATCH /api/projects/${projectId ?? "unknown"} error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Proyecto no encontrado" }, { status: 404 })
    }
    return NextResponse.json({ message: "Error al actualizar el proyecto" }, { status: 500 })
  }
}
