"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Save, History, Plus, Info } from "lucide-react"
import type { Site, SCLeadWeeklyReport } from "@/lib/types/database"

interface WeeklyReportFormProps {
  sites: Site[]
  userSiteId: string | null
  recentReports: (SCLeadWeeklyReport & { site?: { name: string } })[]
  userId: string | null
}

// Helper to get current week info
function getCurrentWeekInfo() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)

  // Get Monday of current week
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return {
    year: new Date().getFullYear(),
    weekNumber,
    periodStart: monday.toISOString().split("T")[0],
    periodEnd: sunday.toISOString().split("T")[0],
  }
}

// KPI Definitions with formulas for reference (28 KPIs - KPIs.md)
const KPI_HELP = {
  screen_failure_rate: "SC-08: (Screen Failures / Total Screened) × 100. Target: ≤28%",
  enrollment_vs_plan: "SC-07: (Acumulado Mes / Meta Mensual) × 100. Target: ≥85%",
  visits_completed_pct: "SC-11: (Visitas Completadas / Visitas Planeadas) × 100. Target: ≥95%",
  visit_window_adherence: "SC-12: (Visitas en Ventana / Visitas Completadas) × 100. Target: ≥90%",
  patient_retention: "SC-09: ((Ongoing Inicio - Perdidos) / Ongoing Inicio) × 100. Target: ≥85%",
  sae_reported_on_time: "SC-17: (SAEs Reportados 24h / SAEs Identificados) × 100. Target: 100%",
  protocol_deviation_rate: "SC-16: (Total Desviaciones / Total Procedimientos) × 100. Target: ≤3%",
  critical_deviations: "SC-15: (Desviaciones Críticas / 100 Visitas). Target: ≤2",
  mv_siv_participation: "SC-06: (MV/SIV Participadas / MV/SIV Planeadas) × 100. Target: 100%",
}

export function WeeklyReportForm({ sites, userSiteId, recentReports, userId }: WeeklyReportFormProps) {
  const supabase = createClient()
  const weekInfo = getCurrentWeekInfo()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    site_id: userSiteId || "",
    year: weekInfo.year,
    week_number: weekInfo.weekNumber,
    period_start: weekInfo.periodStart,
    period_end: weekInfo.periodEnd,

    // RECLUTAMIENTO (SC-07, SC-08, SC-09)
    patients_screened: 0,          // Total tamizados
    patients_randomized: 0,        // Total randomizados
    screen_failures: 0,            // Screen failures
    monthly_target: 0,             // Meta mensual de reclutamiento
    monthly_accumulated: 0,        // Acumulado del mes
    weekly_projection: 0,          // Proyección semanal
    weekly_actual: 0,              // Real semanal

    // EJECUCIÓN DE VISITAS (SC-11, SC-12, SC-09)
    visits_planned: 0,             // Visitas planeadas
    visits_completed: 0,           // Visitas completadas
    visits_in_window: 0,           // Visitas dentro de ventana
    visits_procedures_complete: 0, // Visitas con procedimientos 100% completos
    patients_ongoing_start: 0,     // Pacientes ongoing al inicio del periodo
    patients_lost: 0,              // Pacientes perdidos/discontinuados

    // SEGURIDAD Y COMPLIANCE (SC-15, SC-16, SC-17, SC-18)
    saes_identified: 0,            // SAEs identificados
    saes_reported_24h: 0,          // SAEs reportados en 24h
    major_deviations: 0,           // Desviaciones mayores (semana)
    total_deviations_month: 0,     // Total desviaciones del mes
    total_procedures_month: 0,     // Total procedimientos del mes
    major_deviations_month: 0,     // Desviaciones mayores del mes
    open_capas: 0,                 // CAPAs abiertas

    // EFICIENCIA OPERATIVA (SC-06)
    total_coordinators: 0,         // Total coordinadores
    total_studies: 0,              // Total estudios activos
    total_patients_ongoing: 0,     // Total pacientes activos
    mv_siv_planned: 0,             // MV/SIV planeadas
    mv_siv_participated: 0,        // MV/SIV con participación

    // Notas
    notes: "",
  })

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!formData.site_id) {
      setError("Selecciona un sitio")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from("sc_lead_weekly_reports")
        .upsert({
          ...formData,
          reported_by: userId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "site_id,year,week_number"
        })

      if (insertError) throw insertError

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Error al guardar el reporte")
    } finally {
      setLoading(false)
    }
  }

  const NumberInput = ({ label, field, hint, kpiRef }: { label: string; field: string; hint?: string; kpiRef?: keyof typeof KPI_HELP }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Label htmlFor={field} className="text-sm">{label}</Label>
        {kpiRef && KPI_HELP[kpiRef] && (
          <span title={KPI_HELP[kpiRef]} className="cursor-help">
            <Info className="h-3 w-3 text-muted-foreground" />
          </span>
        )}
      </div>
      <Input
        id={field}
        type="number"
        min="0"
        value={formData[field as keyof typeof formData] as number}
        onChange={(e) => handleChange(field, parseInt(e.target.value) || 0)}
        className="h-9"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )

  // Calculate KPIs for preview
  const calculateKPIs = () => {
    const kpis: Record<string, { value: string; status: "on_target" | "warning" | "critical" | "no_data" }> = {}

    // SC-08: Screen Fail Rate (Target: ≤28%)
    if (formData.patients_screened > 0) {
      const sfr = (formData.screen_failures / formData.patients_screened) * 100
      kpis.screen_failure_rate = {
        value: `${sfr.toFixed(1)}%`,
        status: sfr <= 28 ? "on_target" : sfr <= 35 ? "warning" : "critical"
      }
    }

    // SC-07: Enrollment vs Plan (Target: ≥85%)
    if (formData.monthly_target > 0) {
      const evp = (formData.monthly_accumulated / formData.monthly_target) * 100
      kpis.enrollment_vs_plan = {
        value: `${evp.toFixed(1)}%`,
        status: evp >= 85 ? "on_target" : evp >= 75 ? "warning" : "critical"
      }
    }

    // SC-11: Visits Completed vs Planned (Target: ≥95%)
    if (formData.visits_planned > 0) {
      const vc = (formData.visits_completed / formData.visits_planned) * 100
      kpis.visits_completed = {
        value: `${vc.toFixed(1)}%`,
        status: vc >= 95 ? "on_target" : vc >= 90 ? "warning" : "critical"
      }
    }

    // SC-17: SAE Reported <24h (Target: 100%)
    if (formData.saes_identified > 0) {
      const sae = (formData.saes_reported_24h / formData.saes_identified) * 100
      kpis.sae_reporting = {
        value: `${sae.toFixed(0)}%`,
        status: sae === 100 ? "on_target" : sae >= 90 ? "warning" : "critical"
      }
    }

    return kpis
  }

  const kpis = calculateKPIs()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Registro Semanal de KPIs</h1>
          <p className="text-muted-foreground">Ingresa los datos para calcular los 28 KPIs del módulo SC Lead</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <CalendarIcon className="h-3 w-3 mr-1" />
          Semana {formData.week_number} - {formData.year}
        </Badge>
      </div>

      <Tabs defaultValue="form" className="space-y-4">
        <TabsList>
          <TabsTrigger value="form">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Registro
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          {/* Site and Period Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Periodo de Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label>Sitio</Label>
                  <Select
                    value={formData.site_id}
                    onValueChange={(value) => handleChange("site_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sitio" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Semana</Label>
                  <Input
                    type="number"
                    min="1"
                    max="53"
                    value={formData.week_number}
                    onChange={(e) => handleChange("week_number", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fecha Inicio</Label>
                  <Input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => handleChange("period_start", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fecha Fin</Label>
                  <Input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => handleChange("period_end", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Preview */}
          {Object.keys(kpis).length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vista Previa de KPIs Calculados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {kpis.screen_failure_rate && (
                    <Badge variant={kpis.screen_failure_rate.status === "on_target" ? "default" : kpis.screen_failure_rate.status === "warning" ? "secondary" : "destructive"}>
                      Screen Failure: {kpis.screen_failure_rate.value}
                    </Badge>
                  )}
                  {kpis.conversion_rate && (
                    <Badge variant={kpis.conversion_rate.status === "on_target" ? "default" : kpis.conversion_rate.status === "warning" ? "secondary" : "destructive"}>
                      Conversión: {kpis.conversion_rate.value}
                    </Badge>
                  )}
                  {kpis.visits_completed && (
                    <Badge variant={kpis.visits_completed.status === "on_target" ? "default" : kpis.visits_completed.status === "warning" ? "secondary" : "destructive"}>
                      Visitas: {kpis.visits_completed.value}
                    </Badge>
                  )}
                  {kpis.sae_reporting && (
                    <Badge variant={kpis.sae_reporting.status === "on_target" ? "default" : kpis.sae_reporting.status === "warning" ? "secondary" : "destructive"}>
                      SAE Report: {kpis.sae_reporting.value}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* RECLUTAMIENTO - SC-07, SC-08, SC-09 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Reclutamiento</CardTitle>
              <CardDescription>Datos para calcular SC-07, SC-08, SC-09</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NumberInput
                  label="Pacientes Tamizados"
                  field="patients_screened"
                  kpiRef="screen_failure_rate"
                />
                <NumberInput
                  label="Pacientes Randomizados"
                  field="patients_randomized"
                  kpiRef="conversion_rate"
                />
                <NumberInput
                  label="Screen Failures"
                  field="screen_failures"
                  kpiRef="screen_failure_rate"
                />
                <NumberInput
                  label="Meta Mensual"
                  field="monthly_target"
                  kpiRef="recruitment_target_compliance"
                />
                <NumberInput
                  label="Acumulado Mes"
                  field="monthly_accumulated"
                  kpiRef="recruitment_target_compliance"
                />
                <NumberInput
                  label="Proyección Semanal"
                  field="weekly_projection"
                  kpiRef="randomized_vs_projection"
                />
                <NumberInput
                  label="Real Semanal"
                  field="weekly_actual"
                  kpiRef="randomized_vs_projection"
                />
              </div>
            </CardContent>
          </Card>

          {/* EJECUCIÓN DE VISITAS - SC-11, SC-12 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ejecución de Visitas</CardTitle>
              <CardDescription>Datos para calcular SC-11, SC-12</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NumberInput
                  label="Visitas Planeadas"
                  field="visits_planned"
                  kpiRef="visits_completed_pct"
                />
                <NumberInput
                  label="Visitas Completadas"
                  field="visits_completed"
                  kpiRef="visits_completed_pct"
                />
                <NumberInput
                  label="Visitas en Ventana"
                  field="visits_in_window"
                  kpiRef="visit_window_adherence"
                />
                <NumberInput
                  label="Visitas Procedimientos 100%"
                  field="visits_procedures_complete"
                  hint="Visitas donde se completaron todos los procedimientos"
                  kpiRef="procedures_complete_pct"
                />
                <NumberInput
                  label="Pacientes Ongoing (inicio)"
                  field="patients_ongoing_start"
                  kpiRef="patient_retention"
                />
                <NumberInput
                  label="Pacientes Perdidos"
                  field="patients_lost"
                  kpiRef="patient_retention"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEGURIDAD Y COMPLIANCE - SC-15, SC-16, SC-17, SC-18 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Seguridad y Compliance</CardTitle>
              <CardDescription>Datos para calcular SC-15, SC-16, SC-17, SC-18</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NumberInput
                  label="SAEs Identificados"
                  field="saes_identified"
                  kpiRef="sae_reported_on_time"
                />
                <NumberInput
                  label="SAEs Reportados 24h"
                  field="saes_reported_24h"
                  kpiRef="sae_reported_on_time"
                />
                <NumberInput
                  label="Desviaciones Mayores (semana)"
                  field="major_deviations"
                />
                <NumberInput
                  label="Total Desviaciones (mes)"
                  field="total_deviations_month"
                  kpiRef="protocol_deviation_rate"
                />
                <NumberInput
                  label="Total Procedimientos (mes)"
                  field="total_procedures_month"
                  kpiRef="protocol_deviation_rate"
                />
                <NumberInput
                  label="Desv. Mayores (mes)"
                  field="major_deviations_month"
                  kpiRef="major_deviation_rate"
                />
                <NumberInput
                  label="CAPAs Abiertos"
                  field="open_capas"
                />
              </div>
            </CardContent>
          </Card>

          {/* EFICIENCIA OPERATIVA - SC-06 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Eficiencia Operativa</CardTitle>
              <CardDescription>Datos para calcular SC-06 (Participación MV/SIV)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <NumberInput
                  label="Total Coordinadores"
                  field="total_coordinators"
                />
                <NumberInput
                  label="Total Estudios Activos"
                  field="total_studies"
                />
                <NumberInput
                  label="Pacientes Ongoing"
                  field="total_patients_ongoing"
                />
                <NumberInput
                  label="MV/SIV Planeadas"
                  field="mv_siv_planned"
                  kpiRef="mv_siv_participation"
                />
                <NumberInput
                  label="MV/SIV Participadas"
                  field="mv_siv_participated"
                  kpiRef="mv_siv_participation"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Notas y Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Observaciones, contingencias, logros destacados, riesgos identificados..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-600">Reporte guardado exitosamente</p>}
            </div>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Guardando..." : "Guardar Reporte"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Recientes</CardTitle>
              <CardDescription>Últimos 10 reportes semanales</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sitio</TableHead>
                    <TableHead>Semana</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead className="text-right">Tamizados</TableHead>
                    <TableHead className="text-right">Randomizados</TableHead>
                    <TableHead className="text-right">Visitas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No hay reportes registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.site?.name || "-"}</TableCell>
                        <TableCell>S{report.week_number}/{report.year}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {report.period_start} - {report.period_end}
                        </TableCell>
                        <TableCell className="text-right">{report.patients_screened}</TableCell>
                        <TableCell className="text-right">{report.patients_randomized}</TableCell>
                        <TableCell className="text-right">
                          {report.visits_completed}/{report.visits_planned}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
