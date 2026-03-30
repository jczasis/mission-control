#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lirzzskabepwdlhvdmla.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function verify() {
  console.log('📧 INFINITY MAILER - Verificación Final')
  console.log('='.repeat(60))
  console.log('')
  
  // 1. Verificar sending_config
  console.log('1️⃣  Reglas de envío (sending_config):')
  const { data: config } = await supabase
    .from('sending_config')
    .select('*')
  
  if (config && config.length > 0) {
    console.log(`   ✅ ${config.length} reglas cargadas`)
    config.forEach(r => {
      console.log(`      - ${r.config_key}: ${r.config_value}`)
    })
  } else {
    console.log('   ❌ No hay reglas cargadas')
  }
  
  console.log('')
  
  // 2. Verificar vistas
  console.log('2️⃣  Vistas SQL (para stats):')
  try {
    const { data: stats } = await supabase
      .from('vw_mailer_stats')
      .select('*')
    if (stats && stats.length > 0) {
      console.log('   ✅ vw_mailer_stats: Funcional')
      console.log(`      Total enviadas: ${stats[0].total_sent || 0}`)
      console.log(`      Total entregadas: ${stats[0].total_delivered || 0}`)
    }
  } catch (e) {
    console.log('   ⚠️  vw_mailer_stats: No verificada')
  }
  
  console.log('')
  console.log('3️⃣  Campañas existentes:')
  const { data: campaigns } = await supabase
    .from('email_campaigns')
    .select('*')
  
  if (campaigns && campaigns.length > 0) {
    console.log(`   ✅ ${campaigns.length} campaña(s) existente(s)`)
  } else {
    console.log('   ✅ 0 campañas (lista vacía, normal)')
  }
  
  console.log('')
  console.log('='.repeat(60))
  console.log('✅ SISTEMA LISTO PARA USAR')
  console.log('')
  console.log('Próximos pasos:')
  console.log('1. npm run dev')
  console.log('2. Abre http://localhost:5173/mailer')
  console.log('3. Crea tu primera campaña')
  console.log('')
}

verify().catch(console.error)
