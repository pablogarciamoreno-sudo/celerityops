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
import { Plus, HelpCircle, CheckCircle } from "lucide-react"
import type { Study } from "@/lib/types/database"
import { useRouter } from "next/navigation"

interface QueriesPageProps {
  userId: string
  studies: Study[]
  queries: Array<{
    id: string
    study_id: string
    query_origin: string
    opened_date: string
    resolved_date: string | null
    status: string
    aging_days: number
    notes: string | null
    study?: { protocol_number: string }
  }>
}

export function QueriesPage({ userId, studies, queries }: QueriesPageProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    study_id: "",
    query_origin: "",
    opened_date: new Date().toISOString().split("T")[0],
    status: "open",
    notes: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.from("queries").insert({
      ...formData,
      user_id: userId,
    })

    if (error) {
      toast.error("Error al registrar query", { description: error.message })
    } else {
      toast.success("Query registrado exitosamente")
      setOpen(false)
      setFormData({
        study_id: "",
        query_origin: "",
        opened_date: new Date().toISOString().split("T")[0],
        status: "open",
        notes: "",
      })
      router.refresh()
    }

    setLoading(false)
  }

  const handleResolve = async (queryId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("queries")
      .update({
        status: "resolved",
        resolved_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", queryId)

    if (error) {
      toast.error("Error al resolver query", { description: error.message })
    } else {
      toast.success("Query resuelto")
      router.refresh()
    }
  }

  const openQueries = queries.filter((q) => q.status === "open")
  const resolvedQueries = queries.filter((q) => q.status === "resolved")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Queries de Datos</h1>
          <p className="text-muted-foreground">Gestiona y resuelve queries de datos de monitores</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Query
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Query</DialogTitle>
              <DialogDescription>Ingresa los detalles del nuevo query de datos</DialogDescription>
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
                  <Label htmlFor="query_origin">Origen del Query *</Label>
                  <Input
                    id="query_origin"
                    value={formData.query_origin}
                    onChange={(e) => setFormData({ ...formData, query_origin: e.target.value })}
                    placeholder="ej., Patrocinador, CRA, Sistema EDC"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="opened_date">Fecha de Apertura *</Label>
                  <Input
                    id="opened_date"
                    type="date"
                    value={formData.opened_date}
                    onChange={(e) => setFormData({ ...formData, opened_date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Descripción / Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Describe los detalles del query"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || !formData.study_id || !formData.query_origin}>
                  {loading ? "Guardando..." : "Registrar Query"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Queries Abiertos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-500" />
            Queries Abiertos ({openQueries.length})
          </CardTitle>
          <CardDescription>Queries pendientes de resolución</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {openQueries.map((query) => (
              <div key={query.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-primary">{query.study?.protocol_number}</span>
                    <StatusBadge status={query.status} />
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${query.aging_days > 10 ? "bg-red-100 text-red-700" : query.aging_days > 5 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}
                    >
                      {query.aging_days}d antigüedad
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Origen: {query.query_origin}</p>
                  {query.notes && <p className="text-sm mt-1">{query.notes}</p>}
                </div>
                <Button size="sm" onClick={() => handleResolve(query.id)} className="ml-4">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Resolver
                </Button>
              </div>
            ))}
            {openQueries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sin queries abiertos - ¡excelente trabajo!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Queries Resueltos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Queries Resueltos ({resolvedQueries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Estudio</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Origen</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Apertura</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Resolución</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Días para Resolver</th>
                </tr>
              </thead>
              <tbody>
                {resolvedQueries.slice(0, 10).map((query) => (
                  <tr key={query.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium text-primary">{query.study?.protocol_number}</td>
                    <td className="px-4 py-3 text-sm">{query.query_origin}</td>
                    <td className="px-4 py-3 text-sm">{new Date(query.opened_date).toLocaleDateString("es-ES")}</td>
                    <td className="px-4 py-3 text-sm">
                      {query.resolved_date ? new Date(query.resolved_date).toLocaleDateString("es-ES") : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">{query.aging_days}d</td>
                  </tr>
                ))}
                {resolvedQueries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Aún no hay queries resueltos
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
