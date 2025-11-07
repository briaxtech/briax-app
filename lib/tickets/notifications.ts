import { TicketStatus, TicketUpdate, TicketUpdateType, TicketWatcherType } from "@prisma/client"

import { prisma } from "@/lib/db"
import { sendProjectNotificationEmail } from "@/lib/email/resend"

const ticketStatusLabels: Record<TicketStatus, string> = {
  NEW: "Nuevo",
  IN_PROGRESS: "En progreso",
  WAITING_CLIENT: "Esperando cliente",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
}

const updateTypeLabels: Record<TicketUpdateType, string> = {
  NOTE: "Nota interna",
  STATUS_CHANGE: "Cambio de estado",
  INCIDENT: "Incidencia",
}

export async function notifyTicketClients(ticketId: string, update?: TicketUpdate) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      client: true,
      watchers: true,
    },
  })

  if (!ticket) return { skipped: true }

  const clientRecipients = ticket.watchers.filter((watcher) => watcher.type === TicketWatcherType.CLIENT).map((watcher) => watcher.email)
  if (clientRecipients.length === 0) {
    return { skipped: true }
  }

  const html = buildTicketEmailHtml(ticket, update)
  const subject = `[#${ticket.ticketNumber}] ${ticket.title} · ${ticketStatusLabels[ticket.status]}`

  const result = await sendProjectNotificationEmail({
    to: clientRecipients,
    subject,
    html,
  })

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { lastClientNotifAt: new Date() },
  })

  return result
}

function buildTicketEmailHtml(
  ticket: {
    ticketNumber: number
    title: string
    status: TicketStatus
    priority: string
    serviceArea: string | null
    environment: string | null
    client?: { name: string | null } | null
  },
  update?: TicketUpdate | null,
) {
  const messageBlock = update
    ? `<p style="margin:12px 0;font-size:14px;"><strong>${updateTypeLabels[update.type]}</strong><br/>${formatMessage(update.message)}</p>`
    : ""

  return `
    <div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#0f172a;">
      <p>Hola ${ticket.client?.name ?? "equipo"},</p>
      <p>Tenemos una actualización del ticket <strong>#${ticket.ticketNumber}</strong> (${ticket.title}).</p>
      <p><strong>Estado:</strong> ${ticketStatusLabels[ticket.status]} · <strong>Prioridad:</strong> ${ticket.priority}</p>
      ${ticket.serviceArea ? `<p><strong>Servicio:</strong> ${ticket.serviceArea}${ticket.environment ? ` · ${ticket.environment}` : ""}</p>` : ""}
      ${messageBlock}
      <p style="margin:24px 0 8px 0;">Puedes responder este correo o entrar al panel para seguir la conversación.</p>
      <p style="color:#475569;">Equipo Briax</p>
    </div>
  `
}

function formatMessage(message: string) {
  return escapeHtml(message).replace(/\n/g, "<br/>")
}

function escapeHtml(input: string) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
