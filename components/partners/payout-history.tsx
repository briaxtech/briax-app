import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface Payout {
  id: string
  date: string
  amount: string
  status: string
  method: string
}

interface PayoutHistoryProps {
  payouts: Payout[]
}

const statusColors = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  PAID: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
}

export function PayoutHistory({ payouts }: PayoutHistoryProps) {
  return (
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-foreground mb-6">Payout History</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Method</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id} className="border-b border-border hover:bg-sidebar-accent/30 transition-colors">
                <td className="px-4 py-3 text-sm text-muted-foreground">{payout.date}</td>
                <td className="px-4 py-3 text-sm text-foreground font-medium">{payout.amount}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{payout.method}</td>
                <td className="px-4 py-3">
                  <Badge className={statusColors[payout.status as keyof typeof statusColors]}>{payout.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
