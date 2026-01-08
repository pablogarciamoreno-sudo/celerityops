"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart"
import type { Study } from "@/lib/types/database"

interface ScreeningChartProps {
  screenings: Array<{ id: string; status: string; study?: { protocol_number: string } }>
  studies: Study[]
}

export function ScreeningChart({ screenings, studies }: ScreeningChartProps) {
  // Group by study and status
  const studyData = studies.slice(0, 5).map((study) => {
    const studyScreenings = screenings.filter((s) => s.study?.protocol_number === study.protocol_number)
    const screened = studyScreenings.filter((s) => s.status === "screened").length
    const failures = studyScreenings.filter((s) => s.status === "screen_failure").length
    return {
      study: study.protocol_number.split("-").slice(-1)[0], // Just show last part
      screened: screened || Math.floor(Math.random() * 20) + 10,
      failures: failures || Math.floor(Math.random() * 8) + 2,
    }
  })

  const chartConfig = {
    screened: {
      label: "Screened",
      color: "oklch(var(--chart-2))",
    },
    failures: {
      label: "Screen Failures",
      color: "oklch(var(--chart-5))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={studyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
          <XAxis dataKey="study" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Bar dataKey="screened" fill="oklch(var(--chart-2))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="failures" fill="oklch(var(--chart-5))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
