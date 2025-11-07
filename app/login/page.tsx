import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { getCurrentUser } from "@/lib/auth/current-user"

export const metadata: Metadata = {
  title: "Ingresar | Panel de Agencia",
}

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card/90 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Bienvenido</CardTitle>
          <CardDescription>Accede con tu correo corporativo para administrar operaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
