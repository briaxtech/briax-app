import { Button } from "@/components/ui/button"
import { PartnerTable } from "@/components/partners/partner-table"
import { Plus } from "lucide-react"

export default function PartnersPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Socios</h1>
          <p className="text-muted-foreground mt-2">Gestiona afiliados, revendedores y colaboradores</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo socio
        </Button>
      </div>

      {/* Tabla de socios */}
      <PartnerTable />
    </div>
  )
}
