#!/usr/bin/env node

/**
 * Infinity Mailer - Setup en Supabase
 * Ejecuta MAILER_SETUP.sql vía Supabase SDK
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://lirzzskabepwdlhvdmla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setup() {
  console.log('📧 Infinity Mailer - Schema Setup en Supabase');
  console.log('='.repeat(50));
  console.log('');

  try {
    // Leer SQL
    const sql = fs.readFileSync('/home/claudio/mission-control/MAILER_SETUP.sql', 'utf-8');

    // Dividir por statements (simplista pero funcional)
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('--') && s.length > 5);

    console.log(`📋 Total de statements: ${statements.length}`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const progress = `[${i + 1}/${statements.length}]`;

      try {
        // Ejecutar vía RPC o raw query
        // Nota: Supabase SDK no tiene soporte directo para ejecutar SQL raw
        // Pero podemos loggear lo que sería

        console.log(`${progress} ${stmt.substring(0, 50).replace(/\n/g, ' ')}...`);

        // Aquí iría la ejecución real
        // Por ahora, solo loguear
        successCount++;
        console.log('   ✅ (Would execute)');
      } catch (err) {
        errorCount++;
        console.log(`   ❌ Error: ${err.message}`);
      }
    }

    console.log('');
    console.log('⚠️  LIMITACIÓN ENCONTRADA:');
    console.log('   Supabase SDK no ejecuta SQL raw directamente.');
    console.log('   Necesitas ejecutar manualmente vía SQL Editor.');
    console.log('');
    console.log('📋 PASOS:');
    console.log('   1. Abre: https://supabase.com/dashboard');
    console.log('   2. Proyecto: lirzzskabepwdlhvdmla');
    console.log('   3. SQL Editor → New Query');
    console.log('   4. Copy-paste: /home/claudio/mission-control/MAILER_SETUP.sql');
    console.log('   5. RUN');
    console.log('');

    // Verificar si las tablas ya existen
    console.log('🔍 Verificando si tablas ya existen...');
    console.log('');

    const tables = [
      'email_campaigns',
      'email_recipients',
      'email_history',
      'email_templates',
      'outreach_blacklist',
      'outreach_bounces',
      'sending_config',
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ❌ ${table}: No existe (error: ${error.code})`);
        } else {
          console.log(`   ✅ ${table}: Ya existe`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: Error al verificar`);
      }
    }

    console.log('');
    console.log('Next: Ejecuta el SQL manualmente en Supabase SQL Editor');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setup();
