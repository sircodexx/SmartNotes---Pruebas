import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { signToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, career, semester, university } = await request.json()

    console.log("Register attempt for:", email) // Debug log

    // Verificar si el usuario ya existe
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email])

    if ((existingUsers as any[]).length > 0) {
      console.log("User already exists:", email) // Debug log
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
    }

    // Crear nuevo usuario
    const hashedPassword = await hashPassword(password)
    const [result] = await db.execute(
      "INSERT INTO users (email, password, name, career, semester, university) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, name, career, semester, university],
    )

    const userId = (result as any).insertId
    console.log("User created with ID:", userId) // Debug log

    // Crear configuraciones por defecto
    await db.execute("INSERT INTO user_settings (user_id) VALUES (?)", [userId])

    // Generar token JWT
    const token = signToken({ userId, email, name })

    const userData = {
      id: userId,
      email,
      name,
      career,
      semester,
      university,
      points: 0,
      level: 1,
    }

    const response = NextResponse.json({
      success: true,
      message: "Usuario registrado exitosamente",
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

    console.log("Registration successful for:", email) // Debug log

    return response
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
