import { notFound } from "next/navigation"

import { ClientDetailTabs } from "@/components/clients/client-detail-tabs"
import { EditClientDialog } from "@/components/clients/edit-client-dialog"
import { Card } from "@/components/ui/card"
import { prisma } from "@/lib/db"
import { serviceIdFromProjectType } from "@/lib/clients/service-templates"
import type { ClientFormValues } from "@/lib/validation/client-form"

export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  const clients = await prisma.client.findMany({ select: { id: true } })
  return clients.map((client) => ({ id: client.id }))
}

const clientStatusLabels: Record<string, string> = {
  LEAD: "Prospecto",
  ACTIVE: "Activo",
  PAUSED: "En pausa",
  CLOSED: "Cerrado",
}

const projectStatusLabels: Record<string, string> = {
  DISCOVERY: "Descubrimiento",
  IN_PROGRESS: "En progreso",
  REVIEW: "Revision",
  PRODUCTION: "Produccion",
  PAUSED: "En pausa",
  CLOSED: "Cerrado",
}

const projectTypeLabels: Record<string, string> = {
  website: "Sitio web",
  ecommerce: "E-commerce",
  automation: "Automatizacion",
  data: "Datos",
  support: "Soporte",
  consulting: "Consultoria",
}

const ticketStatusLabels: Record<string, string> = {
  NEW: "Nuevo",
  IN_PROGRESS: "En progreso",
  WAITING_CLIENT: "Esperando cliente",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
}

const ticketPriorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Critica",
}

const invoiceStatusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  PAID: "Pagada",
  OVERDUE: "Vencida",
}

const formatCurrency = (amount: number, currency: string) =>
  `${currency} ${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
      },
      tickets: {
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        orderBy: { issueDate: "desc" },
      },
      accesses: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!client) {
    notFound()
  }

  const clientInfo = {
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    phone: client.phone,
    country: client.country,
    industry: client.industry,
    status: client.status,
    statusLabel: clientStatusLabels[client.status] ?? client.status,
    notes: client.notes,
  }

  const projects = client.projects.map((project) => ({
    id: project.id,
    name: project.name,
    type: projectTypeLabels[project.type] ?? project.type,
    status: project.status,
    statusLabel: projectStatusLabels[project.status] ?? project.status,
    dueDate: project.dueDate ? project.dueDate.toISOString() : null,
  }))

  const tickets = client.tickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    statusLabel: ticketStatusLabels[ticket.status] ?? ticket.status,
    priorityLabel: ticketPriorityLabels[ticket.priority] ?? ticket.priority,
    createdAt: ticket.createdAt.toISOString(),
  }))

  const invoices = client.invoices.map((invoice) => ({
    id: invoice.id,
    number: invoice.id.slice(0, 6).toUpperCase(),
    amount: formatCurrency(invoice.amount, invoice.currency),
    statusLabel: invoiceStatusLabels[invoice.status] ?? invoice.status,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
  }))

  const accesses = client.accesses.map((access) => ({
    id: access.id,
    service: access.service,
    username: access.username,
    password: access.password,
    url: access.url,
    notes: access.notes,
    createdAt: access.createdAt.toISOString(),
    updatedAt: access.updatedAt.toISOString(),
  }))

  const serviceCodes = Array.from(
    new Set(
      client.projects
        .map((project) => serviceIdFromProjectType(project.type))
        .filter((code): code is string => Boolean(code)),
    ),
  )

  const formDefaultValues: ClientFormValues = {
    clientName: client.name,
    contactName: client.contactName ?? "",
    contactEmail: client.contactEmail ?? "",
    phone: client.phone ?? "",
    country: client.country ?? "",
    industry: client.industry ?? "",
    status: client.status,
    services: serviceCodes.length > 0 ? serviceCodes : [],
    notes: client.notes ?? "",
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
          <p className="text-muted-foreground mt-2">Cliente ID: {client.id}</p>
        </div>
        <EditClientDialog clientId={client.id} defaultValues={formDefaultValues} />
      </div>

      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <ClientDetailTabs
          clientId={client.id}
          client={clientInfo}
          projects={projects}
          tickets={tickets}
          invoices={invoices}
          accesses={accesses}
        />
      </Card>
    </div>
  )
}
