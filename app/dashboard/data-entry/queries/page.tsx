import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { QueriesPage } from "@/components/forms/queries-page"

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [studiesResult, queriesResult] = await Promise.all([
    supabase.from("study_assignments").select("study:studies(*)").eq("user_id", user.id).eq("is_active", true),
    supabase
      .from("queries")
      .select("*, study:studies(protocol_number)")
      .eq("user_id", user.id)
      .order("opened_date", { ascending: false })
      .limit(100),
  ])

  const studies = studiesResult.data?.map((a) => a.study).filter(Boolean) || []
  const queries = queriesResult.data || []

  return <QueriesPage userId={user.id} studies={studies} queries={queries} />
}
