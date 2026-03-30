#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lirzzskabepwdlhvdmla.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkAllTables() {
  console.log('🔍 Verificando TODAS las tablas en Supabase')
  console.log('='.repeat(60))
  console.log('')
  
  // Intentar acceder a cada tabla esperada
  const tablesToCheck = [
    'email_campaigns',
    'email_recipients',
    'email_history',
    'email_templates',
    'outreach_blacklist',
    'outreach_bounces',
    'sending_config',
    // Tablas que podrían existir
    'email_campaign',
    'campaign',
    'mailer_config',
    'config'
  ]
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1)
      
      if (!error) {
        console.log(`✅ ${table}: EXISTE`)
      } else if (error.code === 'PGRST116') {
        console.log(`❌ ${table}: No existe`)
      } else {
        console.log(`⚠️  ${table}: ${error.message.substring(0, 40)}`)
      }
    } catch (e) {
      console.log(`❌ ${table}: Error de conexión`)
    }
  }
}

checkAllTables().catch(console.error)
