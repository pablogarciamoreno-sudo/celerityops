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
import { Plus, CheckCircle, Clock, AlertTriangle, Filter } from "lucide-react"
import type { Site, Study, SCLeadActionItem } from "@/lib/types/database"

interface ActionItemsManagerProps {
  actionItems: (SCLeadActionItem & { site?: { name: string }; study?: { protocol_number: string } })[]
  sites: Site[]
  studies: { id: string; protocol_number: string; name: string }[]
  userSiteId: string | null
  userId: string | null
}

const severityColors: Record<string, string> = {
  Major: "bg-red-100 text-red-800",
  Minor: "bg-yellow-100 text-yellow-800",
  Observacion: "bg-blue-100 text-blue-800",
}

const statusColors: Record<string, string> = {
  Abierto: "bg-red-100 text-red-800",
  "En Progreso": "bg-yellow-100 text-yellow-800",
  Cerrado: "bg-green-100 text-green-800",
}

const categories = [
  "Documentación",
  "Consentimiento",
  "Procedimientos",
  "Seguridad",
  "Regulatorio",
  "Training",
  "Data Entry",
  "Otro",
]

export function ActionItemsManager({ actionItems: initialItems, sites, studies, userSiteId, userId }: ActionItemsManagerProps) {
  const supabase = createClient()
  const [actionItems, setActionItems] = useState(initialItems)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [formData, setFormData] = useState({
    site_id: userSiteId || "",
    study_id: "",
    mv_date: "",
    description: "",
    category: "",
    severity: "Minor",
    responsible: "",
    due_date: "",
    notes: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.site_id || !formData.description || !formData.due_date) {
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("sc_lead_action_items")
        .insert({
          ...formData,
          study_id: formData.study_id || null,
          mv_date: formData.mv_date || null,
          status: "Abierto",
          created_by: userId,
        })
        .select("*, site:sites(name), study:studies(protocol_number)")
        .single()

      if (error) throw error

      setActionItems((prev) => [data, ...prev])
      setIsDialogOpen(false)
      setFormData({
        site_id: userSiteId || "",
        study_id: "",
        mv_date: "",
        description: "",
        category: "",
        severity: "Minor",
        responsible: "",
        due_date: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error creating action item:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === "Cerrado") {
        updates.closed_date = new Date().toISOString().split("T")[0]
      }

      const { error } = await supabase
        .from("sc_lead_action_items")
        .update(updates)
        .eq("id", id)

      if (error) throw error

      setActionItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      )
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const filteredItems = statusFilter === "all"
    ? actionItems
    : actionItems.filter((item) => item.status === statusFilter)

  const openCount = actionItems.filter((i) => i.status === "Abierto").length
  const inProgressCount = actionItems.filter((i) => i.status === "En Progreso").length
  const overdueCount = actionItems.filter((i) => {
    if (i.status === "Cerrado") return false
    return new Date(i.due_date) < new Date()
  }).length

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Action Items</h1>
          <p className="text-muted-foreground">Gestión de hallazgos de monitoring visits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Action Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Action Item</DialogTitle>
              <DialogDescription>
                Registra un nuevo hallazgo o acción pendiente
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
                  <Label>Estudio</Label>
                  <Select value={formData.study_id} onValueChange={(v) => handleChange("study_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estudio" />
                    </SelectTrigger>
                    <SelectContent>
                      {studies.map((study) => (
                        <SelectItem key={study.id} value={study.id}>{study.protocol_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción *</Label>
                <Textarea
                  placeholder="Describe el hallazgo o acción requerida..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severidad</Label>
                  <Select value={formData.severity} onValueChange={(v) => handleChange("severity", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Major">Major</SelectItem>
                      <SelectItem value="Minor">Minor</SelectItem>
                      <SelectItem value="Observacion">Observación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha MV</Label>
                  <Input
                    type="date"
                    value={formData.mv_date}
                    onChange={(e) => handleChange("mv_date", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Responsable</Label>
                  <Input
                    placeholder="Nombre del responsable"
                    value={formData.responsible}
                    onChange={(e) => handleChange("responsible", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Límite *</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleChange("due_date", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  placeholder="Notas adicionales..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Crear Action Item"}
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
                <p className="text-sm text-muted-foreground">Abiertos</p>
                <p className="text-2xl font-bold">{openCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Progreso</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{actionItems.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Action Items</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Abierto">Abiertos</SelectItem>
                  <SelectItem value="En Progreso">En Progreso</SelectItem>
                  <SelectItem value="Cerrado">Cerrados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sitio</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay action items
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const daysUntilDue = getDaysUntilDue(item.due_date)
                  const isOverdue = daysUntilDue < 0 && item.status !== "Cerrado"

                  return (
                    <TableRow key={item.id} className={isOverdue ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{item.site?.name || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>
                        <Badge className={severityColors[item.severity] || ""}>
                          {item.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.responsible || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{item.due_date}</span>
                          {item.status !== "Cerrado" && (
                            <span className={`text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
                              {isOverdue ? `${Math.abs(daysUntilDue)} días vencido` : `${daysUntilDue} días`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[item.status] || ""}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={item.status}
                          onValueChange={(v) => handleStatusChange(item.id, v)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Abierto">Abierto</SelectItem>
                            <SelectItem value="En Progreso">En Progreso</SelectItem>
                            <SelectItem value="Cerrado">Cerrado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
