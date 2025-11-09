import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"

const memberSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo invalido"),
  roleId: z.string().optional().nullable(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  phone: z.string().optional(),
  slackHandle: z.string().optional(),
  preferredChannel: z.string().optional(),
  availability: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  focusAreas: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isEscalationContact: z.boolean().optional(),
})

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      include: { role: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ members })
  } catch (error) {
    console.error("GET /api/team-members error:", error)
    return NextResponse.json({ message: "Error al obtener el equipo" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const data = memberSchema.parse(payload)

    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        email: data.email,
        location: data.location,
        timezone: data.timezone ?? "America/Argentina/Buenos_Aires",
        phone: data.phone,
        slackHandle: data.slackHandle,
        preferredChannel: data.preferredChannel,
        availability: data.availability,
        responsibilities: data.responsibilities ?? [],
        focusAreas: data.focusAreas ?? [],
        notes: data.notes,
        isEscalationContact: data.isEscalationContact ?? false,
        role: data.roleId ? { connect: { id: data.roleId } } : undefined,
      },
      include: { role: true },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error("POST /api/team-members error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "El correo ya existe en el equipo" }, { status: 409 })
    }
    return NextResponse.json({ message: "No se pudo crear el integrante" }, { status: 500 })
  }
}
