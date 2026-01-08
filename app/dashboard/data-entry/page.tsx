import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StaffDashboard } from "@/components/dashboard/staff/staff-dashboard"

export default async function DataEntryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [assignmentsResult, queriesResult] = await Promise.all([
    supabase.from("study_assignments").select("*, study:studies(*)").eq("user_id", user.id).eq("is_active", true),
    supabase
      .from("queries")
      .select("*, study:studies(protocol_number)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ])

  const assignments = assignmentsResult.data || []
  const queries = queriesResult.data || []

  const openQueries = queries.filter((q) => q.status === "open").length
  const resolvedThisMonth = queries.filter((q) => {
    if (q.status !== "resolved" || !q.resolved_date) return false
    const date = new Date(q.resolved_date)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  const avgAging =
    queries.length > 0 ? Math.round(queries.reduce((sum, q) => sum + (q.aging_days || 0), 0) / queries.length) : 0

  return (
    <StaffDashboard
      role="Data Entry Specialist"
      kpis={[
        { title: "Assigned Studies", value: assignments.length, icon: "flask" },
        {
          title: "Open Queries",
          value: openQueries,
          icon: "help",
          status: openQueries > 20 ? "critical" : openQueries > 10 ? "warning" : "success",
        },
        { title: "Resolved This Month", value: resolvedThisMonth, icon: "check" },
        { title: "Avg Aging (days)", value: avgAging, icon: "clock", status: avgAging > 10 ? "warning" : "success" },
      ]}
      assignedStudies={assignments.map((a) => a.study).filter(Boolean)}
      recentRecords={queries.map((q) => ({
        id: q.id,
        type: "Query" as const,
        date: q.opened_date,
        status: q.status,
        study: q.study?.protocol_number || "",
        details: `${q.query_origin} - ${q.aging_days}d old`,
      }))}
      quickActions={[{ label: "Resolve Query", href: "/dashboard/data-entry/queries", icon: "check" }]}
    />
  )
}
