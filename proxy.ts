import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session"

const PUBLIC_ROUTES = ["/login"]
const AUTH_API_PREFIX = "/api/auth"

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith(`${route}?`))

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = token ? await verifySessionToken(token) : null
  const isAuthenticated = Boolean(session)

  if (pathname.startsWith("/api")) {
    if (pathname.startsWith(AUTH_API_PREFIX)) {
      return NextResponse.next()
    }

    if (!isAuthenticated) {
      const response = NextResponse.json({ message: "No autorizado" }, { status: 401 })
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        maxAge: 0,
        path: "/",
      })
      return response
    }

    return NextResponse.next()
  }

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
