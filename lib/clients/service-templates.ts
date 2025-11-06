export type ServiceTemplate = {
  name: string
  type: string
  description: string
}

export const SERVICE_TEMPLATES: Record<string, ServiceTemplate> = {
  web: {
    name: "Implementacion de sitio web",
    type: "website",
    description: "Proyecto base para sitio web corporativo y contenido administrable.",
  },
  ecommerce: {
    name: "Plataforma ecommerce",
    type: "ecommerce",
    description: "Desarrollo de catalogo, carrito y flujos de checkout.",
  },
  automation: {
    name: "Automatizaciones de marketing",
    type: "automation",
    description: "Workflows de marketing y sincronizacion con CRM.",
  },
  data: {
    name: "Integraciones de datos",
    type: "data",
    description: "Conectores y pipelines para consolidar informacion clave.",
  },
  support: {
    name: "Mesa de soporte continua",
    type: "support",
    description: "Seguimiento mensual y gestion de incidencias.",
  },
  consulting: {
    name: "Consultoria estrategica",
    type: "consulting",
    description: "Sesiones de discovery, analisis y roadmap tecnico.",
  },
}

export const SERVICE_OPTIONS = Object.entries(SERVICE_TEMPLATES).map(([id, value]) => ({
  id,
  label: value.name,
}))

export function serviceIdFromProjectType(type: string): string | null {
  const entry = Object.entries(SERVICE_TEMPLATES).find(([, template]) => template.type === type)
  return entry ? entry[0] : null
}
