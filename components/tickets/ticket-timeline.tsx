"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

const typeStyles: Record<string, string> = {
  NOTE: "bg-blue-500/15 text-blue-500",
  STATUS_CHANGE: "bg-emerald-500/15 text-emerald-500",
  INCIDENT: "bg-amber-500/15 text-amber-500",
}

type TimelineItem = {
  id: string
  type: string
  message: string
  public: boolean
  notifyClient: boolean
  previousStatus?: string | null
  nextStatus?: string | null
  createdAt: string
  author: { name?: string | null; email?: string | null } | null
}

export function TicketTimeline({ updates }: { updates: TimelineItem[] }) {
  if (updates.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavia no hay actualizaciones registradas.</p>
  }

  return (
    <div className="space-y-4">
      {updates.map((update, index) => (
        <div key={update.id} className="relative pl-6 pb-6 last:pb-0">
          {index !== updates.length - 1 ? <span className="absolute left-2 top-8 h-full w-px bg-border" /> : null}
          <span className={cn("absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-background", typeStyles[update.type] ?? "bg-muted")} />
          <div className="flex items-center gap-3">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", typeStyles[update.type] ?? "bg-muted text-muted-foreground")}>
              {update.type === "NOTE" ? "Nota" : update.type === "INCIDENT" ? "Incidencia" : "Cambio de estado"}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(update.createdAt), "PPPp", {
                locale: es,
              })}
            </span>
          </div>
          <p className="mt-2 text-sm text-foreground leading-relaxed whitespace-pre-line">{update.message}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {update.author?.name ? <span>{update.author.name}</span> : null}
            {update.previousStatus && update.nextStatus ? (
              <span>
                {update.previousStatus} → {update.nextStatus}
              </span>
            ) : null}
            {update.public ? <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">Visible al cliente</span> : null}
            {update.notifyClient ? <span className="rounded bg-secondary/20 px-2 py-0.5 text-secondary-foreground">Notificado</span> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
