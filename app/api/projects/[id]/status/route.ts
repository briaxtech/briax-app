import { NextRequest, NextResponse } from "next/server"
import { ProjectStatus, ProjectUpdateType } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { sendProjectNotificationEmail } from "@/lib/email/resend"
import { getProjectStatusLabel } from "@/lib/projects/constants"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const paramsSchema = z.object({
  id: z.string().min(1),
})

const statusSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
  note: z.string().max(500).optional(),
  authorName: z.string().max(80).optional(),
  authorEmail: z.string().email().optional(),
  notifyTeam: z.boolean().default(false),
})

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  let projectId: string | null = null
  try {
    const resolvedParams = await context.params
    const { id } = paramsSchema.parse(resolvedParams)
    projectId = id
    const payload = await req.json()
    const data = statusSchema.parse(payload)

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

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { status: data.status },
    })

    const statusLabel = getProjectStatusLabel(data.status)

    const updateRecord = await prisma.projectUpdate.create({
      data: {
        projectId: id,
        type: ProjectUpdateType.STATUS_CHANGE,
        title: `Estado actualizado a ${statusLabel}`,
        message: data.note ?? `El proyecto cambio a estado ${statusLabel}`,
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

      const html = [
        `<p>El proyecto <strong>${project.name}</strong> cambio de estado a <strong>${statusLabel}</strong>.</p>`,
        data.note ? `<p><em>${data.note}</em></p>` : "",
        data.authorName ? `<p>Actualizado por ${data.authorName}</p>` : "",
      ].join("")

      try {
        await sendProjectNotificationEmail({
          to: recipients,
          subject: `Estado actualizado: ${project.name}`,
          html,
        })
      } catch (emailError) {
        console.error("Error enviando notificacion de cambio de estado:", emailError)
      }
    }

    return NextResponse.json({
      project: {
        ...updatedProject,
        statusLabel,
      },
      update: updateRecord,
    })
  } catch (error) {
    console.error(`PATCH /api/projects/${projectId ?? "unknown"}/status error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos invalidos", issues: error.issues },
        { status: 400 },
      )
    }
    return NextResponse.json({ message: "Error al actualizar el estado" }, { status: 500 })
  }
}
