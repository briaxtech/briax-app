import { NextRequest, NextResponse } from "next/server"
import { Prisma, UserRole } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/db"

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  timezone: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const role = searchParams.get("role")

    const users = await prisma.user.findMany({
      where: role ? { role: role as UserRole } : undefined,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("GET /api/users error:", error)
    return NextResponse.json({ message: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const data = createUserSchema.parse(payload)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        timezone: data.timezone ?? "UTC",
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("POST /api/users error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos invalidos", issues: error.issues },
        { status: 400 },
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "El correo ya esta registrado" }, { status: 409 })
    }
    return NextResponse.json({ message: "Error al crear usuario" }, { status: 500 })
  }
}
