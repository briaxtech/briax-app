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
      {/* Main content with proper spacing for sidebar and topbar */}
      <main className="ml-64 mt-16 p-6">{children}</main>
    </div>
  )
}
