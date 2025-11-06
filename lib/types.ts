import type {
  UserRole,
  ClientStatus,
  ProjectStatus,
  TicketStatus,
  TicketPriority,
  InvoiceStatus,
  PartnerStatus,
  PartnerType,
  PartnerReferralStatus,
  PayoutStatus,
  AutomationType,
  AutomationStatus,
} from "@prisma/client"

export type {
  UserRole,
  ClientStatus,
  ProjectStatus,
  TicketStatus,
  TicketPriority,
  InvoiceStatus,
  PartnerStatus,
  PartnerType,
  PartnerReferralStatus,
  PayoutStatus,
  AutomationType,
  AutomationStatus,
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Dashboard KPI Type
export interface DashboardKPI {
  activeClients: number
  activeProjects: number
  monthlyRevenue: number
  openTickets: number
  activePartners: number
  partnerRevenue: number
}

// Chart Data Type
export interface ChartDataPoint {
  name: string
  value: number
}
