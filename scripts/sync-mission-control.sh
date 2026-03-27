#!/bin/bash

# Sincroniza estado de Mission Control con Supabase
# Uso: ./sync-mission-control.sh
# Cron: */30 * * * * (cada 30 min)

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Cargar credenciales
export SUPABASE_URL="https://lirzzskabepwdlhvdmla.supabase.co"
export SUPABASE_KEY="${SUPABASE_ANON_KEY}"

# Logging
LOG_FILE="/tmp/mission-control-sync.log"
timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

echo "[$(timestamp)] Iniciando sincronización Mission Control..." | tee -a "$LOG_FILE"

# 1. Verificar que el build está actualizado
if [ -d "dist" ]; then
  BUILD_TIME=$(stat -f '%Sm' -t '%Y-%m-%d %H:%M:%S' dist/index.html 2>/dev/null || echo "desconocido")
  echo "[$(timestamp)] Build actualizado: $BUILD_TIME" | tee -a "$LOG_FILE"
else
  echo "[$(timestamp)] ⚠️ No hay build. Ejecutar: npm run build" | tee -a "$LOG_FILE"
fi

# 2. Guardar estado en Supabase
echo "[$(timestamp)] Guardando estado en Supabase..." | tee -a "$LOG_FILE"

curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/mission_control_config" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d @- << EOF
{
  "key": "last_sync",
  "value": {
    "timestamp": "$(date -Iseconds)",
    "version": "$(jq -r '.version' package.json 2>/dev/null || echo 'unknown')",
    "status": "active",
    "health": "ok"
  }
}
EOF

echo "[$(timestamp)] ✅ Sincronización completada" | tee -a "$LOG_FILE"

# 3. Registrar en script_runs
curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/script_runs" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"script_name\": \"sync-mission-control.sh\",
    \"status\": \"success\",
    \"created_at\": \"$(date -Iseconds)\"
  }"

echo "[$(timestamp)] Entrada de script_runs creada" | tee -a "$LOG_FILE"
