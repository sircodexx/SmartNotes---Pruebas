import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request)
    const taskId = params.id
    const updates = await request.json()

    // Verificar que la tarea pertenece al usuario
    const [tasks] = await db.execute("SELECT id FROM tasks WHERE id = ? AND user_id = ?", [taskId, user.userId])

    if ((tasks as any[]).length === 0) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    // Construir query dinámicamente
    const fields = Object.keys(updates)
    const values = Object.values(updates)
    const setClause = fields.map((field) => `${field} = ?`).join(", ")

    await db.execute(`UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, [
      ...values,
      taskId,
      user.userId,
    ])

    // Si se marca como completada, otorgar puntos
    if (updates.status === "completed") {
      const [taskData] = await db.execute("SELECT points_reward FROM tasks WHERE id = ?", [taskId])

      const points = (taskData as any[])[0]?.points_reward || 10

      await db.execute("UPDATE users SET points = points + ? WHERE id = ?", [points, user.userId])

      // Actualizar estadísticas diarias
      const today = new Date().toISOString().split("T")[0]
      await db.execute(
        `INSERT INTO daily_stats (user_id, date, tasks_completed, points_earned) 
         VALUES (?, ?, 1, ?) 
         ON DUPLICATE KEY UPDATE 
         tasks_completed = tasks_completed + 1, 
         points_earned = points_earned + ?`,
        [user.userId, today, points, points],
      )
    }

    return NextResponse.json({ message: "Tarea actualizada exitosamente" })
  } catch (error) {
    console.error("Error actualizando tarea:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request)
    const taskId = params.id

    await db.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", [taskId, user.userId])

    return NextResponse.json({ message: "Tarea eliminada exitosamente" })
  } catch (error) {
    console.error("Error eliminando tarea:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
