# CHANGELOG - Mission Control Dashboard

Todas las iteraciones quedan registradas aquí. Esto permite que futures sesiones Claude entiendan la evolución del proyecto.

---

## [FEAT] 2026-03-27 16:45 CL - Email Scheduler + Pipeline Aprobación

### Email Scheduler para Infinity Box
- ✅ Componente UI `EmailScheduler.tsx` con dashboard (Pendientes/Aprobadas/Enviadas)
- ✅ API client `email-scheduler.ts` (getEmailCampaigns, approveEmailCampaign, scheduleEmailCampaign)
- ✅ Schema Supabase completo (4 tablas: campaigns, recipients, bounces, approvals)
- ✅ Daemon backend `email-scheduler-daemon.py` con 3 acciones:
  - `generate`: Crea campaña diaria 09:00 CL
  - `send`: Envía campañas aprobadas 09:30 CL siguiente día
  - `bounces`: Verifica bounces cada 30 min
- ✅ Cron wrapper `/scripts/email-scheduler-cron.sh`
- ✅ Integración Telegram para alertas automáticas
- ✅ Documentación completa (EMAIL_SCHEDULER.md)

### Layout
- Updated a 5 columnas: Evangelio | Polymarket+Métricas | Tasks | **Email Scheduler** | CronStatus

### Pipeline de Aprobación (Día Siguiente)
```
[Día N 09:00] Generate → pending
[Día N antes 12:00] Juan aprueba en UI → approved
[Día N+1 09:30] Sistema envía → sent
```

### Guardrails
- ✅ Horario laboral CL (L-V)
- ⏳ TODO: Máx 1 email/dominio, delay 20-55s, no govt/competencia, auto-pause bounce>20%

---

## [INIT] 2026-03-26 19:35 CL

### Setup Inicial
- ✅ Vite + React 19 + TypeScript
- ✅ Tailwind CSS configurado
- ✅ Estructura carpetas base
- ✅ Dependencias instaladas:
  - `@supabase/supabase-js`
  - `@tanstack/react-query`
  - `zustand`
  - `axios`
  - `lucide-react`

### Componentes Creados
1. **Evangelio.tsx** - Verso del día (API bolls.life, cache 24h)
2. **Polymarket.tsx** - Mercados hot Venezuela (real-time)
3. **Metricas.tsx** - KPIs: InfinityBox, EMPEX, SEIA
4. **GmailTasks.tsx** - OAuth Google + sincronización
5. **CronStatus.tsx** - Estado de jobs (tabla `script_runs`)
6. **App.tsx** - Layout principal 4-col responsive

### APIs Integradas
- ✅ Bible API (pública, sin auth)
- ✅ Polymarket API (pública, mock fallback)
- ✅ Supabase (queries + mutations)
- ⏳ Google Tasks API (OAuth pendiente)

### Infraestructura Supabase
- ✅ Schema SQL (6 tablas + índices) → `SETUP_SUPABASE.sql`
- ✅ Credenciales guardadas en `.env.local`
- ⏳ Carga de datos históricos (ETA: 27/03)

### Estado Local
- ✅ npm run dev activo en http://localhost:5173
- ✅ HMR (hot reload) configurado
- ⏳ Testing exhaustivo (pendiente)

### Documentación
- ✅ `CLAUDE.md` - Reglas, credenciales, roadmap
- ✅ `CHANGELOG.md` - Este archivo
- ✅ `.env.example` - Template (sin secretos)

---

## [PENDING] 2026-03-27 (Próximo)

### Testing & Validación
- [ ] Conectar OAuth Google para Gmail Tasks
- [ ] Ejecutar queries Supabase (verificar conexión)
- [ ] Test de Polymarket API
- [ ] Mobile responsiveness (test en iPhone)

### Build & Deploy
- [ ] npm run build (verificar tamaño)
- [ ] Crear repo en GitHub
- [ ] Configurar Vercel (auto-deploy)
- [ ] Verificar variables de entorno en Vercel

### Ajustes UX
- [ ] Agregar loading spinners más visuales
- [ ] Error boundaries para APIs fallidas
- [ ] Modo oscuro/claro toggle (guardar en DB)
- [ ] Refresh manual de componentes

---

## Notas Importantes

1. **Credenciales**: `.env.local` NO se commitea. Usar `.env.example` como referencia.
2. **Supabase Schema**: Ejecutar `SETUP_SUPABASE.sql` antes de usar la app.
3. **Google OAuth**: Pendiente obtener `VITE_GOOGLE_CLIENT_ID` desde Google Cloud Console.
4. **Vercel**: Configurar variables en Vercel dashboard (no en .env.local).

---

**Última actualización**: 2026-03-26 19:35 CL
**Status**: 🟡 En construcción (Fase 1 - Setup base)
**Owner**: Juan Carlos Zuhlsdorf / Claude
