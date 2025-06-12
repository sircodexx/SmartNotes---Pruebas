"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Calendar, Target, Zap } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { TaskCard } from "@/components/dashboard/task-card"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GradientButton } from "@/components/ui/gradient-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import ClientOnly from "@/components/client-only"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
  points: number
  level: number
  avatar_url?: string
}

interface Task {
  id: number
  title: string
  description?: string
  due_date?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "overdue"
  category?: string
  estimated_time?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [filter, setFilter] = useState({ status: "all", priority: "all" })
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium" as const,
    category: "",
    estimated_time: "",
  })

  useEffect(() => {
    // Verificar autenticación del lado del cliente
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user")
      const token = localStorage.getItem("auth-token")

      console.log("Checking auth - User:", !!storedUser, "Token:", !!token)

      if (!storedUser || !token) {
        console.log("No user data or token found, redirecting to login")
        router.push("/login")
        return
      }

      // Verificar que el token sea válido haciendo una petición a la API
      try {
        const response = await fetch("/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 401) {
          console.log("Token invalid, clearing storage and redirecting")
          localStorage.removeItem("user")
          localStorage.removeItem("auth-token")
          router.push("/login")
          return
        }

        if (response.ok) {
          // Token válido, cargar usuario
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setAuthChecked(true)
          fetchDashboardData()
        } else {
          throw new Error("Failed to verify token")
        }
      } catch (error) {
        console.error("Error verifying auth:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("auth-token")
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth-token")

      if (!token) {
        router.push("/login")
        return
      }

      // Fetch stats and user data
      const statsResponse = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
        setUser(statsData.user)
      } else if (statsResponse.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem("user")
        localStorage.removeItem("auth-token")
        router.push("/login")
        return
      }

      // Fetch tasks
      const tasksResponse = await fetch("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData.tasks)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("auth-token")

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newTask,
          estimated_time: newTask.estimated_time ? Number.parseInt(newTask.estimated_time) : null,
        }),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setNewTask({
          title: "",
          description: "",
          due_date: "",
          priority: "medium",
          category: "",
          estimated_time: "",
        })
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const handleTaskStatusChange = async (taskId: number, status: string) => {
    try {
      const token = localStorage.getItem("auth-token")

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const handleTaskDelete = async (taskId: number) => {
    try {
      const token = localStorage.getItem("auth-token")

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filter.status === "all" || task.status === filter.status
    const matchesPriority = filter.priority === "all" || task.priority === filter.priority
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Mostrar loading mientras se verifica la autenticación
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{!authChecked ? "Verificando autenticación..." : "Cargando tu dashboard..."}</p>
        </div>
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />

        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Hola, {user?.name}! 👋</h1>
            <p className="text-gray-600">
              Bienvenido a tu dashboard. Aquí podrás gestionar tus tareas y ver tu progreso.
            </p>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="mb-8">
              <StatsOverview stats={stats} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <AnimatedCard>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Nueva Tarea</h3>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Crear
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Tarea</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="priority">Prioridad</Label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="estimated_time">Tiempo (min)</Label>
                          <Input
                            id="estimated_time"
                            type="number"
                            value={newTask.estimated_time}
                            onChange={(e) => setNewTask({ ...newTask, estimated_time: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="due_date">Fecha límite</Label>
                        <Input
                          id="due_date"
                          type="datetime-local"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Categoría</Label>
                        <Input
                          id="category"
                          value={newTask.category}
                          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                          placeholder="Ej: Matemáticas, Historia..."
                        />
                      </div>
                      <GradientButton type="submit" className="w-full">
                        Crear Tarea
                      </GradientButton>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.1}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Modo Enfoque</h3>
                <Button variant="outline" size="sm">
                  Iniciar
                </Button>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Calendario</h3>
                <Button variant="outline" size="sm">
                  Ver
                </Button>
              </div>
            </AnimatedCard>
          </div>

          {/* Tasks Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">Mis Tareas ({filteredTasks.length})</h2>

              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Buscar tareas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="md:w-64"
                />

                <div className="flex gap-2">
                  <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filter.priority} onValueChange={(value) => setFilter({ ...filter, priority: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
                  <p className="text-gray-600 mb-4">
                    {tasks.length === 0
                      ? "¡Crea tu primera tarea para comenzar!"
                      : "No se encontraron tareas con los filtros aplicados"}
                  </p>
                  {tasks.length === 0 && (
                    <GradientButton onClick={() => setIsCreateDialogOpen(true)}>Crear Primera Tarea</GradientButton>
                  )}
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleTaskStatusChange}
                    onEdit={(task) => {
                      // TODO: Implement edit functionality
                      console.log("Edit task:", task)
                    }}
                    onDelete={handleTaskDelete}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </ClientOnly>
  )
}
