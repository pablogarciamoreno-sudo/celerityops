"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Users, GraduationCap, AlertTriangle, UserCheck, Pencil } from "lucide-react"
import type { Site, SCLeadTeamMember } from "@/lib/types/database"

interface TeamRosterManagerProps {
  teamMembers: (SCLeadTeamMember & { site?: { name: string } })[]
  sites: Site[]
  userSiteId: string | null
}

const roleOptions = [
  "Study Coordinator",
  "Study Coordinator Sr",
  "Regulatory Specialist",
  "Data Entry Specialist",
  "Research Nurse",
  "Site Lead",
  "SC Lead",
  "QA Specialist",
]

const performanceOptions = [
  { value: "Excepcional", color: "bg-green-100 text-green-800" },
  { value: "Satisfactorio", color: "bg-blue-100 text-blue-800" },
  { value: "Necesita Mejora", color: "bg-yellow-100 text-yellow-800" },
  { value: "No Evaluado", color: "bg-gray-100 text-gray-800" },
]

export function TeamRosterManager({ teamMembers: initialMembers, sites, userSiteId }: TeamRosterManagerProps) {
  const supabase = createClient()
  const [teamMembers, setTeamMembers] = useState(initialMembers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    site_id: userSiteId || "",
    name: "",
    role: "",
    hire_date: "",
    gcp_current: false,
    gcp_expiry_date: "",
    performance_rating: "No Evaluado",
    workload_score: "",
    studies_assigned: 0,
    patients_assigned: 0,
    is_active: true,
  })

  const resetForm = () => {
    setFormData({
      site_id: userSiteId || "",
      name: "",
      role: "",
      hire_date: "",
      gcp_current: false,
      gcp_expiry_date: "",
      performance_rating: "No Evaluado",
      workload_score: "",
      studies_assigned: 0,
      patients_assigned: 0,
      is_active: true,
    })
    setEditingId(null)
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.site_id || !formData.name) return

    setLoading(true)
    try {
      const payload = {
        ...formData,
        hire_date: formData.hire_date || null,
        gcp_expiry_date: formData.gcp_expiry_date || null,
        workload_score: formData.workload_score ? parseFloat(formData.workload_score) : null,
      }

      if (editingId) {
        // Update existing
        const { data, error } = await supabase
          .from("sc_lead_team_roster")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .select("*, site:sites(name)")
          .single()

        if (error) throw error

        setTeamMembers((prev) => prev.map((m) => (m.id === editingId ? data : m)))
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("sc_lead_team_roster")
          .insert(payload)
          .select("*, site:sites(name)")
          .single()

        if (error) throw error

        setTeamMembers((prev) => [...prev, data])
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving team member:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (member: SCLeadTeamMember) => {
    setFormData({
      site_id: member.site_id,
      name: member.name,
      role: member.role || "",
      hire_date: member.hire_date || "",
      gcp_current: member.gcp_current,
      gcp_expiry_date: member.gcp_expiry_date || "",
      performance_rating: member.performance_rating || "No Evaluado",
      workload_score: member.workload_score?.toString() || "",
      studies_assigned: member.studies_assigned,
      patients_assigned: member.patients_assigned,
      is_active: member.is_active,
    })
    setEditingId(member.id)
    setIsDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Metrics
  const activeMembers = teamMembers.filter((m) => m.is_active)
  const gcpExpiringSoon = activeMembers.filter((m) => {
    if (!m.gcp_expiry_date) return false
    const expiry = new Date(m.gcp_expiry_date)
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    return expiry <= thirtyDays
  })
  const avgWorkload = activeMembers.reduce((sum, m) => sum + (m.workload_score || 0), 0) / (activeMembers.length || 1)

  const getPerformanceColor = (rating: string) => {
    return performanceOptions.find((p) => p.value === rating)?.color || "bg-gray-100 text-gray-800"
  }

  const isGCPExpired = (date: string | null) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  const isGCPExpiringSoon = (date: string | null) => {
    if (!date) return false
    const expiry = new Date(date)
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    return expiry <= thirtyDays && expiry > new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roster del Equipo</h1>
          <p className="text-muted-foreground">Gestión del personal de investigación clínica</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Miembro" : "Agregar Miembro del Equipo"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Actualiza la información del miembro" : "Registra un nuevo miembro del equipo de investigación"}
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
                  <Label>Rol</Label>
                  <Select value={formData.role} onValueChange={(v) => handleChange("role", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo *</Label>
                  <Input
                    placeholder="Nombre del miembro"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Ingreso</Label>
                  <Input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleChange("hire_date", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>GCP Vigente</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={formData.gcp_current}
                      onCheckedChange={(v) => handleChange("gcp_current", v)}
                    />
                    <span className="text-sm">{formData.gcp_current ? "Sí" : "No"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fecha Vencimiento GCP</Label>
                  <Input
                    type="date"
                    value={formData.gcp_expiry_date}
                    onChange={(e) => handleChange("gcp_expiry_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Evaluación Desempeño</Label>
                  <Select value={formData.performance_rating} onValueChange={(v) => handleChange("performance_rating", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {performanceOptions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Workload Score (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="3.5"
                    value={formData.workload_score}
                    onChange={(e) => handleChange("workload_score", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estudios Asignados</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.studies_assigned}
                    onChange={(e) => handleChange("studies_assigned", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pacientes Asignados</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.patients_assigned}
                    onChange={(e) => handleChange("patients_assigned", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => handleChange("is_active", v)}
                />
                <Label>Miembro Activo</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false)
                resetForm()
              }}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : editingId ? "Actualizar" : "Agregar Miembro"}
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
                <p className="text-sm text-muted-foreground">Equipo Activo</p>
                <p className="text-2xl font-bold">{activeMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GCP por Vencer</p>
                <p className="text-2xl font-bold">{gcpExpiringSoon.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workload Promedio</p>
                <p className="text-2xl font-bold">{avgWorkload.toFixed(1)}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${avgWorkload > 4 ? "text-red-500" : "text-green-500"}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold">{teamMembers.length - activeMembers.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros del Equipo</CardTitle>
          <CardDescription>Personal de investigación clínica activo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Sitio</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-center">GCP</TableHead>
                <TableHead className="text-center">Estudios</TableHead>
                <TableHead className="text-center">Pacientes</TableHead>
                <TableHead className="text-center">Workload</TableHead>
                <TableHead>Desempeño</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No hay miembros registrados
                  </TableCell>
                </TableRow>
              ) : (
                teamMembers.map((member) => (
                  <TableRow key={member.id} className={!member.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {!member.is_active && <Badge variant="outline" className="text-xs">Inactivo</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.site?.name || "-"}</TableCell>
                    <TableCell>{member.role || "-"}</TableCell>
                    <TableCell className="text-center">
                      {member.gcp_current ? (
                        <div className="flex flex-col items-center">
                          <Badge className={
                            isGCPExpired(member.gcp_expiry_date)
                              ? "bg-red-100 text-red-800"
                              : isGCPExpiringSoon(member.gcp_expiry_date)
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }>
                            {isGCPExpired(member.gcp_expiry_date) ? "Vencido" : "Vigente"}
                          </Badge>
                          {member.gcp_expiry_date && (
                            <span className="text-xs text-muted-foreground mt-1">{member.gcp_expiry_date}</span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">Sin GCP</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{member.studies_assigned}</TableCell>
                    <TableCell className="text-center">{member.patients_assigned}</TableCell>
                    <TableCell className="text-center">
                      {member.workload_score !== null ? (
                        <Badge variant={member.workload_score > 4 ? "destructive" : "outline"}>
                          {member.workload_score.toFixed(1)}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPerformanceColor(member.performance_rating)}>
                        {member.performance_rating}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
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
