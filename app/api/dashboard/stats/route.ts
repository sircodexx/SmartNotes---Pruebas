import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week" // week, month, year

    let dateFilter = ""
    if (period === "week") {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
    } else if (period === "month") {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)"
    } else if (period === "year") {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)"
    }

    // Estadísticas generales
    const [userStats] = await db.execute("SELECT points, level FROM users WHERE id = ?", [user.userId])

    // Tareas por estado
    const [taskStats] = await db.execute(
      `SELECT 
        status,
        COUNT(*) as count
       FROM tasks 
       WHERE user_id = ? 
       GROUP BY status`,
      [user.userId],
    )

    // Estadísticas diarias
    const [dailyStats] = await db.execute(
      `SELECT 
        date,
        tasks_completed,
        time_studied,
        points_earned,
        focus_sessions
       FROM daily_stats 
       WHERE user_id = ? ${dateFilter}
       ORDER BY date DESC`,
      [user.userId],
    )

    // Logros del usuario
    const [achievements] = await db.execute(
      `SELECT a.name, a.description, a.icon, a.badge_type, ua.earned_at
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = ?
       ORDER BY ua.earned_at DESC`,
      [user.userId],
    )

    // Próximas tareas
    const [upcomingTasks] = await db.execute(
      `SELECT id, title, due_date, priority, status
       FROM tasks 
       WHERE user_id = ? AND status != 'completed' AND due_date >= NOW()
       ORDER BY due_date ASC
       LIMIT 5`,
      [user.userId],
    )

    return NextResponse.json({
      user: (userStats as any[])[0],
      taskStats,
      dailyStats,
      achievements,
      upcomingTasks,
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
