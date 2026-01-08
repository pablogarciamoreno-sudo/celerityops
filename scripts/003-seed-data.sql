-- =============================================
-- SEED DATA FOR CELERITY CRO
-- =============================================

-- Insert Roles
INSERT INTO roles (id, name, description, permissions_json) VALUES
  ('11111111-1111-1111-1111-111111111111', 'COO', 'Chief Operating Officer - Full access to all data and settings', '{"view_all": true, "manage_settings": true, "export": true}'),
  ('22222222-2222-2222-2222-222222222222', 'Site Lead', 'Site Manager - Full access to site data, team management', '{"view_site": true, "manage_team": true, "register_notes": true}'),
  ('33333333-3333-3333-3333-333333333333', 'Study Coordinator', 'SC - Registers screenings, enrollments, visits, AEs', '{"register_clinical": true, "view_assigned": true}'),
  ('44444444-4444-4444-4444-444444444444', 'Regulatory Specialist', 'Manages regulatory submissions and essential documents', '{"register_regulatory": true, "view_assigned": true}'),
  ('55555555-5555-5555-5555-555555555555', 'Data Entry Specialist', 'Handles queries and CRF completion', '{"register_data": true, "view_assigned": true}'),
  ('66666666-6666-6666-6666-666666666666', 'QA Manager', 'Quality Assurance - Cross-site quality metrics', '{"view_all": true, "register_qa": true, "manage_deviations": true}');

-- Insert Sites
INSERT INTO sites (id, name, country, city, address, is_active) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Celerity Santiago', 'Chile', 'Santiago', 'Av. Providencia 1234, Providencia', true),
  ('aaaa2222-2222-2222-2222-222222222222', 'Celerity Iquique', 'Chile', 'Iquique', 'Calle Baquedano 567, Iquique', true),
  ('aaaa3333-3333-3333-3333-333333333333', 'Celerity Concepción', 'Chile', 'Concepción', 'Av. O''Higgins 890, Concepción', true),
  ('aaaa4444-4444-4444-4444-444444444444', 'Celerity Lima', 'Peru', 'Lima', 'Av. Javier Prado 456, San Isidro', true),
  ('aaaa5555-5555-5555-5555-555555555555', 'Celerity México', 'Mexico', 'Mexico City', 'Paseo de la Reforma 789, Cuauhtémoc', true);

-- Insert Studies
INSERT INTO studies (id, protocol_number, sponsor, therapeutic_area, phase, status, title, target_enrollment, start_date, end_date, site_id) VALUES
  ('bbbb1111-1111-1111-1111-111111111111', 'ONCO-2024-001', 'Pfizer', 'Oncology', 'Phase III', 'enrolling', 'A Randomized Study of PF-123 in Advanced NSCLC', 150, '2024-01-15', '2026-01-15', 'aaaa1111-1111-1111-1111-111111111111'),
  ('bbbb2222-2222-2222-2222-222222222222', 'ONCO-2024-002', 'Roche', 'Oncology', 'Phase II', 'active', 'Phase II Study of RO-456 in Breast Cancer', 80, '2024-03-01', '2025-09-01', 'aaaa1111-1111-1111-1111-111111111111'),
  ('bbbb3333-3333-3333-3333-333333333333', 'CARD-2024-001', 'Novartis', 'Cardiology', 'Phase III', 'enrolling', 'CARDIOVASC: Study of NVS-789 in Heart Failure', 200, '2024-02-01', '2026-06-01', 'aaaa2222-2222-2222-2222-222222222222'),
  ('bbbb4444-4444-4444-4444-444444444444', 'CARD-2024-002', 'AstraZeneca', 'Cardiology', 'Phase II', 'active', 'AZ-Heart: Evaluation of AZ-321 in Arrhythmia', 60, '2024-04-15', '2025-10-15', 'aaaa3333-3333-3333-3333-333333333333'),
  ('bbbb5555-5555-5555-5555-555555555555', 'ONCO-2024-003', 'Merck', 'Oncology', 'Phase III', 'enrolling', 'KEYNOTE-999: Pembrolizumab in Colorectal Cancer', 180, '2024-01-01', '2026-12-31', 'aaaa4444-4444-4444-4444-444444444444'),
  ('bbbb6666-6666-6666-6666-666666666666', 'IMMU-2024-001', 'Johnson & Johnson', 'Immunology', 'Phase II', 'active', 'JNJ-Immune: Study in Rheumatoid Arthritis', 100, '2024-05-01', '2025-11-01', 'aaaa5555-5555-5555-5555-555555555555'),
  ('bbbb7777-7777-7777-7777-777777777777', 'ONCO-2023-001', 'Bristol-Myers Squibb', 'Oncology', 'Phase III', 'completed', 'CheckMate-888: Nivolumab in Melanoma', 120, '2023-01-01', '2024-06-30', 'aaaa1111-1111-1111-1111-111111111111');

-- Insert KPI Targets
INSERT INTO kpi_targets (metric_name, target_value, threshold_warning, threshold_critical, site_id, study_id) VALUES
  ('enrollment_rate', 85, 70, 50, NULL, NULL),
  ('screen_failure_rate', 25, 35, 50, NULL, NULL),
  ('query_aging_days', 5, 10, 15, NULL, NULL),
  ('visit_completion_rate', 95, 85, 75, NULL, NULL),
  ('document_completion_rate', 100, 90, 80, NULL, NULL),
  ('deviation_rate', 5, 10, 15, NULL, NULL);
