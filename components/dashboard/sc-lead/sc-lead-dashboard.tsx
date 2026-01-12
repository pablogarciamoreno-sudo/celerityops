"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Users,
  Calendar,
  ClipboardCheck,
  Rocket,
  AlertTriangle,
  Star,
  Settings,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
} from "@/lib/types/database"

// ========================================
// 39 KPIs del módulo SC Lead (del JSON)
// ========================================
const KPI_DEFINITIONS = [
  // RECLUTAMIENTO (5 KPIs)
  { id: "SC-001", key: "screen_failure_rate", label: "Screen Failure Rate", category: "recruitment", target: 15, operator: "<=", unit: "%", frequency: "Semanal" },
  { id: "SC-002", key: "conversion_screening_randomized", label: "Conversión Screening→Randomizado", category: "recruitment", target: 35, operator: ">=", unit: "%", frequency: "Semanal" },
  { id: "SC-003", key: "days_referral_to_contact", label: "Tiempo Derivación→Contacto", category: "recruitment", target: 1, operator: "<=", unit: "días", frequency: "Por paciente" },
  { id: "SC-004", key: "recruitment_target_compliance", label: "% Cumplimiento Targets Reclutamiento", category: "recruitment", target: 85, operator: ">=", unit: "%", frequency: "Mensual" },
  { id: "SC-005", key: "randomized_vs_projection", label: "Randomizados vs Proyección", category: "recruitment", target: 90, operator: ">=", unit: "%", frequency: "Semanal" },

  // EJECUCIÓN DE VISITAS (4 KPIs)
  { id: "SC-006", key: "visits_completed_pct", label: "% Visitas Completadas", category: "execution", target: 90, operator: ">=", unit: "%", frequency: "Semanal" },
  { id: "SC-007", key: "visit_window_adherence", label: "% Adherencia Ventana Visita", category: "execution", target: 90, operator: ">=", unit: "%", frequency: "Semanal" },
  { id: "SC-008", key: "procedures_complete_pct", label: "% Procedimientos Completos por Visita", category: "execution", target: 95, operator: ">=", unit: "%", frequency: "Semanal" },
  { id: "SC-009", key: "patient_retention_monthly", label: "Retención de Pacientes", category: "execution", target: 90, operator: ">=", unit: "%", frequency: "Mensual" },

  // SEGURIDAD Y COMPLIANCE (5 KPIs)
  { id: "SC-010", key: "sae_reported_on_time", label: "% SAEs Reportados en Plazo", category: "safety", target: 100, operator: "=", unit: "%", frequency: "Por evento" },
  { id: "SC-011", key: "major_deviations_weekly", label: "Desviaciones Mayores (semana)", category: "safety", target: 2, operator: "<=", unit: "qty", frequency: "Semanal" },
  { id: "SC-012", key: "protocol_deviation_rate", label: "Tasa Desviaciones Protocolo", category: "safety", target: 3, operator: "<=", unit: "%", frequency: "Mensual" },
  { id: "SC-013", key: "major_deviation_rate", label: "Tasa Desviaciones Mayores", category: "safety", target: 1, operator: "<=", unit: "%", frequency: "Mensual" },
  { id: "SC-014", key: "open_capas", label: "CAPAs Abiertas del Área", category: "safety", target: 3, operator: "<=", unit: "qty", frequency: "Semanal" },

  // MONITORING ACTION ITEMS (6 KPIs)
  { id: "SC-019", key: "open_action_items", label: "Action Items Abiertos", category: "monitoring", target: 5, operator: "<=", unit: "qty", frequency: "Semanal" },
  { id: "SC-020", key: "ai_closed_on_time", label: "% AI Cerrados en Plazo (≤15d)", category: "monitoring", target: 90, operator: ">=", unit: "%", frequency: "Semanal" },
  { id: "SC-021", key: "ai_overdue", label: "AI Vencidos (>15 días)", category: "monitoring", target: 0, operator: "=", unit: "qty", frequency: "Semanal" },
  { id: "SC-022", key: "avg_days_ai_closure", label: "Promedio Días Cierre AI", category: "monitoring", target: 10, operator: "<=", unit: "días", frequency: "Semanal" },
  { id: "SC-023", key: "major_findings_mv_pct", label: "% Major Findings en MV", category: "monitoring", target: 5, operator: "<=", unit: "%", frequency: "Por MV" },
  { id: "SC-024", key: "audit_readiness_score", label: "Audit Readiness Score", category: "monitoring", target: 90, operator: ">=", unit: "%", frequency: "Mensual" },

  // START-UP Y REGULATORIO (6 KPIs)
  { id: "SC-025", key: "days_to_fpfv", label: "Tiempo hasta FPFV (días)", category: "startup", target: 30, operator: "<=", unit: "días", frequency: "Por estudio" },
  { id: "SC-026", key: "fpfv_within_30days_pct", label: "% Estudios con FPFV ≤30 días", category: "startup", target: 85, operator: ">=", unit: "%", frequency: "Trimestral" },
  { id: "SC-027", key: "submissions_no_resubmit", label: "% Sometimientos sin Re-sometimiento", category: "startup", target: 90, operator: ">=", unit: "%", frequency: "Trimestral" },
  { id: "SC-028", key: "ec_approval_cycle_days", label: "Tiempo Ciclo Aprobación EC", category: "startup", target: 45, operator: "<=", unit: "días", frequency: "Por estudio" },
  { id: "SC-029", key: "studies_in_startup", label: "Estudios en Start-Up Activos", category: "startup", target: null, operator: "info", unit: "qty", frequency: "Semanal" },
  { id: "SC-030", key: "pending_amendments", label: "Enmiendas Pendientes Aprobación", category: "startup", target: null, operator: "info", unit: "qty", frequency: "Semanal" },

  // SATISFACCIÓN PATROCINADORES (3 KPIs)
  { id: "SC-031", key: "sponsor_performance_score", label: "Score Evaluación Performance", category: "sponsor", target: 4, operator: ">=", unit: "/5.0", frequency: "Trimestral" },
  { id: "SC-032", key: "cra_response_48h", label: "% Consultas CRA/Sponsor ≤48h", category: "sponsor", target: 90, operator: ">=", unit: "%", frequency: "Semanal" },
  { id: "SC-033", key: "sponsor_nps", label: "NPS de Sponsors", category: "sponsor", target: 8, operator: ">=", unit: "/10", frequency: "Trimestral" },

  // GESTIÓN DE EQUIPO (6 KPIs)
  { id: "SC-034", key: "annual_turnover", label: "Turnover Anual Equipo", category: "team", target: 18, operator: "<=", unit: "%", frequency: "Anual" },
  { id: "SC-035", key: "satisfactory_performance_pct", label: "% Equipo Evaluación Satisfactoria", category: "team", target: 80, operator: ">=", unit: "%", frequency: "Semestral" },
  { id: "SC-036", key: "gcp_current_pct", label: "% Equipo GCP Vigente", category: "team", target: 100, operator: "=", unit: "%", frequency: "Mensual" },
  { id: "SC-037", key: "span_of_control", label: "Span of Control", category: "team", target: 8, operator: "<=", unit: "reportes", frequency: "Mensual" },
  { id: "SC-038", key: "training_completion_pct", label: "Training Completado vs Plan", category: "team", target: 90, operator: ">=", unit: "%", frequency: "Mensual" },
  { id: "SC-039", key: "workload_score", label: "Workload Score Equipo", category: "team", target: "2.5-3.5", operator: "range", unit: "score", frequency: "Semanal" },

  // EFICIENCIA OPERATIVA (4 KPIs)
  { id: "SC-040", key: "studies_per_coordinator", label: "Estudios Activos por Coordinador", category: "efficiency", target: "3-5", operator: "range", unit: "qty", frequency: "Mensual" },
  { id: "SC-041", key: "patients_per_coordinator", label: "Pacientes Activos por Coordinador", category: "efficiency", target: "15-25", operator: "range", unit: "qty", frequency: "Semanal" },
  { id: "SC-042", key: "contingency_resolution_hours", label: "Tiempo Resolución Contingencias", category: "efficiency", target: 4, operator: "<=", unit: "horas", frequency: "Por evento" },
  { id: "SC-043", key: "mv_siv_participation", label: "% Participación en MV/SIV", category: "efficiency", target: 100, operator: "=", unit: "%", frequency: "Por visita" },
]

// Categorías
const CATEGORIES = [
  { key: "recruitment", label: "Reclutamiento", icon: Target, color: "text-indigo-600", bgColor: "bg-indigo-50", count: 5 },
  { key: "execution", label: "Ejecución de Visitas", icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-50", count: 4 },
  { key: "safety", label: "Seguridad y Compliance", icon: AlertTriangle, color: "text-amber-600", bgColor: "bg-amber-50", count: 5 },
  { key: "monitoring", label: "Monitoring Action Items", icon: ClipboardCheck, color: "text-purple-600", bgColor: "bg-purple-50", count: 6 },
  { key: "startup", label: "Start-up y Regulatorio", icon: Rocket, color: "text-cyan-600", bgColor: "bg-cyan-50", count: 6 },
  { key: "sponsor", label: "Satisfacción Patrocinadores", icon: Star, color: "text-yellow-600", bgColor: "bg-yellow-50", count: 3 },
  { key: "team", label: "Gestión de Equipo", icon: Users, color: "text-emerald-600", bgColor: "bg-emerald-50", count: 6 },
  { key: "efficiency", label: "Eficiencia Operativa", icon: Settings, color: "text-slate-600", bgColor: "bg-slate-50", count: 4 },
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

// Calcular estado del KPI
function calculateStatus(value: number | null, target: number | string | null, operator: string): "on_target" | "warning" | "critical" | "info" | "no_data" {
  if (value === null || value === undefined) return "no_data"
  if (operator === "info" || target === null) return "info"

  if (operator === "range" && typeof target === "string") {
    const [min, max] = target.split("-").map(Number)
    if (value >= min && value <= max) return "on_target"
    if (value >= min * 0.8 && value <= max * 1.2) return "warning"
    return "critical"
  }

  const numTarget = typeof target === "number" ? target : parseFloat(String(target))

  switch (operator) {
    case "<=":
      if (value <= numTarget) return "on_target"
      if (value <= numTarget * 1.15) return "warning"
      return "critical"
    case ">=":
      if (value >= numTarget) return "on_target"
      if (value >= numTarget * 0.85) return "warning"
      return "critical"
    case "=":
      if (value === numTarget) return "on_target"
      if (Math.abs(value - numTarget) <= numTarget * 0.1) return "warning"
      return "critical"
    default:
      return "no_data"
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "on_target": return <Badge className="bg-green-100 text-green-800 text-xs">En Meta</Badge>
    case "warning": return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Alerta</Badge>
    case "critical": return <Badge className="bg-red-100 text-red-800 text-xs">Crítico</Badge>
    case "info": return <Badge className="bg-blue-100 text-blue-800 text-xs">Info</Badge>
    default: return <Badge variant="outline" className="text-xs">Sin Datos</Badge>
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "on_target": return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "warning": return <AlertCircle className="h-4 w-4 text-yellow-600" />
    case "critical": return <XCircle className="h-4 w-4 text-red-600" />
    case "info": return <Info className="h-4 w-4 text-blue-600" />
    default: return <Clock className="h-4 w-4 text-gray-400" />
  }
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
  const [activeCategory, setActiveCategory] = useState<string>("all")

  // Obtener último reporte semanal
  const latestReport = useMemo(() => {
    if (selectedSite === "all") return weeklyReports[0] || null
    return weeklyReports.find((r) => r.site_id === selectedSite) || null
  }, [weeklyReports, selectedSite])

  // Calcular valor de cada KPI
  const calculateKPIValue = (key: string): number | null => {
    const r = latestReport

    switch (key) {
      // Reclutamiento
      case "screen_failure_rate":
        if (!r?.patients_screened) return null
        return Math.round((r.screen_failures / r.patients_screened) * 100)
      case "conversion_screening_randomized":
        if (!r?.patients_screened) return null
        return Math.round((r.patients_randomized / r.patients_screened) * 100)
      case "days_referral_to_contact":
        return null // Calculado por paciente individual
      case "recruitment_target_compliance":
        if (!r?.monthly_target) return null
        return Math.round((r.monthly_accumulated / r.monthly_target) * 100)
      case "randomized_vs_projection":
        if (!r?.weekly_projection) return null
        return Math.round((r.weekly_actual / r.weekly_projection) * 100)

      // Ejecución
      case "visits_completed_pct":
        if (!r?.visits_planned) return null
        return Math.round((r.visits_completed / r.visits_planned) * 100)
      case "visit_window_adherence":
        if (!r?.visits_completed) return null
        return Math.round((r.visits_in_window / r.visits_completed) * 100)
      case "procedures_complete_pct":
        if (!r?.visits_completed) return null
        return Math.round((r.visits_procedures_complete / r.visits_completed) * 100)
      case "patient_retention_monthly":
        if (!r?.patients_ongoing_start) return null
        return Math.round(((r.patients_ongoing_start - r.patients_lost) / r.patients_ongoing_start) * 100)

      // Seguridad
      case "sae_reported_on_time":
        if (!r?.saes_identified) return r ? 100 : null
        return Math.round((r.saes_reported_24h / r.saes_identified) * 100)
      case "major_deviations_weekly":
        return r?.major_deviations ?? null
      case "protocol_deviation_rate":
        if (!r?.total_procedures_month) return null
        return Math.round((r.total_deviations_month / r.total_procedures_month) * 100 * 10) / 10
      case "major_deviation_rate":
        if (!r?.total_procedures_month) return null
        return Math.round((r.major_deviations_month / r.total_procedures_month) * 100 * 10) / 10
      case "open_capas":
        return r?.open_capas ?? null

      // Monitoring
      case "open_action_items":
        return actionItems.filter(ai => ai.status === "Abierto").length
      case "ai_closed_on_time":
        const closed = actionItems.filter(ai => ai.status === "Cerrado")
        if (closed.length === 0) return null
        const onTime = closed.filter(ai => {
          const created = new Date(ai.created_at)
          const closedDate = ai.closed_date ? new Date(ai.closed_date) : new Date()
          const days = Math.floor((closedDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
          return days <= 15
        })
        return Math.round((onTime.length / closed.length) * 100)
      case "ai_overdue":
        return actionItems.filter(ai => {
          if (ai.status === "Cerrado") return false
          const dueDate = new Date(ai.due_date)
          const today = new Date()
          return (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24) > 15
        }).length
      case "avg_days_ai_closure":
        const closedItems = actionItems.filter(ai => ai.status === "Cerrado" && ai.closed_date)
        if (closedItems.length === 0) return null
        const totalDays = closedItems.reduce((sum, ai) => {
          const created = new Date(ai.created_at)
          const closed = new Date(ai.closed_date!)
          return sum + Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        }, 0)
        return Math.round(totalDays / closedItems.length)
      case "major_findings_mv_pct":
        return null // Calculado por MV
      case "audit_readiness_score":
        const latestAudit = auditReadiness[0]
        return latestAudit?.score ?? null

      // Startup
      case "days_to_fpfv":
        return null // Calculado por estudio
      case "fpfv_within_30days_pct":
        const withFPFV = startupTrackers.filter(s => s.fpfv_date && s.ec_approval_date)
        if (withFPFV.length === 0) return null
        const within30 = withFPFV.filter(s => {
          const approval = new Date(s.ec_approval_date!)
          const fpfv = new Date(s.fpfv_date!)
          return (fpfv.getTime() - approval.getTime()) / (1000 * 60 * 60 * 24) <= 30
        })
        return Math.round((within30.length / withFPFV.length) * 100)
      case "submissions_no_resubmit":
        if (startupTrackers.length === 0) return null
        const noResubmit = startupTrackers.filter(s => !s.required_resubmission)
        return Math.round((noResubmit.length / startupTrackers.length) * 100)
      case "ec_approval_cycle_days":
        return null // Calculado por estudio
      case "studies_in_startup":
        return startupTrackers.filter(s => s.status !== "FPFV Logrado" && s.status !== "Suspendido").length
      case "pending_amendments":
        return startupTrackers.filter(s => s.status === "Aprobacion Pendiente").length

      // Sponsor
      case "sponsor_performance_score":
        return null // De evaluaciones trimestrales
      case "cra_response_48h":
        return null // De queries tracker
      case "sponsor_nps":
        return null // De evaluaciones

      // Team
      case "annual_turnover":
        return null // Cálculo anual
      case "satisfactory_performance_pct":
        if (teamMembers.length === 0) return null
        const satisfactory = teamMembers.filter(m => m.performance_rating === "Satisfactorio" || m.performance_rating === "Excepcional")
        return Math.round((satisfactory.length / teamMembers.length) * 100)
      case "gcp_current_pct":
        if (teamMembers.length === 0) return null
        const gcpCurrent = teamMembers.filter(m => m.gcp_current)
        return Math.round((gcpCurrent.length / teamMembers.length) * 100)
      case "span_of_control":
        return teamMembers.filter(m => m.is_active).length
      case "training_completion_pct":
        return null // De training tracker
      case "workload_score":
        const activeMembers = teamMembers.filter(m => m.is_active && m.workload_score)
        if (activeMembers.length === 0) return null
        return Math.round(activeMembers.reduce((sum, m) => sum + (m.workload_score || 0), 0) / activeMembers.length * 10) / 10

      // Efficiency
      case "studies_per_coordinator":
        if (!r?.total_coordinators) return null
        return Math.round((r.total_studies / r.total_coordinators) * 10) / 10
      case "patients_per_coordinator":
        if (!r?.total_coordinators) return null
        return Math.round((r.total_patients_ongoing / r.total_coordinators) * 10) / 10
      case "contingency_resolution_hours":
        return null // De contingencias
      case "mv_siv_participation":
        if (!r?.mv_siv_planned) return null
        return Math.round((r.mv_siv_participated / r.mv_siv_planned) * 100)

      default:
        return null
    }
  }

  // Calcular resumen
  const summary = useMemo(() => {
    let onTarget = 0, warning = 0, critical = 0, noData = 0

    KPI_DEFINITIONS.forEach(kpi => {
      if (kpi.operator === "info") return
      const value = calculateKPIValue(kpi.key)
      const status = calculateStatus(value, kpi.target, kpi.operator)
      if (status === "on_target") onTarget++
      else if (status === "warning") warning++
      else if (status === "critical") critical++
      else noData++
    })

    return { onTarget, warning, critical, noData, total: 39 }
  }, [latestReport, actionItems, startupTrackers, teamMembers, auditReadiness])

  // Filtrar KPIs por categoría
  const filteredKPIs = activeCategory === "all"
    ? KPI_DEFINITIONS
    : KPI_DEFINITIONS.filter(kpi => kpi.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scorecard SC Lead</h1>
          <p className="text-muted-foreground">39 KPIs en 8 categorías</p>
        </div>
        <Select value={selectedSite} onValueChange={setSelectedSite}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar Sitio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Sitios</SelectItem>
            {sites.map((site) => (
              <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{summary.onTarget}</p>
                <p className="text-sm text-green-600">En Meta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-700">{summary.warning}</p>
                <p className="text-sm text-yellow-600">En Alerta</p>
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
                <p className="text-sm text-red-600">Crítico</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-gray-700">{summary.noData}</p>
                <p className="text-sm text-gray-600">Sin Datos</p>
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
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin datos semanales</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primer registro semanal para ver los KPIs calculados.
              </p>
              <Button asChild>
                <a href="/dashboard/sc-lead/weekly-report">Crear Registro Semanal</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Todos (39)
          </TabsTrigger>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <TabsTrigger
                key={cat.key}
                value={cat.key}
                className="gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-3 w-3" />
                {cat.label} ({cat.count})
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeCategory === "all" ? "Todos los KPIs" : CATEGORIES.find(c => c.key === activeCategory)?.label}
              </CardTitle>
              <CardDescription>
                {filteredKPIs.length} indicadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredKPIs.map((kpi) => {
                  const value = calculateKPIValue(kpi.key)
                  const status = calculateStatus(value, kpi.target, kpi.operator)
                  const category = CATEGORIES.find(c => c.key === kpi.category)

                  return (
                    <div key={kpi.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{kpi.label}</span>
                            {activeCategory === "all" && category && (
                              <Badge variant="outline" className={`text-xs ${category.color}`}>
                                {category.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {kpi.id} | Meta: {kpi.target !== null ? `${kpi.operator === "range" ? "" : kpi.operator} ${kpi.target}` : "Info"} {kpi.unit} | {kpi.frequency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right min-w-[60px]">
                          <p className="text-lg font-bold">
                            {value !== null ? value : "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">{kpi.unit}</p>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button variant="outline" className="h-auto py-4 justify-start" asChild>
          <a href="/dashboard/sc-lead/weekly-report">
            <Calendar className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Registro Semanal</p>
              <p className="text-xs text-muted-foreground">Ingresar datos</p>
            </div>
          </a>
        </Button>
        <Button variant="outline" className="h-auto py-4 justify-start" asChild>
          <a href="/dashboard/sc-lead/action-items">
            <ClipboardCheck className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Action Items</p>
              <p className="text-xs text-muted-foreground">{actionItems.filter(ai => ai.status !== "Cerrado").length} abiertos</p>
            </div>
          </a>
        </Button>
        <Button variant="outline" className="h-auto py-4 justify-start" asChild>
          <a href="/dashboard/sc-lead/startup">
            <Rocket className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Start-up Tracker</p>
              <p className="text-xs text-muted-foreground">{startupTrackers.filter(s => s.status !== "FPFV Logrado").length} activos</p>
            </div>
          </a>
        </Button>
        <Button variant="outline" className="h-auto py-4 justify-start" asChild>
          <a href="/dashboard/sc-lead/team">
            <Users className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Equipo</p>
              <p className="text-xs text-muted-foreground">{teamMembers.filter(m => m.is_active).length} activos</p>
            </div>
          </a>
        </Button>
      </div>
    </div>
  )
}
