# ✅ INFINITY MAILER - SETUP FINAL (30 Marzo 2026)

**Status**: 🟢 CASI LISTO - Falta cargar 1 SQL simple (2 minutos)

---

## Estado Actual

✅ **Base de datos**: 7 tablas creadas en Supabase
✅ **Código frontend**: MailerCard.tsx + MailerPage.tsx implementados
✅ **API backend**: mailer.ts con 20+ funciones
✅ **Build**: npm run build sin errores
⏳ **Pendiente**: Cargar reglas default en sending_config

---

## Paso 1: Cargar Reglas Default (2 min)

1. **Abre Supabase Dashboard**:
   - URL: https://supabase.com/dashboard
   - Proyecto: `lirzzskabepwdlhvdmla`

2. **Ve a SQL Editor**:
   - Click izquierda: "SQL Editor"
   - Click: "New Query"

3. **Copy-Paste este SQL**:

```sql
INSERT INTO public.sending_config (config_key, config_value, data_type, description)
VALUES
  ('max_per_domain', '1', 'int', 'Máximo 1 email por dominio/empresa'),
  ('max_per_day', '20', 'int', 'Máximo 20 emails L-V (horario laboral)'),
  ('delay_min_seconds', '20', 'int', 'Delay mínimo entre emails'),
  ('delay_max_seconds', '55', 'int', 'Delay máximo entre emails'),
  ('business_hours_start', '9', 'int', 'Hora inicio (CL)'),
  ('business_hours_end', '18', 'int', 'Hora fin (CL)'),
  ('bounce_pause_threshold', '20', 'int', 'Pause si bounce % > esto'),
  ('soft_bounce_max_retries', '3', 'int', 'Máximo reintentos soft bounce'),
  ('exclude_government', 'true', 'boolean', 'Excluir gob.cl, muni.cl, etc'),
  ('exclude_generic_emails', 'true', 'boolean', 'Excluir info@, contacto@, etc')
ON CONFLICT (config_key) DO NOTHING;
```

4. **Click RUN** → Espera ~2 segundos → Deberías ver "✓ 10 rows inserted"

---

## Paso 2: Verificar Setup (1 min)

```bash
cd /home/claudio/mission-control
node verify_setup.mjs
```

Expected output:
```
✅ Reglas de envío (sending_config): 10 reglas cargadas
✅ SISTEMA LISTO PARA USAR
```

---

## Paso 3: Ejecutar Local (2 min)

```bash
cd /home/claudio/mission-control
npm run dev
```

Abre en browser:
- Dashboard: http://localhost:5173
- Mailer: http://localhost:5173/mailer

---

## Paso 4: Crear Campaña Test (2 min)

1. Abre http://localhost:5173/mailer
2. Click Tab "Nueva"
3. Llena:
   - **Nombre**: "Test 30 Marzo"
   - **Asunto**: "Cajas de cartón a medida para industria"
   - **Body**: (dejar default)
   - **CSV**: `test1@example.com,Test User 1,Test Company`
4. Click "Crear Campaña"
5. Deberías ver: ✅ Campaña creada, status = `draft`

---

## ✅ Checklist Final

- [x] Base de datos (7 tablas)
- [x] Frontend (MailerCard + MailerPage)
- [x] API backend (mailer.ts)
- [ ] **Cargar reglas default (ESTE PASO)**
- [ ] Verificar setup
- [ ] npm run dev
- [ ] Crear campaña test

---

## 📊 Funcionalidades Listas

| Feature | Status |
|---------|--------|
| Crear campaña | ✅ Listo |
| Bulk import CSV | ✅ Listo |
| Aprobar campaña | ✅ Listo |
| Programar envío | ✅ Listo |
| Stats dashboard | ✅ Listo |
| Auditoría completa | ✅ Listo |
| Validación preflight | ⏳ Phase 2 |
| Bounce management | ✅ DB ready |
| Templates gallery | ✅ Listo |

---

## 🔐 Reglas Integradas

✅ Email template original: "Cajas de cartón corrugado a medida para industria"
✅ Máximo 1/dominio + máximo 20/día
✅ Delay 20-55s aleatorio
✅ Horario CL 9-18 L-V
✅ Auditoría en email_history
✅ Bounce tracking + blacklist

---

**Total tiempo de setup**: ~5 minutos
**Status**: 🟢 LISTO PARA USAR

