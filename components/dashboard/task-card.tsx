"use client"

import { useState } from "react"
import { Calendar, Clock, Flag, MoreVertical, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import ClientOnly from "@/components/client-only"

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

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: number, status: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
}

const statusColors = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleToggleComplete = async () => {
    setIsCompleting(true)
    const newStatus = task.status === "completed" ? "pending" : "completed"
    await onStatusChange(task.id, newStatus)
    setIsCompleting(false)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"

  return (
    <ClientOnly>
      <Card
        className={cn(
          "transition-all duration-300 hover:shadow-md border-l-4",
          task.status === "completed"
            ? "opacity-75 border-l-green-500"
            : isOverdue
              ? "border-l-red-500"
              : "border-l-blue-500",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 mt-1"
                onClick={handleToggleComplete}
                disabled={isCompleting}
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                )}
              </Button>

              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-medium text-gray-900 mb-1",
                    task.status === "completed" && "line-through text-gray-500",
                  )}
                >
                  {task.title}
                </h3>

                {task.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>}

                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {task.due_date && (
                    <div className={cn("flex items-center space-x-1", isOverdue && "text-red-600")}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  )}

                  {task.estimated_time && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.estimated_time}min</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority}
                  </Badge>

                  <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>
                    {task.status.replace("_", " ")}
                  </Badge>

                  {task.category && (
                    <Badge variant="secondary" className="text-xs">
                      {task.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>Editar</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "in_progress")}
                  disabled={task.status === "completed"}
                >
                  Marcar en progreso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  )
}
