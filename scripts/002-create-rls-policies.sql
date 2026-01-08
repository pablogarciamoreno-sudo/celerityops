-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- CELERITY CRO MANAGEMENT SYSTEM
-- =============================================

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE adverse_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE essential_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTION: Get user role name
-- =============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT r.name 
  FROM users u
  JOIN roles r ON u.role_id = r.id
  WHERE u.id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTION: Get user site_id
-- =============================================
CREATE OR REPLACE FUNCTION get_user_site_id()
RETURNS UUID AS $$
  SELECT site_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTION: Check if user is COO or QA
-- =============================================
CREATE OR REPLACE FUNCTION is_global_viewer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name IN ('COO', 'QA Manager')
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- =============================================
-- ROLES TABLE POLICIES
-- =============================================
CREATE POLICY "Roles are viewable by all authenticated users"
  ON roles FOR SELECT TO authenticated USING (true);

-- =============================================
-- SITES TABLE POLICIES
-- =============================================
CREATE POLICY "Sites are viewable by all authenticated users"
  ON sites FOR SELECT TO authenticated USING (true);

-- =============================================
-- USERS TABLE POLICIES
-- =============================================
-- COO and QA can see all users
-- Site Lead can see users in their site
-- Staff can see their own profile and colleagues in same site
CREATE POLICY "Users can view based on role"
  ON users FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    site_id = get_user_site_id() OR
    id = auth.uid()
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =============================================
-- STUDIES TABLE POLICIES  
-- =============================================
-- COO and QA can see all studies
-- Others see studies at their site
CREATE POLICY "Studies viewable based on role"
  ON studies FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    site_id = get_user_site_id()
  );

CREATE POLICY "Studies insertable by Site Lead and above"
  ON studies FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COO', 'Site Lead')
  );

CREATE POLICY "Studies updatable by Site Lead and above"
  ON studies FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'COO' OR
    (get_user_role() = 'Site Lead' AND site_id = get_user_site_id())
  );

-- =============================================
-- STUDY ASSIGNMENTS POLICIES
-- =============================================
CREATE POLICY "Study assignments viewable based on role"
  ON study_assignments FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM studies s 
      WHERE s.id = study_id AND s.site_id = get_user_site_id()
    )
  );

CREATE POLICY "Study assignments manageable by leads"
  ON study_assignments FOR ALL TO authenticated
  USING (
    get_user_role() IN ('COO', 'Site Lead')
  );

-- =============================================
-- SCREENINGS POLICIES
-- =============================================
CREATE POLICY "Screenings viewable based on role"
  ON screenings FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM studies s 
      WHERE s.id = study_id AND s.site_id = get_user_site_id()
    )
  );

CREATE POLICY "Screenings insertable by coordinators"
  ON screenings FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    get_user_role() IN ('Study Coordinator', 'Site Lead', 'COO')
  );

CREATE POLICY "Screenings updatable by owner or lead"
  ON screenings FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('Site Lead', 'COO')
  );

-- =============================================
-- ENROLLMENTS POLICIES
-- =============================================
CREATE POLICY "Enrollments viewable based on role"
  ON enrollments FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM studies s 
      WHERE s.id = study_id AND s.site_id = get_user_site_id()
    )
  );

CREATE POLICY "Enrollments insertable by coordinators"
  ON enrollments FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    get_user_role() IN ('Study Coordinator', 'Site Lead', 'COO')
  );

CREATE POLICY "Enrollments updatable by owner or lead"
  ON enrollments FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('Site Lead', 'COO')
  );

-- =============================================
-- VISITS POLICIES
-- =============================================
CREATE POLICY "Visits viewable based on role"
  ON visits FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM studies s 
      WHERE s.id = study_id AND s.site_id = get_user_site_id()
    )
  );

CREATE POLICY "Visits insertable by coordinators"
  ON visits FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    get_user_role() IN ('Study Coordinator', 'Site Lead', 'COO')
  );

CREATE POLICY "Visits updatable by owner or lead"
  ON visits FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('Site Lead', 'COO')
  );

-- =============================================
-- ADVERSE EVENTS POLICIES
-- =============================================
CREATE POLICY "Adverse events viewable based on role"
  ON adverse_events FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM studies s 
      WHERE s.id = study_id AND s.site_id = get_user_site_id()
    )
  );

CREATE POLICY "Adverse events insertable by coordinators"
  ON adverse_events FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    get_user_role() IN ('Study Coordinator', 'Site Lead', 'COO')
  );

CREATE POLICY "Adverse events updatable by owner or lead"
  ON adverse_events FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('Site Lead', 'COO', 'QA Manager')
  );

-- =============================================
-- QUERIES POLICIES
-- =============================================
CREATE POLICY "Queries viewable based on role"
  ON queries FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM studies s 
      WHERE s.id = study_id AND s.site_id = get_user_site_id()
    )
  );

CREATE POLICY "Queries insertable by data entry"
  ON queries FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    get_user_role() IN ('Data Entry Specialist', 'Study Coordinator', 'Site Lead', 'COO')
  );

CREATE POLICY "Queries updatable by owner or lead"
  ON queries FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('Site Lead', 'COO')
  );

-- =============================================
-- REGULATORY SUBMISSIONS POLICIES
-- =============================================
CREATE POLICY "Regulatory submissions viewable based on role"
  ON regulatory_submissions FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM studies s 
      WHERE s.id = study_id AND s.site_id = get_user_site_id()
    )
  );

CREATE POLICY "Regulatory submissions insertable by regulatory"
  ON regulatory_submissions FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    get_user_role() IN ('Regulatory Specialist', 'Site Lead', 'COO')
  );

CREATE POLICY "Regulatory submissions updatable by owner or lead"
  ON regulatory_submissions FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('Site Lead', 'COO')
  );

-- =============================================
-- ESSENTIAL DOCUMENTS POLICIES
-- =============================================
CREATE POLICY "Essential documents viewable based on role"
  ON essential_documents FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM studies s 
      WHERE s.id = study_id AND s.site_id = get_user_site_id()
    )
  );

CREATE POLICY "Essential documents insertable by regulatory"
  ON essential_documents FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    get_user_role() IN ('Regulatory Specialist', 'Site Lead', 'COO')
  );

CREATE POLICY "Essential documents updatable by owner or lead"
  ON essential_documents FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('Site Lead', 'COO')
  );

-- =============================================
-- MONITORING ACTION ITEMS POLICIES
-- =============================================
CREATE POLICY "Monitoring items viewable based on role"
  ON monitoring_action_items FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    site_id = get_user_site_id()
  );

CREATE POLICY "Monitoring items insertable by QA and leads"
  ON monitoring_action_items FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('QA Manager', 'Site Lead', 'COO')
  );

CREATE POLICY "Monitoring items updatable by QA and leads"
  ON monitoring_action_items FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('QA Manager', 'Site Lead', 'COO') OR
    user_id = auth.uid()
  );

-- =============================================
-- DEVIATIONS POLICIES
-- =============================================
CREATE POLICY "Deviations viewable based on role"
  ON deviations FOR SELECT TO authenticated
  USING (
    is_global_viewer() OR
    site_id = get_user_site_id()
  );

CREATE POLICY "Deviations insertable by QA and leads"
  ON deviations FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('QA Manager', 'Site Lead', 'COO', 'Study Coordinator')
  );

CREATE POLICY "Deviations updatable by QA and leads"
  ON deviations FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('QA Manager', 'Site Lead', 'COO')
  );

-- =============================================
-- KPI TARGETS POLICIES
-- =============================================
CREATE POLICY "KPI targets viewable by all"
  ON kpi_targets FOR SELECT TO authenticated USING (true);

CREATE POLICY "KPI targets manageable by COO"
  ON kpi_targets FOR ALL TO authenticated
  USING (get_user_role() = 'COO');

-- =============================================
-- ALERTS POLICIES
-- =============================================
CREATE POLICY "Users can view their own alerts"
  ON alerts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Alerts insertable by system"
  ON alerts FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own alerts"
  ON alerts FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- ACTIVITY LOG POLICIES
-- =============================================
CREATE POLICY "Activity log viewable by COO and self"
  ON activity_log FOR SELECT TO authenticated
  USING (
    get_user_role() = 'COO' OR
    user_id = auth.uid()
  );

CREATE POLICY "Activity log insertable by all"
  ON activity_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
