import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyPassword } from "@/lib/password"
import { signToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt for:", email) // Debug log

    // Buscar usuario
    const [users] = await db.execute(
      "SELECT id, email, password, name, career, semester, university, points, level FROM users WHERE email = ?",
      [email],
    )

    const user = (users as any[])[0]
    if (!user) {
      console.log("User not found:", email) // Debug log
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    console.log("User found:", user.email) // Debug log

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      console.log("Invalid password for:", email) // Debug log
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    console.log("Password valid for:", email) // Debug log

    // Generar token JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    console.log("Token generated for:", email) // Debug log
    console.log("Generated token:", token.substring(0, 50) + "...") // Debug log

    // Crear respuesta con datos del usuario
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      career: user.career,
      semester: user.semester,
      university: user.university,
      points: user.points,
      level: user.level,
    }

    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: userData,
      token,
    })

    // Configurar cookie con el token
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    })

    console.log("Cookie set with token") // Debug log
    console.log("Login successful for:", email) // Debug log

    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
