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
import { CalendarIcon, Save, History, Plus } from "lucide-react"
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
    // Reclutamiento
    patients_screened: 0,
    patients_randomized: 0,
    screen_failures: 0,
    monthly_target: 0,
    monthly_accumulated: 0,
    weekly_projection: 0,
    weekly_actual: 0,
    // Visitas
    visits_planned: 0,
    visits_completed: 0,
    visits_in_window: 0,
    visits_procedures_complete: 0,
    patients_ongoing_start: 0,
    patients_lost: 0,
    // Seguridad
    saes_identified: 0,
    saes_reported_24h: 0,
    major_deviations: 0,
    total_deviations_month: 0,
    total_procedures_month: 0,
    major_deviations_month: 0,
    open_capas: 0,
    // Eficiencia
    total_coordinators: 0,
    total_studies: 0,
    total_patients_ongoing: 0,
    mv_siv_planned: 0,
    mv_siv_participated: 0,
    // Notes
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

  const NumberInput = ({ label, field, hint }: { label: string; field: string; hint?: string }) => (
    <div className="space-y-1">
      <Label htmlFor={field} className="text-sm">{label}</Label>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Registro Semanal</h1>
          <p className="text-muted-foreground">Ingresa los KPIs de la semana</p>
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
              <CardTitle className="text-lg">Periodo</CardTitle>
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

          {/* Recruitment KPIs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Reclutamiento</CardTitle>
              <CardDescription>Métricas de tamizaje y enrolamiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NumberInput label="Pacientes Tamizados" field="patients_screened" />
                <NumberInput label="Pacientes Randomizados" field="patients_randomized" />
                <NumberInput label="Screen Failures" field="screen_failures" />
                <NumberInput label="Meta Mensual" field="monthly_target" />
                <NumberInput label="Acumulado Mes" field="monthly_accumulated" />
                <NumberInput label="Proyección Semanal" field="weekly_projection" />
                <NumberInput label="Real Semanal" field="weekly_actual" />
              </div>
            </CardContent>
          </Card>

          {/* Visits KPIs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ejecución de Visitas</CardTitle>
              <CardDescription>Cumplimiento de visitas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <NumberInput label="Visitas Planeadas" field="visits_planned" />
                <NumberInput label="Visitas Completadas" field="visits_completed" />
                <NumberInput label="Visitas en Ventana" field="visits_in_window" />
                <NumberInput label="Procedimientos Completos" field="visits_procedures_complete" />
                <NumberInput label="Pacientes Ongoing (inicio)" field="patients_ongoing_start" />
                <NumberInput label="Pacientes Perdidos" field="patients_lost" />
              </div>
            </CardContent>
          </Card>

          {/* Safety KPIs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Seguridad y Compliance</CardTitle>
              <CardDescription>SAEs, desviaciones y CAPAs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NumberInput label="SAEs Identificados" field="saes_identified" />
                <NumberInput label="SAEs Reportados 24h" field="saes_reported_24h" />
                <NumberInput label="Desviaciones Mayores" field="major_deviations" />
                <NumberInput label="Total Desviaciones (mes)" field="total_deviations_month" />
                <NumberInput label="Total Procedimientos (mes)" field="total_procedures_month" />
                <NumberInput label="Desv. Mayores (mes)" field="major_deviations_month" />
                <NumberInput label="CAPAs Abiertos" field="open_capas" />
              </div>
            </CardContent>
          </Card>

          {/* Efficiency KPIs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Eficiencia Operativa</CardTitle>
              <CardDescription>Capacidad y monitoring visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <NumberInput label="Total Coordinadores" field="total_coordinators" />
                <NumberInput label="Total Estudios" field="total_studies" />
                <NumberInput label="Pacientes Ongoing" field="total_patients_ongoing" />
                <NumberInput label="MV/SIV Planeadas" field="mv_siv_planned" />
                <NumberInput label="MV/SIV Participadas" field="mv_siv_participated" />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Observaciones, contingencias, logros destacados..."
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
