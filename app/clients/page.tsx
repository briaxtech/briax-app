import { ClientTable } from "@/components/clients/client-table"
import { NewClientDialog } from "@/components/clients/new-client-dialog"

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gestiona las cuentas y las relaciones con tus clientes</p>
        </div>
        <NewClientDialog />
      </div>

      {/* Tabla de clientes */}
      <ClientTable />
    </div>
  )
}
