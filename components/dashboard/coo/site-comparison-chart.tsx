"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart"
import type { Site, Study } from "@/lib/types/database"

interface SiteComparisonChartProps {
  sites: Site[]
  studies: Study[]
  enrollments: Array<{ id: string; study?: { protocol_number: string } }>
  queries: Array<{ id: string; status: string; study?: { protocol_number: string } }>
}

export function SiteComparisonChart({ sites }: SiteComparisonChartProps) {
  // Mock comparative data for radar chart
  const metrics = ["Enrollment", "Quality", "Timeliness", "Documentation", "Compliance"]

  const chartData = metrics.map((metric) => {
    const dataPoint: Record<string, string | number> = { metric }
    sites.slice(0, 3).forEach((site, index) => {
      dataPoint[`site${index + 1}`] = Math.floor(Math.random() * 30) + 70 // Random score 70-100
    })
    return dataPoint
  })

  const chartConfig: Record<string, { label: string; color: string }> = {}
  sites.slice(0, 3).forEach((site, index) => {
    chartConfig[`site${index + 1}`] = {
      label: site.name.replace("Celerity ", ""),
      color: `oklch(var(--chart-${index + 1}))`,
    }
  })

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          {sites.slice(0, 3).map((site, index) => (
            <Radar
              key={site.id}
              name={site.name.replace("Celerity ", "")}
              dataKey={`site${index + 1}`}
              stroke={`oklch(var(--chart-${index + 1}))`}
              fill={`oklch(var(--chart-${index + 1}))`}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
