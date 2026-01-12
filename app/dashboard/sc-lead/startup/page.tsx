import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StartupTracker } from "@/components/dashboard/sc-lead/startup-tracker"

export default async function StartupTrackerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, site:sites(*)")
    .eq("auth_id", user.id)
    .single()

  // Fetch startup trackers
  const { data: startupTrackers } = await supabase
    .from("sc_lead_startup_tracker")
    .select("*, site:sites(name)")
    .order("created_at", { ascending: false })

  // Fetch sites
  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("name")

  return (
    <StartupTracker
      trackers={startupTrackers || []}
      sites={sites || []}
      userSiteId={userProfile?.site_id}
      userId={userProfile?.id}
    />
  )
}
