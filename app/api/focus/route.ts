import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { task_id, duration } = await request.json()

    const [result] = await db.execute("INSERT INTO focus_sessions (user_id, task_id, duration) VALUES (?, ?, ?)", [
      user.userId,
      task_id || null,
      duration,
    ])

    return NextResponse.json({
      message: "Sesión de enfoque iniciada",
      sessionId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error iniciando sesión de enfoque:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
