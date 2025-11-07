import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; accessId: string } }) {
  try {
    const deleted = await prisma.clientAccess.deleteMany({
      where: { id: params.accessId, clientId: params.id },
    })

    if (deleted.count === 0) {
      return NextResponse.json({ message: "Acceso no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/clients/[id]/accesses/[accessId] error:", error)
    return NextResponse.json({ message: "Error al eliminar el acceso" }, { status: 500 })
  }
}
