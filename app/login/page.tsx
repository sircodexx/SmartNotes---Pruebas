"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GradientButton } from "@/components/ui/gradient-button"
import ClientOnly from "@/components/client-only"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Evitar hidration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Solo verificar token después de que el componente esté montado
  useEffect(() => {
    if (!mounted) return

    const token = localStorage.getItem("auth-token")
    if (token) {
      console.log("Token found in localStorage, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [mounted, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log("Attempting login with:", formData.email)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      console.log("Login response status:", response.status)

      const data = await response.json()
      console.log("Login response data:", data)

      if (response.ok && data.success) {
        console.log("Login successful, saving data and redirecting...")

        // Guardar datos del usuario en localStorage
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("auth-token", data.token)

        setLoginSuccess(true)

        // Esperar un momento y redirigir
        setTimeout(() => {
          console.log("Redirecting to dashboard...")
          window.location.href = "/dashboard"
        }, 1000)
      } else {
        console.log("Login failed:", data.error)
        setError(data.error || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error("Error en login:", error)
      setError("Error de conexión. Verifica tu conexión a internet.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartNotes
            </h1>
            <p className="text-gray-600 mt-2">Tu asistente académico inteligente</p>
          </motion.div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginSuccess ? (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    ¡Login exitoso! Redirigiendo al dashboard...
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@universidad.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <GradientButton type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </GradientButton>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ClientOnly>
  )
}
