import { TicketTable } from "@/components/tickets/ticket-table"
import { TicketCreateDialog } from "@/components/tickets/ticket-create-dialog"
import { TicketFilters } from "@/components/tickets/ticket-filters"

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground mt-2">Solicitudes de soporte e incidencias de proyecto</p>
        </div>
        <TicketCreateDialog />
      </div>

      <TicketFilters />

      <TicketTable />
    </div>
  )
}
