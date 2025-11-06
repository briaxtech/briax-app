import { NextRequest, NextResponse } from "next/server"
import { ProjectUpdateType } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { sendProjectNotificationEmail } from "@/lib/email/resend"

const paramsSchema = z.object({
  id: z.string().min(1),
})

const createUpdateSchema = z.object({
  type: z.nativeEnum(ProjectUpdateType).default(ProjectUpdateType.NOTE),
  title: z.string().max(120).optional(),
  message: z.string().min(3),
  authorName: z.string().max(80).optional(),
  authorEmail: z.string().email().optional(),
  notifyTeam: z.boolean().default(false),
})

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  let projectId: string | null = null
  try {
    const resolvedParams = await context.params
    const { id } = paramsSchema.parse(resolvedParams)
    projectId = id

    const updates = await prisma.projectUpdate.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ updates })
  } catch (error) {
    console.error(`GET /api/projects/${projectId ?? "unknown"}/updates error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Identificador invalido" }, { status: 400 })
    }
    return NextResponse.json({ message: "Error al obtener las actualizaciones" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  let projectId: string | null = null
  try {
    const resolvedParams = await context.params
    const { id } = paramsSchema.parse(resolvedParams)
    projectId = id
    const payload = await req.json()
    const data = createUpdateSchema.parse(payload)

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: { select: { email: true, name: true } },
        client: { select: { contactEmail: true, name: true } },
      },
    })

    if (!project) {
      return NextResponse.json({ message: "Proyecto no encontrado" }, { status: 404 })
    }

    const created = await prisma.projectUpdate.create({
      data: {
        projectId: id,
        type: data.type,
        title: data.title,
        message: data.message,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        notifyTeam: data.notifyTeam,
      },
    })

    if (data.notifyTeam) {
      const recipients = [
        project.manager?.email,
        project.client?.contactEmail,
        data.authorEmail,
      ].filter((email): email is string => Boolean(email))

      const subject = data.title
        ? `[Proyecto] ${data.title}`
        : `Actualizacion de proyecto ${project.name}`

      const html = [
        `<p>Se registro una nueva actualizacion para el proyecto <strong>${project.name}</strong>.</p>`,
        `<p><em>${data.message}</em></p>`,
        data.authorName ? `<p>Autor: ${data.authorName}</p>` : "",
      ].join("")

      try {
        await sendProjectNotificationEmail({
          to: recipients,
          subject,
          html,
        })
      } catch (emailError) {
        console.error("Error enviando notificacion de proyecto:", emailError)
      }
    }

    return NextResponse.json({ update: created }, { status: 201 })
  } catch (error) {
    console.error(`POST /api/projects/${projectId ?? "unknown"}/updates error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos invalidos", issues: error.issues },
        { status: 400 },
      )
    }
    return NextResponse.json({ message: "Error al crear la actualizacion" }, { status: 500 })
  }
}
