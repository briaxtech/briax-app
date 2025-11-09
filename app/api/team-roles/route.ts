import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"

const roleSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio").max(60),
  color: z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Color invalido, usa formato HEX")
    .default("#2563EB"),
})

export async function GET() {
  try {
    const roles = await prisma.teamRole.findMany({
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ roles })
  } catch (error) {
    console.error("GET /api/team-roles error:", error)
    return NextResponse.json({ message: "Error al obtener roles" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const data = roleSchema.parse(payload)
    const role = await prisma.teamRole.create({ data })
    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error("POST /api/team-roles error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: "No se pudo crear el rol" }, { status: 500 })
  }
}
