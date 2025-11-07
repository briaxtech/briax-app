import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { clientAccessFormSchema } from "@/lib/validation/client-access-form"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const sanitizeAccess = (access: {
  id: string
  service: string
  username: string | null
  password: string | null
  url: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}) => ({
  id: access.id,
  service: access.service,
  username: access.username,
  password: access.password,
  url: access.url,
  notes: access.notes,
  createdAt: access.createdAt,
  updatedAt: access.updatedAt,
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accesses = await prisma.clientAccess.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      accesses: accesses.map(sanitizeAccess),
    })
  } catch (error) {
    console.error("GET /api/clients/[id]/accesses error:", error)
    return NextResponse.json({ message: "Error al obtener accesos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const payload = clientAccessFormSchema.parse(body)

    const clientExists = await prisma.client.count({ where: { id: params.id } })
    if (!clientExists) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }

    const access = await prisma.clientAccess.create({
      data: {
        clientId: params.id,
        service: payload.service.trim(),
        username: payload.username?.trim() ? payload.username.trim() : null,
        password: payload.password?.length ? payload.password : null,
        url: payload.url?.trim() ? payload.url.trim() : null,
        notes: payload.notes?.trim() ? payload.notes.trim() : null,
      },
    })

    return NextResponse.json({ access: sanitizeAccess(access) }, { status: 201 })
  } catch (error) {
    console.error("POST /api/clients/[id]/accesses error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: "Error al guardar el acceso" }, { status: 500 })
  }
}
