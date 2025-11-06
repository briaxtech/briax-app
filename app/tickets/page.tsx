import { Button } from "@/components/ui/button"
import { TicketTable } from "@/components/tickets/ticket-table"
import { Plus } from "lucide-react"

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground mt-2">Solicitudes de soporte e incidencias de proyecto</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo ticket
        </Button>
      </div>

      {/* Tabla de tickets */}
      <TicketTable />
    </div>
  )
}
