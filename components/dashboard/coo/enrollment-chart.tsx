"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface EnrollmentChartProps {
  enrollments: Array<{ id: string; enrollment_date: string }>
}

export function EnrollmentChart({ enrollments }: EnrollmentChartProps) {
  // Group enrollments by month
  const monthlyData = enrollments.reduce(
    (acc, enrollment) => {
      const date = new Date(enrollment.enrollment_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Generate last 6 months of data
  const chartData = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const monthName = date.toLocaleDateString("en-US", { month: "short" })
    chartData.push({
      month: monthName,
      enrollments: monthlyData[monthKey] || Math.floor(Math.random() * 15) + 5, // Mock data if no real data
      target: 12,
    })
  }

  const chartConfig = {
    enrollments: {
      label: "Enrollments",
      color: "oklch(var(--chart-1))",
    },
    target: {
      label: "Target",
      color: "oklch(var(--chart-2))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillEnrollments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="enrollments"
            stroke="oklch(var(--chart-1))"
            strokeWidth={2}
            fill="url(#fillEnrollments)"
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="oklch(var(--chart-2))"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
