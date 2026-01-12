"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Target,
  Users,
  Calendar,
  CheckSquare,
  Rocket,
  Shield,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
} from "lucide-react"
import type {
  SCLeadWeeklyReport,
  SCLeadActionItem,
  SCLeadStartupTracker,
  SCLeadTeamMember,
  SCLeadAuditReadiness,
  Site,
  KPIStatus,
  KPICategory,
} from "@/lib/types/database"

// Configuracion de categorias
const CATEGORIES = [
  { key: "recruitment" as KPICategory, label: "Reclutamiento", icon: Target, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  { key: "execution" as KPICategory, label: "Ejecucion Visitas", icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-50" },
  { key: "safety" as KPICategory, label: "Seguridad", icon: AlertCircle, color: "text-amber-600", bgColor: "bg-amber-50" },
  { key: "monitoring" as KPICategory, label: "Monitoring", icon: CheckSquare, color: "text-purple-600", bgColor: "bg-purple-50" },
  { key: "startup" as KPICategory, label: "Start-up", icon: Rocket, color: "text-cyan-600", bgColor: "bg-cyan-50" },
  { key: "sponsor" as KPICategory, label: "Sponsors", icon: Star, color: "text-yellow-600", bgColor: "bg-yellow-50" },
  { key: "team" as KPICategory, label: "Equipo", icon: Users, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { key: "efficiency" as KPICategory, label: "Eficiencia", icon: TrendingUp, color: "text-slate-600", bgColor: "bg-slate-50" },
]

interface SCLeadDashboardProps {
  weeklyReports: SCLeadWeeklyReport[]
  actionItems: SCLeadActionItem[]
  startupTrackers: SCLeadStartupTracker[]
  teamMembers: SCLeadTeamMember[]
  auditReadiness: SCLeadAuditReadiness[]
  sites: Site[]
  userSiteId: string | null
}

// Funcion para calcular estado del KPI
function calculateKPIStatus(
  value: number | null,
  target: number | string | null,
  operator: string
): KPIStatus {
  if (value === null || value === undefined) return "pending"
  if (operator === "info" || target === null) return "info"

  const numTarget = typeof target === "number" ? target : parseFloat(String(target))

  switch (operator) {
    case "<=":
      return value <= numTarget ? "on_target" : "critical"
    case ">=":
      return value >= numTarget ? "on_target" : "critical"
    case "=":
      return value === numTarget ? "on_target" : "critical"
    case "range":
      if (typeof target === "string" && target.includes("-")) {
        const [min, max] = target.split("-").map(Number)
        if (value >= min && value <= max) return "on_target"
        return "warning"
      }
      return "warning"
    default:
      return "pending"
  }
}

function getStatusIcon(status: KPIStatus) {
  switch (status) {
    case "on_target":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "warning":
      return <AlertCircle className="h-4 w-4 text-amber-500" />
    case "critical":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "info":
      return <Info className="h-4 w-4 text-blue-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

function getStatusBg(status: KPIStatus) {
  switch (status) {
    case "on_target":
      return "bg-green-50 border-green-200"
    case "warning":
      return "bg-amber-50 border-amber-200"
    case "critical":
      return "bg-red-50 border-red-200"
    case "info":
      return "bg-blue-50 border-blue-200"
    default:
      return "bg-gray-50 border-gray-200"
  }
}

// Componente KPI Card
function KPICard({
  label,
  value,
  target,
  unit,
  status,
}: {
  label: string
  value: number | string | null
  target: number | string | null
  unit: string
  status: KPIStatus
}) {
  return (
    <div className={`p-4 rounded-lg border ${getStatusBg(status)}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 line-clamp-2">{label}</span>
        {getStatusIcon(status)}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {value !== null ? value : "-"}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
      {target !== null && (
        <div className="mt-1 text-xs text-gray-500">
          Meta: {target}{unit}
        </div>
      )}
    </div>
  )
}

export function SCLeadDashboard({
  weeklyReports,
  actionItems,
  startupTrackers,
  teamMembers,
  auditReadiness,
  sites,
  userSiteId,
}: SCLeadDashboardProps) {
  const [selectedSite, setSelectedSite] = useState<string>(userSiteId || "all")

  // Obtener el ultimo reporte semanal
  const latestReport = useMemo(() => {
    if (selectedSite === "all") {
      return weeklyReports[0] || null
    }
    return weeklyReports.find((r) => r.site_id === selectedSite) || null
  }, [weeklyReports, selectedSite])

  // Calcular KPIs desde el reporte semanal
  const kpis = useMemo(() => {
    if (!latestReport) {
      return {
        recruitment: [],
        execution: [],
        safety: [],
        monitoring: [],
        startup: [],
        sponsor: [],
        team: [],
        efficiency: [],
      }
    }

    const r = latestReport

    // Screen Failure Rate
    const screenFailureRate = r.patients_screened > 0
      ? Math.round((r.screen_failures / r.patients_screened) * 100)
      : null

    // Conversion Rate
    const conversionRate = r.patients_screened > 0
      ? Math.round((r.patients_randomized / r.patients_screened) * 100)
      : null

    // % Visits Completed
    const visitsCompletedPct = r.visits_planned > 0
      ? Math.round((r.visits_completed / r.visits_planned) * 100)
      : null

    // % Visit Window Adherence
    const visitWindowPct = r.visits_completed > 0
      ? Math.round((r.visits_in_window / r.visits_completed) * 100)
      : null

    // % Procedures Complete
    const proceduresCompletePct = r.visits_completed > 0
      ? Math.round((r.visits_procedures_complete / r.visits_completed) * 100)
      : null

    // Retention Rate
    const retentionRate = r.patients_ongoing_start > 0
      ? Math.round(((r.patients_ongoing_start - r.patients_lost) / r.patients_ongoing_start) * 100)
      : null

    // SAE Reported on Time
    const saeOnTime = r.saes_identified > 0
      ? Math.round((r.saes_reported_24h / r.saes_identified) * 100)
      : 100

    // Protocol Deviation Rate
    const deviationRate = r.total_procedures_month > 0
      ? Math.round((r.total_deviations_month / r.total_procedures_month) * 100 * 10) / 10
      : null

    // MV/SIV Participation
    const mvParticipation = r.mv_siv_planned > 0
      ? Math.round((r.mv_siv_participated / r.mv_siv_planned) * 100)
      : null

    // Studies per Coordinator
    const studiesPerCoord = r.total_coordinators > 0
      ? Math.round((r.total_studies / r.total_coordinators) * 10) / 10
      : null

    // Patients per Coordinator
    const patientsPerCoord = r.total_coordinators > 0
      ? Math.round((r.total_patients_ongoing / r.total_coordinators) * 10) / 10
      : null

    // Action items counts
    const openAI = actionItems.filter((ai) => ai.status === "Abierto").length
    const overdueAI = actionItems.filter((ai) => {
      if (ai.status === "Cerrado") return false
      const dueDate = new Date(ai.due_date)
      const today = new Date()
      const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays > 15
    }).length

    // Team with GCP current
    const gcpCurrentPct = teamMembers.length > 0
      ? Math.round((teamMembers.filter((t) => t.gcp_current).length / teamMembers.length) * 100)
      : null

    // Startup studies count
    const studiesInStartup = startupTrackers.filter(
      (s) => s.status !== "FPFV Logrado" && s.status !== "Suspendido"
    ).length

    return {
      recruitment: [
        { label: "Screen Failure Rate", value: screenFailureRate, target: 15, unit: "%", operator: "<=" },
        { label: "Conversion Screening->Randomizado", value: conversionRate, target: 35, unit: "%", operator: ">=" },
        { label: "Randomizados vs Proyeccion", value: r.weekly_projection > 0 ? Math.round((r.weekly_actual / r.weekly_projection) * 100) : null, target: 90, unit: "%", operator: ">=" },
      ],
      execution: [
        { label: "% Visitas Completadas", value: visitsCompletedPct, target: 90, unit: "%", operator: ">=" },
        { label: "% Adherencia Ventana", value: visitWindowPct, target: 90, unit: "%", operator: ">=" },
        { label: "% Procedimientos Completos", value: proceduresCompletePct, target: 95, unit: "%", operator: ">=" },
        { label: "Retencion Pacientes", value: retentionRate, target: 90, unit: "%", operator: ">=" },
      ],
      safety: [
        { label: "% SAEs Reportados en Plazo", value: saeOnTime, target: 100, unit: "%", operator: "=" },
        { label: "Desviaciones Mayores (semana)", value: r.major_deviations, target: 2, unit: "qty", operator: "<=" },
        { label: "Tasa Desviaciones", value: deviationRate, target: 3, unit: "%", operator: "<=" },
        { label: "CAPAs Abiertas", value: r.open_capas, target: 3, unit: "qty", operator: "<=" },
      ],
      monitoring: [
        { label: "Action Items Abiertos", value: openAI, target: 5, unit: "qty", operator: "<=" },
        { label: "AI Vencidos (>15d)", value: overdueAI, target: 0, unit: "qty", operator: "=" },
      ],
      startup: [
        { label: "Estudios en Start-Up", value: studiesInStartup, target: null, unit: "qty", operator: "info" },
      ],
      sponsor: [],
      team: [
        { label: "% Equipo GCP Vigente", value: gcpCurrentPct, target: 100, unit: "%", operator: "=" },
        { label: "Total Coordinadores", value: r.total_coordinators, target: null, unit: "", operator: "info" },
      ],
      efficiency: [
        { label: "Estudios por Coordinador", value: studiesPerCoord, target: "3-5", unit: "", operator: "range" },
        { label: "Pacientes por Coordinador", value: patientsPerCoord, target: "15-25", unit: "", operator: "range" },
        { label: "% Participacion MV/SIV", value: mvParticipation, target: 100, unit: "%", operator: "=" },
      ],
    }
  }, [latestReport, actionItems, teamMembers, startupTrackers])

  // Calcular resumen de estados
  const summary = useMemo(() => {
    let onTarget = 0
    let warning = 0
    let critical = 0
    let total = 0

    Object.values(kpis).forEach((categoryKpis) => {
      categoryKpis.forEach((kpi) => {
        if (kpi.operator === "info") return
        total++
        const status = calculateKPIStatus(kpi.value, kpi.target, kpi.operator)
        if (status === "on_target") onTarget++
        else if (status === "warning") warning++
        else if (status === "critical") critical++
      })
    })

    return { onTarget, warning, critical, total }
  }, [kpis])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scorecard SC Lead</h1>
          <p className="text-muted-foreground">
            Study Coordinator Lead - KPIs Operativos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar Sitio" />
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{summary.onTarget}</p>
                <p className="text-sm text-green-600">KPIs en Meta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-700">{summary.warning}</p>
                <p className="text-sm text-amber-600">KPIs en Alerta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-700">{summary.critical}</p>
                <p className="text-sm text-red-600">KPIs Criticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{summary.total}</p>
                <p className="text-sm text-blue-600">Total KPIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No data message */}
      {!latestReport && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin datos semanales</h3>
              <p className="text-muted-foreground mb-4">
                No hay reportes semanales registrados aun. Comienza creando tu primer registro semanal.
              </p>
              <Button asChild>
                <a href="/dashboard/sc-lead/weekly-report">Crear Registro Semanal</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs by Category */}
      {latestReport && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.key} value={cat.key} className="gap-1">
                <cat.icon className="h-3 w-3" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {CATEGORIES.map((category) => {
              const categoryKpis = kpis[category.key]
              if (!categoryKpis || categoryKpis.length === 0) return null

              return (
                <Card key={category.key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                      {category.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {categoryKpis.map((kpi, idx) => (
                        <KPICard
                          key={idx}
                          label={kpi.label}
                          value={kpi.value}
                          target={kpi.target}
                          unit={kpi.unit}
                          status={calculateKPIStatus(kpi.value, kpi.target, kpi.operator)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {CATEGORIES.map((category) => (
            <TabsContent key={category.key} value={category.key}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className={`h-5 w-5 ${category.color}`} />
                    {category.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {kpis[category.key]?.map((kpi, idx) => (
                      <KPICard
                        key={idx}
                        label={kpi.label}
                        value={kpi.value}
                        target={kpi.target}
                        unit={kpi.unit}
                        status={calculateKPIStatus(kpi.value, kpi.target, kpi.operator)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/dashboard/sc-lead/action-items"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <CheckSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Action Items</p>
                <p className="text-sm text-muted-foreground">
                  {actionItems.filter((ai) => ai.status !== "Cerrado").length} abiertos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/dashboard/sc-lead/startup"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-50">
                <Rocket className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium">Start-up Tracker</p>
                <p className="text-sm text-muted-foreground">
                  {startupTrackers.filter((s) => s.status !== "FPFV Logrado" && s.status !== "Suspendido").length} en proceso
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/dashboard/sc-lead/team"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Equipo</p>
                <p className="text-sm text-muted-foreground">
                  {teamMembers.length} miembros activos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
