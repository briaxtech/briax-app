import { NextRequest, NextResponse } from "next/server"
import { ClientStatus, Prisma } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { SERVICE_TEMPLATES } from "@/lib/clients/service-templates"
import { clientFormSchema } from "@/lib/validation/client-form"
import { serviceIdFromProjectType } from "@/lib/clients/service-templates"

const paramsSchema = z.object({
  id: z.string().min(1),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = paramsSchema.parse(params)

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
        },
        tickets: {
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          orderBy: { issueDate: "desc" },
        },
        _count: {
          select: { projects: true, tickets: true, invoices: true },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }

    const services = projectToServiceCodes(client.projects)

    return NextResponse.json({ client: { ...client, services } })
  } catch (error) {
    console.error(`GET /api/clients/${params?.id} error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Identificador invalido" }, { status: 400 })
    }
    return NextResponse.json({ message: "Error al obtener el cliente" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = paramsSchema.parse(params)
    const payload = await req.json()
    const data = clientFormSchema.parse(payload)

    const updatedClient = await prisma.$transaction(async (tx) => {
      const client = await tx.client.update({
        where: { id },
        data: {
          name: data.clientName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          phone: data.phone ?? null,
          country: data.country,
          industry: data.industry,
          status: data.status as ClientStatus,
          notes: data.notes ?? null,
        },
      })

      const existingProjects = await tx.project.findMany({ where: { clientId: id } })
      const existingTypes = new Set(existingProjects.map((project) => project.type))

      const templates = data.services
        .map((serviceId) => SERVICE_TEMPLATES[serviceId])
        .filter(Boolean)

      await Promise.all(
        templates
          .filter((template) => !existingTypes.has(template.type))
          .map((template) =>
            tx.project.create({
              data: {
                name: template.name,
                type: template.type,
                description: template.description,
                status: "DISCOVERY",
                clientId: id,
              },
            }),
          ),
      )

      return client
    })

    return NextResponse.json({ client: updatedClient })
  } catch (error) {
    console.error(`PATCH /api/clients/${params?.id} error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos invalidos", issues: error.issues },
        { status: 400 },
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }
    return NextResponse.json({ message: "Error al actualizar el cliente" }, { status: 500 })
  }
}

function projectToServiceCodes(projects: Array<{ type: string }>) {
  const codes = new Set<string>()
  projects.forEach((project) => {
    const serviceId = serviceIdFromProjectType(project.type)
    if (serviceId) codes.add(serviceId)
  })
  return Array.from(codes)
}
