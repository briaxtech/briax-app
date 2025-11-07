import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/db"
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth/session"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "La contrasena es requerida" }),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { email, password } = loginSchema.parse(json)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: "Credenciales invalidas" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json({ message: "Credenciales invalidas" }, { status: 401 })
    }

    const token = await createSessionToken(user.id)

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }

    console.error("POST /api/auth/login error:", error)
    return NextResponse.json({ message: "No se pudo iniciar sesion" }, { status: 500 })
  }
}
