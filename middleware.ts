import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware checking path:", pathname)

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register"]

  if (publicRoutes.includes(pathname)) {
    console.log("Public route, allowing access")
    return NextResponse.next()
  }

  // Allow root path to handle its own logic
  if (pathname === "/") {
    console.log("Root path, allowing access")
    return NextResponse.next()
  }

  // Check for authentication token (simple presence check)
  const token = request.cookies.get("auth-token")?.value

  console.log("Token found:", !!token)

  if (!token) {
    console.log("No token, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si hay token, permitir acceso
  console.log("Token present, allowing access")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
