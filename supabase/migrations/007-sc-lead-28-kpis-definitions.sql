-- =============================================
-- MIGRACION: 28 KPIs SC Lead (del KPIs.md)
-- Fecha: 2026-01-14
-- Descripcion: Inserta las 28 definiciones de KPIs
-- =============================================

-- Limpiar datos anteriores si existen
DELETE FROM sc_lead_kpi_definitions;

-- =============================================
-- INSERTAR 28 KPIs
-- =============================================

INSERT INTO sc_lead_kpi_definitions (kpi_key, label, category, data_type, target_value, target_operator, unit, input_frequency, sort_order, is_active) VALUES

-- 🚀 START-UP (6 KPIs: #1-6)
('feasibility_response', 'Respuesta a Factibilidad (site)', 'startup', 'number', 2, '<=', 'días', 'Por estudio', 1, true),
('team_assignment_post_selection', 'Asignación de Equipo Post-Selección', 'startup', 'number', 3, '<=', 'días', 'Por estudio', 2, true),
('training_completed_pre_siv', 'Entrenamientos Sistemas Completados Pre-SIV', 'startup', 'percentage', 100, '=', '%', 'Por estudio', 3, true),
('checklist_pre_siv', 'Checklist Pre-SIV Completado (1 sem antes)', 'startup', 'percentage', 100, '=', '%', 'Por estudio', 4, true),
('siv_to_fpi', 'SIV → FPI', 'startup', 'number', 21, '<=', 'días', 'Por estudio', 5, true),
('siv_mv_participation', 'Participación en SIV/MV', 'startup', 'percentage', 100, '=', '%', 'Por visita', 6, true),

-- 🎯 RECLUTAMIENTO Y RETENCIÓN (6 KPIs: #7-12)
('enrollment_vs_plan', 'Enrollment vs Plan (site)', 'recruitment', 'percentage', 85, '>=', '%', 'Mensual', 7, true),
('screen_fail_rate', 'Screen-Fail Rate', 'recruitment', 'percentage', 28, '<=', '%', 'Mensual', 8, true),
('patient_retention', 'Retención de Pacientes', 'recruitment', 'percentage', 85, '>=', '%', 'Mensual', 9, true),
('referral_to_contact', 'Tiempo Derivación → Contacto Paciente', 'recruitment', 'number', 24, '<=', 'horas', 'Por paciente', 10, true),
('visits_completed_vs_planned', '% Visitas Completadas vs Planificadas', 'recruitment', 'percentage', 95, '>=', '%', 'Semanal', 11, true),
('visit_window_adherence', '% Adherencia a Ventana de Visita', 'recruitment', 'percentage', 90, '>=', '%', 'Semanal', 12, true),

-- 📊 CALIDAD DE DATOS (6 KPIs: #13-18)
('query_resolution', 'Resolución de Queries', 'quality', 'number', 48, '<=', 'horas', 'Por query', 13, true),
('etmf_completeness', 'eTMF Completeness', 'quality', 'percentage', 95, '>=', '%', 'Mensual', 14, true),
('critical_deviations_per_100', 'Desviaciones Críticas / 100 Visitas', 'quality', 'number', 2, '<=', 'qty', 'Mensual', 15, true),
('protocol_deviation_rate', 'Tasa Desviaciones Protocolo (todas)', 'quality', 'percentage', 3, '<=', '%', 'Mensual', 16, true),
('sae_reported_24h', '% SAEs Reportados <24h', 'quality', 'percentage', 100, '=', '%', 'Por evento', 17, true),
('capa_closed_on_time', 'CAPA Cerradas On-Time', 'quality', 'percentage', 95, '>=', '%', 'Mensual', 18, true),

-- 💻 TRANSFORMACIÓN DIGITAL (2 KPIs: #20-21) - Nota: #19 no existe
('data_entry_post_visit', 'Data Entry Post-Visita', 'digital', 'number', 24, '<=', 'horas', 'Por visita', 20, true),
('etmf_docs_on_time', '% Documentos Subidos eTMF en Plazo', 'digital', 'percentage', 95, '>=', '%', 'Mensual', 21, true),

-- 📝 MONITOREO Y ACTION ITEMS (4 KPIs: #22-25)
('ai_closed_14days', 'Action Items Cerrados ≤14 días', 'monitoring', 'percentage', 95, '>=', '%', 'Semanal', 22, true),
('ai_aging_30days', 'Action Items Aging >30 días', 'monitoring', 'count', 1, '<=', 'qty', 'Semanal', 23, true),
('avg_days_ai_closure', 'Promedio Días Cierre Action Items', 'monitoring', 'number', 7, '<=', 'días', 'Semanal', 24, true),
('major_findings_mv', '% Major Findings en MV', 'monitoring', 'percentage', 5, '<=', '%', 'Por MV', 25, true),

-- ⭐ SATISFACCIÓN SPONSORS (2 KPIs: #26-27)
('cra_response_48h', '% Consultas CRA/Sponsor Respondidas ≤48h', 'sponsor', 'percentage', 95, '>=', '%', 'Semanal', 26, true),
('sponsor_performance_score', 'Score Evaluación Performance Sponsor', 'sponsor', 'decimal', 4.0, '>=', '/5', 'Trimestral', 27, true),

-- 👥 GESTIÓN DE EQUIPO (2 KPIs: #28-29)
('gcp_current_pct', '% Equipo GCP Vigente', 'team', 'percentage', 100, '=', '%', 'Mensual', 28, true),
('training_vs_plan', 'Training Completado vs Plan', 'team', 'percentage', 95, '>=', '%', 'Mensual', 29, true);

-- =============================================
-- VERIFICAR INSERCION
-- =============================================
-- SELECT category, COUNT(*) as count FROM sc_lead_kpi_definitions GROUP BY category ORDER BY MIN(sort_order);
-- Resultado esperado:
-- startup: 6
-- recruitment: 6
-- quality: 6
-- digital: 2
-- monitoring: 4
-- sponsor: 2
-- team: 2
-- TOTAL: 28

COMMENT ON TABLE sc_lead_kpi_definitions IS '28 KPIs del módulo SC Lead según KPIs.md (2026-01-14)';
