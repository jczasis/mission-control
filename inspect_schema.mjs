#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lirzzskabepwdlhvdmla.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function inspectSchema() {
  console.log('🔍 Inspeccionando esquema de tablas\n')
  
  // Intentar SELECT sin condiciones para ver si obtenemos metadata
  const tables = ['email_campaigns', 'sending_config', 'config', 'mailer_config']
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0) // Sin datos, solo schema
    
    if (!error) {
      console.log(`✅ ${table}: Accesible`)
    } else {
      console.log(`❌ ${table}: ${error.code || error.message}`)
    }
  }
}

inspectSchema().catch(console.error)
