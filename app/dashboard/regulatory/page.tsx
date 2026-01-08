import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StaffDashboard } from "@/components/dashboard/staff/staff-dashboard"

export default async function RegulatoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [assignmentsResult, submissionsResult, documentsResult] = await Promise.all([
    supabase.from("study_assignments").select("*, study:studies(*)").eq("user_id", user.id).eq("is_active", true),
    supabase
      .from("regulatory_submissions")
      .select("*, study:studies(protocol_number)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("essential_documents")
      .select("*, study:studies(protocol_number)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  const assignments = assignmentsResult.data || []
  const submissions = submissionsResult.data || []
  const documents = documentsResult.data || []

  const pendingSubmissions = submissions.filter((s) => s.status === "submitted" || s.status === "under_review").length
  const pendingDocs = documents.filter((d) => d.status === "pending").length

  return (
    <StaffDashboard
      role="Regulatory Specialist"
      kpis={[
        { title: "Assigned Studies", value: assignments.length, icon: "flask" },
        {
          title: "Pending Submissions",
          value: pendingSubmissions,
          icon: "file",
          status: pendingSubmissions > 5 ? "warning" : "neutral",
        },
        {
          title: "Pending Documents",
          value: pendingDocs,
          icon: "folder",
          status: pendingDocs > 10 ? "warning" : "neutral",
        },
        {
          title: "Approved This Month",
          value: submissions.filter((s) => s.status === "approved").length,
          icon: "check",
        },
      ]}
      assignedStudies={assignments.map((a) => a.study).filter(Boolean)}
      recentRecords={[
        ...submissions.map((s) => ({
          id: s.id,
          type: "Submission" as const,
          date: s.submitted_date,
          status: s.status,
          study: s.study?.protocol_number || "",
          details: `${s.submission_type} to ${s.entity}`,
        })),
        ...documents.map((d) => ({
          id: d.id,
          type: "Document" as const,
          date: d.created_at,
          status: d.status,
          study: d.study?.protocol_number || "",
          details: d.document_type,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
      quickActions={[
        { label: "New Submission", href: "/dashboard/regulatory/submissions", icon: "file" },
        { label: "Add Document", href: "/dashboard/regulatory/documents", icon: "folder" },
      ]}
    />
  )
}
