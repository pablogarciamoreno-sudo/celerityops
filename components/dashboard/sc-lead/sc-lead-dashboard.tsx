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
// 28 KPIs del módulo SC Lead (del KPIs.md)
// Fuente: SC Lead/KPIs.md
// ========================================
const KPI_DEFINITIONS = [
  // 🚀 START-UP (6 KPIs: #1-6)
  { id: "SC-01", key: "feasibility_response", label: "Respuesta a Factibilidad (site)", category: "startup", target: 2, operator: "<=", unit: "días", frequency: "Por estudio" },
  { id: "SC-02", key: "team_assignment_post_selection", label: "Asignación de Equipo Post-Selección", category: "startup", target: 3, operator: "<=", unit: "días", frequency: "Por estudio" },
  { id: "SC-03", key: "training_completed_pre_siv", label: "Entrenamientos Sistemas Completados Pre-SIV", category: "startup", target: 100, operator: "=", unit: "%", frequency: "Por estudio" },
  { id: "SC-04", key: "checklist_pre_siv", label: "Checklist Pre-SIV Completado (1 sem antes)", category: "startup", target: 100, operator: "=", unit: "%", frequency: "Por estudio" },
  { id: "SC-05", key: "siv_to_fpi", label: "SIV → FPI", category: "startup", target: 21, operator: "<=", unit: "días", frequency: "Por estudio" },
  { id: "SC-06", key: "siv_mv_participation", label: "Participación en SIV/MV", category: "startup", target: 100, operator: "=", unit: "%", frequency: "Por visita" },

  // 🎯 RECLUTAMIENTO Y RETENCIÓN (6 KPIs: #7-12)
  { id: "SC-07", key: "enrollment_vs_plan", label: "Enrollment vs Plan (site)", category: "recruitment", target: 85, operator: ">=", unit: "%", frequency: "Mensual" },
  { id: "SC-08", key: "screen_fail_rate", label: "Screen-Fail Rate", category: "recruitment", target: 28, operator: "<=", unit: "%", frequency: "Mensual" },
  { id: "SC-09", key: "patient_retention", label: "Retención de Pacientes", category: "recruitment", target: 85, operator: ">=", unit: "%", frequency: "Mensual" },
  { id: "SC-10", key: "referral_to_contact", label: "Tiempo Derivación → Contacto Paciente", category: "recruitment", target: 24, operator: "<=", unit: "horas", frequency: "Por paciente" },
  { id: "SC-11", key: "visits_completed_vs_planned", label: "% Visitas Completadas vs Planificadas", category: "recruitment", target: 95, operator: ">=", unit: "%", frequency: "Semanal" },
  { id: "SC-12", key: "visit_window_adherence", label: "% Adherencia a Ventana de Visita", category: "recruitment", target: 90, operator: ">=", unit: "%", frequency: "Semanal" },

  // 📊 CALIDAD DE DATOS (6 KPIs: #13-18)
  { id: "SC-13", key: "query_resolution", label: "Resolución de Queries", category: "quality", target: 48, operator: "<=", unit: "horas", frequency: "Por query" },
  { id: "SC-14", key: "etmf_completeness", label: "eTMF Completeness", category: "quality", target: 95, operator: ">=", unit: "%", frequency: "Mensual" },
  { id: "SC-15", key: "critical_deviations_per_100", label: "Desviaciones Críticas / 100 Visitas", category: "quality", target: 2, operator: "<=", unit: "qty", frequency: "Mensual" },
  { id: "SC-16", key: "protocol_deviation_rate", label: "Tasa Desviaciones Protocolo (todas)", category: "quality", target: 3, operator: "<=", unit: "%", frequency: "Mensual" },
  { id: "SC-17", key: "sae_reported_24h", label: "% SAEs Reportados <24h", category: "quality", target: 100, operator: "=", unit: "%", frequency: "Por evento" },
  { id: "SC-18", key: "capa_closed_on_time", label: "CAPA Cerradas On-Time", category: "quality", target: 95, operator: ">=", unit: "%", frequency: "Mensual" },

  // 💻 TRANSFORMACIÓN DIGITAL (2 KPIs: #20-21)
  { id: "SC-20", key: "data_entry_post_visit", label: "Data Entry Post-Visita", category: "digital", target: 24, operator: "<=", unit: "horas", frequency: "Por visita" },
  { id: "SC-21", key: "etmf_docs_on_time", label: "% Documentos Subidos eTMF en Plazo", category: "digital", target: 95, operator: ">=", unit: "%", frequency: "Mensual" },

  // 📝 MONITOREO Y ACTION ITEMS (4 KPIs: #22-25)
  { id: "SC-22", key: "ai_closed_14days", label: "Action Items Cerrados ≤14 días", category: "monitoring", target: 95, operator: ">=", unit: "%", frequency: "Semanal" },
  { id: "SC-23", key: "ai_aging_30days", label: "Action Items Aging >30 días", category: "monitoring", target: 1, operator: "<=", unit: "qty", frequency: "Semanal" },
  { id: "SC-24", key: "avg_days_ai_closure", label: "Promedio Días Cierre Action Items", category: "monitoring", target: 7, operator: "<=", unit: "días", frequency: "Semanal" },
  { id: "SC-25", key: "major_findings_mv", label: "% Major Findings en MV", category: "monitoring", target: 5, operator: "<=", unit: "%", frequency: "Por MV" },

  // ⭐ SATISFACCIÓN SPONSORS (2 KPIs: #26-27)
  { id: "SC-26", key: "cra_response_48h", label: "% Consultas CRA/Sponsor Respondidas ≤48h", category: "sponsor", target: 95, operator: ">=", unit: "%", frequency: "Semanal" },
  { id: "SC-27", key: "sponsor_performance_score", label: "Score Evaluación Performance Sponsor", category: "sponsor", target: 4.0, operator: ">=", unit: "/5", frequency: "Trimestral" },

  // 👥 GESTIÓN DE EQUIPO (2 KPIs: #28-29)
  { id: "SC-28", key: "gcp_current_pct", label: "% Equipo GCP Vigente", category: "team", target: 100, operator: "=", unit: "%", frequency: "Mensual" },
  { id: "SC-29", key: "training_vs_plan", label: "Training Completado vs Plan", category: "team", target: 95, operator: ">=", unit: "%", frequency: "Mensual" },
]

// Categorías (7 del KPIs.md)
const CATEGORIES = [
  { key: "startup", label: "Start-up", icon: Rocket, color: "text-cyan-600", bgColor: "bg-cyan-50", count: 6 },
  { key: "recruitment", label: "Reclutamiento y Retención", icon: Target, color: "text-indigo-600", bgColor: "bg-indigo-50", count: 6 },
  { key: "quality", label: "Calidad de Datos", icon: ClipboardCheck, color: "text-amber-600", bgColor: "bg-amber-50", count: 6 },
  { key: "digital", label: "Transformación Digital", icon: Settings, color: "text-blue-600", bgColor: "bg-blue-50", count: 2 },
  { key: "monitoring", label: "Monitoreo y Action Items", icon: AlertTriangle, color: "text-purple-600", bgColor: "bg-purple-50", count: 4 },
  { key: "sponsor", label: "Satisfacción Sponsors", icon: Star, color: "text-yellow-600", bgColor: "bg-yellow-50", count: 2 },
  { key: "team", label: "Gestión de Equipo", icon: Users, color: "text-emerald-600", bgColor: "bg-emerald-50", count: 2 },
]

// Tipos para datos adicionales de KPIs
interface PatientContact {
  id: string
  site_id: string
  referral_date: string
  contact_date: string | null
  hours_to_contact: number | null
}

interface SponsorQuery {
  id: string
  site_id: string
  received_at: string
  responded_at: string | null
  hours_to_response: number | null
}

interface SponsorEvaluation {
  id: string
  site_id: string
  evaluation_date: string
  score: number
  quarter: string
}

interface SCLeadDashboardProps {
  weeklyReports: SCLeadWeeklyReport[]
  actionItems: SCLeadActionItem[]
  startupTrackers: SCLeadStartupTracker[]
  teamMembers: SCLeadTeamMember[]
  auditReadiness: SCLeadAuditReadiness[]
  sites: Site[]
  userSiteId: string | null
  patientContacts?: PatientContact[]
  sponsorQueries?: SponsorQuery[]
  sponsorEvaluations?: SponsorEvaluation[]
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
  patientContacts = [],
  sponsorQueries = [],
  sponsorEvaluations = [],
}: SCLeadDashboardProps) {
  const [selectedSite, setSelectedSite] = useState<string>(userSiteId || "all")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  // Obtener último reporte semanal
  const latestReport = useMemo(() => {
    if (selectedSite === "all") return weeklyReports[0] || null
    return weeklyReports.find((r) => r.site_id === selectedSite) || null
  }, [weeklyReports, selectedSite])

  // Calcular valor de cada KPI (28 KPIs del KPIs.md)
  const calculateKPIValue = (key: string): number | null => {
    const r = latestReport

    switch (key) {
      // 🚀 START-UP
      case "feasibility_response":
        return null // Calculado por estudio (días desde recepción hasta respuesta)
      case "team_assignment_post_selection":
        return null // Calculado por estudio
      case "training_completed_pre_siv":
        return null // Calculado por estudio
      case "checklist_pre_siv":
        return null // Calculado por estudio
      case "siv_to_fpi":
        const withFPFV = startupTrackers.filter(s => s.fpfv_date && s.ec_approval_date)
        if (withFPFV.length === 0) return null
        const avgDays = withFPFV.reduce((sum, s) => {
          const approval = new Date(s.ec_approval_date!)
          const fpfv = new Date(s.fpfv_date!)
          return sum + (fpfv.getTime() - approval.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / withFPFV.length
        return Math.round(avgDays)
      case "siv_mv_participation":
        if (!r?.mv_siv_planned) return null
        return Math.round((r.mv_siv_participated / r.mv_siv_planned) * 100)

      // 🎯 RECLUTAMIENTO Y RETENCIÓN
      case "enrollment_vs_plan":
        if (!r?.monthly_target) return null
        return Math.round((r.monthly_accumulated / r.monthly_target) * 100)
      case "screen_fail_rate":
        if (!r?.patients_screened) return null
        return Math.round((r.screen_failures / r.patients_screened) * 100)
      case "patient_retention":
        if (!r?.patients_ongoing_start) return null
        return Math.round(((r.patients_ongoing_start - r.patients_lost) / r.patients_ongoing_start) * 100)
      case "referral_to_contact":
        // SC-10: Tiempo promedio derivación → contacto (en horas)
        const contactsWithTime = patientContacts.filter(c => c.hours_to_contact !== null)
        if (contactsWithTime.length === 0) return null
        const avgHours = contactsWithTime.reduce((sum, c) => sum + (c.hours_to_contact || 0), 0) / contactsWithTime.length
        return Math.round(avgHours)
      case "visits_completed_vs_planned":
        if (!r?.visits_planned) return null
        return Math.round((r.visits_completed / r.visits_planned) * 100)
      case "visit_window_adherence":
        if (!r?.visits_completed) return null
        return Math.round((r.visits_in_window / r.visits_completed) * 100)

      // 📊 CALIDAD DE DATOS
      case "query_resolution":
        return null // Calculado desde queries (horas promedio)
      case "etmf_completeness":
        return null // Calculado desde documentos eTMF
      case "critical_deviations_per_100":
        if (!r?.visits_completed) return null
        return Math.round((r.major_deviations / r.visits_completed) * 100)
      case "protocol_deviation_rate":
        if (!r?.total_procedures_month) return null
        return Math.round((r.total_deviations_month / r.total_procedures_month) * 100 * 10) / 10
      case "sae_reported_24h":
        if (!r?.saes_identified) return r ? 100 : null
        return Math.round((r.saes_reported_24h / r.saes_identified) * 100)
      case "capa_closed_on_time":
        return null // Calculado desde CAPAs cerradas

      // 💻 TRANSFORMACIÓN DIGITAL
      case "data_entry_post_visit":
        return null // Calculado desde tiempos de data entry
      case "etmf_docs_on_time":
        return null // Calculado desde documentos eTMF

      // 📝 MONITOREO Y ACTION ITEMS
      case "ai_closed_14days":
        const closed = actionItems.filter(ai => ai.status === "Cerrado")
        if (closed.length === 0) return null
        const onTime = closed.filter(ai => {
          const created = new Date(ai.created_at)
          const closedDate = ai.closed_date ? new Date(ai.closed_date) : new Date()
          const days = Math.floor((closedDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
          return days <= 14
        })
        return Math.round((onTime.length / closed.length) * 100)
      case "ai_aging_30days":
        return actionItems.filter(ai => {
          if (ai.status === "Cerrado") return false
          const dueDate = new Date(ai.due_date)
          const today = new Date()
          return (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24) > 30
        }).length
      case "avg_days_ai_closure":
        const closedItems = actionItems.filter(ai => ai.status === "Cerrado" && ai.closed_date)
        if (closedItems.length === 0) return null
        const totalDays = closedItems.reduce((sum, ai) => {
          const created = new Date(ai.created_at)
          const closedDate = new Date(ai.closed_date!)
          return sum + Math.floor((closedDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        }, 0)
        return Math.round(totalDays / closedItems.length)
      case "major_findings_mv":
        const majorFindings = actionItems.filter(ai => ai.severity === "Major")
        const totalFindings = actionItems.length
        if (totalFindings === 0) return null
        return Math.round((majorFindings.length / totalFindings) * 100)

      // ⭐ SATISFACCIÓN SPONSORS
      case "cra_response_48h":
        // SC-26: % consultas respondidas en ≤48h
        const queriesWithResponse = sponsorQueries.filter(q => q.responded_at !== null)
        if (queriesWithResponse.length === 0) return sponsorQueries.length > 0 ? 0 : null
        const respondedIn48h = queriesWithResponse.filter(q => (q.hours_to_response || 0) <= 48)
        return Math.round((respondedIn48h.length / queriesWithResponse.length) * 100)
      case "sponsor_performance_score":
        // SC-27: Score promedio de evaluaciones (sobre 5)
        if (sponsorEvaluations.length === 0) return null
        const avgScore = sponsorEvaluations.reduce((sum, e) => sum + e.score, 0) / sponsorEvaluations.length
        return Math.round(avgScore * 10) / 10

      // 👥 GESTIÓN DE EQUIPO
      case "gcp_current_pct":
        if (teamMembers.length === 0) return null
        const gcpCurrent = teamMembers.filter(m => m.gcp_current && m.is_active)
        const activeMembers = teamMembers.filter(m => m.is_active)
        if (activeMembers.length === 0) return null
        return Math.round((gcpCurrent.length / activeMembers.length) * 100)
      case "training_vs_plan":
        return null // Calculado desde training tracker

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

    return { onTarget, warning, critical, noData, total: 28 }
  }, [latestReport, actionItems, startupTrackers, teamMembers, auditReadiness, patientContacts, sponsorQueries, sponsorEvaluations])

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
          <p className="text-muted-foreground">28 KPIs en 7 categorías</p>
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
            Todos (28)
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
