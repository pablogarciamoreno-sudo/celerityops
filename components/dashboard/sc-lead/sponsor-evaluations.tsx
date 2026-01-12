"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Star, TrendingUp, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Site } from "@/lib/types/database"

interface Evaluation {
  id: string
  site_id: string
  quarter: string
  sponsor: string
  study_name: string
  performance_score: number | null
  nps_score: number | null
  comments: string | null
  evaluation_date: string
  created_at: string
  site?: { name: string }
}

interface SponsorEvaluationsProps {
  evaluations: Evaluation[]
  sites: Site[]
  userSiteId: string | null
}

function getCurrentQuarter() {
  const now = new Date()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)
  return `Q${quarter} ${now.getFullYear()}`
}

export function SponsorEvaluations({ evaluations: initialEvaluations, sites, userSiteId }: SponsorEvaluationsProps) {
  const supabase = createClient()
  const [evaluations, setEvaluations] = useState(initialEvaluations)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    site_id: userSiteId || "",
    quarter: getCurrentQuarter(),
    sponsor: "",
    study_name: "",
    performance_score: "",
    nps_score: "",
    comments: "",
    evaluation_date: new Date().toISOString().split("T")[0],
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.site_id || !formData.sponsor) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("sc_lead_sponsor_evaluations")
        .insert({
          ...formData,
          performance_score: formData.performance_score ? parseFloat(formData.performance_score) : null,
          nps_score: formData.nps_score ? parseInt(formData.nps_score) : null,
        })
        .select("*, site:sites(name)")
        .single()

      if (error) throw error

      setEvaluations((prev) => [data, ...prev])
      setIsDialogOpen(false)
      setFormData({
        site_id: userSiteId || "",
        quarter: getCurrentQuarter(),
        sponsor: "",
        study_name: "",
        performance_score: "",
        nps_score: "",
        comments: "",
        evaluation_date: new Date().toISOString().split("T")[0],
      })
    } catch (error) {
      console.error("Error saving evaluation:", error)
    } finally {
      setLoading(false)
    }
  }

  // Metrics
  const avgPerformance = evaluations.reduce((sum, e) => sum + (e.performance_score || 0), 0) / (evaluations.filter(e => e.performance_score).length || 1)
  const avgNPS = evaluations.reduce((sum, e) => sum + (e.nps_score || 0), 0) / (evaluations.filter(e => e.nps_score).length || 1)
  const promoters = evaluations.filter((e) => e.nps_score && e.nps_score >= 9).length
  const detractors = evaluations.filter((e) => e.nps_score && e.nps_score <= 6).length

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-800"
    if (score >= 4) return "bg-green-100 text-green-800"
    if (score >= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getNPSColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-800"
    if (score >= 9) return "bg-green-100 text-green-800"
    if (score >= 7) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  // Get unique sponsors for summary
  const sponsorSummary = evaluations.reduce((acc, e) => {
    if (!acc[e.sponsor]) {
      acc[e.sponsor] = { count: 0, totalScore: 0, totalNPS: 0, npsCount: 0 }
    }
    acc[e.sponsor].count++
    if (e.performance_score) acc[e.sponsor].totalScore += e.performance_score
    if (e.nps_score) {
      acc[e.sponsor].totalNPS += e.nps_score
      acc[e.sponsor].npsCount++
    }
    return acc
  }, {} as Record<string, { count: number; totalScore: number; totalNPS: number; npsCount: number }>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evaluaciones de Sponsor</h1>
          <p className="text-muted-foreground">Feedback trimestral sobre desempeño de sponsors</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Evaluar Sponsor</DialogTitle>
              <DialogDescription>
                Registra tu evaluación del desempeño del sponsor
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sitio *</Label>
                  <Select value={formData.site_id} onValueChange={(v) => handleChange("site_id", v)}>
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
                <div className="space-y-2">
                  <Label>Trimestre</Label>
                  <Input
                    placeholder="Q1 2025"
                    value={formData.quarter}
                    onChange={(e) => handleChange("quarter", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sponsor *</Label>
                  <Input
                    placeholder="Nombre del sponsor"
                    value={formData.sponsor}
                    onChange={(e) => handleChange("sponsor", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estudio</Label>
                  <Input
                    placeholder="Nombre del estudio"
                    value={formData.study_name}
                    onChange={(e) => handleChange("study_name", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Performance Score (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                    value={formData.performance_score}
                    onChange={(e) => handleChange("performance_score", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">1=Muy malo, 5=Excelente</p>
                </div>
                <div className="space-y-2">
                  <Label>NPS Score (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="8"
                    value={formData.nps_score}
                    onChange={(e) => handleChange("nps_score", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">0=No recomendaría, 10=Definitivamente</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fecha de Evaluación</Label>
                <Input
                  type="date"
                  value={formData.evaluation_date}
                  onChange={(e) => handleChange("evaluation_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Comentarios</Label>
                <Textarea
                  placeholder="Fortalezas, áreas de mejora, observaciones..."
                  value={formData.comments}
                  onChange={(e) => handleChange("comments", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Guardar Evaluación"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Prom.</p>
                <p className="text-2xl font-bold">{avgPerformance.toFixed(1)}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NPS Promedio</p>
                <p className="text-2xl font-bold">{avgNPS.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promotores (9-10)</p>
                <p className="text-2xl font-bold">{promoters}</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detractores (0-6)</p>
                <p className="text-2xl font-bold">{detractors}</p>
              </div>
              <ThumbsDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsor Summary */}
      {Object.keys(sponsorSummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Sponsor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(sponsorSummary).map(([sponsor, data]) => (
                <div key={sponsor} className="p-4 rounded-lg border">
                  <p className="font-medium">{sponsor}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">{data.count} eval.</span>
                    <Badge className={getScoreColor(data.totalScore / data.count)}>
                      {(data.totalScore / data.count).toFixed(1)}/5
                    </Badge>
                    {data.npsCount > 0 && (
                      <Badge className={getNPSColor(data.totalNPS / data.npsCount)}>
                        NPS: {Math.round(data.totalNPS / data.npsCount)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Evaluaciones</CardTitle>
          <CardDescription>Todas las evaluaciones de sponsor registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sitio</TableHead>
                <TableHead>Trimestre</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Estudio</TableHead>
                <TableHead className="text-center">Performance</TableHead>
                <TableHead className="text-center">NPS</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay evaluaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">{evaluation.site?.name || "-"}</TableCell>
                    <TableCell>{evaluation.quarter}</TableCell>
                    <TableCell>{evaluation.sponsor}</TableCell>
                    <TableCell>{evaluation.study_name || "-"}</TableCell>
                    <TableCell className="text-center">
                      {evaluation.performance_score !== null ? (
                        <Badge className={getScoreColor(evaluation.performance_score)}>
                          {evaluation.performance_score.toFixed(1)}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {evaluation.nps_score !== null ? (
                        <Badge className={getNPSColor(evaluation.nps_score)}>
                          {evaluation.nps_score}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{evaluation.evaluation_date}</TableCell>
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
