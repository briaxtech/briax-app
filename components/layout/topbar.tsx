"use client"

import { Search, Bell, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLogout } from "@/hooks/use-logout"

interface TopbarProps {
  userName: string
  userEmail: string
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const { logout, pending } = useLogout()
  const initials =
    userName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-40">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Busqueda rapida..." className="pl-10 bg-background border-input" />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" aria-label="Notificaciones">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold uppercase">
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
    </header>
  )
}
