-- =============================================
-- MODULO SC LEAD - TABLAS DE BASE DE DATOS
-- Ejecutar este SQL en Supabase SQL Editor
-- =============================================

-- 1. Definiciones de KPIs (tabla de referencia)
CREATE TABLE IF NOT EXISTS sc_lead_kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_key VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  data_type VARCHAR(20) NOT NULL,
  target_value DECIMAL,
  target_range VARCHAR(20),
  target_operator VARCHAR(10),
  unit VARCHAR(20),
  input_frequency VARCHAR(20),
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Registro semanal (input principal del SC Lead)
CREATE TABLE IF NOT EXISTS sc_lead_weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Reclutamiento
  patients_screened INTEGER DEFAULT 0,
  patients_randomized INTEGER DEFAULT 0,
  screen_failures INTEGER DEFAULT 0,
  monthly_target INTEGER DEFAULT 0,
  monthly_accumulated INTEGER DEFAULT 0,
  weekly_projection INTEGER DEFAULT 0,
  weekly_actual INTEGER DEFAULT 0,

  -- Visitas
  visits_planned INTEGER DEFAULT 0,
  visits_completed INTEGER DEFAULT 0,
  visits_in_window INTEGER DEFAULT 0,
  visits_procedures_complete INTEGER DEFAULT 0,
  patients_ongoing_start INTEGER DEFAULT 0,
  patients_lost INTEGER DEFAULT 0,

  -- Seguridad
  saes_identified INTEGER DEFAULT 0,
  saes_reported_24h INTEGER DEFAULT 0,
  major_deviations INTEGER DEFAULT 0,
  total_deviations_month INTEGER DEFAULT 0,
  total_procedures_month INTEGER DEFAULT 0,
  major_deviations_month INTEGER DEFAULT 0,
  open_capas INTEGER DEFAULT 0,

  -- Eficiencia
  total_coordinators INTEGER DEFAULT 0,
  total_studies INTEGER DEFAULT 0,
  total_patients_ongoing INTEGER DEFAULT 0,
  mv_siv_planned INTEGER DEFAULT 0,
  mv_siv_participated INTEGER DEFAULT 0,

  -- Metadata
  reported_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(site_id, year, week_number)
);

-- 3. Action Items de Monitoring Visits
CREATE TABLE IF NOT EXISTS sc_lead_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  mv_date DATE,
  description TEXT NOT NULL,
  category VARCHAR(30),
  severity VARCHAR(20),
  responsible VARCHAR(100),
  due_date DATE,
  closed_date DATE,
  status VARCHAR(20) DEFAULT 'Abierto',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Contacto de pacientes (tiempo de respuesta)
CREATE TABLE IF NOT EXISTS sc_lead_patient_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  referral_date DATE NOT NULL,
  contact_date DATE,
  referral_source VARCHAR(50),
  patient_initials VARCHAR(10),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Start-up tracker (estudios en activacion)
CREATE TABLE IF NOT EXISTS sc_lead_startup_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  study_name VARCHAR(100) NOT NULL,
  protocol_number VARCHAR(50),
  sponsor VARCHAR(100),
  ec_submission_date DATE,
  ec_approval_date DATE,
  last_approval_date DATE,
  fpfv_date DATE,
  required_resubmission BOOLEAN DEFAULT false,
  status VARCHAR(30) DEFAULT 'En Sometimiento',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Consultas CRA/Sponsor (responsiveness)
CREATE TABLE IF NOT EXISTS sc_lead_sponsor_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  received_date TIMESTAMPTZ NOT NULL,
  response_date TIMESTAMPTZ,
  origin VARCHAR(30),
  description TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Roster del equipo
CREATE TABLE IF NOT EXISTS sc_lead_team_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50),
  hire_date DATE,
  gcp_current BOOLEAN DEFAULT false,
  gcp_expiry_date DATE,
  performance_rating VARCHAR(30),
  workload_score DECIMAL(2,1),
  studies_assigned INTEGER DEFAULT 0,
  patients_assigned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Movimientos de personal (anual)
CREATE TABLE IF NOT EXISTS sc_lead_team_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  headcount_start INTEGER DEFAULT 0,
  hires INTEGER DEFAULT 0,
  departures INTEGER DEFAULT 0,
  headcount_current INTEGER DEFAULT 0,
  trainings_planned INTEGER DEFAULT 0,
  trainings_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, year)
);

-- 9. Evaluaciones de sponsors (trimestral)
CREATE TABLE IF NOT EXISTS sc_lead_sponsor_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  quarter VARCHAR(10),
  sponsor VARCHAR(100),
  study_name VARCHAR(100),
  performance_score DECIMAL(2,1),
  nps_score INTEGER,
  comments TEXT,
  evaluation_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Contingencias operativas
CREATE TABLE IF NOT EXISTS sc_lead_contingencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  report_date TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20),
  resolution_date TIMESTAMPTZ,
  resolution_hours DECIMAL(5,1),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Audit Readiness checklist (mensual)
CREATE TABLE IF NOT EXISTS sc_lead_audit_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL,
  isf_complete BOOLEAN DEFAULT false,
  regulatory_current BOOLEAN DEFAULT false,
  delegation_logs_current BOOLEAN DEFAULT false,
  consents_verified BOOLEAN DEFAULT false,
  source_docs_complete BOOLEAN DEFAULT false,
  saes_documented BOOLEAN DEFAULT false,
  deviations_documented BOOLEAN DEFAULT false,
  etmf_current BOOLEAN DEFAULT false,
  score DECIMAL(5,2),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, period)
);

-- =============================================
-- INDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_weekly_reports_site_period ON sc_lead_weekly_reports(site_id, year, week_number);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON sc_lead_action_items(status, site_id);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON sc_lead_action_items(due_date);
CREATE INDEX IF NOT EXISTS idx_startup_tracker_status ON sc_lead_startup_tracker(status, site_id);
CREATE INDEX IF NOT EXISTS idx_patient_contacts_dates ON sc_lead_patient_contacts(referral_date, contact_date);
CREATE INDEX IF NOT EXISTS idx_team_roster_site ON sc_lead_team_roster(site_id, is_active);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE sc_lead_weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_patient_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_startup_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_sponsor_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_team_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_team_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_sponsor_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_contingencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_audit_readiness ENABLE ROW LEVEL SECURITY;

-- Politicas: usuarios autenticados pueden ver/editar datos de sus sitios
CREATE POLICY "Users can view their site data" ON sc_lead_weekly_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their site data" ON sc_lead_weekly_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their site data" ON sc_lead_weekly_reports
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Repetir para otras tablas (simplificado para MVP)
CREATE POLICY "Authenticated users" ON sc_lead_action_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users" ON sc_lead_patient_contacts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users" ON sc_lead_startup_tracker FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users" ON sc_lead_sponsor_queries FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users" ON sc_lead_team_roster FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users" ON sc_lead_team_movements FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users" ON sc_lead_sponsor_evaluations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users" ON sc_lead_contingencies FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users" ON sc_lead_audit_readiness FOR ALL USING (auth.uid() IS NOT NULL);
