# 🚀 Infinity Mailer - Próximos Pasos

**Estado actual**: ✅ Interface implementada, lista para conectar
**Próximo**: Setup DB + Testing

---

## 1️⃣ Setup Base de Datos (5 min)

### Ejecutar schema en Supabase

```bash
# Opción A: Manual (recomendado)
1. Abre https://supabase.com/dashboard
2. Proyecto: lirzzskabepwdlhvdmla
3. SQL Editor → New Query
4. Copia-pega archivo: /home/claudio/mission-control/MAILER_SETUP.sql
5. RUN ✓

# Opción B: Script interactivo
bash /home/claudio/mission-control/setup-mailer-quick.sh
```

**Verifica**: En Supabase → Table Editor deberías ver:
- ✓ email_campaigns
- ✓ email_recipients
- ✓ email_history
- ✓ email_templates

---

## 2️⃣ Dev Local (2 min)

```bash
cd /home/claudio/mission-control
npm run dev

# Abre en browser:
# http://localhost:5173 → Dashboard
# http://localhost:5173/mailer → Panel Mailer
```

---

## 3️⃣ Crear Campaña Test (5 min)

1. Ir a http://localhost:5173/mailer
2. Tab "Nueva"
3. Llenar formulario:
   - **Nombre**: "Test Marzo 30"
   - **Asunto**: "Prueba VersaSteel"
   - **Body**: "Contenido test"
   - **Destinatarios** (pega esto):
     ```
     test1@example.com,Test User 1,Test Company
     test2@example.com,Test User 2,Test Company
     ```
4. Click "Crear Campaña"
5. Deberías ver: ✓ Campaña creada, status: `draft`

**Si error**: Revisar console (F12) y Supabase logs

---

## 4️⃣ Test Flujo Completo (10 min)

### Escenario: Aprobar + Programar

1. En `/mailer` → Tab "Campañas"
2. Click campaign "Test Marzo 30"
3. Click botón azul: "Aprobar para envío"
   - Status → `approved`
   - Vés timestamp en `approved_at`
4. Click botón purple: "Programar para mañana 09:00"
   - Status → `scheduled`
   - Vés fecha/hora en `scheduled_for`
5. Tab "Destinatarios"
   - Vés 2 contactos en status `pending`

---

## 5️⃣ Integración con Infinity Box (15 min)

### Conectar envío real

**Necesario**:
- Credenciales SMTP Infinity Box O
- API endpoint de Infinity Box

**En `src/lib/api/mailer.ts` agregar**:

```typescript
export async function sendCampaignEmail(campaignId: string) {
  const campaign = await getCampaignById(campaignId);
  const recipients = await getRecipients(campaignId);

  // TODO: Llamar a Infinity Box API / SMTP
  for (const recipient of recipients) {
    try {
      // await sendViaInfinityBox(recipient.email, campaign.subject, campaign.body)
      // await markRecipientAsDelivered(recipient.id);
    } catch (err) {
      // await markRecipientAsBounced(recipient.id, err.message);
    }
  }

  await markAsSent(campaignId);
}
```

**Script cron** (para envío automático mañana 09:00):
```bash
# ~/.cron/send-scheduled-emails.sh
#!/bin/bash
curl -X POST http://localhost:5173/api/mailer/send-scheduled \
  -H "Content-Type: application/json"
```

---

## 6️⃣ Features Futuros

### Phase 2: Automatización
- [ ] Webhook SMTP → actualizar status
- [ ] Cron job para envío automático
- [ ] Bounce handling inteligente
- [ ] Unsubscribe automático

### Phase 3: Analytics
- [ ] Open rate tracking
- [ ] Click tracking
- [ ] A/B testing
- [ ] Reports diarios

### Phase 4: AI
- [ ] Generador de subject lines
- [ ] Segmentación SEIA automática
- [ ] Personalization con variables

---

## 📞 Troubleshooting Rápido

| Síntoma | Causa | Solución |
|---------|-------|----------|
| "Could not find table" | Schema no ejecutado | Ejecutar MAILER_SETUP.sql |
| Página blanca | Error en React | npm run dev, F12 console |
| Datos no guardan | RLS policies | Revisar permisos Supabase |
| Routing roto | React Router | Verificar App.tsx tiene `<BrowserRouter>` |

---

## 📊 Vista rápida del estado

```
Backend API:  ✅ Completo (src/lib/api/mailer.ts)
UI/Components: ✅ Completo (src/components/MailerCard.tsx, src/pages/MailerPage.tsx)
Database:      ⏳ Necesita setup SQL (MAILER_SETUP.sql)
SMTP/Envío:    ⏳ Por conectar a Infinity Box
Cron Auto:     ⏳ Por implementar
```

---

## 🎯 Meta de hoy

✓ Interface completamente implementada
✓ Build de producción listo
⏳ Setup DB (10 min)
⏳ Test básico (10 min)
⏳ Conectar Infinity Box (cuando tengas creds)

---

**Documentación completa**: MAILER_IMPLEMENTATION.md
**Build status**: ✅ npm run build (sin errores)
**Last update**: 2026-03-30 14:45 CL
