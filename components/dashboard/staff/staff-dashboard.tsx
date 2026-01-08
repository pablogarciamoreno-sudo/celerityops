"use client"

import type React from "react"

import { KPICard } from "@/components/dashboard/kpi-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FlaskConical,
  ClipboardList,
  Users,
  Calendar,
  AlertTriangle,
  FileText,
  FolderOpen,
  CheckCircle,
  HelpCircle,
  Clock,
  Plus,
} from "lucide-react"
import Link from "next/link"
import type { Study } from "@/lib/types/database"

const iconMap: Record<string, React.ElementType> = {
  flask: FlaskConical,
  clipboard: ClipboardList,
  users: Users,
  calendar: Calendar,
  alert: AlertTriangle,
  file: FileText,
  folder: FolderOpen,
  check: CheckCircle,
  help: HelpCircle,
  clock: Clock,
}

interface StaffDashboardProps {
  role: string
  kpis: Array<{
    title: string
    value: number
    icon: string
    status?: "success" | "warning" | "critical" | "neutral"
  }>
  assignedStudies: Study[]
  recentRecords: Array<{
    id: string
    type: string
    date: string
    status: string
    study: string
    details: string
  }>
  quickActions: Array<{
    label: string
    href: string
    icon: string
  }>
}

export function StaffDashboard({ role, kpis, assignedStudies, recentRecords, quickActions }: StaffDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Encabezado de página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de {role}</h1>
          <p className="text-muted-foreground">Tu espacio de trabajo personal y resumen de actividad</p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => {
            const Icon = iconMap[action.icon] || Plus
            return (
              <Button key={action.label} asChild>
                <Link href={action.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = iconMap[kpi.icon] || FlaskConical
          return (
            <KPICard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              icon={<Icon className="h-4 w-4" />}
              status={kpi.status || "neutral"}
            />
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Estudios Asignados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Mis Estudios
            </CardTitle>
            <CardDescription>Estudios asignados a ti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedStudies.slice(0, 5).map((study) => (
                <div key={study.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary text-sm">{study.protocol_number}</span>
                    <StatusBadge status={study.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {study.sponsor} • {study.therapeutic_area}
                  </p>
                </div>
              ))}
              {assignedStudies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Sin estudios asignados</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Registros Recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Registros Recientes</CardTitle>
            <CardDescription>Tus últimas entradas y actividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRecords.slice(0, 8).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">{record.study}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs font-medium">{record.type}</span>
                    </div>
                    <p className="text-sm truncate mt-1">{record.details}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <StatusBadge status={record.status} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(record.date).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
              ))}
              {recentRecords.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sin registros aún. ¡Comienza creando tu primera entrada!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
