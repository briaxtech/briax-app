import type { ReactNode } from "react"

import { requireCurrentUser } from "@/lib/auth/current-user"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

export async function MainLayout({ children }: { children: ReactNode }) {
  const user = await requireCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar userName={user.name} userEmail={user.email} />
      {/* Main content spacing adapts per breakpoint */}
      <main className="px-4 pb-10 pt-20 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-24">{children}</main>
    </div>
  )
}
