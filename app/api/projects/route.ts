import { NextRequest, NextResponse } from "next/server"
import { ProjectStatus } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { projectToCalendarEntry } from "@/lib/projects/mappers"
import { projectFormSchema } from "@/lib/validation/project-form"

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
        client: { select: { id: true, name: true, contactEmail: true } },
        manager: { select: { id: true, name: true, email: true } },
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
        ...projectToCalendarEntry(project),
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

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const data = projectFormSchema.parse(payload)

    const dueDate = data.dueDate!

    const project = await prisma.project.create({
      data: {
        name: data.name,
        type: data.type,
        status: ProjectStatus.DISCOVERY,
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

    return NextResponse.json({ project: projectToCalendarEntry(project) }, { status: 201 })
  } catch (error) {
    console.error("POST /api/projects error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos invalidos", issues: error.issues },
        { status: 400 },
      )
    }
    return NextResponse.json({ message: "Error al crear el proyecto" }, { status: 500 })
  }
}
