#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lirzzskabepwdlhvdmla.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testAccess() {
  console.log('🔐 Probando acceso a tablas...\n')
  
  // Probar insertar en cada tabla
  const tests = [
    {
      table: 'email_campaigns',
      data: { name: 'Test', subject: 'Test', body: 'Test', status: 'draft', created_by: 'test' }
    },
    {
      table: 'sending_config',
      data: { config_key: 'test', config_value: 'value', data_type: 'string' }
    }
  ]
  
  for (const test of tests) {
    const { error } = await supabase
      .from(test.table)
      .insert([test.data])
    
    if (!error) {
      console.log(`✅ ${test.table}: INSERT OK`)
    } else if (error.code === 'PGRST116') {
      console.log(`⚠️  ${test.table}: Tabla no existe`)
    } else if (error.code === 'PGRST103') {
      console.log(`🔒 ${test.table}: SIN PERMISOS (RLS policy bloqueada)`)
    } else {
      console.log(`❌ ${test.table}: ${error.code || error.message}`)
    }
  }
}

testAccess().catch(console.error)
