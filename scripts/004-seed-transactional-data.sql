-- =============================================
-- DATOS TRANSACCIONALES DE PRUEBA
-- Ejecutar DESPUÉS de crear un usuario en auth.users
-- =============================================

-- NOTA: Necesitas reemplazar 'TU_USER_ID' con el UUID real del usuario
-- que creaste en Supabase Auth antes de ejecutar este script.

-- Para probar sin usuario real, puedes comentar las líneas de user_id
-- o crear usuarios de prueba primero.

-- Screenings de prueba (últimos 30 días)
INSERT INTO screenings (study_id, user_id, subject_initials, screening_date, status, failure_reason, notes) 
SELECT 
  'bbbb1111-1111-1111-1111-111111111111',
  (SELECT id FROM users LIMIT 1),
  'ABC-' || generate_series,
  CURRENT_DATE - (generate_series || ' days')::INTERVAL,
  CASE WHEN random() > 0.3 THEN 'screened' ELSE 'screen_failure' END,
  CASE WHEN random() <= 0.3 THEN 'No cumple criterios de inclusión' ELSE NULL END,
  'Tamizaje registrado'
FROM generate_series(1, 20)
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- Enrollments de prueba
INSERT INTO enrollments (study_id, user_id, subject_id, enrollment_date, status, notes)
SELECT 
  'bbbb1111-1111-1111-1111-111111111111',
  (SELECT id FROM users LIMIT 1),
  'ONCO-001-' || LPAD(generate_series::TEXT, 3, '0'),
  CURRENT_DATE - (generate_series * 2 || ' days')::INTERVAL,
  'enrolled',
  'Sujeto enrolado exitosamente'
FROM generate_series(1, 15)
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- Visits de prueba
INSERT INTO visits (study_id, user_id, subject_id, visit_number, visit_date, status, notes)
SELECT 
  'bbbb1111-1111-1111-1111-111111111111',
  (SELECT id FROM users LIMIT 1),
  'ONCO-001-' || LPAD((generate_series % 15 + 1)::TEXT, 3, '0'),
  'V' || ((generate_series % 5) + 1),
  CURRENT_DATE - (generate_series || ' days')::INTERVAL,
  CASE 
    WHEN random() > 0.9 THEN 'missed'
    WHEN random() > 0.8 THEN 'rescheduled'
    ELSE 'completed'
  END,
  'Visita de seguimiento'
FROM generate_series(1, 30)
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- Queries de prueba
INSERT INTO queries (study_id, user_id, query_origin, query_type, opened_date, resolved_date, status, notes)
SELECT 
  'bbbb1111-1111-1111-1111-111111111111',
  (SELECT id FROM users LIMIT 1),
  CASE (generate_series % 3)
    WHEN 0 THEN 'Monitor'
    WHEN 1 THEN 'Data Management'
    ELSE 'Medical Review'
  END,
  'data_clarification',
  CURRENT_DATE - (generate_series * 2 || ' days')::INTERVAL,
  CASE WHEN random() > 0.4 THEN CURRENT_DATE - (generate_series || ' days')::INTERVAL ELSE NULL END,
  CASE WHEN random() > 0.4 THEN 'resolved' ELSE 'open' END,
  'Query de clarificación de datos'
FROM generate_series(1, 25)
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- Adverse Events de prueba
INSERT INTO adverse_events (study_id, user_id, subject_id, ae_type, severity, description, reported_date, status, notes)
SELECT 
  'bbbb1111-1111-1111-1111-111111111111',
  (SELECT id FROM users LIMIT 1),
  'ONCO-001-' || LPAD((generate_series % 15 + 1)::TEXT, 3, '0'),
  CASE WHEN random() > 0.8 THEN 'SAE' ELSE 'AE' END,
  CASE (generate_series % 4)
    WHEN 0 THEN 'mild'
    WHEN 1 THEN 'moderate'
    WHEN 2 THEN 'severe'
    ELSE 'mild'
  END,
  CASE (generate_series % 5)
    WHEN 0 THEN 'Náuseas'
    WHEN 1 THEN 'Fatiga'
    WHEN 2 THEN 'Cefalea'
    WHEN 3 THEN 'Dolor abdominal'
    ELSE 'Mareos'
  END,
  CURRENT_DATE - (generate_series * 3 || ' days')::INTERVAL,
  CASE WHEN random() > 0.3 THEN 'resolved' ELSE 'open' END,
  'Evento adverso reportado'
FROM generate_series(1, 12)
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- Regulatory Submissions de prueba
INSERT INTO regulatory_submissions (study_id, user_id, submission_type, entity, submitted_date, approved_date, status, notes)
VALUES 
  ('bbbb1111-1111-1111-1111-111111111111', (SELECT id FROM users LIMIT 1), 'Protocolo Inicial', 'ISP Chile', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '60 days', 'approved', 'Aprobación inicial'),
  ('bbbb1111-1111-1111-1111-111111111111', (SELECT id FROM users LIMIT 1), 'Enmienda 1', 'ISP Chile', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days', 'approved', 'Enmienda aprobada'),
  ('bbbb1111-1111-1111-1111-111111111111', (SELECT id FROM users LIMIT 1), 'Reporte Anual', 'ISP Chile', CURRENT_DATE - INTERVAL '5 days', NULL, 'submitted', 'Pendiente revisión'),
  ('bbbb3333-3333-3333-3333-333333333333', (SELECT id FROM users LIMIT 1), 'Protocolo Inicial', 'DIGEMID Perú', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days', 'approved', 'Aprobación DIGEMID');

-- Monitoring Action Items de prueba
INSERT INTO monitoring_action_items (study_id, site_id, user_id, cra_name, visit_date, action_item_description, due_date, status, priority, notes)
VALUES 
  ('bbbb1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', (SELECT id FROM users LIMIT 1), 'María González', CURRENT_DATE - INTERVAL '10 days', 'Completar training log de nuevo coordinador', CURRENT_DATE + INTERVAL '5 days', 'open', 'high', 'Visita de monitoreo'),
  ('bbbb1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', (SELECT id FROM users LIMIT 1), 'María González', CURRENT_DATE - INTERVAL '10 days', 'Actualizar delegation log', CURRENT_DATE + INTERVAL '3 days', 'in_progress', 'medium', 'Visita de monitoreo'),
  ('bbbb2222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', (SELECT id FROM users LIMIT 1), 'Carlos Rodríguez', CURRENT_DATE - INTERVAL '5 days', 'Archivar consentimientos originales', CURRENT_DATE + INTERVAL '7 days', 'open', 'medium', 'Visita de inicio'),
  ('bbbb3333-3333-3333-3333-333333333333', 'aaaa2222-2222-2222-2222-222222222222', (SELECT id FROM users LIMIT 1), 'Ana Martínez', CURRENT_DATE - INTERVAL '15 days', 'Resolver discrepancias de inventario', CURRENT_DATE - INTERVAL '5 days', 'closed', 'high', 'Cerrado');

-- Deviations de prueba
INSERT INTO deviations (study_id, site_id, user_id, deviation_type, description, identified_date, capa_required, status, root_cause, notes)
VALUES 
  ('bbbb1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', (SELECT id FROM users LIMIT 1), 'Protocolo', 'Visita fuera de ventana de tiempo', CURRENT_DATE - INTERVAL '20 days', false, 'closed', 'Error de agendamiento', 'Desviación menor'),
  ('bbbb1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', (SELECT id FROM users LIMIT 1), 'GCP', 'Consentimiento firmado después del procedimiento', CURRENT_DATE - INTERVAL '10 days', true, 'capa_initiated', 'Falta de entrenamiento', 'Se inició CAPA'),
  ('bbbb3333-3333-3333-3333-333333333333', 'aaaa2222-2222-2222-2222-222222222222', (SELECT id FROM users LIMIT 1), 'Protocolo', 'Dosis incorrecta administrada', CURRENT_DATE - INTERVAL '5 days', true, 'under_review', NULL, 'En investigación');

-- Alerts de prueba
INSERT INTO alerts (user_id, alert_type, title, message, severity, is_read, link_url)
SELECT 
  (SELECT id FROM users LIMIT 1),
  alert_type,
  title,
  message,
  severity,
  false,
  link_url
FROM (VALUES 
  ('enrollment', 'Bajo enrolamiento', 'El estudio ONCO-2024-001 está por debajo del target de enrolamiento (75%)', 'warning', '/dashboard/coo'),
  ('query', 'Queries críticos', '5 queries tienen más de 10 días sin resolver', 'critical', '/dashboard/data-entry/queries'),
  ('monitoring', 'Action items vencidos', '2 action items de monitoreo están vencidos', 'critical', '/dashboard/qa'),
  ('regulatory', 'Documento por vencer', 'Certificado GCP de Dr. Pérez vence en 30 días', 'info', '/dashboard/regulatory')
) AS t(alert_type, title, message, severity, link_url)
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);
