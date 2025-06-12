"use client"

import { TrendingUp, Target, Clock, Trophy, CheckCircle, AlertCircle } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AnimatedCard } from "@/components/ui/animated-card"
import ClientOnly from "@/components/client-only"

interface StatsOverviewProps {
  stats: {
    user: { points: number; level: number }
    taskStats: Array<{ status: string; count: number }>
    dailyStats: Array<{
      date: string
      tasks_completed: number
      time_studied: number
      points_earned: number
      focus_sessions: number
    }>
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const totalTasks = stats.taskStats.reduce((sum, stat) => sum + stat.count, 0)
  const completedTasks = stats.taskStats.find((s) => s.status === "completed")?.count || 0
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const todayStats = stats.dailyStats[0] || {
    tasks_completed: 0,
    time_studied: 0,
    points_earned: 0,
    focus_sessions: 0,
  }

  const weeklyTasks = stats.dailyStats.slice(0, 7).reduce((sum, day) => sum + day.tasks_completed, 0)
  const weeklyTime = stats.dailyStats.slice(0, 7).reduce((sum, day) => sum + day.time_studied, 0)

  const statCards = [
    {
      title: "Tareas Completadas Hoy",
      value: todayStats.tasks_completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tiempo de Estudio",
      value: `${Math.floor(todayStats.time_studied / 60)}h ${todayStats.time_studied % 60}m`,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Puntos Ganados",
      value: todayStats.points_earned,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Sesiones de Enfoque",
      value: todayStats.focus_sessions,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <ClientOnly>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <AnimatedCard key={stat.title} delay={index * 0.1}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          ))}
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard delay={0.4}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Progreso Semanal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tareas Completadas</span>
                  <span>{weeklyTasks}/35</span>
                </div>
                <Progress value={(weeklyTasks / 35) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiempo de Estudio</span>
                  <span>{Math.floor(weeklyTime / 60)}h / 40h</span>
                </div>
                <Progress value={(weeklyTime / 2400) * 100} className="h-2" />
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.5}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span>Resumen de Tareas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tasa de Completado</span>
                  <span className="font-semibold">{completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  {stats.taskStats.map((stat) => (
                    <div key={stat.status} className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                      <p className="text-xs text-gray-600 capitalize">{stat.status.replace("_", " ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </ClientOnly>
  )
}
