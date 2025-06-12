"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay token antes de redirigir
    const token = localStorage.getItem("auth-token")

    if (token) {
      console.log("Token found, redirecting to dashboard")
      router.push("/dashboard")
    } else {
      console.log("No token found, redirecting to login")
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
