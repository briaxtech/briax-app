"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, systemTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const currentTheme = theme === "system" ? systemTheme : theme

  const handleToggle = () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark"
    setTheme(nextTheme ?? "light")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label="Cambiar tema"
      className="text-muted-foreground hover:text-foreground"
    >
      {mounted ? (
        currentTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  )
}
