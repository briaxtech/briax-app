import { Button } from "@/components/ui/button"
import { InvoiceTable } from "@/components/invoices/invoice-table"
import { Plus } from "lucide-react"

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturas</h1>
          <p className="text-muted-foreground mt-2">Gestiona la facturacion y los cobros</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva factura
        </Button>
      </div>

      {/* Tabla de facturas */}
      <InvoiceTable />
    </div>
  )
}
