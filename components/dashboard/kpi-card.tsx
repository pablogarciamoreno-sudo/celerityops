import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
    label?: string
  }
  icon?: React.ReactNode
  status?: "success" | "warning" | "critical" | "neutral"
  className?: string
}

export function KPICard({ title, value, subtitle, trend, icon, status = "neutral", className }: KPICardProps) {
  const statusColors = {
    success: "border-l-4 border-l-[oklch(var(--success))]",
    warning: "border-l-4 border-l-[oklch(var(--warning))]",
    critical: "border-l-4 border-l-[oklch(var(--critical))]",
    neutral: "",
  }

  const trendColors = {
    up: "text-[oklch(var(--success))]",
    down: "text-[oklch(var(--critical))]",
    neutral: "text-muted-foreground",
  }

  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus

  return (
    <Card className={cn("transition-all hover:shadow-md", statusColors[status], className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1 text-sm", trendColors[trend.direction])}>
              <TrendIcon className="h-4 w-4" />
              <span>{trend.value}%</span>
              {trend.label && <span className="text-xs text-muted-foreground ml-1">{trend.label}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
