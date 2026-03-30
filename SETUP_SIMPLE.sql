-- SETUP SIMPLIFICADO - Ejecuta esto en Supabase SQL Editor
-- Carga las reglas default que falta

INSERT INTO public.sending_config (config_key, config_value, data_type, description)
VALUES
  ('max_per_domain', '1', 'int', 'Máximo 1 email por dominio/empresa'),
  ('max_per_day', '20', 'int', 'Máximo 20 emails L-V (horario laboral)'),
  ('delay_min_seconds', '20', 'int', 'Delay mínimo entre emails'),
  ('delay_max_seconds', '55', 'int', 'Delay máximo entre emails'),
  ('business_hours_start', '9', 'int', 'Hora inicio (CL)'),
  ('business_hours_end', '18', 'int', 'Hora fin (CL)'),
  ('bounce_pause_threshold', '20', 'int', 'Pause si bounce % > esto'),
  ('soft_bounce_max_retries', '3', 'int', 'Máximo reintentos soft bounce'),
  ('exclude_government', 'true', 'boolean', 'Excluir gob.cl, muni.cl, etc'),
  ('exclude_generic_emails', 'true', 'boolean', 'Excluir info@, contacto@, etc')
ON CONFLICT (config_key) DO NOTHING;
