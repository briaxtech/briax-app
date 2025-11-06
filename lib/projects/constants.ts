export const PROJECT_STATUS_ORDER = [
  "DISCOVERY",
  "IN_PROGRESS",
  "REVIEW",
  "PRODUCTION",
  "PAUSED",
  "CLOSED",
] as const

export type ProjectStatusKey = (typeof PROJECT_STATUS_ORDER)[number]

export const PROJECT_STATUS_LABELS: Record<ProjectStatusKey, string> = {
  DISCOVERY: "Descubrimiento",
  IN_PROGRESS: "En progreso",
  REVIEW: "Revision",
  PRODUCTION: "Produccion",
  PAUSED: "En pausa",
  CLOSED: "Cerrado",
}

export const PROJECT_STATUS_OPTIONS = PROJECT_STATUS_ORDER.map((status) => ({
  value: status,
  label: PROJECT_STATUS_LABELS[status],
}))

export const PROJECT_TYPE_LABELS = {
  website: "Sitio web",
  ecommerce: "E-commerce",
  automation: "Automatizacion",
  data: "Datos",
  support: "Soporte",
  consulting: "Consultoria",
} as const

export type ProjectTypeKey = keyof typeof PROJECT_TYPE_LABELS

export function getProjectStatusLabel(status: string) {
  return PROJECT_STATUS_LABELS[status as ProjectStatusKey] ?? status
}

export function getProjectTypeLabel(type: string) {
  return PROJECT_TYPE_LABELS[type as ProjectTypeKey] ?? type
}
