"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Activity,
  Lock,
  Mail,
  Users,
  Building2,
  FlaskConical,
  FileCheck,
  Database,
  Shield,
  Copy,
  Check,
  UserPlus,
} from "lucide-react"
import Link from "next/link"

const TEST_USERS = [
  {
    email: "coo@celerity.com",
    role: "COO",
    name: "Director de Operaciones",
    icon: Activity,
    site: "Global",
  },
  {
    email: "sitelead@celerity.com",
    role: "Site Lead",
    name: "Líder de Sitio",
    icon: Building2,
    site: "México",
  },
  {
    email: "coordinator@celerity.com",
    role: "Study Coordinator",
    name: "Coordinador de Estudio",
    icon: FlaskConical,
    site: "México",
  },
  {
    email: "regulatory@celerity.com",
    role: "Regulatory Specialist",
    name: "Especialista Regulatorio",
    icon: FileCheck,
    site: "Chile",
  },
  {
    email: "dataentry@celerity.com",
    role: "Data Entry Specialist",
    name: "Especialista Data Entry",
    icon: Database,
    site: "México",
  },
  {
    email: "qa@celerity.com",
    role: "QA Manager",
    name: "Gerente de Calidad",
    icon: Shield,
    site: "Brasil",
  },
]

const TEST_PASSWORD = "Celerity2024!"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTestUsers, setShowTestUsers] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Intentando login con:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Respuesta de login:", { data, error })

      if (error) throw error

      if (data.user) {
        console.log("[v0] Login exitoso, redirigiendo a dashboard")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: unknown) {
      console.error("[v0] Error en login:", error)
      const errorMessage = error instanceof Error ? error.message : "Ha ocurrido un error"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectUser = (userEmail: string) => {
    setEmail(userEmail)
    setPassword(TEST_PASSWORD)
    setCopiedEmail(userEmail)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(TEST_PASSWORD)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 2000)
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-6">
          {/* Logo y marca */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-600">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Celerity</h1>
            <p className="text-sm text-slate-500">Operaciones de Investigación Clínica</p>
          </div>

          <Card className="w-full border-slate-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-slate-900">Bienvenido</CardTitle>
              <CardDescription className="text-slate-500">Inicia sesión para acceder a tu panel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nombre@celerity.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-700">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>
                  )}
                  <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>

                  <Link href="/register" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-sky-300 text-sky-700 hover:bg-sky-50 bg-transparent"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Crear cuenta nueva
                    </Button>
                  </Link>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent"
                  onClick={() => setShowTestUsers(!showTestUsers)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {showTestUsers ? "Ocultar usuarios de prueba" : "Ver usuarios de prueba"}
                </Button>

                {showTestUsers && (
                  <div className="mt-4 space-y-3">
                    {/* Contraseña común */}
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-amber-800">Contraseña para todos:</p>
                          <p className="text-sm font-mono text-amber-900">{TEST_PASSWORD}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPassword}
                          className="h-8 w-8 p-0 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                        >
                          {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 text-center">
                      Haz clic en un usuario para auto-completar las credenciales
                    </p>

                    {TEST_USERS.map((testUser) => {
                      const Icon = testUser.icon
                      const isSelected = copiedEmail === testUser.email
                      return (
                        <button
                          key={testUser.email}
                          type="button"
                          onClick={() => handleSelectUser(testUser.email)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                            isSelected
                              ? "border-sky-500 bg-sky-50"
                              : "border-slate-200 hover:border-sky-300 hover:bg-sky-50"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              isSelected ? "bg-sky-100" : "bg-slate-100"
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${isSelected ? "text-sky-600" : "text-slate-600"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">{testUser.role}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {testUser.email} • {testUser.site}
                            </p>
                          </div>
                          {isSelected && <Check className="h-5 w-5 text-sky-600 flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-slate-400">Información de salud protegida. Solo usuarios autorizados.</p>
        </div>
      </div>
    </div>
  )
}
