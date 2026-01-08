"use client"

import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      <SidebarTrigger className="-ml-2">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Alternar barra lateral</span>
      </SidebarTrigger>

      <Separator orientation="vertical" className="h-6" />

      {/* Indicador de sitio */}
      {user?.site && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {user.site.name}
          </Badge>
        </div>
      )}

      {/* Búsqueda */}
      <div className="flex-1 flex justify-center max-w-md mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar estudios, sujetos, documentos..."
            className="w-full pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Notificaciones */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
              3
            </span>
            <span className="sr-only">Notificaciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="font-medium text-sm">Crítico: SAE reportado</span>
            </div>
            <span className="text-xs text-muted-foreground ml-4">ONCO-2024-001 - Sujeto ABC - hace 2 horas</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <span className="font-medium text-sm">Query antigüedad {">"} 10 días</span>
            </div>
            <span className="text-xs text-muted-foreground ml-4">5 queries requieren atención - hace 1 día</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-medium text-sm">Visita de monitoreo programada</span>
            </div>
            <span className="text-xs text-muted-foreground ml-4">CARD-2024-001 - Próximo lunes - hace 3 días</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-center text-primary cursor-pointer">
            Ver todas las notificaciones
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Fecha/hora actual */}
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-medium">
          {new Date().toLocaleDateString("es-ES", { weekday: "short", month: "short", day: "numeric" })}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </header>
  )
}
