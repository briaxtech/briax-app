export type ProjectCalendarEntry = {
  id: string
  clientId: string
  name: string
  clientName: string
  clientEmail: string | null
  type: string
  rawType: string
  status: string
  statusLabel: string
  startDate: string | null
  dueDate: string | null
  managerName: string
  managerEmail: string | null
  createdAt: string
}
