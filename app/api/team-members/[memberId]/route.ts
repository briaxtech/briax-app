import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  roleId: z.string().nullable().optional(),
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

type Context = {
  params: { memberId: string }
}

export async function PATCH(req: NextRequest, context: Context) {
  const { memberId } = context.params
  try {
    const payload = await req.json()
    const { roleId, ...rest } = updateSchema.parse(payload)

    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        ...rest,
        role:
          roleId === undefined ? undefined : roleId ? { connect: { id: roleId } } : { disconnect: true },
      },
      include: { role: true },
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error(`PATCH /api/team-members/${memberId} error:`, error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos invalidos", issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: "No se pudo actualizar el integrante" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: Context) {
  const { memberId } = context.params
  try {
    await prisma.teamMember.delete({ where: { id: memberId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/team-members/${memberId} error:`, error)
    return NextResponse.json({ message: "No se pudo eliminar el integrante" }, { status: 500 })
  }
}
