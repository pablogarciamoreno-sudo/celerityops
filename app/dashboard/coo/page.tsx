import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { COODashboard } from "@/components/dashboard/coo/coo-dashboard"

export default async function COOPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch all dashboard data in parallel with error handling
  let studies: any[] = []
  let screenings: any[] = []
  let enrollments: any[] = []
  let queries: any[] = []
  let actionItems: any[] = []
  let alerts: any[] = []
  let sites: any[] = []

  try {
    const [
      studiesResult,
      screeningsResult,
      enrollmentsResult,
      queriesResult,
      actionItemsResult,
      alertsResult,
      sitesResult,
    ] = await Promise.all([
      supabase.from("studies").select("*, site:sites(name)").order("created_at", { ascending: false }),
      supabase
        .from("screenings")
        .select("*, study:studies(protocol_number)")
        .order("screening_date", { ascending: false }),
      supabase
        .from("enrollments")
        .select("*, study:studies(protocol_number)")
        .order("enrollment_date", { ascending: false }),
      supabase.from("queries").select("*, study:studies(protocol_number)").order("opened_date", { ascending: false }),
      supabase
        .from("monitoring_action_items")
        .select("*, study:studies(protocol_number), site:sites(name)")
        .eq("status", "open")
        .order("due_date", { ascending: true }),
      supabase.from("alerts").select("*").eq("is_read", false).order("created_at", { ascending: false }).limit(10),
      supabase.from("sites").select("*").eq("is_active", true),
    ])

    studies = studiesResult.data || []
    screenings = screeningsResult.data || []
    enrollments = enrollmentsResult.data || []
    queries = queriesResult.data || []
    actionItems = actionItemsResult.data || []
    alerts = alertsResult.data || []
    sites = sitesResult.data || []
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
  }

  // Calculate KPIs
  const activeStudies = studies.filter((s) => s.status === "active" || s.status === "enrolling").length
  const totalEnrollments = enrollments.length
  const totalScreenings = screenings.length
  const screenFailures = screenings.filter((s) => s.status === "screen_failure").length
  const screenFailureRate = totalScreenings > 0 ? Math.round((screenFailures / totalScreenings) * 100) : 0
  const openQueries = queries.filter((q) => q.status === "open").length
  const avgQueryAging =
    queries.length > 0 ? Math.round(queries.reduce((sum, q) => sum + (q.aging_days || 0), 0) / queries.length) : 0
  const openActionItems = actionItems.length

  return (
    <COODashboard
      kpis={{
        activeStudies,
        totalEnrollments,
        screenFailureRate,
        openQueries,
        avgQueryAging,
        openActionItems,
      }}
      studies={studies}
      screenings={screenings}
      enrollments={enrollments}
      queries={queries}
      actionItems={actionItems}
      alerts={alerts}
      sites={sites}
    />
  )
}
