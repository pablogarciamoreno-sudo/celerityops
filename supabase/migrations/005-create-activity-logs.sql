-- =============================================
-- MIGRACION: Crear tabla activity_logs
-- Fecha: 2026-01-15
-- Descripcion: Audit trail de actividades del sistema
-- =============================================

-- Crear tabla activity_logs para audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  table_affected TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear indices para optimizar busquedas
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_table_affected ON activity_logs(table_affected);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Politica: usuarios autenticados pueden ver sus propios logs
CREATE POLICY "Users can view own activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politica: el sistema puede insertar logs
CREATE POLICY "System can insert activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politica: COO y admins pueden ver todos los logs
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND r.name IN ('COO', 'QA Manager')
    )
  );

-- Comentario de la tabla
COMMENT ON TABLE activity_logs IS 'Audit trail de actividades del sistema - registra todas las acciones de usuarios';
COMMENT ON COLUMN activity_logs.action_type IS 'Tipo de accion: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.';
COMMENT ON COLUMN activity_logs.table_affected IS 'Nombre de la tabla afectada por la accion';
COMMENT ON COLUMN activity_logs.record_id IS 'ID del registro afectado (si aplica)';
COMMENT ON COLUMN activity_logs.details IS 'Detalles adicionales de la accion en formato JSON';
