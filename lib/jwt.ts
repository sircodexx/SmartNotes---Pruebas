import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface JWTPayload {
  userId: number
  email: string
  name: string
  iat?: number
  exp?: number
}

export function signToken(payload: JWTPayload): string {
  // Crear payload limpio sin campos adicionales
  const cleanPayload = {
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  }

  console.log("Signing token with payload:", cleanPayload)
  console.log("Using JWT_SECRET:", JWT_SECRET.substring(0, 10) + "...")

  return jwt.sign(cleanPayload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    console.log("Verifying token:", token.substring(0, 20) + "...")
    console.log("Using JWT_SECRET for verification:", JWT_SECRET.substring(0, 10) + "...")

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    console.log("Token verification successful:", decoded)

    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}
