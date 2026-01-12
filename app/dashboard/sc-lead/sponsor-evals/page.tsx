import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SponsorEvaluations } from "@/components/dashboard/sc-lead/sponsor-evaluations"

export default async function SponsorEvalsPage() {
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

  // Fetch sponsor evaluations
  const { data: evaluations } = await supabase
    .from("sc_lead_sponsor_evaluations")
    .select("*, site:sites(name)")
    .order("evaluation_date", { ascending: false })

  // Fetch sites
  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("name")

  return (
    <SponsorEvaluations
      evaluations={evaluations || []}
      sites={sites || []}
      userSiteId={userProfile?.site_id}
    />
  )
}
