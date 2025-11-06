import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface Referral {
  id: string
  clientName: string
  projectName: string
  status: string
  commissionRate: string
  commissionAmount: string
  date: string
}

interface ReferralListProps {
  referrals: Referral[]
}

const statusColors = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  WON: "bg-green-500/20 text-green-400",
  LOST: "bg-red-500/20 text-red-400",
}

export function ReferralList({ referrals }: ReferralListProps) {
  return (
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-foreground mb-6">Referrals</h3>
      <div className="space-y-4">
        {referrals.map((referral) => (
          <div
            key={referral.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-sidebar-accent/30 transition-colors"
          >
            <div className="flex-1">
              <p className="text-foreground font-medium">{referral.clientName}</p>
              <p className="text-sm text-muted-foreground mt-1">{referral.projectName}</p>
              <p className="text-xs text-muted-foreground mt-2">{referral.date}</p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Commission</p>
                <p className="text-foreground font-medium">{referral.commissionAmount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rate</p>
                <p className="text-foreground font-medium">{referral.commissionRate}</p>
              </div>
              <Badge className={statusColors[referral.status as keyof typeof statusColors]}>{referral.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
