-- =============================================
-- CELERITY CRO MANAGEMENT SYSTEM
-- Database Schema Creation Script
-- =============================================

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS kpi_targets CASCADE;
DROP TABLE IF EXISTS deviations CASCADE;
DROP TABLE IF EXISTS monitoring_action_items CASCADE;
DROP TABLE IF EXISTS essential_documents CASCADE;
DROP TABLE IF EXISTS regulatory_submissions CASCADE;
DROP TABLE IF EXISTS queries CASCADE;
DROP TABLE IF EXISTS adverse_events CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS screenings CASCADE;
DROP TABLE IF EXISTS study_assignments CASCADE;
DROP TABLE IF EXISTS studies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =============================================
-- ORGANIZATIONAL TABLES
-- =============================================

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (links to Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role_id UUID REFERENCES roles(id),
  site_id UUID REFERENCES sites(id),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STUDY TABLES
-- =============================================

-- Studies table
CREATE TABLE studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_number TEXT NOT NULL UNIQUE,
  sponsor TEXT NOT NULL,
  therapeutic_area TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('Phase I', 'Phase II', 'Phase III', 'Phase IV')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'enrolling', 'closed', 'suspended', 'completed')),
  title TEXT,
  target_enrollment INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  site_id UUID REFERENCES sites(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study assignments (which users work on which studies)
CREATE TABLE study_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  role_in_study TEXT NOT NULL,
  assigned_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, study_id)
);

-- =============================================
-- TRANSACTIONAL TABLES (Daily Work Records)
-- =============================================

-- Screenings
CREATE TABLE screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  subject_initials TEXT NOT NULL,
  screening_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'screened' CHECK (status IN ('screened', 'screen_failure', 'pending')),
  failure_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  subject_id TEXT NOT NULL,
  enrollment_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'withdrawn', 'completed', 'discontinued')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visits
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  subject_id TEXT NOT NULL,
  visit_number TEXT NOT NULL,
  visit_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'rescheduled', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adverse Events
CREATE TABLE adverse_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  subject_id TEXT NOT NULL,
  ae_type TEXT NOT NULL CHECK (ae_type IN ('AE', 'SAE')),
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening', 'death')),
  description TEXT,
  reported_date DATE NOT NULL,
  resolution_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'ongoing', 'resolved', 'fatal')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queries (Data queries from monitors/sponsor)
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  query_origin TEXT NOT NULL,
  query_type TEXT DEFAULT 'data_clarification',
  opened_date DATE NOT NULL,
  resolved_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'pending')),
  aging_days INTEGER GENERATED ALWAYS AS (
    CASE WHEN resolved_date IS NOT NULL 
      THEN EXTRACT(DAY FROM (resolved_date::timestamp - opened_date::timestamp))::INTEGER
      ELSE EXTRACT(DAY FROM (CURRENT_DATE::timestamp - opened_date::timestamp))::INTEGER
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regulatory Submissions
CREATE TABLE regulatory_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  submission_type TEXT NOT NULL,
  entity TEXT NOT NULL,
  submitted_date DATE NOT NULL,
  approved_date DATE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Essential Documents
CREATE TABLE essential_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  document_type TEXT NOT NULL,
  document_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'approved', 'expired')),
  due_date DATE,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monitoring Action Items
CREATE TABLE monitoring_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id),
  user_id UUID REFERENCES users(id),
  cra_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  action_item_description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  closed_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deviations
CREATE TABLE deviations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id),
  user_id UUID REFERENCES users(id),
  deviation_type TEXT NOT NULL,
  description TEXT NOT NULL,
  identified_date DATE NOT NULL,
  capa_required BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'closed', 'capa_initiated')),
  root_cause TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONFIGURATION TABLES
-- =============================================

-- KPI Targets
CREATE TABLE kpi_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  site_id UUID REFERENCES sites(id),
  study_id UUID REFERENCES studies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  is_read BOOLEAN DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL,
  table_affected TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_site ON users(site_id);
CREATE INDEX idx_studies_site ON studies(site_id);
CREATE INDEX idx_studies_status ON studies(status);
CREATE INDEX idx_screenings_study ON screenings(study_id);
CREATE INDEX idx_screenings_user ON screenings(user_id);
CREATE INDEX idx_screenings_date ON screenings(screening_date);
CREATE INDEX idx_enrollments_study ON enrollments(study_id);
CREATE INDEX idx_enrollments_date ON enrollments(enrollment_date);
CREATE INDEX idx_visits_study ON visits(study_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_queries_study ON queries(study_id);
CREATE INDEX idx_queries_status ON queries(status);
CREATE INDEX idx_adverse_events_study ON adverse_events(study_id);
CREATE INDEX idx_adverse_events_type ON adverse_events(ae_type);
CREATE INDEX idx_regulatory_study ON regulatory_submissions(study_id);
CREATE INDEX idx_monitoring_site ON monitoring_action_items(site_id);
CREATE INDEX idx_monitoring_status ON monitoring_action_items(status);
CREATE INDEX idx_deviations_site ON deviations(site_id);
CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_read ON alerts(is_read);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at);
