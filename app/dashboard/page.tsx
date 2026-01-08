import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user role to redirect to appropriate dashboard
  const { data: userData } = await supabase.from("users").select("role:roles(name)").eq("id", user.id).single()

  const roleName = userData?.role?.name

  switch (roleName) {
    case "COO":
      redirect("/dashboard/coo")
    case "Site Lead":
      redirect("/dashboard/site-lead")
    case "Study Coordinator":
      redirect("/dashboard/coordinator")
    case "Regulatory Specialist":
      redirect("/dashboard/regulatory")
    case "Data Entry Specialist":
      redirect("/dashboard/data-entry")
    case "QA Manager":
      redirect("/dashboard/qa")
    default:
      // If no role found, show a setup message
      redirect("/dashboard/coo")
  }
}
