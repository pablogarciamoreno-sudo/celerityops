import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { QADashboard } from "@/components/dashboard/qa/qa-dashboard"

export default async function QAPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [sitesResult, deviationsResult, actionItemsResult, studiesResult] = await Promise.all([
    supabase.from("sites").select("*").eq("is_active", true),
    supabase
      .from("deviations")
      .select("*, study:studies(protocol_number), site:sites(name)")
      .order("identified_date", { ascending: false }),
    supabase
      .from("monitoring_action_items")
      .select("*, study:studies(protocol_number), site:sites(name)")
      .order("due_date", { ascending: true }),
    supabase.from("studies").select("*").in("status", ["active", "enrolling"]),
  ])

  const sites = sitesResult.data || []
  const deviations = deviationsResult.data || []
  const actionItems = actionItemsResult.data || []
  const studies = studiesResult.data || []

  // Calculate metrics
  const openDeviations = deviations.filter((d) => d.status === "open" || d.status === "under_review").length
  const capasRequired = deviations.filter((d) => d.capa_required).length
  const openActionItems = actionItems.filter((a) => a.status === "open" || a.status === "in_progress").length
  const overdueItems = actionItems.filter((a) => {
    if (a.status === "closed") return false
    return new Date(a.due_date) < new Date()
  }).length

  return (
    <QADashboard
      kpis={{
        openDeviations,
        capasRequired,
        openActionItems,
        overdueItems,
        totalSites: sites.length,
        activeStudies: studies.length,
      }}
      sites={sites}
      deviations={deviations}
      actionItems={actionItems}
    />
  )
}
