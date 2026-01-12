export type Role = {
  id: string
  name: "COO" | "Site Lead" | "SC Lead" | "Study Coordinator" | "Regulatory Specialist" | "Data Entry Specialist" | "QA Manager"
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

// =============================================
// SC LEAD MODULE TYPES
// =============================================

export type KPIStatus = 'on_target' | 'warning' | 'critical' | 'info' | 'pending'

export type KPICategory =
  | 'recruitment'
  | 'execution'
  | 'safety'
  | 'monitoring'
  | 'startup'
  | 'sponsor'
  | 'team'
  | 'efficiency'

export type KPIOperator = '<=' | '>=' | '=' | 'range' | 'info'

export type SCLeadWeeklyReport = {
  id: string
  site_id: string
  year: number
  week_number: number
  period_start: string
  period_end: string
  // Reclutamiento
  patients_screened: number
  patients_randomized: number
  screen_failures: number
  monthly_target: number
  monthly_accumulated: number
  weekly_projection: number
  weekly_actual: number
  // Visitas
  visits_planned: number
  visits_completed: number
  visits_in_window: number
  visits_procedures_complete: number
  patients_ongoing_start: number
  patients_lost: number
  // Seguridad
  saes_identified: number
  saes_reported_24h: number
  major_deviations: number
  total_deviations_month: number
  total_procedures_month: number
  major_deviations_month: number
  open_capas: number
  // Eficiencia
  total_coordinators: number
  total_studies: number
  total_patients_ongoing: number
  mv_siv_planned: number
  mv_siv_participated: number
  // Meta
  reported_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
  site?: Site
}

export type SCLeadActionItem = {
  id: string
  site_id: string
  study_id: string | null
  mv_date: string | null
  description: string
  category: string
  severity: 'Major' | 'Minor' | 'Observacion'
  responsible: string
  due_date: string
  closed_date: string | null
  status: 'Abierto' | 'En Progreso' | 'Cerrado'
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  site?: Site
  study?: Study
  days_open?: number
}

export type SCLeadStartupTracker = {
  id: string
  site_id: string
  study_name: string
  protocol_number: string | null
  sponsor: string | null
  ec_submission_date: string | null
  ec_approval_date: string | null
  last_approval_date: string | null
  fpfv_date: string | null
  required_resubmission: boolean
  status: 'En Sometimiento' | 'Aprobacion Pendiente' | 'Aprobado' | 'En Activacion' | 'FPFV Logrado' | 'Suspendido'
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  site?: Site
}

export type SCLeadTeamMember = {
  id: string
  site_id: string
  name: string
  role: string
  hire_date: string | null
  gcp_current: boolean
  gcp_expiry_date: string | null
  performance_rating: 'Excepcional' | 'Satisfactorio' | 'Necesita Mejora' | 'No Evaluado'
  workload_score: number | null
  studies_assigned: number
  patients_assigned: number
  is_active: boolean
  created_at: string
  updated_at: string
  site?: Site
}

export type SCLeadAuditReadiness = {
  id: string
  site_id: string
  period: string
  isf_complete: boolean
  regulatory_current: boolean
  delegation_logs_current: boolean
  consents_verified: boolean
  source_docs_complete: boolean
  saes_documented: boolean
  deviations_documented: boolean
  etmf_current: boolean
  score: number | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  site?: Site
}

// KPI calculado con valor y estado
export type SCLeadKPIValue = {
  kpi_key: string
  label: string
  category: KPICategory
  value: number | null
  target: number | string | null
  operator: KPIOperator
  unit: string
  status: KPIStatus
}
