#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lirzzskabepwdlhvdmla.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw'

// Crear nuevo cliente para limpiar cache
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

async function loadConfig() {
  console.log('📧 Cargando configuración default en sending_config')
  console.log('='.repeat(60))
  console.log('')
  
  const defaultConfig = [
    { config_key: 'max_per_domain', config_value: '1', data_type: 'int', description: 'Máximo 1 email por dominio/empresa' },
    { config_key: 'max_per_day', config_value: '20', data_type: 'int', description: 'Máximo 20 emails L-V (horario laboral)' },
    { config_key: 'delay_min_seconds', config_value: '20', data_type: 'int', description: 'Delay mínimo entre emails' },
    { config_key: 'delay_max_seconds', config_value: '55', data_type: 'int', description: 'Delay máximo entre emails' },
    { config_key: 'business_hours_start', config_value: '9', data_type: 'int', description: 'Hora inicio (CL)' },
    { config_key: 'business_hours_end', config_value: '18', data_type: 'int', description: 'Hora fin (CL)' },
    { config_key: 'bounce_pause_threshold', config_value: '20', data_type: 'int', description: 'Pause si bounce % > esto' },
    { config_key: 'soft_bounce_max_retries', config_value: '3', data_type: 'int', description: 'Máximo reintentos soft bounce' },
    { config_key: 'exclude_government', config_value: 'true', data_type: 'boolean', description: 'Excluir gob.cl, muni.cl, etc' },
    { config_key: 'exclude_generic_emails', config_value: 'true', data_type: 'boolean', description: 'Excluir info@, contacto@, etc' }
  ]
  
  // Insertar todo junto
  const { data, error } = await supabase
    .from('sending_config')
    .insert(defaultConfig)
    .select()
  
  if (!error) {
    console.log(`✅ ${defaultConfig.length} reglas insertadas exitosamente`)
    console.log('')
    if (data && data.length > 0) {
      data.forEach(item => {
        console.log(`   ✓ ${item.config_key} = ${item.config_value}`)
      })
    }
  } else if (error.code === '23505' || error.message.includes('duplicate')) {
    console.log('⏭️  Algunas reglas ya existen. Verificando estado...')
    
    // Verificar cuántas existen
    const { data: existing } = await supabase
      .from('sending_config')
      .select('count(*)')
    
    console.log(`   Total en DB: ${existing?.length || 0}`)
  } else {
    console.log(`❌ Error: ${error.message}`)
  }
  
  console.log('')
  console.log('Verificando config cargada:')
  const { data: all } = await supabase
    .from('sending_config')
    .select('*')
  
  if (all && all.length > 0) {
    console.log(`✅ ${all.length} reglas en DB`)
    all.forEach(r => {
      console.log(`   - ${r.config_key}: ${r.config_value}`)
    })
  } else {
    console.log('⚠️  No hay reglas cargadas')
  }
}

loadConfig().catch(console.error)
