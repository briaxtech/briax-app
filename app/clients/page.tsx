import { Button } from "@/components/ui/button"
import { ClientTable } from "@/components/clients/client-table"
import { Plus } from "lucide-react"

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-2">Manage all client accounts and relationships</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Client
        </Button>
      </div>

      {/* Client Table */}
      <ClientTable />
    </div>
  )
}
