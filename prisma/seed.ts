import {
  ClientStatus,
  InvoiceStatus,
  PartnerReferralStatus,
  PartnerStatus,
  PartnerType,
  PayoutStatus,
  PrismaClient,
  ProjectStatus,
  ProjectUpdateType,
  TicketPriority,
  TicketSource,
  TicketStatus,
  TicketUpdateType,
  TicketWatcherType,
  UserRole,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.partnerPayout.deleteMany()
  await prisma.partnerReferral.deleteMany()
  await prisma.partner.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.project.deleteMany()
  await prisma.clientAccess.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()

  const demoPassword = process.env.SEED_DEFAULT_PASSWORD ?? "briax-demo"
  const passwordHash = await bcrypt.hash(demoPassword, 10)

  const usersData = [
    { name: "Laura Gomez", email: "laura@briax.com", role: UserRole.OWNER, timezone: "America/Argentina/Buenos_Aires" },
    { name: "Martin Ruiz", email: "martin@briax.com", role: UserRole.ADMIN, timezone: "America/Argentina/Buenos_Aires" },
    { name: "Sofia Torres", email: "sofia@briax.com", role: UserRole.PROJECT_MANAGER, timezone: "America/Mexico_City" },
    { name: "Diego Alvarez", email: "diego@briax.com", role: UserRole.DEVELOPER, timezone: "America/Bogota" },
    { name: "Camila Perez", email: "camila@briax.com", role: UserRole.SUPPORT, timezone: "America/Argentina/Buenos_Aires" },
    { name: "Julian Fernandez", email: "julian@briax.com", role: UserRole.FINANCE, timezone: "America/Montevideo" },
    { name: "Valentina Herrera", email: "valentina@briax.com", role: UserRole.PARTNER_MANAGER, timezone: "America/Santiago" },
  ]

  const userMap: Record<string, { id: string; name: string; email: string }> = {}

  for (const data of usersData) {
    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash,
      },
    })
    userMap[data.email] = user
  }

  const clientsData = [
    {
      name: "TechCorp Inc",
      contactName: "John Smith",
      contactEmail: "john@techcorp.com",
      phone: "+1 555 201 1000",
      country: "Estados Unidos",
      timezone: "America/New_York",
      industry: "Tecnologia",
      status: ClientStatus.ACTIVE,
      notes: "Implementaciones en paralelo para core web y automatizaciones.",
    },
    {
      name: "StartupXYZ",
      contactName: "Sarah Johnson",
      contactEmail: "sarah@startupxyz.com",
      phone: "+1 555 301 2040",
      country: "Canada",
      timezone: "America/Toronto",
      industry: "Servicios",
      status: ClientStatus.LEAD,
      notes: "Proceso comercial avanzado, enfocado en plataforma ecommerce.",
    },
    {
      name: "Enterprise Solutions",
      contactName: "Mike Davis",
      contactEmail: "mike@enterprise.com",
      phone: "+44 20 1234 5678",
      country: "Reino Unido",
      timezone: "Europe/London",
      industry: "Manufactura",
      status: ClientStatus.ACTIVE,
      notes: "Se prioriza integracion de datos y reporting financiero.",
    },
    {
      name: "Innovacion Retail",
      contactName: "Paula Benitez",
      contactEmail: "paula@innovacionretail.com",
      phone: "+54 11 4333 2200",
      country: "Argentina",
      timezone: "America/Argentina/Buenos_Aires",
      industry: "Retail",
      status: ClientStatus.ACTIVE,
      notes: "Proyecto premium con foco en temporada alta Q4 2025.",
    },
  ]

  const clientMap: Record<string, { id: string }> = {}

  for (const data of clientsData) {
    const client = await prisma.client.create({ data })
    clientMap[data.name] = client
  }

  const clientAccessData = [
    {
      clientName: "TechCorp Inc",
      service: "Google Workspace",
      username: "ops@techcorp.com",
      password: "SuperSecure!2024",
      url: "https://admin.google.com",
      notes: "Cuenta administradora. MFA via SMS con John Smith.",
    },
    {
      clientName: "TechCorp Inc",
      service: "Hostinger",
      username: "infra@techcorp.com",
      password: "H0sting#990",
      url: "https://hpanel.hostinger.com",
      notes: "Plan empresarial, expira en mayo 2025.",
    },
    {
      clientName: "Innovacion Retail",
      service: "n8n",
      username: "automations@innovacionretail.com",
      password: "Flows!2025",
      url: "https://n8n.briax.io",
      notes: "Servidor dedicado, acceso SSO deshabilitado.",
    },
  ]

  for (const access of clientAccessData) {
    await prisma.clientAccess.create({
      data: {
        service: access.service,
        username: access.username,
        password: access.password,
        url: access.url,
        notes: access.notes,
        client: { connect: { id: clientMap[access.clientName].id } },
      },
    })
  }

  const projectsData = [
    {
      name: "Rediseno web corporativo",
      type: "website",
      status: ProjectStatus.IN_PROGRESS,
      description: "Actualizacion de la experiencia y nuevo portal de clientes.",
      startDate: new Date("2024-01-15T00:00:00Z"),
      dueDate: new Date("2024-04-15T00:00:00Z"),
      clientName: "TechCorp Inc",
      managerEmail: "sofia@briax.com",
    },
    {
      name: "Automatizacion de marketing 2024",
      type: "automation",
      status: ProjectStatus.REVIEW,
      description: "Orquestacion de workflows de marketing y reporteria de conversion.",
      startDate: new Date("2023-11-20T00:00:00Z"),
      dueDate: new Date("2024-03-30T00:00:00Z"),
      clientName: "TechCorp Inc",
      managerEmail: "sofia@briax.com",
    },
    {
      name: "Lanzamiento ecommerce",
      type: "ecommerce",
      status: ProjectStatus.DISCOVERY,
      description: "Discovery tecnico y funcional para nueva tienda en linea.",
      startDate: new Date("2024-02-10T00:00:00Z"),
      dueDate: new Date("2024-06-10T00:00:00Z"),
      clientName: "StartupXYZ",
      managerEmail: "sofia@briax.com",
    },
    {
      name: "Pipeline de datos operativos",
      type: "data",
      status: ProjectStatus.IN_PROGRESS,
      description: "Integracion entre ERP y herramientas de soporte.",
      startDate: new Date("2023-12-05T00:00:00Z"),
      dueDate: new Date("2024-05-01T00:00:00Z"),
      clientName: "Enterprise Solutions",
      managerEmail: "martin@briax.com",
    },
    {
      name: "Lanzamiento omnicanal Black Friday",
      type: "ecommerce",
      status: ProjectStatus.IN_PROGRESS,
      description: "Implementacion de plataforma ecommerce y POS unificado para la temporada alta.",
      startDate: new Date("2025-08-12T00:00:00Z"),
      dueDate: new Date("2025-11-18T00:00:00Z"),
      clientName: "Innovacion Retail",
      managerEmail: "sofia@briax.com",
    },
  ]

  const projectMap: Record<string, { id: string }> = {}

  for (const project of projectsData) {
    const created = await prisma.project.create({
      data: {
        name: project.name,
        type: project.type,
        status: project.status,
        description: project.description,
        startDate: project.startDate,
        dueDate: project.dueDate,
        client: { connect: { id: clientMap[project.clientName].id } },
        manager: project.managerEmail ? { connect: { id: userMap[project.managerEmail].id } } : undefined,
      },
    })
    projectMap[project.name] = created
  }

  const projectUpdatesData = [
    {
      projectName: "Rediseno de sitio web",
      type: ProjectUpdateType.STATUS_CHANGE,
      title: "Kickoff completado",
      message: "Se finalizo la etapa de analisis y comenzamos el desarrollo de interfaces.",
      authorName: "Sofia Torres",
      authorEmail: "sofia@briax.com",
    },
    {
      projectName: "Lanzamiento ecommerce",
      type: ProjectUpdateType.NOTE,
      title: "Reunion con el cliente",
      message: "Se definieron prioridades para integracion de pasarelas de pago.",
      authorName: "Laura Gomez",
      authorEmail: "laura@briax.com",
    },
    {
      projectName: "Pipeline de datos operativos",
      type: ProjectUpdateType.MILESTONE,
      title: "ETL nightly desplegado",
      message: "El pipeline nocturno ya corre en produccion y sincroniza 25k registros.",
      authorName: "Martin Ruiz",
      authorEmail: "martin@briax.com",
    },
  ]

  for (const update of projectUpdatesData) {
    const project = projectMap[update.projectName]
    if (!project) continue
    await prisma.projectUpdate.create({
      data: {
        projectId: project.id,
        type: update.type,
        title: update.title,
        message: update.message,
        authorName: update.authorName,
        authorEmail: update.authorEmail,
        notifyTeam: false,
      },
    })
  }

  const ticketsData = [
    {
      title: "Revisar hero responsive",
      description: "En iPhone 13 la cabecera se corta y el CTA no aparece.",
      status: TicketStatus.WAITING_CLIENT,
      priority: TicketPriority.HIGH,
      source: TicketSource.CLIENT_PORTAL,
      serviceArea: "Web corporativa",
      environment: "Produccion",
      notifyClient: true,
      dueAt: new Date("2025-11-15T12:00:00Z"),
      clientName: "TechCorp Inc",
      projectName: "Rediseno web corporativo",
      assigneeEmail: "camila@briax.com",
      watchers: [
        { type: TicketWatcherType.CLIENT, email: "john@techcorp.com", name: "John Smith" },
        { type: TicketWatcherType.INTERNAL, email: "camila@briax.com", name: "Camila Perez" },
      ],
      updates: [
        {
          type: TicketUpdateType.STATUS_CHANGE,
          message: "Ticket creado y diagnosticado. Se envio captura al cliente.",
          notifyClient: true,
          public: true,
          nextStatus: TicketStatus.WAITING_CLIENT,
          previousStatus: TicketStatus.NEW,
          authorEmail: "camila@briax.com",
        },
      ],
    },
    {
      title: "Integrar gateway de pagos",
      description: "Configurar sandbox, callbacks y manejo de reintentos.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.CRITICAL,
      source: TicketSource.AUTOMATION,
      serviceArea: "Checkout ecommerce",
      environment: "Staging",
      notifyClient: true,
      dueAt: new Date("2025-11-20T09:00:00Z"),
      clientName: "StartupXYZ",
      projectName: "Lanzamiento ecommerce",
      assigneeEmail: "diego@briax.com",
      watchers: [
        { type: TicketWatcherType.CLIENT, email: "sarah@startupxyz.com", name: "Sarah Johnson" },
        { type: TicketWatcherType.INTERNAL, email: "diego@briax.com", name: "Diego Alvarez" },
      ],
      updates: [
        {
          type: TicketUpdateType.NOTE,
          message: "Webhook de devoluciones configurado. Falta aprobacion de sandbox.",
          notifyClient: false,
          public: false,
          authorEmail: "diego@briax.com",
        },
        {
          type: TicketUpdateType.STATUS_CHANGE,
          message: "Gateway listo para pruebas del cliente.",
          notifyClient: true,
          public: true,
          nextStatus: TicketStatus.WAITING_CLIENT,
          previousStatus: TicketStatus.IN_PROGRESS,
          authorEmail: "diego@briax.com",
        },
      ],
    },
    {
      title: "Ajustar pipeline nocturno",
      description: "Errores intermitentes en transformaciones ETL. Revisar paso 3.",
      status: TicketStatus.NEW,
      priority: TicketPriority.MEDIUM,
      source: TicketSource.MONITORING,
      serviceArea: "Data warehouse",
      environment: "Produccion",
      notifyClient: true,
      clientName: "Enterprise Solutions",
      projectName: "Pipeline de datos operativos",
      assigneeEmail: "diego@briax.com",
      watchers: [
        { type: TicketWatcherType.CLIENT, email: "mike@enterprise.com", name: "Mike Davis" },
        { type: TicketWatcherType.INTERNAL, email: "sofia@briax.com", name: "Sofia Torres" },
      ],
      updates: [
        {
          type: TicketUpdateType.NOTE,
          message: "Alertas recibidas desde Datadog. Se congela ejecucion hasta nuevo aviso.",
          notifyClient: true,
          public: true,
          nextStatus: TicketStatus.NEW,
          previousStatus: TicketStatus.NEW,
          authorEmail: "sofia@briax.com",
        },
      ],
    },
  ]

  for (const ticket of ticketsData) {
    const createdTicket = await prisma.ticket.create({
      data: {
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        source: ticket.source,
        serviceArea: ticket.serviceArea,
        environment: ticket.environment,
        notifyClient: ticket.notifyClient,
        dueAt: ticket.dueAt,
        client: { connect: { id: clientMap[ticket.clientName].id } },
        project: { connect: { id: projectMap[ticket.projectName].id } },
        assignee: ticket.assigneeEmail ? { connect: { id: userMap[ticket.assigneeEmail].id } } : undefined,
      },
    })

    const watcherPayload = (ticket.watchers ?? []).concat(
      clientMap[ticket.clientName].contactEmail
        ? [
            {
              type: TicketWatcherType.CLIENT,
              email: clientMap[ticket.clientName].contactEmail!,
              name: clientMap[ticket.clientName].contactName ?? clientMap[ticket.clientName].name,
            },
          ]
        : [],
    )

    if (watcherPayload.length > 0) {
      const uniqueByEmail = new Map<string, { type: TicketWatcherType; email: string; name?: string }>()
      for (const watcher of watcherPayload) {
        uniqueByEmail.set(watcher.email.toLowerCase(), watcher)
      }
      await prisma.ticketWatcher.createMany({
        data: Array.from(uniqueByEmail.values()).map((watcher) => ({
          ticketId: createdTicket.id,
          type: watcher.type,
          email: watcher.email,
          name: watcher.name,
        })),
      })
    }

    if (ticket.updates && ticket.updates.length > 0) {
      for (const update of ticket.updates) {
        const author = update.authorEmail ? userMap[update.authorEmail] : undefined
        await prisma.ticketUpdate.create({
          data: {
            ticketId: createdTicket.id,
            type: update.type,
            message: update.message,
            notifyClient: update.notifyClient,
            public: update.public,
            nextStatus: update.nextStatus,
            previousStatus: update.previousStatus,
            authorId: author?.id,
            authorName: author?.name,
            authorEmail: update.authorEmail,
          },
        })
      }
    }
  }

  const invoicesData = [
    {
      clientName: "TechCorp Inc",
      projectName: "Rediseno web corporativo",
      amount: 12500,
      currency: "EUR",
      description: "Sprint 3 y 4 entregados",
      issueDate: new Date("2024-02-28T00:00:00Z"),
      dueDate: new Date("2024-03-30T00:00:00Z"),
      status: InvoiceStatus.SENT,
    },
    {
      clientName: "Enterprise Solutions",
      projectName: "Pipeline de datos operativos",
      amount: 18250,
      currency: "EUR",
      description: "Integraciones ERP y soporte",
      issueDate: new Date("2024-01-20T00:00:00Z"),
      dueDate: new Date("2024-02-20T00:00:00Z"),
      status: InvoiceStatus.PAID,
    },
    {
      clientName: "StartupXYZ",
      projectName: "Lanzamiento ecommerce",
      amount: 7200,
      currency: "EUR",
      description: "Discovery funcional y wireframes",
      issueDate: new Date("2024-03-05T00:00:00Z"),
      dueDate: new Date("2024-04-05T00:00:00Z"),
      status: InvoiceStatus.DRAFT,
    },
  ]

  for (const invoice of invoicesData) {
    await prisma.invoice.create({
      data: {
        amount: invoice.amount,
        currency: invoice.currency,
        description: invoice.description,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        client: { connect: { id: clientMap[invoice.clientName].id } },
        project: { connect: { id: projectMap[invoice.projectName].id } },
      },
    })
  }

  const partnersData = [
    {
      name: "Digital Growth Partners",
      type: PartnerType.AGENCY,
      status: PartnerStatus.ACTIVE,
      contactName: "Emily Clark",
      contactEmail: "emily@dgp.com",
      trackingCode: "DGP-001",
      baseCommissionRate: 12.5,
      notes: "Principal canal de referidos en Estados Unidos.",
    },
    {
      name: "360 Sales Network",
      type: PartnerType.AFFILIATE,
      status: PartnerStatus.ACTIVE,
      contactName: "Roger Mills",
      contactEmail: "roger@360sales.com",
      trackingCode: "360-023",
      baseCommissionRate: 10,
      notes: "Especializados en retail y programas de fidelidad.",
    },
  ]

  const partnerMap: Record<string, { id: string }> = {}

  for (const partner of partnersData) {
    const created = await prisma.partner.create({ data: partner })
    partnerMap[partner.name] = created
  }

  const referralsData = [
    {
      partnerName: "Digital Growth Partners",
      clientName: "TechCorp Inc",
      projectName: "Lanzamiento ecommerce",
      status: PartnerReferralStatus.WON,
      commissionRate: 12.5,
      commissionBase: 45000,
      commissionAmount: 5625,
      currency: "EUR",
      notes: "Participacion activa en discovery comercial.",
    },
    {
      partnerName: "360 Sales Network",
      clientName: "Enterprise Solutions",
      projectName: "Pipeline de datos operativos",
      status: PartnerReferralStatus.PENDING,
      commissionRate: 10,
      commissionBase: 60000,
      commissionAmount: 6000,
      currency: "EUR",
      notes: "Esperando cierre contractual.",
    },
  ]

  const referralMap: Record<string, { id: string }> = {}

  for (const referral of referralsData) {
    const created = await prisma.partnerReferral.create({
      data: {
        status: referral.status,
        commissionRate: referral.commissionRate,
        commissionBase: referral.commissionBase,
        commissionAmount: referral.commissionAmount,
        currency: referral.currency,
        notes: referral.notes,
        partner: { connect: { id: partnerMap[referral.partnerName].id } },
        client: { connect: { id: clientMap[referral.clientName].id } },
        project: { connect: { id: projectMap[referral.projectName].id } },
      },
    })
    referralMap[`${referral.partnerName}-${referral.clientName}`] = created
  }

  const payoutsData = [
    {
      partnerName: "Digital Growth Partners",
      amount: 5625,
      currency: "EUR",
      status: PayoutStatus.PAID,
      payoutDate: new Date("2024-02-28T00:00:00Z"),
      method: "Transferencia bancaria",
      notes: "Comision por proyecto ecommerce TechCorp.",
      referralKey: "Digital Growth Partners-TechCorp Inc",
    },
    {
      partnerName: "360 Sales Network",
      amount: 3000,
      currency: "EUR",
      status: PayoutStatus.PENDING,
      payoutDate: null,
      method: "Transferencia bancaria",
      notes: "Primer pago 50% pendiente a aprobacion.",
      referralKey: "360 Sales Network-Enterprise Solutions",
    },
  ]

  for (const payout of payoutsData) {
    await prisma.partnerPayout.create({
      data: {
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        payoutDate: payout.payoutDate,
        method: payout.method,
        notes: payout.notes,
        partner: { connect: { id: partnerMap[payout.partnerName].id } },
        referral: referralMap[payout.referralKey]
          ? { connect: { id: referralMap[payout.referralKey].id } }
          : undefined,
      },
    })
  }

  console.log("Seed data inserted successfully.")
}

main()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
