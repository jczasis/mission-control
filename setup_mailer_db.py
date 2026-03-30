#!/usr/bin/env python3
"""
Setup Supabase schema para Infinity Mailer
Ejecuta tabla por tabla usando REST API
"""

import subprocess
import json

SUPABASE_URL = "https://lirzzskabepwdlhvdmla.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw"

# Script SQL separado en bloques ejecutables
sql_blocks = [
    # 1. email_campaigns
    """
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
      notes TEXT,
      metadata JSONB DEFAULT '{}',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    """,

    # 2. email_recipients
    """
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
    """,

    # 3. email_history
    """
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
    """,

    # 4. email_templates
    """
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
    """,

    # 5. Indexes
    """
    CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
    CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_for ON public.email_campaigns(scheduled_for);
    CREATE INDEX IF NOT EXISTS idx_email_recipients_campaign_id ON public.email_recipients(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_email_recipients_email ON public.email_recipients(email);
    CREATE INDEX IF NOT EXISTS idx_email_recipients_status ON public.email_recipients(status);
    CREATE INDEX IF NOT EXISTS idx_email_history_campaign_id ON public.email_history(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_email_history_action ON public.email_history(action);
    """,
]

# Intenta usar psql si está disponible
try:
    result = subprocess.run(
        ["which", "psql"],
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        print("✅ psql encontrado. Configurando via direct connection...")
        # TODO: obtener connection string desde Supabase
        print("⚠️  Necesitarás configurar la conexión PostgreSQL directo a Supabase")
        print("Connection string: postgresql://postgres:[password]@db.lirzzskabepwdlhvdmla.supabase.co:5432/postgres")
except:
    pass

print("📋 SQL schemas listos en /home/claudio/mission-control/MAILER_SETUP.sql")
print("🚀 Copiar-pegar manualmente en Supabase SQL Editor (https://supabase.com/dashboard)")
print("   O ejecutar: psql postgresql://postgres:[pwd]@db.lirzzskabepwdlhvdmla.supabase.co:5432/postgres < MAILER_SETUP.sql")
