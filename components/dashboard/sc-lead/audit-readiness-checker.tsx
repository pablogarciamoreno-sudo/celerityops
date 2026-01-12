"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Shield, Save, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import type { Site, SCLeadAuditReadiness } from "@/lib/types/database"

interface AuditReadinessCheckerProps {
  records: (SCLeadAuditReadiness & { site?: { name: string } })[]
  sites: Site[]
  userSiteId: string | null
  userId: string | null
}

const checklistItems = [
  { key: "isf_complete", label: "ISF Completo y Actualizado", description: "Investigator Site File con todos los documentos requeridos" },
  { key: "regulatory_current", label: "Documentos Regulatorios Vigentes", description: "Aprobaciones éticas, permisos y licencias al día" },
  { key: "delegation_logs_current", label: "Delegation Logs Actualizados", description: "Registro de delegación de funciones completo" },
  { key: "consents_verified", label: "Consentimientos Verificados", description: "ICFs firmados y versiones correctas" },
  { key: "source_docs_complete", label: "Source Documents Completos", description: "Documentación fuente completa y legible" },
  { key: "saes_documented", label: "SAEs Documentados", description: "Eventos adversos serios reportados y documentados" },
  { key: "deviations_documented", label: "Desviaciones Documentadas", description: "Protocol deviations registradas correctamente" },
  { key: "etmf_current", label: "eTMF Actualizado", description: "Trial Master File electrónico al día" },
]

function getCurrentPeriod() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

export function AuditReadinessChecker({ records: initialRecords, sites, userSiteId, userId }: AuditReadinessCheckerProps) {
  const supabase = createClient()
  const [records, setRecords] = useState(initialRecords)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    site_id: userSiteId || "",
    period: getCurrentPeriod(),
    isf_complete: false,
    regulatory_current: false,
    delegation_logs_current: false,
    consents_verified: false,
    source_docs_complete: false,
    saes_documented: false,
    deviations_documented: false,
    etmf_current: false,
    notes: "",
  })

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked }))
    setSuccess(false)
  }

  const calculateScore = () => {
    const items = checklistItems.map((item) => formData[item.key as keyof typeof formData] as boolean)
    const completed = items.filter(Boolean).length
    return Math.round((completed / items.length) * 100)
  }

  const handleSubmit = async () => {
    if (!formData.site_id) return

    setLoading(true)
    try {
      const score = calculateScore()

      const { data, error } = await supabase
        .from("sc_lead_audit_readiness")
        .upsert({
          ...formData,
          score,
          created_by: userId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "site_id,period"
        })
        .select("*, site:sites(name)")
        .single()

      if (error) throw error

      // Update or add to records
      setRecords((prev) => {
        const exists = prev.find((r) => r.site_id === data.site_id && r.period === data.period)
        if (exists) {
          return prev.map((r) => (r.id === data.id ? data : r))
        }
        return [data, ...prev]
      })

      setSuccess(true)
    } catch (error) {
      console.error("Error saving audit readiness:", error)
    } finally {
      setLoading(false)
    }
  }

  const score = calculateScore()

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">N/A</Badge>
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">{score}%</Badge>
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">{score}%</Badge>
    return <Badge className="bg-red-100 text-red-800">{score}%</Badge>
  }

  // Get latest record per site
  const latestBySite = sites.map((site) => {
    const siteRecords = records.filter((r) => r.site_id === site.id)
    return siteRecords[0] || null
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Readiness</h1>
          <p className="text-muted-foreground">Checklist mensual de preparación para auditoría</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Shield className="h-3 w-3 mr-1" />
          Periodo: {formData.period}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Checklist Form */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluación Mensual</CardTitle>
            <CardDescription>Completa el checklist de audit readiness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Sitio</Label>
              <Select
                value={formData.site_id}
                onValueChange={(v) => {
                  setFormData((prev) => ({ ...prev, site_id: v }))
                  setSuccess(false)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sitio" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {checklistItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={item.key}
                    checked={formData[item.key as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) => handleCheckboxChange(item.key, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={item.key} className="font-medium cursor-pointer">
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  {formData[item.key as keyof typeof formData] ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Notas / Observaciones</Label>
              <Textarea
                placeholder="Hallazgos, pendientes, acciones correctivas..."
                value={formData.notes}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  setSuccess(false)
                }}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Score de Preparación</p>
                <div className="flex items-center gap-3">
                  <Progress value={score} className="w-32" />
                  <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {success && <span className="text-sm text-green-600">Guardado exitosamente</span>}
                <Button onClick={handleSubmit} disabled={loading || !formData.site_id}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Evaluación"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary by Site */}
        <Card>
          <CardHeader>
            <CardTitle>Estado por Sitio</CardTitle>
            <CardDescription>Última evaluación de cada sitio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sites.map((site) => {
                const record = records.find((r) => r.site_id === site.id)
                const siteScore = record?.score ?? null

                return (
                  <div
                    key={site.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{site.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {record ? `Última: ${record.period}` : "Sin evaluación"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {siteScore !== null && siteScore < 70 && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      {getScoreBadge(siteScore)}
                    </div>
                  </div>
                )
              })}

              {sites.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No hay sitios configurados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Evaluaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sitio</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead className="text-center">ISF</TableHead>
                <TableHead className="text-center">Reg.</TableHead>
                <TableHead className="text-center">Del.</TableHead>
                <TableHead className="text-center">ICF</TableHead>
                <TableHead className="text-center">Source</TableHead>
                <TableHead className="text-center">SAE</TableHead>
                <TableHead className="text-center">Dev.</TableHead>
                <TableHead className="text-center">eTMF</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground">
                    No hay evaluaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                records.slice(0, 10).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.site?.name || "-"}</TableCell>
                    <TableCell>{record.period}</TableCell>
                    <TableCell className="text-center">
                      {record.isf_complete ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.regulatory_current ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.delegation_logs_current ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.consents_verified ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.source_docs_complete ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.saes_documented ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.deviations_documented ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.etmf_current ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-right">{getScoreBadge(record.score)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
