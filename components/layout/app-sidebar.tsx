"use client"

import type React from "react"

import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  FlaskConical,
  Home,
  LogOut,
  Search,
  Settings,
  Shield,
  Users,
  AlertTriangle,
  CheckSquare,
  FileCheck,
  Database,
  Target,
  Calendar,
  UserCog,
  Rocket,
  Star,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const navigationByRole: Record<
  string,
  { label: string; items: { title: string; url: string; icon: React.ElementType }[] }[]
> = {
  COO: [
    {
      label: "General",
      items: [
        { title: "Panel Principal", url: "/dashboard/coo", icon: Home },
        { title: "Analíticas", url: "/dashboard/coo/analytics", icon: BarChart3 },
        { title: "Centro de Consultas", url: "/dashboard/coo/query-center", icon: Search },
      ],
    },
    {
      label: "Operaciones",
      items: [
        { title: "Sitios", url: "/dashboard/coo/sites", icon: Building2 },
        { title: "Estudios", url: "/dashboard/coo/studies", icon: FlaskConical },
        { title: "Equipo", url: "/dashboard/coo/team", icon: Users },
      ],
    },
    {
      label: "Calidad",
      items: [
        { title: "Alertas", url: "/dashboard/coo/alerts", icon: Bell },
        { title: "Ítems de Acción", url: "/dashboard/coo/action-items", icon: CheckSquare },
      ],
    },
    {
      label: "Configuración",
      items: [{ title: "Metas KPI", url: "/dashboard/coo/settings", icon: Settings }],
    },
  ],
  "Site Lead": [
    {
      label: "General",
      items: [
        { title: "Panel Principal", url: "/dashboard/site-lead", icon: Home },
        { title: "Actividad del Equipo", url: "/dashboard/site-lead/team", icon: Users },
      ],
    },
    {
      label: "Estudios",
      items: [
        { title: "Estudios Activos", url: "/dashboard/site-lead/studies", icon: FlaskConical },
        { title: "Ítems de Acción", url: "/dashboard/site-lead/action-items", icon: CheckSquare },
      ],
    },
    {
      label: "Registrar",
      items: [{ title: "Notas de Supervisión", url: "/dashboard/site-lead/register", icon: FileText }],
    },
  ],
  "SC Lead": [
    {
      label: "General",
      items: [
        { title: "Scorecard KPIs", url: "/dashboard/sc-lead", icon: Target },
        { title: "Registro Semanal", url: "/dashboard/sc-lead/weekly-report", icon: Calendar },
      ],
    },
    {
      label: "Operaciones",
      items: [
        { title: "Action Items", url: "/dashboard/sc-lead/action-items", icon: CheckSquare },
        { title: "Start-up Tracker", url: "/dashboard/sc-lead/startup", icon: Rocket },
        { title: "Audit Readiness", url: "/dashboard/sc-lead/audit-readiness", icon: Shield },
      ],
    },
    {
      label: "Equipo",
      items: [
        { title: "Roster Equipo", url: "/dashboard/sc-lead/team", icon: UserCog },
        { title: "Evaluaciones Sponsor", url: "/dashboard/sc-lead/sponsor-evals", icon: Star },
      ],
    },
  ],
  "Study Coordinator": [
    {
      label: "General",
      items: [
        { title: "Panel Principal", url: "/dashboard/coordinator", icon: Home },
        { title: "Mis Estudios", url: "/dashboard/coordinator/studies", icon: FlaskConical },
      ],
    },
    {
      label: "Registrar",
      items: [
        { title: "Tamizajes", url: "/dashboard/coordinator/screenings", icon: ClipboardList },
        { title: "Enrolamientos", url: "/dashboard/coordinator/enrollments", icon: Users },
        { title: "Visitas", url: "/dashboard/coordinator/visits", icon: FileCheck },
        { title: "Eventos Adversos", url: "/dashboard/coordinator/adverse-events", icon: AlertTriangle },
      ],
    },
    {
      label: "Historial",
      items: [{ title: "Mis Registros", url: "/dashboard/coordinator/history", icon: Database }],
    },
  ],
  "Regulatory Specialist": [
    {
      label: "General",
      items: [
        { title: "Panel Principal", url: "/dashboard/regulatory", icon: Home },
        { title: "Mis Estudios", url: "/dashboard/regulatory/studies", icon: FlaskConical },
      ],
    },
    {
      label: "Registrar",
      items: [
        { title: "Sometimientos", url: "/dashboard/regulatory/submissions", icon: FileText },
        { title: "Docs. Esenciales", url: "/dashboard/regulatory/documents", icon: FileCheck },
      ],
    },
    {
      label: "Historial",
      items: [{ title: "Mis Registros", url: "/dashboard/regulatory/history", icon: Database }],
    },
  ],
  "Data Entry Specialist": [
    {
      label: "General",
      items: [
        { title: "Panel Principal", url: "/dashboard/data-entry", icon: Home },
        { title: "Mis Estudios", url: "/dashboard/data-entry/studies", icon: FlaskConical },
      ],
    },
    {
      label: "Registrar",
      items: [{ title: "Resolver Queries", url: "/dashboard/data-entry/queries", icon: ClipboardList }],
    },
    {
      label: "Historial",
      items: [{ title: "Mis Registros", url: "/dashboard/data-entry/history", icon: Database }],
    },
  ],
  "QA Manager": [
    {
      label: "General",
      items: [
        { title: "Panel Principal", url: "/dashboard/qa", icon: Home },
        { title: "Métricas de Calidad", url: "/dashboard/qa/metrics", icon: BarChart3 },
      ],
    },
    {
      label: "Calidad",
      items: [
        { title: "Desviaciones", url: "/dashboard/qa/deviations", icon: AlertTriangle },
        { title: "CAPAs", url: "/dashboard/qa/capas", icon: Shield },
        { title: "Ítems de Acción", url: "/dashboard/qa/action-items", icon: CheckSquare },
      ],
    },
    {
      label: "Registrar",
      items: [{ title: "Nuevo Hallazgo", url: "/dashboard/qa/register", icon: FileText }],
    },
  ],
}

export function AppSidebar() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()

  const roleName = user?.role?.name || "Study Coordinator"
  const navigation = navigationByRole[roleName] || navigationByRole["Study Coordinator"]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Celerity</span>
            <span className="text-xs text-sidebar-foreground/60">Operaciones CRO</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider px-2">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground"
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {loading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full bg-sidebar-accent" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24 bg-sidebar-accent" />
              <Skeleton className="h-3 w-16 bg-sidebar-accent" />
            </div>
          </div>
        ) : user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{user.full_name}</span>
                <span className="text-xs text-sidebar-foreground/60 truncate">{user.role?.name}</span>
              </div>
            </div>
            <SidebarSeparator />
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  )
}
