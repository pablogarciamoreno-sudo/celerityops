"use client"

import { KPICard } from "@/components/dashboard/kpi-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, Users, CheckSquare, TrendingUp, Clock, Building2 } from "lucide-react"
import type { Site, Study } from "@/lib/types/database"

interface SiteLeadDashboardProps {
  site?: Site
  kpis: {
    activeStudies: number
    teamMembers: number
    openActionItems: number
    enrollmentsThisMonth: number
  }
  studies: Study[]
  team: Array<{ id: string; full_name: string; email: string; role?: { name: string } }>
  actionItems: Array<{
    id: string
    action_item_description: string
    due_date: string
    priority: string
    status: string
    study?: { protocol_number: string }
  }>
  recentActivity: Array<{
    id: string
    screening_date: string
    status: string
    subject_initials: string
    user?: { full_name: string }
    study?: { protocol_number: string }
  }>
}

export function SiteLeadDashboard({ site, kpis, studies, team, actionItems, recentActivity }: SiteLeadDashboardProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="space-y-6">
      {/* Encabezado de página */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{site?.name || "Panel del Sitio"}</h1>
          <p className="text-muted-foreground">
            {site?.city}, {site?.country}
          </p>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Estudios Activos"
          value={kpis.activeStudies}
          icon={<FlaskConical className="h-4 w-4" />}
          status="neutral"
        />
        <KPICard
          title="Miembros del Equipo"
          value={kpis.teamMembers}
          icon={<Users className="h-4 w-4" />}
          status="neutral"
        />
        <KPICard
          title="Ítems Acción Abiertos"
          value={kpis.openActionItems}
          icon={<CheckSquare className="h-4 w-4" />}
          status={kpis.openActionItems > 10 ? "warning" : "success"}
        />
        <KPICard
          title="Enrolamientos Este Mes"
          value={kpis.enrollmentsThisMonth}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 15, direction: "up" }}
          status="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Actividad del Equipo */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Miembros del Equipo
            </CardTitle>
            <CardDescription>Estado de actividad de tu equipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {team.slice(0, 6).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role?.name}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" title="Activo recientemente" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estudios Activos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Estudios Activos
            </CardTitle>
            <CardDescription>Estudios en ejecución en este sitio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studies
                .filter((s) => s.status === "active" || s.status === "enrolling")
                .map((study) => (
                  <div key={study.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">{study.protocol_number}</span>
                        <StatusBadge status={study.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {study.sponsor} • {study.therapeutic_area}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{study.phase}</p>
                      <p className="text-xs text-muted-foreground">Meta: {study.target_enrollment}</p>
                    </div>
                  </div>
                ))}
              {studies.filter((s) => s.status === "active" || s.status === "enrolling").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Sin estudios activos</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ítems de Acción */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Ítems de Acción Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionItems.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {item.study?.protocol_number}
                    </Badge>
                    <StatusBadge status={item.priority} />
                  </div>
                  <p className="text-sm">{item.action_item_description}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Vence: {new Date(item.due_date).toLocaleDateString("es-ES")}
                  </div>
                </div>
              ))}
              {actionItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Sin ítems de acción pendientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos tamizajes y enrolamientos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Sujeto {activity.subject_initials}</span>
                      <StatusBadge status={activity.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.study?.protocol_number} • {activity.user?.full_name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.screening_date).toLocaleDateString("es-ES")}
                  </span>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Sin actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
