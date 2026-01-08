"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Activity, Lock, Mail, User, ArrowLeft, Building2, Briefcase, Loader2 } from "lucide-react"
import Link from "next/link"

interface Role {
  id: string
  name: string
  description: string
}

interface Site {
  id: string
  name: string
  code: string
  country: string
}

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [roleId, setRoleId] = useState("")
  const [siteId, setSiteId] = useState("")
  const [roles, setRoles] = useState<Role[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      console.log("[v0] Iniciando carga de roles y sites...")
      setIsLoadingData(true)

      try {
        // Obtener roles
        const { data: rolesData, error: rolesError } = await supabase
          .from("roles")
          .select("id, name, description")
          .order("name")

        console.log("[v0] Roles response:", { rolesData, rolesError })

        if (rolesError) {
          console.error("[v0] Error cargando roles:", rolesError)
        } else if (rolesData) {
          setRoles(rolesData)
        }

        // Obtener sitios
        const { data: sitesData, error: sitesError } = await supabase
          .from("sites")
          .select("id, name, code, country")
          .eq("is_active", true)
          .order("name")

        console.log("[v0] Sites response:", { sitesData, sitesError })

        if (sitesError) {
          console.error("[v0] Error cargando sites:", sitesError)
        } else if (sitesData) {
          setSites(sitesData)
        }
      } catch (err) {
        console.error("[v0] Error en fetchData:", err)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    if (!roleId) {
      setError("Por favor selecciona un rol")
      setIsLoading(false)
      return
    }

    if (!siteId) {
      setError("Por favor selecciona un sitio")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Iniciando registro...")

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            full_name: fullName,
          },
        },
      })

      console.log("[v0] Auth response:", { authData, authError })

      if (authError) throw authError

      if (authData.user) {
        console.log("[v0] Usuario auth creado, insertando en tabla users...")

        const { error: insertError } = await supabase.from("users").insert({
          auth_id: authData.user.id,
          email: email,
          full_name: fullName,
          role_id: roleId,
          site_id: siteId,
        })

        console.log("[v0] Insert result:", { insertError })

        if (insertError) {
          console.error("[v0] Error insertando usuario:", insertError)
          throw new Error("Database error saving new user")
        }

        console.log("[v0] Usuario creado exitosamente")
        setSuccess(true)

        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
      }
    } catch (error: unknown) {
      console.error("[v0] Error en registro:", error)
      const errorMessage = error instanceof Error ? error.message : "Ha ocurrido un error"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-slate-50 p-6">
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Cuenta creada exitosamente</h2>
              <p className="text-sm text-slate-500">Redirigiendo al dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
              <CardTitle className="text-xl text-slate-900">Crear cuenta</CardTitle>
              <CardDescription className="text-slate-500">Completa el formulario para registrarte</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-4">
                  {/* Nombre completo */}
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-slate-700">
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Tu nombre completo"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nombre@ejemplo.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-slate-700">
                      Rol
                    </Label>
                    <div className="relative">
                      {isLoadingData ? (
                        <div className="flex items-center gap-2 h-10 px-3 border border-slate-300 rounded-md bg-slate-50">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          <span className="text-sm text-slate-500">Cargando roles...</span>
                        </div>
                      ) : roles.length === 0 ? (
                        <div className="flex items-center gap-2 h-10 px-3 border border-red-300 rounded-md bg-red-50">
                          <span className="text-sm text-red-600">Error: No se pudieron cargar los roles</span>
                        </div>
                      ) : (
                        <>
                          <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                          <Select value={roleId} onValueChange={setRoleId}>
                            <SelectTrigger className="pl-10 border-slate-300 focus:border-sky-500 focus:ring-sky-500">
                              <SelectValue placeholder="Selecciona tu rol" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  <div className="flex flex-col">
                                    <span>{role.name}</span>
                                    {role.description && (
                                      <span className="text-xs text-slate-500">{role.description}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="site" className="text-slate-700">
                      Sitio
                    </Label>
                    <div className="relative">
                      {isLoadingData ? (
                        <div className="flex items-center gap-2 h-10 px-3 border border-slate-300 rounded-md bg-slate-50">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          <span className="text-sm text-slate-500">Cargando sitios...</span>
                        </div>
                      ) : sites.length === 0 ? (
                        <div className="flex items-center gap-2 h-10 px-3 border border-red-300 rounded-md bg-red-50">
                          <span className="text-sm text-red-600">Error: No se pudieron cargar los sitios</span>
                        </div>
                      ) : (
                        <>
                          <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                          <Select value={siteId} onValueChange={setSiteId}>
                            <SelectTrigger className="pl-10 border-slate-300 focus:border-sky-500 focus:ring-sky-500">
                              <SelectValue placeholder="Selecciona tu sitio" />
                            </SelectTrigger>
                            <SelectContent>
                              {sites.map((site) => (
                                <SelectItem key={site.id} value={site.id}>
                                  <span>{site.name}</span>
                                  <span className="ml-2 text-xs text-slate-500">({site.code})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-700">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* Confirmar contraseña */}
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700">
                      Confirmar contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>
                  )}

                  <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <Link href="/login">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-slate-400">Información de salud protegida. Solo usuarios autorizados.</p>
        </div>
      </div>
    </div>
  )
}
