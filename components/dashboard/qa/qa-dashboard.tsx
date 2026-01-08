"use client"

import { useState } from "react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Shield, CheckSquare, Clock, Building2, FlaskConical } from "lucide-react"
import type { Site, Deviation, MonitoringActionItem } from "@/lib/types/database"

interface QADashboardProps {
  kpis: {
    openDeviations: number
    capasRequired: number
    openActionItems: number
    overdueItems: number
    totalSites: number
    activeStudies: number
  }
  sites: Site[]
  deviations: Array<Deviation & { study?: { protocol_number: string }; site?: { name: string } }>
  actionItems: Array<MonitoringActionItem & { study?: { protocol_number: string }; site?: { name: string } }>
}

export function QADashboard({ kpis, sites, deviations, actionItems }: QADashboardProps) {
  const [siteFilter, setSiteFilter] = useState<string>("all")

  const filteredDeviations = siteFilter === "all" ? deviations : deviations.filter((d) => d.site_id === siteFilter)
  const filteredActionItems = siteFilter === "all" ? actionItems : actionItems.filter((a) => a.site_id === siteFilter)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de Aseguramiento de Calidad</h1>
          <p className="text-muted-foreground">Métricas de calidad y seguimiento de cumplimiento entre sitios</p>
        </div>
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-[200px]">
            <Building2 className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Todos los Sitios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Sitios</SelectItem>
            {sites.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Desviaciones Abiertas"
          value={kpis.openDeviations}
          icon={<AlertTriangle className="h-4 w-4" />}
          status={kpis.openDeviations > 10 ? "critical" : kpis.openDeviations > 5 ? "warning" : "success"}
        />
        <KPICard
          title="CAPAs Requeridos"
          value={kpis.capasRequired}
          icon={<Shield className="h-4 w-4" />}
          status={kpis.capasRequired > 5 ? "warning" : "neutral"}
        />
        <KPICard
          title="Ítems Acción Abiertos"
          value={kpis.openActionItems}
          icon={<CheckSquare className="h-4 w-4" />}
          status={kpis.openActionItems > 20 ? "warning" : "neutral"}
        />
        <KPICard
          title="Ítems Vencidos"
          value={kpis.overdueItems}
          icon={<Clock className="h-4 w-4" />}
          status={kpis.overdueItems > 0 ? "critical" : "success"}
        />
        <KPICard title="Sitios" value={kpis.totalSites} icon={<Building2 className="h-4 w-4" />} status="neutral" />
        <KPICard
          title="Estudios Activos"
          value={kpis.activeStudies}
          icon={<FlaskConical className="h-4 w-4" />}
          status="neutral"
        />
      </div>

      {/* Contenido Principal */}
      <Tabs defaultValue="deviations">
        <TabsList>
          <TabsTrigger value="deviations">Desviaciones ({filteredDeviations.length})</TabsTrigger>
          <TabsTrigger value="action-items">Ítems de Acción ({filteredActionItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="deviations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Desviaciones de Protocolo
              </CardTitle>
              <CardDescription>Todas las desviaciones identificadas en los sitios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Estudio</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Sitio</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">CAPA</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeviations.map((deviation) => (
                      <tr key={deviation.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm font-medium text-primary">
                          {deviation.study?.protocol_number}
                        </td>
                        <td className="px-4 py-3 text-sm">{deviation.site?.name}</td>
                        <td className="px-4 py-3 text-sm">{deviation.deviation_type}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(deviation.identified_date).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-4 py-3">
                          {deviation.capa_required ? (
                            <StatusBadge status="critical" />
                          ) : (
                            <span className="text-xs text-muted-foreground">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={deviation.status} />
                        </td>
                      </tr>
                    ))}
                    {filteredDeviations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No se encontraron desviaciones
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action-items" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Ítems de Acción de Monitoreo
              </CardTitle>
              <CardDescription>Ítems de seguimiento de visitas de monitoreo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Estudio</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Sitio</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">CRA</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Descripción</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Fecha Venc.</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Prioridad</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActionItems.map((item) => {
                      const isOverdue = item.status !== "closed" && new Date(item.due_date) < new Date()
                      return (
                        <tr key={item.id} className={`border-b hover:bg-muted/30 ${isOverdue ? "bg-red-50" : ""}`}>
                          <td className="px-4 py-3 text-sm font-medium text-primary">{item.study?.protocol_number}</td>
                          <td className="px-4 py-3 text-sm">{item.site?.name}</td>
                          <td className="px-4 py-3 text-sm">{item.cra_name}</td>
                          <td className="px-4 py-3 text-sm truncate max-w-[200px]">{item.action_item_description}</td>
                          <td className={`px-4 py-3 text-sm ${isOverdue ? "text-destructive font-medium" : ""}`}>
                            {new Date(item.due_date).toLocaleDateString("es-ES")}
                            {isOverdue && <span className="ml-1">(Vencido)</span>}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={item.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={item.status} />
                          </td>
                        </tr>
                      )
                    })}
                    {filteredActionItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No se encontraron ítems de acción
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
