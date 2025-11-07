"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Filter } from "lucide-react"
import { TicketPriority, TicketSource, TicketStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const statusOptions = [
  { value: TicketStatus.NEW, label: "Nuevo" },
  { value: TicketStatus.IN_PROGRESS, label: "En progreso" },
  { value: TicketStatus.WAITING_CLIENT, label: "Esperando cliente" },
  { value: TicketStatus.RESOLVED, label: "Resuelto" },
  { value: TicketStatus.CLOSED, label: "Cerrado" },
]

const priorityOptions = [
  { value: TicketPriority.LOW, label: "Baja" },
  { value: TicketPriority.MEDIUM, label: "Media" },
  { value: TicketPriority.HIGH, label: "Alta" },
  { value: TicketPriority.CRITICAL, label: "Critica" },
]

const sourceOptions = [
  { value: TicketSource.MANUAL, label: "Manual" },
  { value: TicketSource.CLIENT_PORTAL, label: "Portal cliente" },
  { value: TicketSource.AUTOMATION, label: "Automatizacion" },
  { value: TicketSource.MONITORING, label: "Monitoreo" },
]

export function TicketFilters() {
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParam("search", search.trim().length > 0 ? search.trim() : null)
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const hasFilters = useMemo(() => {
    return ["status", "priority", "source", "search"].some((param) => Boolean(searchParams.get(param)))
  }, [searchParams])

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("status")
    params.delete("priority")
    params.delete("source")
    params.delete("search")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-foreground">Filtros rapidos</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Estado</Label>
          <Select value={searchParams.get("status") ?? "all"} onValueChange={(value) => updateParam("status", value === "all" ? null : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado" />
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
          <Label className="text-xs text-muted-foreground">Prioridad</Label>
          <Select value={searchParams.get("priority") ?? "all"} onValueChange={(value) => updateParam("priority", value === "all" ? null : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Origen</Label>
          <Select value={searchParams.get("source") ?? "all"} onValueChange={(value) => updateParam("source", value === "all" ? null : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Origen" />
            </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los origenes</SelectItem>
                  {sourceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Buscar</Label>
          <Input className="w-full" placeholder="Cliente, ticket o palabra clave" value={search} onChange={(event) => setSearch(event.target.value)} />
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
