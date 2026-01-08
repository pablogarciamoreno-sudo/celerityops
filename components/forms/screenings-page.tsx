"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { toast } from "sonner"
import { Plus, ClipboardList } from "lucide-react"
import type { Study } from "@/lib/types/database"
import { useRouter } from "next/navigation"

interface ScreeningsPageProps {
  userId: string
  studies: Study[]
  screenings: Array<{
    id: string
    study_id: string
    subject_initials: string
    screening_date: string
    status: string
    failure_reason: string | null
    notes: string | null
    study?: { protocol_number: string }
  }>
}

export function ScreeningsPage({ userId, studies, screenings }: ScreeningsPageProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    study_id: "",
    subject_initials: "",
    screening_date: new Date().toISOString().split("T")[0],
    status: "screened",
    failure_reason: "",
    notes: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.from("screenings").insert({
      ...formData,
      user_id: userId,
      failure_reason: formData.status === "screen_failure" ? formData.failure_reason : null,
    })

    if (error) {
      toast.error("Error al registrar tamizaje", { description: error.message })
    } else {
      toast.success("Tamizaje registrado exitosamente")
      setOpen(false)
      setFormData({
        study_id: "",
        subject_initials: "",
        screening_date: new Date().toISOString().split("T")[0],
        status: "screened",
        failure_reason: "",
        notes: "",
      })
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tamizajes</h1>
          <p className="text-muted-foreground">Registra y gestiona tamizajes de sujetos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Tamizaje
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Tamizaje</DialogTitle>
              <DialogDescription>Ingresa los detalles del tamizaje para un nuevo sujeto</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="study">Estudio *</Label>
                  <Select value={formData.study_id} onValueChange={(v) => setFormData({ ...formData, study_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estudio" />
                    </SelectTrigger>
                    <SelectContent>
                      {studies.map((study) => (
                        <SelectItem key={study.id} value={study.id}>
                          {study.protocol_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject_initials">Iniciales del Sujeto *</Label>
                  <Input
                    id="subject_initials"
                    value={formData.subject_initials}
                    onChange={(e) => setFormData({ ...formData, subject_initials: e.target.value.toUpperCase() })}
                    placeholder="ABC"
                    maxLength={4}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="screening_date">Fecha de Tamizaje *</Label>
                  <Input
                    id="screening_date"
                    type="date"
                    value={formData.screening_date}
                    onChange={(e) => setFormData({ ...formData, screening_date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screened">Tamizado</SelectItem>
                      <SelectItem value="screen_failure">Fallo de Tamizaje</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.status === "screen_failure" && (
                  <div className="grid gap-2">
                    <Label htmlFor="failure_reason">Razón del Fallo *</Label>
                    <Textarea
                      id="failure_reason"
                      value={formData.failure_reason}
                      onChange={(e) => setFormData({ ...formData, failure_reason: e.target.value })}
                      placeholder="Describe la razón del fallo de tamizaje"
                      required
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionales (opcional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || !formData.study_id || !formData.subject_initials}>
                  {loading ? "Guardando..." : "Registrar Tamizaje"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Registros de Tamizaje
          </CardTitle>
          <CardDescription>Tus tamizajes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Estudio</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Sujeto</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {screenings.map((screening) => (
                  <tr key={screening.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium text-primary">{screening.study?.protocol_number}</td>
                    <td className="px-4 py-3 text-sm">{screening.subject_initials}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(screening.screening_date).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={screening.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">
                      {screening.failure_reason || screening.notes || "-"}
                    </td>
                  </tr>
                ))}
                {screenings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Aún no hay tamizajes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
