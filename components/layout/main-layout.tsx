import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      {/* Main content with proper spacing for sidebar and topbar */}
      <main className="ml-64 mt-16 p-6">{children}</main>
    </div>
  )
}
