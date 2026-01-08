"use client"

import { KPICard } from "@/components/dashboard/kpi-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  Users,
  AlertCircle,
  Clock,
  CheckSquare,
  FlaskConical,
  Download,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { EnrollmentChart } from "./enrollment-chart"
import { SiteComparisonChart } from "./site-comparison-chart"
import { ScreeningChart } from "./screening-chart"
import { useState } from "react"
import type { Study, Alert, Site } from "@/lib/types/database"

interface COODashboardProps {
  kpis: {
    activeStudies: number
    totalEnrollments: number
    screenFailureRate: number
    openQueries: number
    avgQueryAging: number
    openActionItems: number
  }
  studies: Study[]
  screenings: Array<{ id: string; screening_date: string; status: string; study?: { protocol_number: string } }>
  enrollments: Array<{ id: string; enrollment_date: string; study?: { protocol_number: string } }>
  queries: Array<{ id: string; status: string; aging_days: number; study?: { protocol_number: string } }>
  actionItems: Array<{
    id: string
    action_item_description: string
    due_date: string
    priority: string
    status: string
    cra_name: string
    study?: { protocol_number: string }
    site?: { name: string }
  }>
  alerts: Alert[]
  sites: Site[]
}

export function COODashboard({
  kpis,
  studies,
  screenings,
  enrollments,
  queries,
  actionItems,
  alerts,
  sites,
}: COODashboardProps) {
  const [selectedSite, setSelectedSite] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("30")

  return (
    <div className="space-y-6">
      {/* Encabezado de página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel Ejecutivo</h1>
          <p className="text-muted-foreground">Resumen de todas las operaciones clínicas por sitio</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos los Sitios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Sitios</SelectItem>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="365">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Estudios Activos"
          value={kpis.activeStudies}
          icon={<FlaskConical className="h-4 w-4" />}
          trend={{ value: 12, direction: "up", label: "vs mes anterior" }}
          status="neutral"
        />
        <KPICard
          title="Total Enrolados"
          value={kpis.totalEnrollments}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 8, direction: "up", label: "vs mes anterior" }}
          status="success"
        />
        <KPICard
          title="Tasa Fallo Tamizaje"
          value={`${kpis.screenFailureRate}%`}
          icon={<Activity className="h-4 w-4" />}
          trend={{ value: 3, direction: "down", label: "mejora" }}
          status={kpis.screenFailureRate > 35 ? "critical" : kpis.screenFailureRate > 25 ? "warning" : "success"}
        />
        <KPICard
          title="Queries Abiertos"
          value={kpis.openQueries}
          icon={<AlertCircle className="h-4 w-4" />}
          trend={{ value: 15, direction: "down", label: "resueltos" }}
          status={kpis.openQueries > 50 ? "critical" : kpis.openQueries > 20 ? "warning" : "success"}
        />
        <KPICard
          title="Antigüedad Prom. Query"
          value={`${kpis.avgQueryAging}d`}
          icon={<Clock className="h-4 w-4" />}
          subtitle="días para resolución"
          status={kpis.avgQueryAging > 10 ? "critical" : kpis.avgQueryAging > 5 ? "warning" : "success"}
        />
        <KPICard
          title="Ítems Acción Abiertos"
          value={kpis.openActionItems}
          icon={<CheckSquare className="h-4 w-4" />}
          trend={{ value: 5, direction: "down", label: "cerrados esta semana" }}
          status={kpis.openActionItems > 20 ? "critical" : kpis.openActionItems > 10 ? "warning" : "success"}
        />
      </div>

      {/* Fila de gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Tendencia de Enrolamiento"
          description="Progreso mensual de enrolamiento en todos los estudios"
          action={
            <Button variant="ghost" size="sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              Detalles
            </Button>
          }
        >
          <EnrollmentChart enrollments={enrollments} />
        </ChartCard>

        <ChartCard title="Fallos de Tamizaje por Estudio" description="Distribución de resultados de tamizaje">
          <ScreeningChart screenings={screenings} studies={studies} />
        </ChartCard>
      </div>

      {/* Comparación de sitios */}
      <ChartCard title="Comparación de Rendimiento por Sitio" description="Métricas clave en todos los sitios">
        <SiteComparisonChart sites={sites} studies={studies} enrollments={enrollments} queries={queries} />
      </ChartCard>

      {/* Sección inferior: Alertas e Ítems de Acción */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Alertas Activas
            </CardTitle>
            <CardDescription>Ítems críticos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin alertas activas</p>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div
                      className={`h-2 w-2 rounded-full mt-2 ${
                        alert.severity === "critical"
                          ? "bg-destructive"
                          : alert.severity === "warning"
                            ? "bg-amber-500"
                            : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <StatusBadge status={alert.severity} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ítems de Acción */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Ítems de Acción Pendientes
            </CardTitle>
            <CardDescription>Seguimientos de visitas de monitoreo</CardDescription>
          </CardHeader>
          <CardContent>
            {actionItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin ítems de acción pendientes</p>
            ) : (
              <div className="space-y-3">
                {actionItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary">{item.study?.protocol_number}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{item.site?.name}</span>
                      </div>
                      <p className="text-sm truncate">{item.action_item_description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">CRA: {item.cra_name}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          Vence: {new Date(item.due_date).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={item.priority} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Estudios */}
      <Card>
        <CardHeader>
          <CardTitle>Estudios Activos</CardTitle>
          <CardDescription>Todos los estudios en todos los sitios</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos ({studies.length})</TabsTrigger>
              <TabsTrigger value="enrolling">
                Enrolando ({studies.filter((s) => s.status === "enrolling").length})
              </TabsTrigger>
              <TabsTrigger value="active">Activos ({studies.filter((s) => s.status === "active").length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <StudiesTable studies={studies} />
            </TabsContent>
            <TabsContent value="enrolling" className="mt-4">
              <StudiesTable studies={studies.filter((s) => s.status === "enrolling")} />
            </TabsContent>
            <TabsContent value="active" className="mt-4">
              <StudiesTable studies={studies.filter((s) => s.status === "active")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function StudiesTable({ studies }: { studies: Study[] }) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium">Protocolo</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Patrocinador</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Área</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Fase</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Sitio</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Meta</th>
          </tr>
        </thead>
        <tbody>
          {studies.map((study) => (
            <tr key={study.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <span className="font-medium text-primary">{study.protocol_number}</span>
              </td>
              <td className="px-4 py-3 text-sm">{study.sponsor}</td>
              <td className="px-4 py-3 text-sm">{study.therapeutic_area}</td>
              <td className="px-4 py-3 text-sm">{study.phase}</td>
              <td className="px-4 py-3 text-sm">{study.site?.name || "-"}</td>
              <td className="px-4 py-3">
                <StatusBadge status={study.status} />
              </td>
              <td className="px-4 py-3 text-sm">{study.target_enrollment}</td>
            </tr>
          ))}
          {studies.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                No se encontraron estudios
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
