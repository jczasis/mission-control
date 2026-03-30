#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = 'https://lirzzskabepwdlhvdmla.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function setup() {
  console.log('📧 INFINITY MAILER - Verificando DB')
  console.log('='.repeat(50))
  
  const tables = [
    'email_campaigns',
    'email_recipients',
    'email_history',
    'email_templates',
    'outreach_blacklist',
    'outreach_bounces',
    'sending_config'
  ]
  
  console.log('\n🔍 Verificando tablas...\n')
  
  let allExist = true
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1)
      
      if (error && error.code === 'PGRST116') {
        console.log(`   ❌ ${table}: No existe`)
        allExist = false
      } else if (error) {
        console.log(`   ⚠️  ${table}: Error (${error.message})`)
        allExist = false
      } else {
        console.log(`   ✅ ${table}: Existe`)
      }
    } catch (err) {
      console.log(`   ❌ ${table}: Error en verificación`)
      allExist = false
    }
  }
  
  console.log('\n')
  if (!allExist) {
    console.log('⚠️  ALGUNAS TABLAS NO EXISTEN')
    console.log('')
    console.log('Necesitas ejecutar MAILER_SETUP.sql manualmente:')
    console.log('1. Abre: https://supabase.com/dashboard')
    console.log('2. Proyecto: lirzzskabepwdlhvdmla')
    console.log('3. SQL Editor → New Query')
    console.log('4. Copy-paste: /home/claudio/mission-control/MAILER_SETUP.sql')
    console.log('5. RUN')
  } else {
    console.log('✅ TODAS LAS TABLAS EXISTEN - Sistema listo para usar!')
  }
}

setup().catch(console.error)
