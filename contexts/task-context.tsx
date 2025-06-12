"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Task {
  id: number
  title: string
  description?: string
  due_date?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "overdue"
  category?: string
  estimated_time?: number
  actual_time?: number
  points_reward?: number
  created_at?: string
  updated_at?: string
}

interface TasksContextType {
  tasks: Task[]
  isLoading: boolean
  fetchTasks: () => Promise<void>
  createTask: (task: Partial<Task>) => Promise<boolean>
  updateTask: (id: number, updates: Partial<Task>) => Promise<boolean>
  deleteTask: (id: number) => Promise<boolean>
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth-token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tasks", {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async (taskData: Partial<Task>): Promise<boolean> => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        await fetchTasks() // Refrescar la lista
        return true
      }
      return false
    } catch (error) {
      console.error("Error creating task:", error)
      return false
    }
  }

  const updateTask = async (id: number, updates: Partial<Task>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchTasks() // Refrescar la lista
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating task:", error)
      return false
    }
  }

  const deleteTask = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        await fetchTasks() // Refrescar la lista
        return true
      }
      return false
    } catch (error) {
      console.error("Error deleting task:", error)
      return false
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    if (token) {
      fetchTasks()
    }
  }, [])

  return (
    <TasksContext.Provider
      value={{
        tasks,
        isLoading,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider")
  }
  return context
}
