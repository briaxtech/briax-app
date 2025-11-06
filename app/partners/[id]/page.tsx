import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReferralList } from "@/components/partners/referral-list"
import { PayoutHistory } from "@/components/partners/payout-history"
import { Copy, Mail, Phone, Calendar } from "lucide-react"

export default function PartnerDetailPage({ params }: { params: { id: string } }) {
  const mockReferrals = [
    {
      id: "1",
      clientName: "NewTech Solutions",
      projectName: "Web Platform Development",
      status: "WON",
      commissionRate: "10%",
      commissionAmount: "€5,000",
      date: "2024-02-15",
    },
    {
      id: "2",
      clientName: "StartupHub",
      projectName: "Mobile App",
      status: "WON",
      commissionRate: "10%",
      commissionAmount: "€3,200",
      date: "2024-02-20",
    },
    {
      id: "3",
      clientName: "Enterprise Corp",
      projectName: "Automation System",
      status: "PENDING",
      commissionRate: "10%",
      commissionAmount: "€2,500",
      date: "2024-03-10",
    },
  ]

  const mockPayouts = [
    {
      id: "1",
      date: "2024-02-28",
      amount: "€5,000",
      method: "Bank Transfer",
      status: "PAID",
    },
    {
      id: "2",
      date: "2024-03-15",
      amount: "€3,200",
      method: "Bank Transfer",
      status: "PENDING",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tech Solutions Agency</h1>
        <p className="text-muted-foreground mt-2">Partner ID: {params.id}</p>
      </div>

      {/* Partner Info Card */}
      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-foreground font-medium">contact@techsolutions.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Phone</p>
              <p className="text-foreground font-medium">+1 (555) 987-6543</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Tracking Code</p>
            <div className="flex items-center gap-2">
              <code className="text-foreground font-mono text-sm bg-background px-3 py-1 rounded">TECH_SOL_001</code>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Joined</p>
              <p className="text-foreground font-medium">Jan 10, 2023</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Type</p>
              <Badge className="bg-purple-500/20 text-purple-400">Agency</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Commission Rate</p>
              <p className="text-foreground font-medium">10%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Total Revenue Generated</p>
              <p className="text-foreground font-medium">€150,000</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-2">Commissions Paid</p>
          <p className="text-3xl font-bold text-green-400">€15,000</p>
        </Card>
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-2">Commissions Pending</p>
          <p className="text-3xl font-bold text-yellow-400">€2,500</p>
        </Card>
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-2">Active Referrals</p>
          <p className="text-3xl font-bold text-primary">12</p>
        </Card>
      </div>

      {/* Referrals and Payouts */}
      <div className="grid grid-cols-2 gap-6">
        <ReferralList referrals={mockReferrals} />
        <PayoutHistory payouts={mockPayouts} />
      </div>
    </div>
  )
}
