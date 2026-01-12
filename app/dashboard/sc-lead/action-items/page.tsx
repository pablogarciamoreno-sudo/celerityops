import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ActionItemsManager } from "@/components/dashboard/sc-lead/action-items-manager"

export default async function ActionItemsPage() {
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

  // Fetch action items
  const { data: actionItems } = await supabase
    .from("sc_lead_action_items")
    .select("*, site:sites(name), study:studies(protocol_number)")
    .order("due_date", { ascending: true })

  // Fetch sites
  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("name")

  // Fetch studies
  const { data: studies } = await supabase
    .from("studies")
    .select("id, protocol_number, name")
    .eq("is_active", true)
    .order("protocol_number")

  return (
    <ActionItemsManager
      actionItems={actionItems || []}
      sites={sites || []}
      studies={studies || []}
      userSiteId={userProfile?.site_id}
      userId={userProfile?.id}
    />
  )
}
