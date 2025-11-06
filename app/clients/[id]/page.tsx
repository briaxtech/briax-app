import { Card } from "@/components/ui/card"
import { ClientDetailTabs } from "@/components/clients/client-detail-tabs"
import { Mail, Phone, MapPin, Calendar } from "lucide-react"

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">TechCorp Inc</h1>
        <p className="text-muted-foreground mt-2">Client ID: {params.id}</p>
      </div>

      {/* Client Info Card */}
      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <div className="grid grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-foreground font-medium">john@techcorp.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Phone</p>
              <p className="text-foreground font-medium">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Country</p>
              <p className="text-foreground font-medium">United States</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Joined</p>
              <p className="text-foreground font-medium">Jan 15, 2024</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <ClientDetailTabs clientId={params.id} />
      </Card>
    </div>
  )
}
