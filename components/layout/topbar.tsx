"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, LogOut, Loader2, Menu, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useLogout } from "@/hooks/use-logout"
import { navigationItems } from "./sidebar"
import { cn } from "@/lib/utils"

interface TopbarProps {
  userName: string
  userEmail: string
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const { logout, pending } = useLogout()
  const pathname = usePathname()
  const initials =
    userName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-card/95 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6 lg:left-64">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navegacion principal</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                    <BarChart3 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Briax</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </div>
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                  <div className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </div>
                </nav>
                <div className="border-t border-border p-4">
                  <Button
                    onClick={logout}
                    disabled={pending}
                    variant="outline"
                    className="w-full items-center justify-center gap-2"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    <span>{pending ? "Cerrando..." : "Cerrar sesion"}</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Busqueda rapida..."
              className="w-full rounded-full border-input bg-background/80 pl-10 pr-4 text-sm shadow-none focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 sm:border-l sm:border-border sm:pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground leading-none">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
              {initials}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={logout}
              disabled={pending}
              aria-label="Cerrar sesion"
            >
              {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
