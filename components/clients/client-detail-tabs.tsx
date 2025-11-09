"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import { ClientAccessSection } from "./client-access-section"

type TabType = "overview" | "projects" | "tickets" | "invoices" | "services" | "accesses"

interface ClientInfo {
  contactName: string | null
  contactEmail: string | null
  phone: string | null
  country: string | null
  industry: string | null
  status: string
  statusLabel: string
  notes: string | null
}

interface ProjectInfo {
  id: string
  name: string
  type: string
  status: string
  statusLabel: string
  dueDate: string | null
}

interface TicketInfo {
  id: string
  title: string
  statusLabel: string
  priorityLabel: string
  createdAt: string
}

interface InvoiceInfo {
  id: string
  number: string
  amount: string
  statusLabel: string
  issueDate: string
  dueDate: string | null
}

interface AccessInfo {
  id: string
  service: string
  username: string | null
  password: string | null
  url: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface ClientDetailTabsProps {
  clientId: string
  client: ClientInfo
  projects: ProjectInfo[]
  tickets: TicketInfo[]
  invoices: InvoiceInfo[]
  accesses: AccessInfo[]
}

const serviceIconColors = ["bg-primary/15", "bg-secondary/20", "bg-muted/30"]

const projectStatusColors: Record<string, string> = {
  DISCOVERY: "bg-blue-500/20 text-blue-400",
  IN_PROGRESS: "bg-purple-500/20 text-purple-400",
  REVIEW: "bg-yellow-500/20 text-yellow-400",
  PRODUCTION: "bg-green-500/20 text-green-400",
  PAUSED: "bg-orange-500/20 text-orange-400",
  CLOSED: "bg-red-500/20 text-red-400",
}

const formatDate = (value: string | null) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("es-ES")
}

export function ClientDetailTabs({ clientId, client, projects, tickets, invoices, accesses }: ClientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Resumen" },
    { id: "projects", label: "Proyectos" },
    { id: "tickets", label: "Tickets" },
    { id: "invoices", label: "Facturas" },
    { id: "services", label: "Servicios" },
    { id: "accesses", label: "Accesos" },
  ]

  const serviceCards = projects.map((project, index) => ({
    id: project.id,
    title: project.name,
    type: project.type,
    statusLabel: project.statusLabel,
    dueDate: project.dueDate ? formatDate(project.dueDate) : "-",
    color: serviceIconColors[index % serviceIconColors.length],
  }))

  const clientStatusColors: Record<string, string> = {
    LEAD: "bg-blue-500/20 text-blue-400",
    ACTIVE: "bg-green-500/20 text-green-400",
    PAUSED: "bg-yellow-500/20 text-yellow-400",
    CLOSED: "bg-red-500/20 text-red-400",
  }

  return (
    <div className="space-y-6">
      {/* Navegacion de pestanas */}
      <div className="border-b border-border">
        <div
          className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-0"
          aria-label="Navegacion de pestañas del cliente"
        >
          <div className="flex gap-1 whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-foreground"
                    : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="px-4 pb-2 text-xs text-muted-foreground sm:hidden">Desliza para ver todas las secciones.</p>
      </div>

      {/* Contenido */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailCard label="Contacto principal" value={client.contactName ?? "Sin definir"} />
            <DetailCard label="Correo electronico" value={client.contactEmail ?? "Sin definir"} />
            <DetailCard label="Telefono" value={client.phone ?? "Sin definir"} />
            <DetailCard label="Pais" value={client.country ?? "Sin definir"} />
            <DetailCard label="Sector" value={client.industry ?? "Sin definir"} />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Estado</p>
              <Badge className={clientStatusColors[client.status] ?? "bg-muted text-muted-foreground"}>
                {client.statusLabel}
              </Badge>
            </div>
            {client.notes ? (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Notas</p>
                <p className="text-sm text-foreground leading-relaxed">{client.notes}</p>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === "projects" && (
          <div className="grid gap-4">
            {projects.length === 0 ? (
              <EmptyCopy>El cliente aun no tiene proyectos asignados.</EmptyCopy>
            ) : (
              projects.map((project) => (
                <Card key={project.id} className="p-4 border-border bg-card/50 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">Tipo: {project.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-muted text-muted-foreground">Entrega: {formatDate(project.dueDate)}</Badge>
                      <Badge className={projectStatusColors[project.status] ?? "bg-muted text-muted-foreground"}>
                        {project.statusLabel}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="grid gap-4">
            {tickets.length === 0 ? (
              <EmptyCopy>No existen tickets asociados.</EmptyCopy>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="p-4 border-border bg-card/50 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{ticket.title}</h3>
                      <p className="text-xs text-muted-foreground">Creado: {formatDate(ticket.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-muted text-muted-foreground">{ticket.priorityLabel}</Badge>
                      <Badge>{ticket.statusLabel}</Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="grid gap-4">
            {invoices.length === 0 ? (
              <EmptyCopy>No hay facturas emitidas para este cliente.</EmptyCopy>
            ) : (
              invoices.map((invoice) => (
                <Card key={invoice.id} className="p-4 border-border bg-card/50 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Factura {invoice.number}</h3>
                      <p className="text-sm text-muted-foreground">
                        Emision: {formatDate(invoice.issueDate)} - Vence: {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-muted text-muted-foreground">{invoice.amount}</Badge>
                      <Badge>{invoice.statusLabel}</Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "services" && (
          <div className="grid gap-4 md:grid-cols-2">
            {serviceCards.length === 0 ? (
              <div className="md:col-span-2">
                <EmptyCopy>No hay servicios activos asociados al cliente.</EmptyCopy>
              </div>
            ) : (
              serviceCards.map((service) => (
                <Card key={service.id} className="p-4 border-border bg-card/50 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 h-10 w-10 rounded-md ${service.color}`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-foreground">{service.title}</h3>
                        <Badge>{service.statusLabel}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{service.type}</p>
                      <p className="text-xs text-muted-foreground">Entrega estimada: {service.dueDate}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "accesses" && <ClientAccessSection clientId={clientId} initialAccesses={accesses} />}
      </div>
    </div>
  )
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  )
}

function EmptyCopy({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}
