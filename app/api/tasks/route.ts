import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")

    let query = "SELECT * FROM tasks WHERE user_id = ?"
    const params: any[] = [user.userId]

    if (status) {
      query += " AND status = ?"
      params.push(status)
    }

    if (priority) {
      query += " AND priority = ?"
      params.push(priority)
    }

    query += " ORDER BY due_date ASC, priority DESC"

    const [tasks] = await db.execute(query, params)

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error obteniendo tareas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { title, description, due_date, priority, category, estimated_time } = await request.json()

    const [result] = await db.execute(
      "INSERT INTO tasks (user_id, title, description, due_date, priority, category, estimated_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [user.userId, title, description, due_date, priority, category, estimated_time],
    )

    const taskId = (result as any).insertId

    // Crear recordatorio automático si hay fecha límite
    if (due_date) {
      const reminderTime = new Date(due_date)
      reminderTime.setHours(reminderTime.getHours() - 2) // 2 horas antes

      await db.execute("INSERT INTO reminders (task_id, user_id, reminder_time, message) VALUES (?, ?, ?, ?)", [
        taskId,
        user.userId,
        reminderTime,
        `Recordatorio: ${title} vence pronto`,
      ])
    }

    return NextResponse.json({
      message: "Tarea creada exitosamente",
      taskId,
    })
  } catch (error) {
    console.error("Error creando tarea:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
