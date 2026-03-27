# Email Scheduler - Deployment Checklist

**Objetivo**: Activar sistema de email scheduler con pipeline de aprobación (día siguiente)

**Estimado**: 15-20 minutos

---

## ✅ PASO 1: Setup Supabase Schema

### 1.1 Conectar a Supabase

```bash
# Opción A: Via psql (recomendado)
psql -h db.lirzzskabepwdlhvdmla.supabase.co \
     -U postgres \
     -d postgres
```

Cuando pida password, usa la contraseña de Supabase (en secrets.json)

### 1.2 Ejecutar schema

```sql
-- Copiar y pegar TODO el contenido de:
-- /home/claudio/mission-control/SETUP_EMAIL_SCHEDULER.sql

-- Pegar en psql y ejecutar con ; al final
```

### 1.3 Verificar tablas

```sql
\dt email_*  -- Deberías ver: email_approvals, email_bounces, email_campaign_recipients, email_campaigns
\dv          -- Deberías ver: email_campaign_stats
```

**Check**: ✅ Si ves las 4 tablas + 1 vista

---

## ✅ PASO 2: Configurar Credenciales

### 2.1 Verificar `.claude/secrets.env`

```bash
# Abre archivo:
nano ~/.claude/secrets.env

# Debe tener MÍNIMO:
export SUPABASE_URL="https://lirzzskabepwdlhvdmla.supabase.co"
export SUPABASE_KEY="<service_role_key_aqui>"
export TELEGRAM_BOT_TOKEN="<token_aqui>"
export TELEGRAM_CHAT_ID="7416120460"
```

### 2.2 Validar credenciales

```bash
# Cargar y probar:
source ~/.claude/secrets.env

# Test Supabase:
curl -s "${SUPABASE_URL}/rest/v1/email_campaigns?limit=1" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" | jq .

# Test Telegram:
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" | jq .
```

**Check**: ✅ Si ambos retornan datos válidos

---

## ✅ PASO 3: Agregar Crons

### 3.1 Abrir crontab

```bash
crontab -e
```

### 3.2 Agregar 3 líneas

```bash
# Email Scheduler - Infinity Box

# Generar campaña diaria (09:00 CL = 14:00 UTC, L-V)
00 14 * * 1-5 /home/claudio/scripts/email-scheduler-cron.sh

# Enviar campañas aprobadas (09:30 CL = 14:30 UTC, L-V)
30 14 * * 1-5 /home/claudio/scripts/email-scheduler-cron.sh

# Verificar bounces (cada 30 min)
*/30 * * * * /home/claudio/scripts/email-scheduler-cron.sh
```

### 3.3 Guardar y verificar

```bash
# En vim/nano: ESC + :wq
# Verificar:
crontab -l | grep email-scheduler
```

**Check**: ✅ Si ves las 3 líneas

---

## ✅ PASO 4: Test Manual (Generar)

### 4.1 Ejecutar daemon en modo generate

```bash
source ~/.claude/secrets.env
ACTION=generate python3 ~/.openclaw/workspace/email-scheduler-daemon.py
```

### 4.2 Verificar resultado

```bash
# En Supabase, verifica:
# SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT 1;

# En Telegram:
# Deberías recibir mensaje "✅ NUEVA CAMPAÑA CREADA"

# En logs:
tail -20 ~/.claude/logs/email-scheduler.log
```

**Check**: ✅ Si ves campaña creada + msg Telegram

---

## ✅ PASO 5: Test UI en Mission Control

### 5.1 Abrir Mission Control

```bash
cd /home/claudio/mission-control

# Si no está corriendo:
npm run dev
```

Accede a: **http://localhost:5173** (o http://100.95.63.60:5173 via Tailscale)

### 5.2 Navegar a Email Scheduler

Deberías ver en la **columna derecha** un panel con:
- 📊 Resumen: Pendientes | Aprobadas | Enviadas
- 📧 Lista de campañas
- ✏️ Botón "+" para crear nuevas

### 5.3 Aprobar campaña manualmente

1. Haz clic en una campaña de la lista
2. Verifica los detalles (asunto, body, contactos)
3. Haz clic en botón **"Aprobar"**
4. Estado debe cambiar a **aprobada** (color azul)

**Check**: ✅ Si UI responde + puedes aprobar

---

## ✅ PASO 6: Test Manual (Envío)

### 6.1 Cambiar estado a approved manualmente (simular aprobación)

```bash
# En Supabase:
UPDATE email_campaigns
SET status = 'approved', approved_at = NOW()
WHERE status = 'pending'
LIMIT 1;
```

### 6.2 Ejecutar daemon en modo send

```bash
source ~/.claude/secrets.env
ACTION=send python3 ~/.openclaw/workspace/email-scheduler-daemon.py
```

### 6.3 Verificar resultado

```bash
# Verifica en Supabase:
# SELECT * FROM email_campaign_recipients LIMIT 5;
# Deberías ver status = 'sent'

# En Telegram:
# Deberías recibir "✅ CAMPAÑA ENVIADA"

# En logs:
tail -20 ~/.claude/logs/email-scheduler.log
```

**Check**: ✅ Si ves recipients enviados + msg Telegram

---

## ✅ PASO 7: Validar Integraciones

### 7.1 Telegram Alerts

```bash
# Ya deberías haber recibido 2 alertas:
# 1. "NUEVA CAMPAÑA CREADA" (paso 4)
# 2. "CAMPAÑA ENVIADA" (paso 6)
```

### 7.2 Monitoreo de Logs

```bash
# Terminal separada:
tail -f ~/.claude/logs/email-scheduler.log

# Deberías ver salida en tiempo real cuando se ejecuten crons
```

### 7.3 Dashboard Supabase

```bash
# Abre:
https://supabase.com/dashboard

# Verifica:
# - email_campaigns: Tienes campaña con status='sent'
# - email_campaign_recipients: Recipients con status='sent'
# - email_campaign_stats: Vista muestra estadísticas
```

**Check**: ✅ Si todo está sincronizado

---

## 🎯 Workflow Operativo (Después del Deploy)

### Cada día L-V (09:00 CL)
1. ⏰ Sistema genera campaña automáticamente
2. 📱 Recibes Telegram: "NUEVA CAMPAÑA CREADA"
3. 🌐 Abres Mission Control
4. 👀 Revisar contactos + asunto
5. ✅ Haces clic "Aprobar"

### Día siguiente (09:30 CL)
1. ⏰ Sistema envía automáticamente
2. 📱 Recibes Telegram: "CAMPAÑA ENVIADA" + stats
3. 📊 Monitorea bounce rate en logs

### Continuo
1. ⏰ Cada 30 min: Sistema verifica bounces
2. ⚠️ Si bounce > 20%: Telegram alert
3. 🚫 Hard bounces → Blacklist automática

---

## ❌ Troubleshooting

### Problema: Crons no se ejecutan

```bash
# Verificar que crontab está activo:
service cron status

# Si no:
sudo service cron start

# Ver logs de cron:
grep CRON /var/log/syslog | tail -10
```

### Problema: Telegram no envía alertas

```bash
# Test directo:
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}" \
  -d "text=TEST"

# Si falla: Verifica TELEGRAM_BOT_TOKEN en secrets.env
```

### Problema: Supabase no responde

```bash
# Test conexión:
curl -s "${SUPABASE_URL}/rest/v1/email_campaigns" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" | jq .

# Si falla: Verifica SUPABASE_URL y SUPABASE_KEY
```

### Problema: Mission Control no muestra Email Scheduler

```bash
# Verifica build:
npm run build

# Si hay errores: Ver en /tmp/mission-control.log
tail -50 /tmp/mission-control.log
```

---

## 📋 Checklist Final

- [ ] Paso 1: Schema Supabase creado (4 tablas + vista)
- [ ] Paso 2: Credenciales validadas (Supabase + Telegram)
- [ ] Paso 3: Crons agregados a crontab (3 líneas)
- [ ] Paso 4: Test generate OK (campaña creada)
- [ ] Paso 5: UI Mission Control funciona
- [ ] Paso 6: Test send OK (recipients enviados)
- [ ] Paso 7: Integraciones validadas (Telegram + Logs + Supabase)

---

## 🚀 GO LIVE

Cuando tengas ✅ en todos los pasos:

**Sistema listo para operación automática L-V 09:00-09:30 CL**

```bash
# Monitorear:
tail -f ~/.claude/logs/email-scheduler.log

# O en Telegram: Recibirás alertas automáticas cada día
```

---

**Última actualización**: 2026-03-27
**Soporte**: Revisa EMAIL_SCHEDULER.md para más detalles
