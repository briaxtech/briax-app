import { randomUUID } from "node:crypto"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { getProjectStatusLabel } from "@/lib/projects/constants"

const DEFAULT_LIMITS = {
  clients: 12,
  projects: 18,
  tickets: 15,
  invoices: 12,
} as const

async function buildAssistantContext() {
  const [clients, projects, tickets, invoices] = await Promise.all([
    prisma.client.findMany({
      orderBy: { updatedAt: "desc" },
      take: DEFAULT_LIMITS.clients,
      select: {
        id: true,
        name: true,
        status: true,
        industry: true,
        timezone: true,
        notes: true,
        updatedAt: true,
      },
    }),
    prisma.project.findMany({
      orderBy: [
        { dueDate: "asc" },
        { updatedAt: "desc" },
      ],
      take: DEFAULT_LIMITS.projects,
      select: {
        id: true,
        name: true,
        status: true,
        dueDate: true,
        startDate: true,
        type: true,
        client: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },
        updatedAt: true,
      },
    }),
    prisma.ticket.findMany({
      where: { status: { in: ["NEW", "IN_PROGRESS", "WAITING_CLIENT"] } },
      orderBy: { createdAt: "desc" },
      take: DEFAULT_LIMITS.tickets,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        createdAt: true,
      },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["SENT", "OVERDUE", "DRAFT"] } },
      orderBy: [
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      take: DEFAULT_LIMITS.invoices,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        dueDate: true,
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        createdAt: true,
      },
    }),
  ])

  const now = new Date()

  return {
    generatedAt: now.toISOString(),
    summary: {
      counts: {
        clients: clients.length,
        projects: projects.length,
        tickets: tickets.length,
        invoices: invoices.length,
      },
      upcomingDeadlines: projects
        .filter((project) => project.dueDate)
        .slice(0, 5)
        .map((project) => ({
          id: project.id,
          name: project.name,
          dueDate: project.dueDate,
          status: getProjectStatusLabel(project.status),
          clientName: project.client?.name ?? "Sin cliente",
        })),
    },
    clients: clients.map((client) => ({
      id: client.id,
      name: client.name,
      status: client.status,
      industry: client.industry,
      timezone: client.timezone,
      lastUpdate: client.updatedAt,
      notes: client.notes,
    })),
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status,
      statusLabel: getProjectStatusLabel(project.status),
      type: project.type,
      dueDate: project.dueDate,
      startDate: project.startDate,
      clientName: project.client?.name ?? "Sin cliente",
      managerName: project.manager?.name ?? "No asignado",
      lastUpdate: project.updatedAt,
    })),
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      clientName: ticket.client?.name ?? null,
      projectName: ticket.project?.name ?? null,
      createdAt: ticket.createdAt,
    })),
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      status: invoice.status,
      amount: invoice.amount,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      clientName: invoice.client?.name ?? null,
      projectName: invoice.project?.name ?? null,
      createdAt: invoice.createdAt,
    })),
  }
}

export async function POST(req: NextRequest) {
  try {
    const agentUrl = process.env.N8N_AGENT_URL
    const agentToken = process.env.N8N_AGENT_TOKEN

    if (!agentUrl) {
      return NextResponse.json(
        { message: "Variable de entorno N8N_AGENT_URL no configurada" },
        { status: 500 },
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body.question !== "string" || body.question.trim().length === 0) {
      return NextResponse.json({ message: "La pregunta es obligatoria" }, { status: 400 })
    }

    const question = body.question.trim()
    const userId: string =
      typeof body.userId === "string" && body.userId.trim().length > 0
        ? body.userId.trim()
        : "dashboard-anon"
    const sessionId: string =
      typeof body.sessionId === "string" && body.sessionId.trim().length > 0
        ? body.sessionId.trim()
        : randomUUID()

    let contextPayload: string | undefined
    if (typeof body.context === "string") {
      contextPayload = body.context
    } else {
      const context = await buildAssistantContext()
      contextPayload = JSON.stringify(context)
    }

    const agentResponse = await fetch(agentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(agentToken ? { Authorization: `Bearer ${agentToken}` } : {}),
      },
      body: JSON.stringify({
        question,
        userId,
        sessionId,
        context: contextPayload,
      }),
    })

    if (!agentResponse.ok) {
      const errorBody = await agentResponse.text().catch(() => "Respuesta no disponible")
      return NextResponse.json(
        { message: "El agente no pudo responder", detail: errorBody },
        { status: 502 },
      )
    }

    const contentType = agentResponse.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      const data = await agentResponse.json()

      if (typeof data === "string") {
        return NextResponse.json({ answer: data })
      }

      if (data && typeof data === "object") {
        if (typeof (data as { answer?: unknown }).answer === "string") {
          return NextResponse.json(data)
        }

        const bodyText = (data as { body?: unknown }).body
        if (typeof bodyText === "string") {
          return NextResponse.json({ answer: bodyText })
        }

        const text =
          typeof (data as { text?: unknown }).text === "string"
            ? (data as { text: string }).text
            : typeof (data as { output?: unknown }).output === "string"
              ? (data as { output: string }).output
              : null

        if (text) {
          return NextResponse.json({ answer: text, raw: data })
        }

        return NextResponse.json(data)
      }
    }

    const fallback = await agentResponse.text()
    return NextResponse.json({ answer: fallback })
  } catch (error) {
    console.error("POST /api/ai error:", error)
    return NextResponse.json({ message: "No se pudo completar la solicitud" }, { status: 500 })
  }
}
