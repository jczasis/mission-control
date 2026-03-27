# 🎯 Mission Control - Dashboard React

**Fundador**: Juan Carlos Zuhlsdorf
**Empresas**: EMPEX, VersaSteel, Infinity Box
**Timezone**: Chile (UTC-3)
**Stack**: React 19 + TypeScript + Tailwind CSS + Supabase + React Query

---

## 📋 Visión

Dashboard centralizado que agregue:
- ✅ Evangelio del día (API pública)
- ✅ Polymarket mercados hot Venezuela
- ✅ Métricas operacionales: InfinityBox, EMPEX, SEIA
- ✅ Tareas Gmail (OAuth)
- ✅ Estado Cron Jobs (Supabase)

**Meta**: Herramienta de comando unificada, auto-sincronizable, listo para escalar.

---

## 🔑 Credenciales (Persistentes)

```bash
# Supabase
VITE_SUPABASE_URL=https://lirzzskabepwdlhvdmla.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth (TODO: Obtener client_id)
VITE_GOOGLE_CLIENT_ID=<pending>

# APIs públicas (sin auth)
VITE_BIBLE_API=https://bolls.life/get-random-verse
VITE_POLYMARKET_API=https://gamma-api.polymarket.com
```

---

## 🎨 Estética & UX

**Tema**: Dark mode (gris 800-900 fondo, acentos azul/verde)
**Layout**:
- Izquierda: Evangelio (64px) + espacio
- Centro: Polymarket (3 cols) + Métricas (2 cols)
- Derecha: Gmail Tasks (sidebar sticky)
- Abajo: Cron Status (full width)

**Responsivo**:
- Desktop (lg): 4-col grid
- Mobile: 1-col stack

---

## 🔄 Proceso de Iteración (Estable)

### 1. Cambios de Código
```bash
cd mission-control
npm run dev          # Pruebas local
npm run build        # Build optimizado
```

### 2. Guardar Estado en Supabase
Tabla: `mission_control_config`
```json
{
  "key": "ui_theme",
  "value": { "colors": {...}, "layout": "4col" }
}
```

### 3. Deploy (Vercel)
```bash
git add .
git commit -m "feat: <descripción>"
git push origin main  # Auto-deploy en Vercel
```

### 4. Monitoreo
- Logs: Ver en browser console + Supabase logs
- Métricas: Checkear tabla `daily_metrics`
- Health: Tabla `script_runs` debe tener runs recientes

---

## 📊 Reglas Operativas

### NO hacer:
- ❌ Cambiar structure sin guardar en Supabase
- ❌ Compartir credenciales en commits
- ❌ Modificar Supabase schema sin backup

### SÍ hacer:
- ✅ Guardar preferencias UI en `mission_control_config`
- ✅ Log cada mejora en `CHANGELOG.md`
- ✅ Test local ANTES de push a Vercel
- ✅ Documentar mejoras para iteración futura

---

## 🚀 Roadmap (Próximas Iteraciones)

### Fase 1 (Actual)
- [x] Setup React local
- [x] Componentes base (Evangelio, Polymarket, Métricas, Tareas, Crons)
- [ ] Testing local exhaustivo
- [ ] Deploy en Vercel
- [ ] Validar OAuth Google

### Fase 2 (Mejoras)
- [ ] Modo oscuro/claro toggleable (guardar en DB)
- [ ] Notificaciones Telegram para alertas críticas
- [ ] Integración con n8n workflows
- [ ] Gráficos históricos (sparklines en KPIs)
- [ ] Mobile app (React Native)

### Fase 3 (Escala)
- [ ] AI insights (análisis de trends SEIA, VersaSteel)
- [ ] Webhooks para sincronización automática
- [ ] API REST para acceso externo
- [ ] Reportes diarios automáticos vía email

---

## 📁 Estructura del Repo

```
mission-control/
├── src/
│   ├── components/        # Componentes React
│   ├── lib/
│   │   ├── api/          # Clientes API
│   │   └── store.ts      # Zustand (si necesario)
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Componente raíz
│   └── App.css           # Estilos Tailwind
├── .env.local            # Credenciales (⚠️ no commitear)
├── .env.example          # Template (❌ secretos)
├── CLAUDE.md             # Este archivo (reglas + contexto)
├── CHANGELOG.md          # Historia de cambios
├── SETUP_SUPABASE.sql    # Schema Supabase
└── package.json
```

---

## 🔗 Links Importantes

- **Local**: http://localhost:5173
- **Supabase**: https://supabase.com (lirzzskabepwdlhvdmla)
- **Vercel**: https://mission-control-xyzabc.vercel.app (TBD)
- **GitHub**: https://github.com/juancarloszuhlsdorf/mission-control (TBD)

---

## 🛠️ Comandos Rápidos

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter (si hay)
npm run lint

# Tests (si hay)
npm run test

# Sincronizar con Supabase
curl -X POST <SUPABASE_URL>/rest/v1/mission_control_config \
  -H "Authorization: Bearer <SUPABASE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"key":"last_sync","value":{"ts":"2026-03-26T19:35:00Z"}}'
```

---

## 👤 Responsables

- **Arquitectura**: Juan Carlos Zuhlsdorf
- **Implementación**: Claude (AI assistant)
- **Testing**: Manual (local) + Vercel CI/CD

---

**Last updated**: 2026-03-26 19:35 CL
**Status**: 🟡 En construcción (fase 1)

---

## Cambios recientes (CHANGELOG)

### 2026-03-26
- [INIT] Setup React Vite + Tailwind
- [FEAT] Componentes base: Evangelio, Polymarket, Métricas, Tasks, Crons
- [INFRA] Supabase schema (6 tablas)
- [TODO] Deploy Vercel + OAuth Google
