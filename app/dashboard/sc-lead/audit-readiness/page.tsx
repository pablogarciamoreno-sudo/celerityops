import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuditReadinessChecker } from "@/components/dashboard/sc-lead/audit-readiness-checker"

export default async function AuditReadinessPage() {
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

  // Fetch audit readiness records
  const { data: auditRecords } = await supabase
    .from("sc_lead_audit_readiness")
    .select("*, site:sites(name)")
    .order("created_at", { ascending: false })

  // Fetch sites
  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("name")

  return (
    <AuditReadinessChecker
      records={auditRecords || []}
      sites={sites || []}
      userSiteId={userProfile?.site_id}
      userId={userProfile?.id}
    />
  )
}
