"use client"

import { useMemo, useRef, useState } from "react"
import { Bot, Loader2, Send, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type AssistantMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Array<{ title?: string; url?: string }>
}

type AgentResponse = {
  answer?: string
  message?: string
  detail?: unknown
  sources?: Array<{ title?: string; url?: string }>
}

export function AssistantWidget() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "assistant-initial",
      role: "assistant",
      content:
        "Hola, soy tu asistente. Preguntame sobre clientes, proyectos, tickets o facturación y te ayudo con recomendaciones.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const sessionId = useMemo(() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
    return `session-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`
  }, [])

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    })
  }

  const handleSubmit = async () => {
    const question = input.trim()
    if (!question || loading) return

    const id = `user-${Date.now()}`
    const newUserMessage: AssistantMessage = { id, role: "user", content: question }
    setMessages((prev) => [...prev, newUserMessage])
    setInput("")
    setLoading(true)
    scrollToBottom()

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          sessionId,
          userId: "dashboard-user",
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? "No se obtuvo respuesta del agente")
      }

      const data = (await response.json()) as AgentResponse
      const assistantText = data.answer ?? data.message ?? "No pude generar una respuesta en este momento."
      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantText,
        sources: data.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
      scrollToBottom()
    } catch (error) {
      const description = error instanceof Error ? error.message : "Error inesperado con el agente"
      toast({ title: "Error", description })
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: "No pude procesar tu consulta, intenta nuevamente.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Asistente inteligente</h2>
            <p className="text-sm text-muted-foreground">
              Obtén insights de la base de datos y recomendaciones en segundos.
            </p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="max-h-80 overflow-y-auto space-y-3 pr-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-sm",
              message.role === "assistant" ? "bg-muted/40" : "bg-primary/5 border-primary/40",
            )}
          >
            <div
              className={cn(
                "mt-0.5 h-8 w-8 flex items-center justify-center rounded-full",
                message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-foreground text-background",
              )}
            >
              {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className="flex-1 space-y-2">
              <p className="whitespace-pre-wrap leading-6 text-foreground">{message.content}</p>
              {message.sources && message.sources.length > 0 ? (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold">Fuentes sugeridas:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {message.sources.map((source, index) => (
                      <li key={index}>
                        {source.url ? (
                          <a href={source.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            {source.title ?? source.url}
                          </a>
                        ) : (
                          source.title ?? "Referencia interna"
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ej. ¿Qué proyectos están cerca de su fecha límite?"
          rows={3}
          disabled={loading}
        />
        <div className="flex justify-end">
          <Button type="button" onClick={handleSubmit} disabled={loading || input.trim().length === 0}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Consultar
          </Button>
        </div>
      </div>
    </Card>
  )
}
