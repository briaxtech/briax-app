import { notFound } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const statusOrder = ["DISCOVERY", "IN_PROGRESS", "REVIEW", "PRODUCTION", "PAUSED", "CLOSED"] as const

const statusLabels: Record<string, string> = {
  DISCOVERY: "Descubrimiento",
  IN_PROGRESS: "En progreso",
  REVIEW: "Revision",
  PRODUCTION: "Produccion",
  PAUSED: "En pausa",
  CLOSED: "Cerrado",
}

const typeLabels: Record<string, string> = {
  website: "Sitio web",
  ecommerce: "E-commerce",
  automation: "Automatizacion",
  data: "Datos",
  support: "Soporte",
  consulting: "Consultoria",
}

const formatDate = (value: Date | null) => {
  if (!value) return "-"
  return value.toLocaleDateString("es-ES")
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      manager: { select: { id: true, name: true } },
      tickets: {
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true } } },
      },
      invoices: {
        orderBy: { issueDate: "desc" },
        include: { client: { select: { name: true } } },
      },
    },
  })

  if (!project) {
    notFound()
  }

  const currentStatusIndex = statusOrder.indexOf(project.status as (typeof statusOrder)[number])

  const timeline = statusOrder.map((status, index) => ({
    status,
    label: statusLabels[status],
    completed: index <= currentStatusIndex && project.status !== "PAUSED",
    current: index === currentStatusIndex,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground mt-2">
            Proyecto ID: {project.id} - Cliente: {project.client?.name ?? "Sin cliente"}
          </p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400">{statusLabels[project.status] ?? project.status}</Badge>
      </div>

      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Detail label="Tipo" value={typeLabels[project.type] ?? project.type} />
          <Detail label="Inicio" value={formatDate(project.startDate)} />
          <Detail label="Entrega estimada" value={formatDate(project.dueDate)} />
          <Detail label="Responsable" value={project.manager?.name ?? "No asignado"} />
        </div>
      </Card>

      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-6">Cronograma del proyecto</h3>
        <div className="flex items-center gap-4 overflow-x-auto">
          {timeline.map((step, index) => (
            <div key={step.status} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">{step.label}</p>
              </div>
              {index < timeline.length - 1 && (
                <div className={`w-12 h-1 mb-6 ${timeline[index + 1].completed ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 border-border bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Descripcion</h3>
          <p className="text-muted-foreground leading-relaxed">
            {project.description ?? "Sin descripcion registrada para este proyecto."}
          </p>
        </Card>
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Indicadores rapidos</h3>
          <div className="space-y-4">
            <Detail label="Tickets asociados" value={String(project.tickets.length)} />
            <Detail label="Facturas emitidas" value={String(project.invoices.length)} />
            <Detail label="Ultima actualizacion" value={formatDate(project.updatedAt)} />
          </div>
        </Card>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  )
}
