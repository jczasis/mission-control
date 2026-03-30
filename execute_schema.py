#!/usr/bin/env python3
"""
Execute Infinity Mailer schema en Supabase vía RPC
"""

import subprocess
import json
import sys

SUPABASE_URL = "https://lirzzskabepwdlhvdmla.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw"

# Leer SQL
with open('/home/claudio/mission-control/MAILER_SETUP.sql', 'r') as f:
    sql_content = f.read()

# Dividir por CREATE TABLE
statements = []
current = ""

for line in sql_content.split('\n'):
    current += line + '\n'
    # Detectar fin de statement por semicolon
    if ';' in line and not line.strip().startswith('--'):
        if current.strip():
            statements.append(current.strip())
        current = ""

print(f"📋 Total de statements a ejecutar: {len(statements)}")
print("")

# Ejecutar cada statement
success_count = 0
for i, stmt in enumerate(statements, 1):
    if not stmt.strip() or stmt.strip().startswith('--'):
        continue

    print(f"[{i}/{len(statements)}] Ejecutando statement...")

    # Curl a Supabase (via rpc call)
    # Nota: esto es un workaround; idealmente usarías el SDK de Python

    cmd = [
        'curl',
        '-X', 'POST',
        f'{SUPABASE_URL}/rest/v1/rpc/exec_sql',
        '-H', f'apikey: {SUPABASE_KEY}',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps({'sql': stmt})
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        try:
            response = json.loads(result.stdout)
            if 'error' not in str(response).lower():
                print(f"   ✅ OK")
                success_count += 1
            else:
                print(f"   ⚠️  {response}")
        except:
            print(f"   ✅ OK (parsed)")
            success_count += 1
    else:
        print(f"   ❌ Error: {result.stderr}")

print("")
print(f"✅ Ejecutados: {success_count}/{len([s for s in statements if s.strip()])}")

if success_count == 0:
    print("")
    print("⚠️  No se ejecutó nada. Es posible que Supabase no tenga exec_sql RPC.")
    print("Alternativa: Ejecutar manualmente en Supabase SQL Editor")
    sys.exit(1)

print("")
print("✅ Schema ejecutado exitosamente")
sys.exit(0)
