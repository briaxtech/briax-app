import { NextRequest, NextResponse } from "next/server"
import { ProjectStatus } from "@prisma/client"

import { prisma } from "@/lib/db"
import { getProjectStatusLabel, getProjectTypeLabel } from "@/lib/projects/constants"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const statusFilter = searchParams.get("status") as ProjectStatus | null
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const dateFilters =
      from || to
        ? {
            dueDate: {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            },
          }
        : undefined

    const projects = await prisma.project.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(dateFilters ?? {}),
      },
      include: {
        client: { select: { name: true, contactEmail: true } },
        manager: { select: { name: true, email: true } },
        updates: {
          select: { id: true, type: true, title: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { dueDate: "asc" },
    })

    return NextResponse.json({
      projects: projects.map((project) => ({
        id: project.id,
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
        updates: project.updates.map((update) => ({
          id: update.id,
          type: update.type,
          title: update.title,
          createdAt: update.createdAt,
        })),
      })),
    })
  } catch (error) {
    console.error("GET /api/projects error:", error)
    return NextResponse.json({ message: "Error al obtener proyectos" }, { status: 500 })
  }
}
