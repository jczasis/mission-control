# 🏗️ Architecture - Mission Control Dashboard

Documento técnico que explica el diseño de la aplicación para futuras iteraciones y mantenimiento.

---

## 📐 Stack Decisiones

### Frontend
- **React 19 + TypeScript**: Type safety, mejor DX
- **Tailwind CSS**: Utility-first, rápido iterar en UI
- **Vite**: Build rápido (3s), HMR instantáneo (perfecto para desarrollo)
- **React Query (@tanstack)**: Caché inteligente + sincronización servidor
- **Zustand**: State management (ligero, si necesarios)

### Backend/Data
- **Supabase**: PostgreSQL + Auth + Real-time (alternativa a Firebase)
- **No backend custom**: Consultas directo desde cliente (RLS en Supabase)

### Deployment
- **Vercel**: Auto-deploy en main, edge functions, serverless functions
- **GitHub**: Source of truth, CI/CD via Vercel

---

## 🔄 Data Flow

```
User Input
    ↓
React Component (useState, useQuery)
    ↓
API Client (lib/api/*)
    ↓
External API (Supabase, Bible, Polymarket, Gmail)
    ↓
React Query Cache
    ↓
Component re-render
```

### Ejemplo: Cargar Métricas
```typescript
// En Metricas.tsx
const { data: metrics } = useQuery({
  queryKey: ['empexMetrics'],
  queryFn: getEmpexMetrics,  // lib/api/supabase.ts
  refetchInterval: 60 * 60 * 1000  // Cada hora
});

// getEmpexMetrics hace:
// 1. Supabase.from('empex_galpones').select()
// 2. Calcula HOY usando new Date()
// 3. Retorna {galponesFoundToday, cotizacionesSent, leadsActivos}
```

---

## 🗂️ Estructura Carpetas

```
mission-control/
├── src/
│   ├── components/
│   │   ├── Evangelio.tsx       # Verso del día (1 línea cache key)
│   │   ├── Polymarket.tsx      # Mercados hot (5 min refresh)
│   │   ├── Metricas.tsx        # KPIs dinámicos (1h refresh)
│   │   ├── GmailTasks.tsx      # OAuth + sincro (real-time)
│   │   └── CronStatus.tsx      # Estado jobs (1 min refresh)
│   ├── lib/
│   │   ├── api/
│   │   │   ├── bible.ts        # GET https://bolls.life/...
│   │   │   ├── polymarket.ts   # GET https://gamma-api.polymarket.com/markets
│   │   │   ├── gmail.ts        # Google Tasks API (OAuth)
│   │   │   ├── supabase.ts     # Queries Supabase (REST client)
│   │   │   └── index.ts        # Export centralizado
│   │   └── store.ts            # Zustand (si necesario)
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── App.tsx                 # Layout principal
│   ├── App.css                 # Tailwind + custom
│   └── main.jsx                # Entry point
├── public/
├── .env.local                  # ⚠️ NO commitear
├── .env.example                # Template
├── CLAUDE.md                   # Reglas + contexto para Claude
├── CHANGELOG.md                # Historial de cambios
├── ARCHITECTURE.md             # Este archivo
├── SETUP_SUPABASE.sql          # Schema SQL
├── README.md                   # Quick start
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🔐 Seguridad & RLS (Row Level Security)

### Credenciales
```
VITE_SUPABASE_URL          → Public, ok en cliente
VITE_SUPABASE_ANON_KEY     → Limitado por RLS, ok en cliente
VITE_GOOGLE_CLIENT_ID      → Public, ok en cliente
```

### Supabase RLS Policies (Recomendado)
```sql
-- Permitir lectura pública de script_runs, daily_metrics
ALTER TABLE script_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_all" ON script_runs FOR SELECT USING (true);

-- Email campaigns: solo lectura de propios (si hay usuario)
-- ... (configurar por usuario si necesario)
```

---

## 🚀 Performance Optimizaciones

### 1. React Query Caching
```typescript
// Bible: cache 24h (unlikely to change)
staleTime: 24 * 60 * 60 * 1000,
gcTime: 24 * 60 * 60 * 1000

// Polymarket: 5 min (volatile)
refetchInterval: 5 * 60 * 1000

// Metrics: 1h (daily aggregates)
refetchInterval: 60 * 60 * 1000
```

### 2. Lazy Loading
- Componentes no cargados hasta visible (Intersection Observer, si necesario)

### 3. API Batching
- No hace N requests, usa Supabase para agregaciones

### 4. Code Splitting
- Vite automático (chunks por route)

---

## 🔧 Extensibilidad

### Agregar Nuevo Componente

1. **Crear componente**:
   ```typescript
   // src/components/MiMetrica.tsx
   export function MiMetrica() {
     const { data } = useQuery({
       queryKey: ['miMetrica'],
       queryFn: getMiMetricData,
       refetchInterval: 60000
     });
     return <div>...</div>;
   }
   ```

2. **Crear API client**:
   ```typescript
   // src/lib/api/miapi.ts
   export async function getMiMetricData() {
     const { data } = await supabase
       .from('mi_tabla')
       .select('*');
     return data;
   }
   ```

3. **Integrar en App**:
   ```typescript
   // src/App.tsx
   import { MiMetrica } from './components/MiMetrica';

   <div className="grid ...">
     <MiMetrica />
   </div>
   ```

4. **Documentar**:
   - Agregar en `CHANGELOG.md`
   - Actualizar `CLAUDE.md` → "Componentes"
   - Actualizar `README.md` tabla de componentes

---

## 📊 Supabase Schema

### Tablas Principales

#### `script_runs`
```sql
id (uuid)
script_name (text)        -- "seia_scraper", "sync-mission-control"
status (text)             -- 'success', 'error', 'pending'
error_message (text)      -- Null si success
created_at (timestamp)
next_run (timestamp)      -- Próxima ejecución esperada
```

#### `daily_metrics`
```sql
id (uuid)
date (date)               -- '2026-03-26'
metric_type (text)        -- 'infinity', 'empex', 'seia'
emails_sent (int)
open_rate (float)         -- 0-100
conversions (int)
galpones_found (int)
...
created_at (timestamp)
```

#### `mission_control_config`
```sql
id (uuid)
key (text)                -- 'ui_theme', 'refresh_intervals', etc
value (jsonb)             -- {colors: {...}, layout: '4col'}
updated_at (timestamp)
```

---

## 🔄 Flujo de Sincronización Automática

### Script: `sync-mission-control.sh` (cada 30 min)

```bash
1. Verifica si build está actualizado
2. Guarda estado en mission_control_config (timestamp, version, health)
3. Registra entrada en script_runs (success/error)
4. Cron: */30 * * * * (propuesto)
```

---

## 🧪 Testing Strategy

### Local (npm run dev)
- ✅ Browser console para logs
- ✅ Verificar React Query devtools (si instalamos)
- ✅ Manual testing cada componente

### Supabase
```bash
# Test connection
curl -H "Authorization: Bearer $SUPABASE_KEY" \
  "https://lirzzskabepwdlhvdmla.supabase.co/rest/v1/script_runs?limit=1"
```

### APIs Externas
```bash
# Bible
curl https://bolls.life/get-random-verse/REINA_VALERA/

# Polymarket
curl "https://gamma-api.polymarket.com/markets?limit=5"

# Google Tasks
# OAuth flow en navegador (testear en app)
```

---

## 📈 Escalabilidad

### Phase 2+ Consideraciones
- **Real-time updates**: Supabase Realtime subscriptions
- **Webhooks**: n8n → POST a /api/webhooks/
- **Edge functions**: Vercel serverless (si lógica compleja)
- **Mobile**: React Native (compartir logic con web)

---

## 📝 Git Workflow

```bash
# Feature branch
git checkout -b feat/new-component

# Develop local
npm run dev

# Test + commit
git add .
git commit -m "feat: add new component"

# Push + PR (si hay team)
git push origin feat/new-component

# Merge + auto-deploy en Vercel
# (después de PR approval)
```

---

## 🚨 Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "VITE_SUPABASE_URL is undefined"
Verificar `.env.local` tiene las variables (no `.env.example`)

### "Gmail Tasks no carga"
- Verificar VITE_GOOGLE_CLIENT_ID en .env.local
- Google Cloud Console → Credenciales → OAuth 2.0
- Agregar localhost:5173 a URIs autorizados

### "Polymarket devuelve 404"
API caída o cambió endpoint → Ver fallback mock en polymarket.ts

---

**Last updated**: 2026-03-26
**Intended for**: Developers, next Claude sessions, documentation
