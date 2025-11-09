import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"

const updateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/).optional(),
})

type Context = {
  params: { roleId: string }
}

export async function PATCH(req: NextRequest, context: Context) {
  const { roleId } = context.params
  try {
    const payload = await req.json()
    const data = updateSchema.parse(payload)

    const role = await prisma.teamRole.update({
      where: { id: roleId },
      data,
    })

    return NextResponse.json({ role })
  } catch (error) {
    console.error(`PATCH /api/team-roles/${roleId} error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: "No se pudo actualizar el rol" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: Context) {
  const { roleId } = context.params
  try {
    await prisma.teamRole.delete({ where: { id: roleId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/team-roles/${roleId} error:`, error)
    return NextResponse.json({ message: "No se pudo eliminar el rol" }, { status: 500 })
  }
}
