"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"

type TabType = "overview" | "projects" | "tickets" | "invoices" | "automations"

interface ClientDetailTabsProps {
  clientId: string
}

export function ClientDetailTabs({ clientId }: ClientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "tickets", label: "Tickets" },
    { id: "invoices", label: "Invoices" },
    { id: "automations", label: "Automations" },
  ]

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Contact Name</p>
              <p className="text-foreground font-medium">John Smith</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Email</p>
              <p className="text-foreground font-medium">john@techcorp.com</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Country</p>
              <p className="text-foreground font-medium">United States</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div>
            <p className="text-muted-foreground">No projects for this client yet</p>
          </div>
        )}

        {activeTab === "tickets" && (
          <div>
            <p className="text-muted-foreground">No tickets for this client yet</p>
          </div>
        )}

        {activeTab === "invoices" && (
          <div>
            <p className="text-muted-foreground">No invoices for this client yet</p>
          </div>
        )}

        {activeTab === "automations" && (
          <div>
            <p className="text-muted-foreground">No automations for this client yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
