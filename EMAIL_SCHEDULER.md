# Email Scheduler - Infinity Box Mailing System

## 📋 Visión

Sistema integrado de programación de campañas de email con **pipeline de aprobación automático** (día siguiente).

**Flujo**:
1. Sistema genera lista de contactos para mañana (09:00 CL)
2. Juan aprueba en Mission Control antes de mediodía
3. Sistema envía automáticamente mañana a las 09:30 CL
4. Monitorea bounces y mantiene blacklist automática

---

## 🏗️ Arquitectura

### Base de datos (Supabase)

```sql
email_campaigns
├─ id, name, subject, body
├─ status: pending → approved → scheduled → sent
├─ recipient_count, created_at, approved_at, scheduled_for

email_campaign_recipients
├─ campaign_id, email, company_name
├─ status: pending → sent → bounced → opened

email_bounces
├─ campaign_id, email, bounce_type, bounce_reason

email_approvals
├─ campaign_id, approved_by, action, reason
```

### UI (Mission Control)

**Componente**: `EmailScheduler.tsx`

**Features**:
- ✅ Resumen: Pendientes | Aprobadas | Enviadas
- ✅ Lista de campañas con estado visual
- ✅ Botón "Aprobar" (pendiente → aprobada)
- ✅ Botón "Enviar Mañana" (aprobada → scheduled)
- ✅ Detalles de campaña (asunto, body, recipients)
- ✅ Historial de envíos

### Backend (Crons)

**Script**: `/home/claudio/.openclaw/workspace/email-scheduler-daemon.py`

**Funcionalidad**:
- `ACTION=generate` (09:00 CL): Crea campaña para aprobación
- `ACTION=send` (09:30 CL): Envía campañas aprobadas
- `ACTION=bounces` (cada 30 min): Monitorea bounces

---

## 📅 Cronograma

### Lunes a Viernes

| Hora CL | Acción | Cron | Estado |
|---------|--------|------|--------|
| **09:00** | Generar lista | `00 14 * * 1-5` | 🔵 pending |
| **09:00-12:00** | Juan aprueba | Manual en UI | 🔵 → 🟢 |
| **09:30** | Enviar aprobadas | `30 14 * * 1-5` | 🟢 → 🟣 |
| **Cada 30 min** | Verificar bounces | `*/30 * * * *` | 🔍 Monitoreo |

### Sin envíos S/D

---

## 🎯 Guardrails

1. ✅ **Máx 1 email por dominio**
2. ✅ **Horario laboral CL L-V 09:00-18:59**
3. ✅ **Delay 20-55s entre envíos**
4. ✅ **NO gobierno/licitación/genéricos**
5. ✅ **NO competencia** (WS Box, PartnerBox, CorruBox, etc)
6. ✅ **SIN ENVÍOS SIN APROBACIÓN EXPLÍCITA** (clave)
7. ✅ **Auto-pausar si bounce rate > 20%**
8. ✅ **Blacklist automática** (bounces hard)

---

## 🚀 Setup

### 1. Deploy schema Supabase

```bash
# En Supabase dashboard o via psql:
psql -h db.lirzzskabepwdlhvdmla.supabase.co -U postgres
\i /home/claudio/mission-control/SETUP_EMAIL_SCHEDULER.sql
```

### 2. Agregar credenciales

```bash
# En ~/.claude/secrets.env:
export SUPABASE_URL="https://lirzzskabepwdlhvdmla.supabase.co"
export SUPABASE_KEY="<service_role_key>"
export TELEGRAM_BOT_TOKEN="<token>"
export TELEGRAM_CHAT_ID="7416120460"
```

### 3. Activar crons

```bash
# Agregar a crontab:
# Generar campaña diaria (09:00 CL = 14:00 UTC)
00 14 * * 1-5 /home/claudio/scripts/email-scheduler-cron.sh

# Enviar campañas aprobadas (09:30 CL = 14:30 UTC)
30 14 * * 1-5 /home/claudio/scripts/email-scheduler-cron.sh

# Verificar bounces cada 30 min
*/30 * * * * /home/claudio/scripts/email-scheduler-cron.sh
```

### 4. Iniciar dev en Mission Control

```bash
cd /home/claudio/mission-control
npm run dev
# Accede a http://localhost:5173
```

---

## 💬 Flujo de Usuario

### Día 1 (Lunes 09:00 CL)

1. **Sistema**: Genera campaña con 20 contactos → estado `pending`
2. **Telegram**: Alert "NUEVA CAMPAÑA CREADA" con link a Mission Control
3. **Juan**: Accede a Mission Control → revisa campaña
4. **Juan**: Hace clic "Aprobar" → estado cambia a `approved`

### Día 2 (Martes 09:30 CL)

1. **Sistema**: Busca campañas con estado `approved`
2. **Sistema**: Envía emails con delay 20-55s
3. **Sistema**: Marca recipients como `sent` en Supabase
4. **Telegram**: Alert "CAMPAÑA ENVIADA" con estadísticas

### Continuo

1. **Sistema**: Verifica bounces cada 30 min
2. **Sistema**: Marca recipients como `bounced`
3. **Sistema**: Agrega a blacklist si bounce type = `hard`
4. **Telegram**: Alert si bounce rate > 20%

---

## 🔌 Integración Actual

✅ **Supabase**: Schema + tablas + RLS
✅ **Telegram**: Alertas automáticas
✅ **Mission Control**: UI para aprobación
✅ **Crons**: Scripts daemon

⏳ **TODO**:
- [ ] Conectar con Zoho Mail API (envío real)
- [ ] Connectar con SEIA para enriquecimiento automático
- [ ] Reporting dashboard (aperturas, clicks)
- [ ] A/B testing de subjects

---

## 📊 Data Flow

```
[Contactos] → [Generate] → [pending] → [UI Approval] → [approved]
                                              ↓
                                            [Next day]
                                              ↓
                         [Send] → [sent] → [Monitor] → [bounced?]
                                              ↓
                                        [Blacklist]
```

---

## 🛠️ Debugging

### Logs

```bash
tail -f ~/.claude/logs/email-scheduler.log
```

### Verificar estado de campaña

```bash
# Supabase:
curl "https://lirzzskabepwdlhvdmla.supabase.co/rest/v1/email_campaigns?status=eq.pending" \
  -H "Authorization: Bearer $SUPABASE_KEY" | jq
```

### Test manual

```bash
ACTION=generate python3 /home/claudio/.openclaw/workspace/email-scheduler-daemon.py
ACTION=send python3 /home/claudio/.openclaw/workspace/email-scheduler-daemon.py
```

---

## 📞 Contacto

- **Infinity Box**: juan@infinitybox.cl | +56927968415
- **Telegram alerts**: 7416120460
- **Mission Control**: http://100.95.63.60:5173 (via Tailscale)

---

**Última actualización**: 2026-03-27
**Estado**: 🟡 Setup completado, testing pendiente
