-- =============================================
-- MIGRACION: Tablas adicionales SC Lead
-- Fecha: 2026-01-15
-- Descripcion: 6 tablas adicionales para 28 KPIs
-- =============================================

-- 1. Definiciones de KPIs (28 KPIs estáticos)
CREATE TABLE IF NOT EXISTS sc_lead_kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_key VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  data_type VARCHAR(20) NOT NULL, -- percentage, count, number, decimal
  target_value DECIMAL,
  target_operator VARCHAR(10), -- <=, >=, =, range, info
  unit VARCHAR(20),
  input_frequency VARCHAR(20),
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Valores históricos de KPIs
CREATE TABLE IF NOT EXISTS sc_lead_kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES sc_lead_kpi_definitions(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  value DECIMAL,
  status VARCHAR(10), -- on_target, warning, critical
  notes TEXT,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Contactos de pacientes (tiempo derivación→contacto)
CREATE TABLE IF NOT EXISTS sc_lead_patient_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
  referral_date DATE NOT NULL,
  contact_date DATE,
  referral_source VARCHAR(50), -- Derivación médica, Base de datos, Publicidad, Referido, Otro
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Consultas CRA/Sponsor (responsiveness)
CREATE TABLE IF NOT EXISTS sc_lead_sponsor_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
  received_date TIMESTAMPTZ NOT NULL,
  response_date TIMESTAMPTZ,
  origin VARCHAR(30), -- CRA, Sponsor, CRO, Comité Ética, Autoridad Regulatoria
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Movimientos de personal (turnover y training)
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, year)
);

-- 6. Evaluaciones de sponsors (trimestral)
CREATE TABLE IF NOT EXISTS sc_lead_sponsor_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  quarter VARCHAR(10), -- Q1 2025, Q2 2025, etc.
  sponsor VARCHAR(100),
  study_name VARCHAR(100),
  performance_score DECIMAL(2,1), -- 1.0 a 5.0
  nps_score INTEGER, -- 0 a 10
  comments TEXT,
  evaluation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Contingencias operativas
CREATE TABLE IF NOT EXISTS sc_lead_contingencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  report_date TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20), -- Crítica, Alta, Media, Baja
  resolution_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_kpi_values_site_period ON sc_lead_kpi_values(site_id, period_start);
CREATE INDEX IF NOT EXISTS idx_kpi_values_kpi ON sc_lead_kpi_values(kpi_id);
CREATE INDEX IF NOT EXISTS idx_patient_contacts_dates ON sc_lead_patient_contacts(referral_date, contact_date);
CREATE INDEX IF NOT EXISTS idx_sponsor_queries_dates ON sc_lead_sponsor_queries(received_date, response_date);
CREATE INDEX IF NOT EXISTS idx_team_movements_year ON sc_lead_team_movements(site_id, year);
CREATE INDEX IF NOT EXISTS idx_sponsor_evaluations_quarter ON sc_lead_sponsor_evaluations(site_id, quarter);
CREATE INDEX IF NOT EXISTS idx_contingencies_priority ON sc_lead_contingencies(priority, site_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE sc_lead_kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_kpi_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_patient_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_sponsor_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_team_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_sponsor_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_lead_contingencies ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios autenticados pueden leer
CREATE POLICY "Authenticated users can read kpi_definitions"
  ON sc_lead_kpi_definitions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read kpi_values"
  ON sc_lead_kpi_values FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert kpi_values"
  ON sc_lead_kpi_values FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update kpi_values"
  ON sc_lead_kpi_values FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read patient_contacts"
  ON sc_lead_patient_contacts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert patient_contacts"
  ON sc_lead_patient_contacts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read sponsor_queries"
  ON sc_lead_sponsor_queries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert sponsor_queries"
  ON sc_lead_sponsor_queries FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update sponsor_queries"
  ON sc_lead_sponsor_queries FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read team_movements"
  ON sc_lead_team_movements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage team_movements"
  ON sc_lead_team_movements FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read sponsor_evaluations"
  ON sc_lead_sponsor_evaluations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert sponsor_evaluations"
  ON sc_lead_sponsor_evaluations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read contingencies"
  ON sc_lead_contingencies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage contingencies"
  ON sc_lead_contingencies FOR ALL TO authenticated USING (true);

-- =============================================
-- COMENTARIOS
-- =============================================

COMMENT ON TABLE sc_lead_kpi_definitions IS 'Definiciones de los 28 KPIs del módulo SC Lead (ver KPIs.md)';
COMMENT ON TABLE sc_lead_kpi_values IS 'Valores históricos de KPIs por sitio y período';
COMMENT ON TABLE sc_lead_patient_contacts IS 'Tiempos de contacto para calcular SC-10 (referral_to_contact)';
COMMENT ON TABLE sc_lead_sponsor_queries IS 'Consultas CRA/Sponsor para calcular SC-26 (cra_response_48h)';
COMMENT ON TABLE sc_lead_team_movements IS 'Movimientos de personal para métricas de equipo';
COMMENT ON TABLE sc_lead_sponsor_evaluations IS 'Evaluaciones trimestrales de sponsors SC-27';
COMMENT ON TABLE sc_lead_contingencies IS 'Contingencias operativas';
