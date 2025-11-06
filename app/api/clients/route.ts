import { NextRequest, NextResponse } from "next/server"
import { ClientStatus, Prisma, ProjectStatus } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { SERVICE_TEMPLATES } from "@/lib/clients/service-templates"
import { clientFormSchema } from "@/lib/validation/client-form"

const statusLabels: Record<ClientStatus, string> = {
  LEAD: "Prospecto",
  ACTIVE: "Activo",
  PAUSED: "En pausa",
  CLOSED: "Cerrado",
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const statusFilter = searchParams.get("status")

    const where: Prisma.ClientWhereInput | undefined = statusFilter
      ? { status: statusFilter as ClientStatus }
      : undefined

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { projects: true, tickets: true, invoices: true } },
      },
    })

    return NextResponse.json({
      clients: clients.map((client) => ({
        id: client.id,
        name: client.name,
        contactName: client.contactName,
        contactEmail: client.contactEmail,
        status: client.status,
        statusLabel: client.status in statusLabels ? statusLabels[client.status] : client.status,
        createdAt: client.createdAt,
        phone: client.phone,
        country: client.country,
        industry: client.industry,
        notes: client.notes,
        counts: {
          projects: client._count.projects,
          tickets: client._count.tickets,
          invoices: client._count.invoices,
        },
      })),
    })
  } catch (error) {
    console.error("GET /api/clients error:", error)
    return NextResponse.json({ message: "Error al obtener clientes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const data = clientFormSchema.parse(payload)

    const createdClient = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name: data.clientName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          phone: data.phone ?? null,
          country: data.country,
          industry: data.industry,
          notes: data.notes ?? null,
          status: data.status as ClientStatus,
          timezone: null,
        },
      })

      const projectPayloads = data.services
        .map((serviceId) => SERVICE_TEMPLATES[serviceId])
        .filter(Boolean)

      if (projectPayloads.length > 0) {
        await Promise.all(
          projectPayloads.map((project) =>
            tx.project.create({
              data: {
                name: project.name,
                type: project.type,
                status: ProjectStatus.DISCOVERY,
                description: project.description,
                clientId: client.id,
              },
            }),
          ),
        )
      }

      return client
    })

    return NextResponse.json({ client: createdClient }, { status: 201 })
  } catch (error) {
    console.error("POST /api/clients error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos invalidos", issues: error.issues },
        { status: 400 },
      )
    }
    return NextResponse.json({ message: "Error al crear cliente" }, { status: 500 })
  }
}
