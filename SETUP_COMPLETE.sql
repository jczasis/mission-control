-- ============================================================================
-- SETUP COMPLETO - Ejecuta TODO esto en Supabase SQL Editor
-- Crea tablas + carga config default
-- ============================================================================

-- 1. TABLA: email_campaigns
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  bounce_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  validated BOOLEAN DEFAULT FALSE,
  validation_result JSONB DEFAULT '{}',
  preflight_report TEXT,
  rules_config_version TEXT DEFAULT '1.0',
  hard_bounce_count INT DEFAULT 0,
  soft_bounce_count INT DEFAULT 0,
  bounce_paused BOOLEAN DEFAULT FALSE,
  bounce_pause_reason TEXT,
  zoho_campaign_id TEXT,
  is_infinity_box BOOLEAN DEFAULT TRUE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. TABLA: email_recipients
CREATE TABLE IF NOT EXISTS public.email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  lead_source TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. TABLA: email_history
CREATE TABLE IF NOT EXISTS public.email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.email_recipients(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. TABLA: email_templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  variables JSONB,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. TABLA: outreach_blacklist
CREATE TABLE IF NOT EXISTS public.outreach_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  reason TEXT NOT NULL,
  bounce_code TEXT,
  bounce_count INT DEFAULT 0,
  blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'
);

-- 6. TABLA: outreach_bounces
CREATE TABLE IF NOT EXISTS public.outreach_bounces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.email_recipients(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  bounce_code TEXT NOT NULL,
  bounce_type TEXT NOT NULL,
  bounce_reason TEXT,
  bounced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  retry_count INT DEFAULT 0,
  retry_last_at TIMESTAMP WITH TIME ZONE,
  final_status TEXT,
  metadata JSONB DEFAULT '{}'
);

-- 7. TABLA: sending_config
CREATE TABLE IF NOT EXISTS public.sending_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  data_type TEXT,
  description TEXT,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Habilitar RLS y permitir acceso público
-- ============================================================================

ALTER TABLE public.sending_config ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura y escritura pública
CREATE POLICY "Allow public access" ON public.sending_config
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Cargar configuración default
-- ============================================================================

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

-- ============================================================================
-- Crear INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_for ON public.email_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_recipients_campaign_id ON public.email_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_recipients_email ON public.email_recipients(email);
CREATE INDEX IF NOT EXISTS idx_email_recipients_status ON public.email_recipients(status);
CREATE INDEX IF NOT EXISTS idx_email_history_campaign_id ON public.email_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_history_action ON public.email_history(action);
CREATE INDEX IF NOT EXISTS idx_outreach_blacklist_email ON public.outreach_blacklist(email);
CREATE INDEX IF NOT EXISTS idx_outreach_bounces_campaign_id ON public.outreach_bounces(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_bounces_email ON public.outreach_bounces(email);
CREATE INDEX IF NOT EXISTS idx_outreach_bounces_bounce_type ON public.outreach_bounces(bounce_type);

-- ============================================================================
-- Crear VISTAS
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_campaign_summary AS
SELECT
  c.id,
  c.name,
  c.subject,
  c.status,
  c.created_at,
  c.scheduled_for,
  c.recipient_count,
  c.delivered_count,
  c.bounce_count,
  ROUND(100.0 * c.delivered_count / NULLIF(c.recipient_count, 0), 2) AS delivery_rate,
  ROUND(100.0 * c.bounce_count / NULLIF(c.recipient_count, 0), 2) AS bounce_rate
FROM public.email_campaigns
ORDER BY c.created_at DESC;

CREATE OR REPLACE VIEW public.vw_scheduled_tomorrow AS
SELECT
  c.id,
  c.name,
  c.subject,
  c.recipient_count,
  c.scheduled_for,
  (SELECT COUNT(*) FROM public.email_recipients WHERE campaign_id = c.id) AS recipient_detail_count
FROM public.email_campaigns c
WHERE c.status = 'scheduled'
  AND DATE(c.scheduled_for) = CURRENT_DATE + INTERVAL '1 day'
ORDER BY c.scheduled_for ASC;

CREATE OR REPLACE VIEW public.vw_mailer_stats AS
SELECT
  (SELECT COUNT(*) FROM public.email_campaigns WHERE status = 'sent') AS total_sent,
  (SELECT COUNT(*) FROM public.email_recipients WHERE status = 'delivered') AS total_delivered,
  (SELECT COUNT(*) FROM public.email_recipients WHERE status = 'bounced') AS total_bounced,
  (SELECT COUNT(*) FROM public.email_campaigns WHERE status = 'pending') AS pending_approval,
  (SELECT COUNT(*) FROM public.email_campaigns WHERE status = 'scheduled') AS scheduled_campaigns;

-- ============================================================================
-- LISTO ✅
-- ============================================================================
-- Si llegaste hasta aquí sin errores, el sistema está 100% funcional
-- Próximo: npm run dev → http://localhost:5173/mailer
