"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function useLogout() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const logout = () => {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" })
      router.replace("/login")
      router.refresh()
    })
  }

  return { logout, pending }
}
