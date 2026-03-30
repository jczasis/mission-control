# 📧 Infinity Mailer - Implementación Completa

**Estado**: ✅ Implementado y listo para usar
**Fecha**: 2026-03-30
**Stack**: React + TypeScript + Tailwind + Supabase + React Router

---

## 🎯 Qué se implementó

### Opción A: Integración completa con interfaz útil

#### 1. **Tarjeta Resumen en Dashboard**
- Ubicación: `/` → columna derecha (antes: EmailScheduler placeholder)
- Muestra:
  - **Pendientes aprobación**: Campañas en status `draft`
  - **Scheduled**: Campañas programadas para mañana
  - **Entregados**: Estadísticas globales
  - **Rebotes**: Tasa de bounces
  - **Lista de mañana**: Próximos envíos con hora exacta
- Botón "Abrir" → navega a `/mailer`

#### 2. **Página `/mailer` - Panel Completo**
Ruta: http://localhost:5173/mailer

**Tabs:**
- **Campañas**: Vista de todas las campañas + detalles expandibles
  - Sidebar: Lista de campañas (clickeable, filtro por status)
  - Panel: Detalles, stats, preview, acciones (Aprobar → Programar → Enviar)
  - Tabla: Destinatarios con estado individual (delivered, bounced, pending)

- **Nueva**: Formulario para crear campañas
  - Nombre, Asunto, Cuerpo
  - Importar destinatarios (formato: `email,nombre,empresa` por línea)
  - Auto-calcula contador

- **Templates**: Galería de templates reutilizables
  - Categorías: SEIA, Infinity Box, VersaSteel, General
  - Usar template → pre-rellena formulario

---

## 🗄️ Base de Datos (Supabase)

### Schema creado

```sql
-- email_campaigns: campañas principales
-- email_recipients: destinatarios por campaña
-- email_history: auditoría de todas las acciones
-- email_templates: templates reutilizables
-- Vistas (vw_): para dashboard y queries optimizadas
```

**Archivo**: `/home/claudio/mission-control/MAILER_SETUP.sql`

### Paso 1: Ejecutar schema en Supabase

Opción A: Copy-paste en SQL Editor
1. Ir a https://supabase.com/dashboard
2. Seleccionar proyecto `lirzzskabepwdlhvdmla`
3. SQL Editor → New query
4. Copiar contenido de `MAILER_SETUP.sql`
5. Ejecutar ✓

Opción B: psql directa (si tienes credenciales)
```bash
psql postgresql://postgres:[pwd]@db.lirzzskabepwdlhvdmla.supabase.co:5432/postgres < MAILER_SETUP.sql
```

---

## 🚀 Cómo usar

### 1. Dev local
```bash
cd /home/claudio/mission-control
npm run dev
# http://localhost:5173 → Dashboard + botón "Abrir Mailer"
# http://localhost:5173/mailer → Panel completo
```

### 2. Crear campaña

**Vía UI**:
1. `/mailer` → Tab "Nueva"
2. Llenar: Nombre, Asunto, Cuerpo, Destinatarios
3. Click "Crear Campaña" → Status `draft`

**Destinatarios** (formato CSV en textarea):
```
contacto@empresa.cl,Juan Pérez,Empresa S.A.
otro@empresa.cl,María González,Empresa S.A.
tercero@empresa.cl,Carlos López,Empresa S.A.
```

### 3. Flujo de aprobación

```
Draft → Pending → Approved → Scheduled → Sent
  ↓
[Tu aprobación en /mailer]
```

**Pasos**:
1. Crear campaña (status: `draft`)
2. Click "Aprobar para envío" (status: `approved`)
3. Click "Programar para mañana 09:00" (status: `scheduled`)
4. Mañana 09:00 CL: Sistema envía automáticamente
5. Status → `sent`

### 4. Monitoreo

- **Destinatarios individuales**: Tabla en `/mailer` → filtro por status
- **Auditoría**: History tab (todas las acciones)
- **Estadísticas**: Tarjeta del dashboard actualiza cada 60s

---

## 🔧 Implementación técnica

### Archivos nuevos

```
src/
├── components/
│   └── MailerCard.tsx          # Tarjeta resumen (dashboard)
├── lib/api/
│   └── mailer.ts               # API client Supabase
├── pages/
│   └── MailerPage.tsx          # Página completa /mailer
└── App.tsx                      # Router actualizado (React Router v6)

mission-control/
├── MAILER_SETUP.sql            # Schema SQL
├── MAILER_IMPLEMENTATION.md    # Este archivo
└── setup_mailer_db.py          # Helper para setup (opcional)
```

### Dependencias instaladas

```bash
npm install react-router-dom lucide-react @supabase/supabase-js
```

### API Backend (mailer.ts)

Funciones disponibles:
- `getCampaigns()` - Listar todas
- `createCampaign()` - Crear nueva
- `approveCampaign(id, approvedBy)` - Aprobar
- `scheduleCampaign(id, scheduledFor)` - Programar
- `markAsSent(id)` - Marcar como enviado
- `addRecipients(campaignId, recipients)` - Agregar destinatarios
- `getMailerStats()` - Stats para dashboard
- `getScheduledTomorrow()` - Emails mañana
- `logAction()` - Auditoría

---

## ✅ Checklist de setup

- [ ] **DB Schema**: Ejecutar `MAILER_SETUP.sql` en Supabase SQL Editor
- [ ] **Build**: `npm run build` (✓ probado)
- [ ] **Dev local**: `npm run dev` y verificar:
  - [ ] Dashboard con tarjeta mailer
  - [ ] Link "Abrir" navega a `/mailer`
  - [ ] Página `/mailer` carga sin errores
  - [ ] Crear campaña dummy (Supabase debe estar con schema)
- [ ] **Templates iniciales** (opcional): Insertar en `email_templates`
- [ ] **Cron automático** (futuro): Cuando status=`scheduled` y fecha llega, enviar automáticamente

---

## 📊 Flujo de datos

```
Usuario en /mailer
    ↓
[Crea campaña] → email_campaigns (status: draft)
    ↓
[Agrega contactos] → email_recipients (status: pending)
    ↓
[Aprueba] → email_campaigns (status: approved, approved_by, approved_at)
    ↓
[Programa mañana] → email_campaigns (status: scheduled, scheduled_for)
    ↓
[Mañana 09:00] → Cron job (futuro) envía
    ↓
email_recipients actualiza (status: sent/delivered/bounced)
email_history registra todo
    ↓
Dashboard tarjeta muestra stats en tiempo real
```

---

## 🔌 Integración con Infinity Box

### Próximo: Webhook de envío real

Cuando esté listo para enviar realmente:

```typescript
// webhook endpoint (futuro)
POST /api/mailer/send/{campaignId}

// Payload:
{
  "campaign_id": "uuid",
  "recipients": [
    {
      "email": "contacto@empresa.cl",
      "name": "Juan Pérez",
      "variables": { "empresa": "Empresa S.A." }
    }
  ],
  "template": "body_html",
  "from_email": "campañas@grupoempex.com"
}

// Llamar a Infinity Box API o SMTP
// Actualizar email_recipients.status en cada bounce/delivered
```

---

## 🧪 Testing

### Test manual: Crear campaña dummy

```
1. npm run dev
2. Go to http://localhost:5173/mailer
3. Tab "Nueva"
4. Nombre: "Test 30/03"
   Asunto: "Test Subject"
   Body: "Cuerpo test"
   Destinatarios:
   test1@test.cl,Test User 1,Test Corp
   test2@test.cl,Test User 2,Test Corp

5. Click "Crear Campaña"
   → Debe crear en Supabase (si schema fue ejecutado)
   → Status: draft
   → 2 destinatarios pending
```

### Error: Tabla no existe?

Si ves error `"Could not find table 'public.email_campaigns'"`:
→ Schema no fue ejecutado
→ Ejecutar `MAILER_SETUP.sql` en Supabase SQL Editor

---

## 📈 Roadmap

### Phase 2 (Próximo):
- [ ] Webhook para envío real (SMTP/Infinity Box)
- [ ] Cron automático (Node/n8n) para envío a la hora programada
- [ ] Open/Click tracking
- [ ] Unsubscribe automático
- [ ] Bounce handling

### Phase 3:
- [ ] AI: Generador de subject lines
- [ ] Segmentación avanzada (SEIA + variables)
- [ ] A/B testing
- [ ] Reportes detallados (Supabase warehouse)

---

## 🐛 Troubleshooting

| Error | Solución |
|-------|----------|
| `PGRST205: Could not find table` | Ejecutar MAILER_SETUP.sql en Supabase |
| `Cannot find module 'react-router-dom'` | `npm install react-router-dom` |
| Build fail: lucide-react | `npm install lucide-react` |
| Supabase key invalid | Verificar `.env` con keys correctas |
| Campaigns no cargan | Verificar conexión DB + permissions en RLS (si activó) |

---

## 📞 Soporte

Archivos clave:
- `src/lib/api/mailer.ts` - Toda la lógica de API
- `src/pages/MailerPage.tsx` - UI completa
- `MAILER_SETUP.sql` - Schema

Logs:
- Console del browser (F12 → Console)
- Supabase studio (https://supabase.com/dashboard)

---

**Implementado por**: Claude
**Último update**: 2026-03-30 14:45 CL
