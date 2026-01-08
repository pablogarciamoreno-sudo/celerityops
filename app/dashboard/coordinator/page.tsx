import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StaffDashboard } from "@/components/dashboard/staff/staff-dashboard"

export default async function CoordinatorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch coordinator-specific data
  const [assignmentsResult, screeningsResult, enrollmentsResult, visitsResult, adverseEventsResult] = await Promise.all(
    [
      supabase.from("study_assignments").select("*, study:studies(*)").eq("user_id", user.id).eq("is_active", true),
      supabase
        .from("screenings")
        .select("*, study:studies(protocol_number)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("enrollments")
        .select("*, study:studies(protocol_number)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("visits")
        .select("*, study:studies(protocol_number)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("adverse_events")
        .select("*, study:studies(protocol_number)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ],
  )

  const assignments = assignmentsResult.data || []
  const screenings = screeningsResult.data || []
  const enrollments = enrollmentsResult.data || []
  const visits = visitsResult.data || []
  const adverseEvents = adverseEventsResult.data || []

  // Calculate stats
  const thisMonth = new Date()
  const screeningsThisMonth = screenings.filter((s) => {
    const date = new Date(s.created_at)
    return date.getMonth() === thisMonth.getMonth() && date.getFullYear() === thisMonth.getFullYear()
  }).length

  const enrollmentsThisMonth = enrollments.filter((e) => {
    const date = new Date(e.created_at)
    return date.getMonth() === thisMonth.getMonth() && date.getFullYear() === thisMonth.getFullYear()
  }).length

  const visitsThisMonth = visits.filter((v) => {
    const date = new Date(v.created_at)
    return date.getMonth() === thisMonth.getMonth() && date.getFullYear() === thisMonth.getFullYear()
  }).length

  const openAEs = adverseEvents.filter((ae) => ae.status === "open" || ae.status === "ongoing").length

  return (
    <StaffDashboard
      role="Study Coordinator"
      kpis={[
        { title: "Assigned Studies", value: assignments.length, icon: "flask" },
        { title: "Screenings This Month", value: screeningsThisMonth, icon: "clipboard" },
        { title: "Enrollments This Month", value: enrollmentsThisMonth, icon: "users" },
        { title: "Visits This Month", value: visitsThisMonth, icon: "calendar" },
        { title: "Open AEs", value: openAEs, icon: "alert", status: openAEs > 0 ? "warning" : "success" },
      ]}
      assignedStudies={assignments.map((a) => a.study).filter(Boolean)}
      recentRecords={[
        ...screenings.map((s) => ({
          id: s.id,
          type: "Screening" as const,
          date: s.screening_date,
          status: s.status,
          study: s.study?.protocol_number || "",
          details: `Subject ${s.subject_initials}`,
        })),
        ...enrollments.map((e) => ({
          id: e.id,
          type: "Enrollment" as const,
          date: e.enrollment_date,
          status: e.status,
          study: e.study?.protocol_number || "",
          details: `Subject ${e.subject_id}`,
        })),
        ...visits.map((v) => ({
          id: v.id,
          type: "Visit" as const,
          date: v.visit_date,
          status: v.status,
          study: v.study?.protocol_number || "",
          details: `Visit ${v.visit_number} - ${v.subject_id}`,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
      quickActions={[
        { label: "New Screening", href: "/dashboard/coordinator/screenings", icon: "clipboard" },
        { label: "New Enrollment", href: "/dashboard/coordinator/enrollments", icon: "users" },
        { label: "Log Visit", href: "/dashboard/coordinator/visits", icon: "calendar" },
        { label: "Report AE", href: "/dashboard/coordinator/adverse-events", icon: "alert" },
      ]}
    />
  )
}
