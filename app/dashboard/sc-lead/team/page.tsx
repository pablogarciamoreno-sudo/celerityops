import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TeamRosterManager } from "@/components/dashboard/sc-lead/team-roster-manager"

export default async function TeamRosterPage() {
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

  // Fetch team roster
  const { data: teamMembers } = await supabase
    .from("sc_lead_team_roster")
    .select("*, site:sites(name)")
    .order("name", { ascending: true })

  // Fetch sites
  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("name")

  return (
    <TeamRosterManager
      teamMembers={teamMembers || []}
      sites={sites || []}
      userSiteId={userProfile?.site_id}
    />
  )
}
