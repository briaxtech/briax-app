"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

interface Project {
  id: string
  name: string
  clientName: string
  type: string
  status: string
  dueDate?: string
  manager?: string
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    clientName: "TechCorp Inc",
    type: "website",
    status: "IN_PROGRESS",
    dueDate: "2024-04-15",
    manager: "John Manager",
  },
  {
    id: "2",
    name: "E-commerce Platform",
    clientName: "StartupXYZ",
    type: "ecommerce",
    status: "REVIEW",
    dueDate: "2024-03-30",
    manager: "Sarah PM",
  },
  {
    id: "3",
    name: "Automation Workflow",
    clientName: "Enterprise Solutions",
    type: "automation",
    status: "DEVELOPMENT",
    dueDate: "2024-05-10",
    manager: "Mike Dev",
  },
  {
    id: "4",
    name: "AI Agent Integration",
    clientName: "TechCorp Inc",
    type: "ai-agent",
    status: "DISCOVERY",
    dueDate: "2024-06-01",
  },
]

const statusColors = {
  DISCOVERY: "bg-blue-500/20 text-blue-400",
  IN_PROGRESS: "bg-purple-500/20 text-purple-400",
  REVIEW: "bg-yellow-500/20 text-yellow-400",
  PRODUCTION: "bg-green-500/20 text-green-400",
  PAUSED: "bg-orange-500/20 text-orange-400",
  CLOSED: "bg-red-500/20 text-red-400",
}

const typeLabels = {
  website: "Website",
  ecommerce: "E-Commerce",
  automation: "Automation",
  "ai-agent": "AI Agent",
  custom: "Custom",
}

export function ProjectTable() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Project</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Due Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Manager</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockProjects.map((project) => (
              <tr key={project.id} className="border-b border-border hover:bg-sidebar-accent/30 transition-colors">
                <td className="px-6 py-4">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-foreground font-medium hover:text-primary transition-colors"
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{project.clientName}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="text-foreground">
                    {typeLabels[project.type as keyof typeof typeLabels] || project.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                    {project.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{project.dueDate || "-"}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{project.manager || "-"}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
