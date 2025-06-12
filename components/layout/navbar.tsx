"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Search, User, LogOut, Settings, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import ClientOnly from "@/components/client-only"

interface NavbarProps {
  user?: {
    id: number
    name: string
    email: string
    points: number
    level: number
    avatar_url?: string
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    localStorage.removeItem("user")
    localStorage.removeItem("auth-token")
    router.push("/login")
  }

  // Si no hay usuario, no renderizar nada o mostrar un estado de carga
  if (!user) {
    return null
  }

  return (
    <ClientOnly>
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SN</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SmartNotes
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-0 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-gray-500">
                          Nivel {user?.level} • {user?.points} pts
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trophy className="mr-2 h-4 w-4" />
                    Logros
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </ClientOnly>
  )
}
