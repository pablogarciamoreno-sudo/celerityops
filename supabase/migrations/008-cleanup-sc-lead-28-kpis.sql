-- =============================================
-- MIGRACION: Limpieza y consistencia 28 KPIs SC Lead
-- Fecha: 2026-01-14
-- Descripcion: Asegura consistencia con los 28 KPIs del KPIs.md
-- =============================================

-- =============================================
-- 1. LIMPIAR KPI DEFINITIONS
-- Solo mantener los 28 KPIs del KPIs.md
-- =============================================

-- Desactivar KPIs que no están en el listado de 28
UPDATE sc_lead_kpi_definitions
SET is_active = false
WHERE kpi_key NOT IN (
  -- 🚀 START-UP (6 KPIs)
  'feasibility_response',
  'team_assignment_post_selection',
  'training_completed_pre_siv',
  'checklist_pre_siv',
  'siv_to_fpi',
  'siv_mv_participation',
  -- 🎯 RECLUTAMIENTO Y RETENCIÓN (6 KPIs)
  'enrollment_vs_plan',
  'screen_fail_rate',
  'patient_retention',
  'referral_to_contact',
  'visits_completed_vs_planned',
  'visit_window_adherence',
  -- 📊 CALIDAD DE DATOS (6 KPIs)
  'query_resolution',
  'etmf_completeness',
  'critical_deviations_per_100',
  'protocol_deviation_rate',
  'sae_reported_24h',
  'capa_closed_on_time',
  -- 💻 TRANSFORMACIÓN DIGITAL (2 KPIs)
  'data_entry_post_visit',
  'etmf_docs_on_time',
  -- 📝 MONITOREO Y ACTION ITEMS (4 KPIs)
  'ai_closed_14days',
  'ai_aging_30days',
  'avg_days_ai_closure',
  'major_findings_mv',
  -- ⭐ SATISFACCIÓN SPONSORS (2 KPIs)
  'cra_response_48h',
  'sponsor_performance_score',
  -- 👥 GESTIÓN DE EQUIPO (2 KPIs)
  'gcp_current_pct',
  'training_vs_plan'
);

-- Asegurar que los 28 KPIs están activos
UPDATE sc_lead_kpi_definitions
SET is_active = true
WHERE kpi_key IN (
  'feasibility_response', 'team_assignment_post_selection', 'training_completed_pre_siv',
  'checklist_pre_siv', 'siv_to_fpi', 'siv_mv_participation',
  'enrollment_vs_plan', 'screen_fail_rate', 'patient_retention',
  'referral_to_contact', 'visits_completed_vs_planned', 'visit_window_adherence',
  'query_resolution', 'etmf_completeness', 'critical_deviations_per_100',
  'protocol_deviation_rate', 'sae_reported_24h', 'capa_closed_on_time',
  'data_entry_post_visit', 'etmf_docs_on_time',
  'ai_closed_14days', 'ai_aging_30days', 'avg_days_ai_closure', 'major_findings_mv',
  'cra_response_48h', 'sponsor_performance_score',
  'gcp_current_pct', 'training_vs_plan'
);

-- =============================================
-- 2. ACTUALIZAR COMENTARIOS DE TABLAS
-- =============================================

COMMENT ON TABLE sc_lead_kpi_definitions IS '28 KPIs del módulo SC Lead según KPIs.md (2026-01-14)';
COMMENT ON TABLE sc_lead_kpi_values IS 'Valores históricos de KPIs por sitio y período';
COMMENT ON TABLE sc_lead_weekly_reports IS 'Reportes semanales con datos para calcular KPIs';
COMMENT ON TABLE sc_lead_action_items IS 'Action items para KPIs SC-22 a SC-25 (monitoreo)';
COMMENT ON TABLE sc_lead_patient_contacts IS 'Tiempos de contacto para KPI SC-10 (referral_to_contact)';
COMMENT ON TABLE sc_lead_sponsor_queries IS 'Consultas CRA/Sponsor para KPI SC-26 (cra_response_48h)';
COMMENT ON TABLE sc_lead_sponsor_evaluations IS 'Evaluaciones trimestrales para KPI SC-27 (sponsor_performance_score)';
COMMENT ON TABLE sc_lead_team_roster IS 'Roster de equipo para KPI SC-28 (gcp_current_pct)';

-- =============================================
-- 3. VERIFICACION
-- =============================================
-- Ejecutar después de la migración:
-- SELECT COUNT(*) as active_kpis FROM sc_lead_kpi_definitions WHERE is_active = true;
-- Resultado esperado: 28

-- Verificar categorías:
-- SELECT category, COUNT(*) as count
-- FROM sc_lead_kpi_definitions
-- WHERE is_active = true
-- GROUP BY category
-- ORDER BY MIN(sort_order);
-- Esperado:
-- startup: 6
-- recruitment: 6
-- quality: 6
-- digital: 2
-- monitoring: 4
-- sponsor: 2
-- team: 2
