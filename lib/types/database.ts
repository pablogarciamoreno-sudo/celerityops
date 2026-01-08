export type Role = {
  id: string
  name: "COO" | "Site Lead" | "Study Coordinator" | "Regulatory Specialist" | "Data Entry Specialist" | "QA Manager"
  description: string
  permissions_json: Record<string, boolean>
  created_at: string
}

export type Site = {
  id: string
  name: string
  country: string
  city: string
  address: string | null
  is_active: boolean
  created_at: string
}

export type User = {
  id: string
  email: string
  full_name: string
  role_id: string
  site_id: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  role?: Role
  site?: Site
}

export type Study = {
  id: string
  protocol_number: string
  sponsor: string
  therapeutic_area: string
  phase: "Phase I" | "Phase II" | "Phase III" | "Phase IV"
  status: "active" | "enrolling" | "closed" | "suspended" | "completed"
  title: string | null
  target_enrollment: number
  start_date: string | null
  end_date: string | null
  site_id: string | null
  created_at: string
  updated_at: string
  site?: Site
}

export type Screening = {
  id: string
  study_id: string
  user_id: string
  subject_initials: string
  screening_date: string
  status: "screened" | "screen_failure" | "pending"
  failure_reason: string | null
  notes: string | null
  created_at: string
  study?: Study
  user?: User
}

export type Enrollment = {
  id: string
  study_id: string
  user_id: string
  subject_id: string
  enrollment_date: string
  status: "enrolled" | "withdrawn" | "completed" | "discontinued"
  notes: string | null
  created_at: string
  study?: Study
  user?: User
}

export type Visit = {
  id: string
  study_id: string
  user_id: string
  subject_id: string
  visit_number: string
  visit_date: string
  status: "completed" | "missed" | "rescheduled" | "pending"
  notes: string | null
  created_at: string
  study?: Study
  user?: User
}

export type AdverseEvent = {
  id: string
  study_id: string
  user_id: string
  subject_id: string
  ae_type: "AE" | "SAE"
  severity: "mild" | "moderate" | "severe" | "life_threatening" | "death"
  description: string | null
  reported_date: string
  resolution_date: string | null
  status: "open" | "ongoing" | "resolved" | "fatal"
  notes: string | null
  created_at: string
  study?: Study
  user?: User
}

export type Query = {
  id: string
  study_id: string
  user_id: string
  query_origin: string
  query_type: string
  opened_date: string
  resolved_date: string | null
  status: "open" | "resolved" | "pending"
  aging_days: number
  notes: string | null
  created_at: string
  study?: Study
  user?: User
}

export type RegulatorySubmission = {
  id: string
  study_id: string
  user_id: string
  submission_type: string
  entity: string
  submitted_date: string
  approved_date: string | null
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "withdrawn"
  document_url: string | null
  notes: string | null
  created_at: string
  study?: Study
  user?: User
}

export type EssentialDocument = {
  id: string
  study_id: string
  user_id: string
  document_type: string
  document_name: string | null
  status: "pending" | "collected" | "approved" | "expired"
  due_date: string | null
  completion_date: string | null
  notes: string | null
  created_at: string
  study?: Study
  user?: User
}

export type MonitoringActionItem = {
  id: string
  study_id: string
  site_id: string
  user_id: string | null
  cra_name: string
  visit_date: string
  action_item_description: string
  due_date: string
  status: "open" | "in_progress" | "closed"
  closed_date: string | null
  priority: "low" | "medium" | "high" | "critical"
  notes: string | null
  created_at: string
  study?: Study
  site?: Site
  user?: User
}

export type Deviation = {
  id: string
  study_id: string
  site_id: string
  user_id: string | null
  deviation_type: string
  description: string
  identified_date: string
  capa_required: boolean
  status: "open" | "under_review" | "closed" | "capa_initiated"
  root_cause: string | null
  notes: string | null
  created_at: string
  study?: Study
  site?: Site
  user?: User
}

export type Alert = {
  id: string
  user_id: string | null
  alert_type: string
  title: string
  message: string
  severity: "info" | "warning" | "critical"
  is_read: boolean
  link_url: string | null
  created_at: string
}

export type KPITarget = {
  id: string
  metric_name: string
  target_value: number
  threshold_warning: number | null
  threshold_critical: number | null
  site_id: string | null
  study_id: string | null
  created_at: string
}

export type ActivityLog = {
  id: string
  user_id: string | null
  action_type: string
  table_affected: string
  record_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  user?: User
}
