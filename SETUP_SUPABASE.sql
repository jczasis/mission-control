-- Tabla para cron jobs (si no existe)
CREATE TABLE IF NOT EXISTS script_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  script_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('success', 'error', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_run TIMESTAMP
);

-- Tabla para métricas diarias (EMPEX, InfinityBox, SEIA)
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL, -- 'infinity', 'empex', 'seia'
  emails_sent INTEGER,
  open_rate FLOAT,
  conversions INTEGER,
  galpones_found INTEGER,
  cotizaciones_sent INTEGER,
  leads_activos INTEGER,
  seia_projects INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, metric_type)
);

-- Tabla para configuración de Mission Control
CREATE TABLE IF NOT EXISTS mission_control_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para email campaigns (InfinityBox tracking)
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  sent_at TIMESTAMP NOT NULL,
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  recipient_email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para EMPEX galpones
CREATE TABLE IF NOT EXISTS empex_galpones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT,
  location TEXT,
  found_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para EMPEX quotes
CREATE TABLE IF NOT EXISTS empex_quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id TEXT,
  sent_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para EMPEX leads
CREATE TABLE IF NOT EXISTS empex_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_name TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'converted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_script_runs_created_at ON script_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at DESC);
