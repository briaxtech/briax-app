interface TimelineStep {
  id: string
  status: string
  label: string
  completed: boolean
}

interface ProjectStatusTimelineProps {
  steps: TimelineStep[]
}

export function ProjectStatusTimeline({ steps }: ProjectStatusTimelineProps) {
  return (
    <div className="flex items-center gap-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-4">
          {/* Step indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">{step.label}</p>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className={`w-12 h-1 mb-6 ${step.completed ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  )
}
