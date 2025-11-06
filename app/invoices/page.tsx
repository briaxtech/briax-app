import { Button } from "@/components/ui/button"
import { InvoiceTable } from "@/components/invoices/invoice-table"
import { Plus } from "lucide-react"

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-2">Manage billing and payments</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      {/* Invoice Table */}
      <InvoiceTable />
    </div>
  )
}
