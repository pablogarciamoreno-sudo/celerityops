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
import { Switch } from "@/components/ui/switch"
import { Plus, Rocket, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import type { Site, SCLeadStartupTracker } from "@/lib/types/database"

interface StartupTrackerProps {
  trackers: (SCLeadStartupTracker & { site?: { name: string } })[]
  sites: Site[]
  userSiteId: string | null
  userId: string | null
}

const statusOptions = [
  { value: "En Sometimiento", label: "En Sometimiento", color: "bg-blue-100 text-blue-800" },
  { value: "Aprobacion Pendiente", label: "Aprobación Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "Aprobado", label: "Aprobado", color: "bg-green-100 text-green-800" },
  { value: "En Activacion", label: "En Activación", color: "bg-purple-100 text-purple-800" },
  { value: "FPFV Logrado", label: "FPFV Logrado", color: "bg-emerald-100 text-emerald-800" },
  { value: "Suspendido", label: "Suspendido", color: "bg-red-100 text-red-800" },
]

export function StartupTracker({ trackers: initialTrackers, sites, userSiteId, userId }: StartupTrackerProps) {
  const supabase = createClient()
  const [trackers, setTrackers] = useState(initialTrackers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    site_id: userSiteId || "",
    study_name: "",
    protocol_number: "",
    sponsor: "",
    ec_submission_date: "",
    ec_approval_date: "",
    last_approval_date: "",
    fpfv_date: "",
    required_resubmission: false,
    status: "En Sometimiento",
    notes: "",
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.site_id || !formData.study_name) {
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("sc_lead_startup_tracker")
        .insert({
          ...formData,
          ec_submission_date: formData.ec_submission_date || null,
          ec_approval_date: formData.ec_approval_date || null,
          last_approval_date: formData.last_approval_date || null,
          fpfv_date: formData.fpfv_date || null,
          created_by: userId,
        })
        .select("*, site:sites(name)")
        .single()

      if (error) throw error

      setTrackers((prev) => [data, ...prev])
      setIsDialogOpen(false)
      setFormData({
        site_id: userSiteId || "",
        study_name: "",
        protocol_number: "",
        sponsor: "",
        ec_submission_date: "",
        ec_approval_date: "",
        last_approval_date: "",
        fpfv_date: "",
        required_resubmission: false,
        status: "En Sometimiento",
        notes: "",
      })
    } catch (error) {
      console.error("Error creating startup tracker:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("sc_lead_startup_tracker")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      setTrackers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus as any } : t))
      )
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  // Calculate metrics
  const inSubmission = trackers.filter((t) => t.status === "En Sometimiento").length
  const pendingApproval = trackers.filter((t) => t.status === "Aprobacion Pendiente").length
  const inActivation = trackers.filter((t) => t.status === "En Activacion" || t.status === "Aprobado").length
  const fpfvAchieved = trackers.filter((t) => t.status === "FPFV Logrado").length

  const getStatusColor = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-800"
  }

  const getDaysInStatus = (tracker: SCLeadStartupTracker) => {
    const startDate = tracker.ec_submission_date
      ? new Date(tracker.ec_submission_date)
      : new Date(tracker.created_at)
    const days = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Start-up Tracker</h1>
          <p className="text-muted-foreground">Seguimiento de estudios en activación</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Estudio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Estudio en Start-up</DialogTitle>
              <DialogDescription>
                Registra un nuevo estudio en proceso de activación
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
                  <Label>Estado</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Estudio *</Label>
                  <Input
                    placeholder="Nombre del estudio"
                    value={formData.study_name}
                    onChange={(e) => handleChange("study_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número de Protocolo</Label>
                  <Input
                    placeholder="ABC-123-001"
                    value={formData.protocol_number}
                    onChange={(e) => handleChange("protocol_number", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sponsor</Label>
                <Input
                  placeholder="Nombre del sponsor"
                  value={formData.sponsor}
                  onChange={(e) => handleChange("sponsor", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Sometimiento EC</Label>
                  <Input
                    type="date"
                    value={formData.ec_submission_date}
                    onChange={(e) => handleChange("ec_submission_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Aprobación EC</Label>
                  <Input
                    type="date"
                    value={formData.ec_approval_date}
                    onChange={(e) => handleChange("ec_approval_date", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Última Aprobación</Label>
                  <Input
                    type="date"
                    value={formData.last_approval_date}
                    onChange={(e) => handleChange("last_approval_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha FPFV</Label>
                  <Input
                    type="date"
                    value={formData.fpfv_date}
                    onChange={(e) => handleChange("fpfv_date", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.required_resubmission}
                  onCheckedChange={(v) => handleChange("required_resubmission", v)}
                />
                <Label>Requirió Re-sometimiento</Label>
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  placeholder="Observaciones..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Agregar Estudio"}
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
                <p className="text-sm text-muted-foreground">En Sometimiento</p>
                <p className="text-2xl font-bold">{inSubmission}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprob. Pendiente</p>
                <p className="text-2xl font-bold">{pendingApproval}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Activación</p>
                <p className="text-2xl font-bold">{inActivation}</p>
              </div>
              <Rocket className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">FPFV Logrado</p>
                <p className="text-2xl font-bold">{fpfvAchieved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estudios en Start-up</CardTitle>
          <CardDescription>Pipeline de activación de estudios</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sitio</TableHead>
                <TableHead>Estudio</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Sometimiento EC</TableHead>
                <TableHead>Aprobación EC</TableHead>
                <TableHead>FPFV</TableHead>
                <TableHead>Días</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trackers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No hay estudios en start-up
                  </TableCell>
                </TableRow>
              ) : (
                trackers.map((tracker) => (
                  <TableRow key={tracker.id}>
                    <TableCell className="font-medium">{tracker.site?.name || "-"}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tracker.study_name}</p>
                        {tracker.protocol_number && (
                          <p className="text-xs text-muted-foreground">{tracker.protocol_number}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{tracker.sponsor || "-"}</TableCell>
                    <TableCell>{tracker.ec_submission_date || "-"}</TableCell>
                    <TableCell>{tracker.ec_approval_date || "-"}</TableCell>
                    <TableCell>{tracker.fpfv_date || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getDaysInStatus(tracker)}d</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={tracker.status}
                        onValueChange={(v) => handleStatusChange(tracker.id, v)}
                      >
                        <SelectTrigger className="w-40 h-8">
                          <Badge className={getStatusColor(tracker.status)}>
                            {tracker.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
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
