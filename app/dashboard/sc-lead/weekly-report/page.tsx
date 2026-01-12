import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WeeklyReportForm } from "@/components/dashboard/sc-lead/weekly-report-form"

export default async function WeeklyReportPage() {
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

  // Fetch sites for dropdown (if user can view all sites)
  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("name")

  // Fetch recent weekly reports
  const { data: recentReports } = await supabase
    .from("sc_lead_weekly_reports")
    .select("*, site:sites(name)")
    .order("period_start", { ascending: false })
    .limit(10)

  return (
    <WeeklyReportForm
      sites={sites || []}
      userSiteId={siteId}
      recentReports={recentReports || []}
      userId={userProfile?.id}
    />
  )
}
