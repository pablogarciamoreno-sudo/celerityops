import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EnrollmentsPage } from "@/components/forms/enrollments-page"

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [studiesResult, enrollmentsResult] = await Promise.all([
    supabase.from("study_assignments").select("study:studies(*)").eq("user_id", user.id).eq("is_active", true),
    supabase
      .from("enrollments")
      .select("*, study:studies(protocol_number)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  const studies = studiesResult.data?.map((a) => a.study).filter(Boolean) || []
  const enrollments = enrollmentsResult.data || []

  return <EnrollmentsPage userId={user.id} studies={studies} enrollments={enrollments} />
}
