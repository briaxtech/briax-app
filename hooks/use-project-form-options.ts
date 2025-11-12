"use client"

import { useEffect, useState } from "react"

export type ProjectFormOption = {
  id: string
  label: string
  meta?: string | null
}

type UseProjectFormOptionsResult = {
  clients: ProjectFormOption[]
  managers: ProjectFormOption[]
  loading: boolean
  reload: () => void
}

export function useProjectFormOptions(active: boolean): UseProjectFormOptionsResult {
  const [clients, setClients] = useState<ProjectFormOption[]>([])
  const [managers, setManagers] = useState<ProjectFormOption[]>([])
  const [loading, setLoading] = useState(false)
  const [shouldReload, setShouldReload] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!active) return
    if (hasLoaded && !shouldReload) return

    const controller = new AbortController()

    const load = async () => {
      try {
        setLoading(true)
        const [clientsRes, managersRes] = await Promise.all([
          fetch("/api/clients", { signal: controller.signal }),
          fetch("/api/users?role=PROJECT_MANAGER", { signal: controller.signal }),
        ])

        if (!clientsRes.ok || !managersRes.ok) {
          throw new Error("No se pudieron obtener las opciones de formulario")
        }

        const clientsBody = await clientsRes.json()
        const managersBody = await managersRes.json()

        setClients(
          (clientsBody.clients ?? []).map((client: { id: string; name: string; contactName?: string | null }) => ({
            id: client.id,
            label: client.name,
            meta: client.contactName ?? null,
          })),
        )
        setManagers(
          (managersBody.users ?? []).map((user: { id: string; name: string; email?: string | null }) => ({
            id: user.id,
            label: user.name,
            meta: user.email ?? null,
          })),
        )
        setHasLoaded(true)
      } catch (error) {
        if (controller.signal.aborted) return
        console.error("useProjectFormOptions error", error)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setShouldReload(false)
        }
      }
    }

    load()

    return () => controller.abort()
  }, [active, hasLoaded, shouldReload])

  return {
    clients,
    managers,
    loading,
    reload: () => setShouldReload(true),
  }
}
