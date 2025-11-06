"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, FolderOpen, Ticket, FileText, Users2, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    label: "Panel",
    href: "/dashboard",
    icon: BarChart3,
    roles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "DEVELOPER", "SUPPORT", "FINANCE", "PARTNER_MANAGER"],
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: Users,
    roles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "SUPPORT"],
  },
  {
    label: "Proyectos",
    href: "/projects",
    icon: FolderOpen,
    roles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "DEVELOPER"],
  },
  {
    label: "Tickets",
    href: "/tickets",
    icon: Ticket,
    roles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "DEVELOPER", "SUPPORT"],
  },
  {
    label: "Facturas",
    href: "/invoices",
    icon: FileText,
    roles: ["OWNER", "ADMIN", "FINANCE"],
  },
  {
    label: "Socios",
    href: "/partners",
    icon: Users2,
    roles: ["OWNER", "ADMIN", "PARTNER_MANAGER"],
  },
  {
    label: "Configuracion",
    href: "/settings",
    icon: Settings,
    roles: ["OWNER", "ADMIN"],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">Briax</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </aside>
  )
}
