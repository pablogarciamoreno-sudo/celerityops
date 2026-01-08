import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SiteLeadDashboard } from "@/components/dashboard/site-lead/site-lead-dashboard"

export default async function SiteLeadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user's site
  const { data: userData } = await supabase.from("users").select("site_id, site:sites(*)").eq("id", user.id).single()

  const siteId = userData?.site_id

  // Fetch site-specific data
  const [studiesResult, teamResult, actionItemsResult, screeningsResult, enrollmentsResult] = await Promise.all([
    supabase.from("studies").select("*").eq("site_id", siteId).order("created_at", { ascending: false }),
    supabase.from("users").select("*, role:roles(name)").eq("site_id", siteId).eq("is_active", true),
    supabase
      .from("monitoring_action_items")
      .select("*, study:studies(protocol_number)")
      .eq("site_id", siteId)
      .in("status", ["open", "in_progress"])
      .order("due_date", { ascending: true }),
    supabase
      .from("screenings")
      .select("*, study:studies!inner(site_id), user:users(full_name)")
      .eq("study.site_id", siteId)
      .order("screening_date", { ascending: false })
      .limit(20),
    supabase
      .from("enrollments")
      .select("*, study:studies!inner(site_id)")
      .eq("study.site_id", siteId)
      .order("enrollment_date", { ascending: false }),
  ])

  const studies = studiesResult.data || []
  const team = teamResult.data || []
  const actionItems = actionItemsResult.data || []
  const screenings = screeningsResult.data || []
  const enrollments = enrollmentsResult.data || []

  // Calculate KPIs
  const activeStudies = studies.filter((s) => s.status === "active" || s.status === "enrolling").length
  const teamMembers = team.length
  const openActionItems = actionItems.length
  const enrollmentsThisMonth = enrollments.filter((e) => {
    const date = new Date(e.enrollment_date)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  return (
    <SiteLeadDashboard
      site={userData?.site}
      kpis={{
        activeStudies,
        teamMembers,
        openActionItems,
        enrollmentsThisMonth,
      }}
      studies={studies}
      team={team}
      actionItems={actionItems}
      recentActivity={screenings}
    />
  )
}
