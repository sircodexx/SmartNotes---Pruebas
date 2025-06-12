import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request)
    const sessionId = params.id

    // Marcar sesión como completada
    await db.execute("UPDATE focus_sessions SET completed = TRUE, ended_at = NOW() WHERE id = ? AND user_id = ?", [
      sessionId,
      user.userId,
    ])

    // Otorgar puntos por sesión completada
    const focusPoints = 15
    await db.execute("UPDATE users SET points = points + ? WHERE id = ?", [focusPoints, user.userId])

    // Actualizar estadísticas diarias
    const today = new Date().toISOString().split("T")[0]
    await db.execute(
      `INSERT INTO daily_stats (user_id, date, focus_sessions, points_earned) 
       VALUES (?, ?, 1, ?) 
       ON DUPLICATE KEY UPDATE 
       focus_sessions = focus_sessions + 1, 
       points_earned = points_earned + ?`,
      [user.userId, today, focusPoints, focusPoints],
    )

    return NextResponse.json({
      message: "Sesión de enfoque completada",
      pointsEarned: focusPoints,
    })
  } catch (error) {
    console.error("Error completando sesión de enfoque:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
