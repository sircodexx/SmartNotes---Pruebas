import type { NextRequest } from "next/server"
import { verifyToken } from "./jwt"

export function getAuthUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

  if (!token) return null

  return verifyToken(token)
}

export function requireAuth(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}
