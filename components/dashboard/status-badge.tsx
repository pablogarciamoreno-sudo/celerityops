import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType =
  | "active"
  | "enrolling"
  | "completed"
  | "closed"
  | "suspended"
  | "open"
  | "resolved"
  | "pending"
  | "in_progress"
  | "screened"
  | "screen_failure"
  | "enrolled"
  | "withdrawn"
  | "discontinued"
  | "approved"
  | "rejected"
  | "under_review"
  | "submitted"
  | "draft"
  | "collected"
  | "expired"
  | "mild"
  | "moderate"
  | "severe"
  | "life_threatening"
  | "death"
  | "ongoing"
  | "fatal"
  | "capa_initiated"
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "AE"
  | "SAE"

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  // Study status
  active: { label: "Active", variant: "default", className: "bg-sky-500 hover:bg-sky-600 text-white" },
  enrolling: { label: "Enrolling", variant: "default", className: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  completed: { label: "Completed", variant: "secondary", className: "bg-slate-200 text-slate-700" },
  closed: { label: "Closed", variant: "secondary", className: "bg-slate-200 text-slate-700" },
  suspended: { label: "Suspended", variant: "destructive" },

  // General status
  open: { label: "Open", variant: "default", className: "bg-amber-500 hover:bg-amber-600 text-white" },
  resolved: { label: "Resolved", variant: "secondary", className: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pending", variant: "outline", className: "border-amber-500 text-amber-600" },
  in_progress: { label: "In Progress", variant: "default", className: "bg-sky-500 hover:bg-sky-600 text-white" },

  // Screening status
  screened: { label: "Screened", variant: "default", className: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  screen_failure: { label: "Screen Failure", variant: "destructive" },

  // Enrollment status
  enrolled: { label: "Enrolled", variant: "default", className: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  withdrawn: { label: "Withdrawn", variant: "destructive" },
  discontinued: { label: "Discontinued", variant: "destructive" },

  // Regulatory status
  approved: { label: "Approved", variant: "default", className: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  rejected: { label: "Rejected", variant: "destructive" },
  under_review: { label: "Under Review", variant: "default", className: "bg-amber-500 hover:bg-amber-600 text-white" },
  submitted: { label: "Submitted", variant: "default", className: "bg-sky-500 hover:bg-sky-600 text-white" },
  draft: { label: "Draft", variant: "outline" },

  // Document status
  collected: { label: "Collected", variant: "default", className: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  expired: { label: "Expired", variant: "destructive" },

  // AE severity
  mild: { label: "Mild", variant: "secondary", className: "bg-emerald-100 text-emerald-700" },
  moderate: { label: "Moderate", variant: "default", className: "bg-amber-500 hover:bg-amber-600 text-white" },
  severe: { label: "Severe", variant: "destructive" },
  life_threatening: { label: "Life Threatening", variant: "destructive" },
  death: { label: "Death", variant: "destructive", className: "bg-slate-900 hover:bg-slate-800 text-white" },

  // AE status
  ongoing: { label: "Ongoing", variant: "default", className: "bg-amber-500 hover:bg-amber-600 text-white" },
  fatal: { label: "Fatal", variant: "destructive", className: "bg-slate-900 hover:bg-slate-800 text-white" },

  // Deviation status
  capa_initiated: { label: "CAPA Initiated", variant: "default", className: "bg-sky-500 hover:bg-sky-600 text-white" },

  // Priority
  low: { label: "Low", variant: "secondary", className: "bg-slate-200 text-slate-700" },
  medium: { label: "Medium", variant: "default", className: "bg-amber-500 hover:bg-amber-600 text-white" },
  high: { label: "High", variant: "destructive" },
  critical: { label: "Critical", variant: "destructive", className: "bg-red-600 hover:bg-red-700 text-white" },

  // AE Type
  AE: { label: "AE", variant: "default", className: "bg-amber-500 hover:bg-amber-600 text-white" },
  SAE: { label: "SAE", variant: "destructive" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const }

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
