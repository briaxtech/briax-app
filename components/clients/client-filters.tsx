"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const statusOptions = [
  { value: "LEAD", label: "Prospecto" },
  { value: "ACTIVE", label: "Activo" },
  { value: "PAUSED", label: "En pausa" },
  { value: "CLOSED", label: "Cerrado" },
]

export function ClientFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "")
  }, [searchParams])

  const updateParam = (key: string, value?: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (value && value.length > 0) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const hasFilters = useMemo(() => {
    return ["status", "search"].some((param) => Boolean(searchParams.get(param)))
  }, [searchParams])

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("status")
    params.delete("search")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    setSearch("")
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-foreground">Filtros de clientes</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Estado</Label>
          <Select
            value={searchParams.get("status") ?? "all"}
            onValueChange={(value) => updateParam("status", value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Buscar</Label>
          <Input
            className="w-full"
            placeholder="Cliente, contacto o email"
            value={search}
            onChange={(event) => {
              const value = event.target.value
              setSearch(value)
              updateParam("search", value.trim().length > 0 ? value.trim() : null)
            }}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" disabled={!hasFilters} onClick={resetFilters}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}
