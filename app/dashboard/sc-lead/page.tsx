import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SCLeadDashboard } from "@/components/dashboard/sc-lead/sc-lead-dashboard"

export default async function SCLeadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile to get site_id
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, site:sites(*)")
    .eq("auth_id", user.id)
    .single()

  const siteId = userProfile?.site_id

  // Fetch SC Lead data
  let weeklyReports: any[] = []
  let actionItems: any[] = []
  let startupTrackers: any[] = []
  let teamMembers: any[] = []
  let auditReadiness: any[] = []
  let sites: any[] = []

  try {
    const queries = [
      // Weekly reports (last 12 weeks)
      supabase
        .from("sc_lead_weekly_reports")
        .select("*, site:sites(name)")
        .order("period_start", { ascending: false })
        .limit(12),
      // Action items
      supabase
        .from("sc_lead_action_items")
        .select("*, site:sites(name), study:studies(protocol_number)")
        .order("due_date", { ascending: true }),
      // Startup tracker
      supabase
        .from("sc_lead_startup_tracker")
        .select("*, site:sites(name)")
        .order("created_at", { ascending: false }),
      // Team roster
      supabase
        .from("sc_lead_team_roster")
        .select("*, site:sites(name)")
        .eq("is_active", true)
        .order("name", { ascending: true }),
      // Audit readiness (latest per site)
      supabase
        .from("sc_lead_audit_readiness")
        .select("*, site:sites(name)")
        .order("created_at", { ascending: false })
        .limit(10),
      // Sites
      supabase.from("sites").select("*").eq("is_active", true),
    ]

    const [
      weeklyResult,
      actionItemsResult,
      startupResult,
      teamResult,
      auditResult,
      sitesResult,
    ] = await Promise.all(queries)

    weeklyReports = weeklyResult.data || []
    actionItems = actionItemsResult.data || []
    startupTrackers = startupResult.data || []
    teamMembers = teamResult.data || []
    auditReadiness = auditResult.data || []
    sites = sitesResult.data || []
  } catch (error) {
    console.error("Error fetching SC Lead data:", error)
  }

  return (
    <SCLeadDashboard
      weeklyReports={weeklyReports}
      actionItems={actionItems}
      startupTrackers={startupTrackers}
      teamMembers={teamMembers}
      auditReadiness={auditReadiness}
      sites={sites}
      userSiteId={siteId}
    />
  )
}
