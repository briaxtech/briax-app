import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/db"
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session"

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const session = await verifySessionToken(token)
  if (!session?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  if (!user) return null

  return user
})

export async function requireCurrentUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}
