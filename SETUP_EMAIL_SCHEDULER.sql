-- Email Scheduler Schema
-- =====================

-- Tabla de campañas de email
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  recipient_count INT NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by VARCHAR(255),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  email_account VARCHAR(255) DEFAULT 'juan@infinitybox.cl',
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de emails individuales dentro de una campaña
CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'bounced', 'opened', 'clicked')),
  sent_at TIMESTAMP WITH TIME ZONE,
  bounce_code VARCHAR(10),
  bounce_reason TEXT,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de bounces y errores
CREATE TABLE IF NOT EXISTS email_bounces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  bounce_type VARCHAR(50), -- 'hard' o 'soft'
  bounce_reason TEXT,
  bounce_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de aprobaciones
CREATE TABLE IF NOT EXISTS email_approvals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
  approved_by VARCHAR(255) NOT NULL,
  action VARCHAR(50), -- 'approve', 'reject', 'schedule'
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created ON email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign_id ON email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON email_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_email_bounces_campaign_id ON email_bounces(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_bounces_email ON email_bounces(email);
CREATE INDEX IF NOT EXISTS idx_email_approvals_campaign_id ON email_approvals(campaign_id);

-- Vistas útiles
CREATE OR REPLACE VIEW email_campaign_stats AS
SELECT
  ec.id,
  ec.name,
  ec.status,
  COUNT(DISTINCT ecr.id) as total_recipients,
  COUNT(CASE WHEN ecr.status = 'sent' THEN 1 END) as sent_count,
  COUNT(CASE WHEN ecr.status = 'bounced' THEN 1 END) as bounced_count,
  COUNT(CASE WHEN ecr.status = 'opened' THEN 1 END) as opened_count,
  ROUND(
    COUNT(CASE WHEN ecr.status = 'bounced' THEN 1 END)::numeric /
    NULLIF(COUNT(CASE WHEN ecr.status = 'sent' THEN 1 END), 0),
    4
  ) * 100 as bounce_rate
FROM email_campaigns ec
LEFT JOIN email_campaign_recipients ecr ON ec.id = ecr.campaign_id
GROUP BY ec.id, ec.name, ec.status;

-- Enable RLS (si aplica)
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_bounces ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_approvals ENABLE ROW LEVEL SECURITY;

-- Política RLS: Lectura pública (el usuario Juan puede ver todas las campañas)
CREATE POLICY "email_campaigns_read" ON email_campaigns
  FOR SELECT USING (true);

CREATE POLICY "email_campaigns_update" ON email_campaigns
  FOR UPDATE USING (true);

CREATE POLICY "email_campaign_recipients_read" ON email_campaign_recipients
  FOR SELECT USING (true);

CREATE POLICY "email_bounces_read" ON email_bounces
  FOR SELECT USING (true);

-- Nota: Los inserts se harán desde funciones o servicios backend con permisos elevados
-- Este schema asume que los crons y scripts usar credenciales con permisos completos
