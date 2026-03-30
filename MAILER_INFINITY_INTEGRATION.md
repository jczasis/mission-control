# 📧 Infinity Mailer + Mailing-Infinity Agent Integration

**Status**: ✅ Integración completa de reglas + modelo de email
**Date**: 2026-03-30
**Scope**: Todas las reglas de validación, bounce management y guardrails del agente mailing-infinity integradas en el nuevo Mailer

---

## ✅ QUÉ QUEDÓ DEL MODELO ANTERIOR

### 1. Email Template (Modelo de Correo)
```
Subject: "Cajas de cartón corrugado a medida para industria"
Format:  Plain text (no HTML para mejor deliverability)
From:    juan@infinitybox.cl
Firma:   Juan + teléfono + website

Body:
  - Pitch estructurado (3 objetivos: proteger, optimizar costos, presentación marca)
  - Proof points: corrugadora propia, HACCP, ECT
  - CTA baja: "¿Te interesa que lo revisemos?"
```
**Ubicación en nuevo Mailer**: MAILER_RULES_CONFIG.json → `emailTemplate`

---

### 2. Reglas de Envío (Sending Rules)
✅ **Máximo 1 por dominio/empresa** (anti-spam, anti-ban)
✅ **Máximo 20 emails/día** (L-V horario laboral 09:00-18:59 CL)
✅ **Delay aleatorio 20-55s** (anti-detección)
✅ **Horario laboral obligatorio** (L-V 09:00-18:59, --force para exceptions)

**Ubicación en DB**: `sending_config` tabla (MAILER_SETUP.sql)
**Ubicación en código**: src/lib/api/mailer.ts (agregar validations)

---

### 3. Validación Preflight (Antes de Enviar)

#### ❌ Excluidos AUTOMÁTICAMENTE:
1. **Gobierno/Municipalidades**
   - Dominios: gob.cl, muni.cl, carabineros.cl, pdi.cl, chilecompra.cl, tesoro.cl, direcciontrabajo.cl

2. **Licitación Pública**
   - Keywords: licitacion, chilecompra, padron, proveedores publicos

3. **Emails Genéricos**
   - Patterns: info@, contacto@, admin@, noreply@, support@, soporte@, ventas@, empresa@, test@, example@

4. **Dominios de Prueba**
   - test.cl, example.com, localhost, gmail.test

5. **Bounce Previo**
   - Hard bounce (5.1.1, 5.4.4) = blacklist permanente
   - Soft bounce 3x = blacklist temporal

6. **Duplicados**
   - No repetir emails enviados últimos 30 días

**Output**: HTML report con detalles de qué pasó preflight

---

### 4. Bounce Management (Gestión de Rebotes)

#### Clasificación:
```
HARD BOUNCE (Permanente):
  - Codes: 5.1.1 (usuario no existe), 5.4.4 (dominio rechaza)
  - Acción: Blacklist email forever
  - Table: outreach_blacklist

SOFT BOUNCE (Temporal):
  - Codes: 4.2.1 (mailbox full), 4.3.2, 4.5.0 (server timeout)
  - Acción: Retry mañana (max 3 intentos)
  - Si 3+ soft bounces = blacklist
```

#### Alertas:
- ⚠️ **Bounce rate > 5%**: Alert Juan
- ⚠️ **Bounce rate > 20%**: PAUSE automático + alert urgente

**Tablas**: `outreach_bounces`, `outreach_blacklist`

---

### 5. Segmentación (ICP - Ideal Customer Profile)

✅ **Target**: Santiago y Región Metropolitana
✅ **Tamaño**: 20-500 empleados
✅ **Sectores**: Alimentos, Retail, Manufactura, Logística, Distribución
✅ **Decisor**: Gerente Operaciones, Jefe Compras, Owner, Gerente Logística
❌ **Excluir**: Gobierno, Municipalidades, Telecom (alto bounce)

---

## 🔧 CÓMO ESTÁ INTEGRADO EN EL NUEVO MAILER

### Archivos Clave:

| Archivo | Qué Contiene |
|---------|------------|
| `MAILER_SETUP.sql` | Nuevas tablas: `outreach_blacklist`, `outreach_bounces`, `sending_config` |
| `MAILER_RULES_CONFIG.json` | Toda la configuración de Infinity Box (reglas, template, umbra les) |
| `src/lib/api/mailer.ts` | API para validar preflight, gestionar blacklist, log bounces |
| `src/pages/MailerPage.tsx` | UI Form para crear campañas con validación integrada |
| `MAILER_IMPLEMENTATION.md` | Guía técnica |

---

### Base de Datos (7 Tablas):

```
email_campaigns          ← Campañas principales + campos validación/bounce
email_recipients         ← Destinatarios + estado individual
email_history            ← Auditoría de acciones
email_templates          ← Templates reutilizables
outreach_blacklist       ← Emails/dominios bloqueados (hard bounce, genéricos)
outreach_bounces         ← Tracking de cada bounce (código, tipo, motivo)
sending_config           ← Reglas globales (maxPerDay=20, delayMin=20, etc)
```

---

## 🚀 PRÓXIMOS PASOS (Implementación)

### Phase 1: Setup DB (INMEDIATO - 5 min)
```bash
# Ejecutar MAILER_SETUP.sql en Supabase
# Verifica que se crean 7 tablas ✓
```

### Phase 2: Integrar Validación en API (WIP - 30 min)
```typescript
// src/lib/api/mailer.ts: agregar

export async function validatePreflight(campaignId: string): Promise<{
  passed: boolean;
  warnings: string[];
  errors: string[];
  skipped: number;
  sendable: number;
}> {
  // 1. Leer campaign + recipients
  // 2. Para cada recipient:
  //    - Revisar si email está en outreach_blacklist
  //    - Revisar si es genérico (info@, contacto@, etc)
  //    - Revisar si es gobierno (gob.cl, muni.cl, etc)
  //    - Revisar si es dominio de prueba
  //    - Revisar si ya fue enviado (last 30 days)
  // 3. Contar: 1 por dominio max
  // 4. Validar horario (si ~9-18 CL)
  // 5. Return: { passed, warnings, errors, skipped, sendable }
}

export async function checkBlacklist(email: string): Promise<boolean> {
  // Revisar si email está en outreach_blacklist
  const { data } = await supabase
    .from('outreach_blacklist')
    .select('*')
    .eq('email', email)
    .single();
  return !!data;
}

export async function logBounce(
  campaignId: string,
  recipientId: string,
  email: string,
  bounceCode: string,
  bounceReason: string
): Promise<void> {
  // Insertar en outreach_bounces
  // Si hard bounce: agregar a outreach_blacklist
  // Si 3+ soft bounces: agregar a outreach_blacklist
}
```

### Phase 3: Integrar en MailerPage UI (WIP - 30 min)
```typescript
// src/pages/MailerPage.tsx: agregar Tab "Validación"

// Cuando click "Crear Campaña":
// 1. POST crear campaign (status: draft)
// 2. POST agregar recipients
// 3. POST validatePreflight()
// 4. Mostrar HTML report con:
//    - ✅ X enviables
//    - ⚠️ Y advertencias (genéricos, bounce previo, etc)
//    - ❌ Z errores (gobierno, test domain, etc)
// 5. Si todo OK: mostrar botón "Listo para aprobación"
```

### Phase 4: Conectar Bounce Monitoring (FUTURO - 1h)
```bash
# Cron job cada 30 min:
# 1. Poll Zoho Mail API para bounces
# 2. Clasificar como hard/soft
# 3. logBounce() → actualizar DB
# 4. Si bounce > 20%: PAUSE campaign automático
# 5. Alert Telegram a Juan
```

### Phase 5: Cron Automático (FUTURO - 1h)
```bash
# Cron job lunes 09:00 CL:
# 1. Query: SELECT * FROM email_campaigns WHERE status='scheduled' AND scheduled_for <= NOW()
# 2. Para cada campaña:
#    - validatePreflight() (última validación)
#    - Si OK: integrar con Zoho Mail API
#    - Enviar emails con delay aleatorio 20-55s
#    - Actualizar status → 'sent'
# 3. Log todos en email_history
# 4. Reportar a Juan por Telegram
```

---

## 📋 Checklist de Integración

- [x] Crear MAILER_RULES_CONFIG.json con toda la config
- [x] Actualizar MAILER_SETUP.sql con nuevas tablas (blacklist, bounces, config)
- [ ] Implementar validatePreflight() en API
- [ ] Integrar validación en MailerPage UI
- [ ] Implementar logBounce() y checkBlacklist()
- [ ] Conectar bounce monitoring (cron + Zoho API)
- [ ] Setup cron automático de envío
- [ ] Testing end-to-end

---

## 🔐 Guardrails que Quedan INVIOLABLES

❌ **NUNCA SIN APROBACIÓN**: Solo enviar si campañ a aprobada explícitamente
❌ **NUNCA A GOBIERNO**: gob.cl, muni.cl, etc = blacklist permanente
❌ **NUNCA EMAILS GENÉRICOS**: info@, contacto@ = filter automático
❌ **NUNCA SIN VALIDACIÓN**: Preflight report OBLIGATORIO antes de enviar
❌ **NUNCA OVERSPAMMING**: Máx 20/día, máx 1/dominio, delay 20-55s
❌ **NUNCA IGNORAR BOUNCES**: Hard bounce = blacklist, bounce > 20% = PAUSE

---

## 💡 Ejemplo: Crear + Validar Campaña

```
1. Usuario en /mailer → Tab "Nueva"
2. Llena: Nombre, Asunto, Body, CSV recipients
3. Click "Crear Campaña"
   → Backend: createCampaign() + addRecipients()
   → Status: draft
4. MailerPage Tab "Campañas" → selecciona campaña
5. Click "Revisar Preflight" (nuevo botón)
   → validatePreflight():
      ✅ 87 emails válidos
      ⚠️ 3 emails genéricos (descartados)
      ⚠️ 2 emails con bounce previo (descartados)
      ❌ 0 errores críticos
   → HTML report mostrando detalles
6. Si está OK: Click "Aprobar para Envío"
   → Status: approved
   → Botón cambia a "Programar para mañana"
7. Click "Programar para mañana 09:00"
   → Status: scheduled
   → scheduled_for: tomorrow 09:00 CL
8. Mañana 09:00: Cron job automático envía + log everything
```

---

## 📞 Referencia: Configuración Actual

Todas las reglas están en `MAILER_RULES_CONFIG.json`:
- `sendingRules`: maxPerDomain=1, maxPerDay=20, delay=20-55s
- `validationRules`: govt, licitacion, generic emails, bounce previo
- `bounceManagement`: hard/soft classification, thresholds, alertas
- `segmentation`: ICP (tamaño, sectores, decisores, ubicación)
- `approvalWorkflow`: Pasos de Draft → Approved → Scheduled → Sent

---

**Implementado por**: Claude
**Integrado desde**: mailing-infinity agent (config.json, CLAUDE.md, AUDIT_CRITERIOS.md)
**Status**: Ready para Phase 2 (validación en API)
