import { NextResponse } from "next/server"
import { ProjectStatus } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getProjectStatusLabel, PROJECT_STATUS_ORDER } from "@/lib/projects/constants"

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
