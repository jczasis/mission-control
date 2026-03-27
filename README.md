# 🎯 Mission Control Dashboard

Dashboard centralizado para operaciones **EMPEX**, **VersaSteel** e **Infinity Box**.

Creado por: **Juan Carlos Zuhlsdorf**
Stack: **React 19 + TypeScript + Tailwind + Supabase**

---

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- npm o yarn
- Supabase project (credenciales)
- Google Cloud project (opcional, para Gmail Tasks)

### Setup Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables (copiar .env.example)
cp .env.example .env.local
# Editar .env.local con credenciales reales

# 3. Setup Supabase (ejecutar una sola vez)
# Copiar contenido de SETUP_SUPABASE.sql en Supabase SQL editor

# 4. Iniciar servidor local
npm run dev
```

**App disponible en**: http://localhost:5173

---

## 📊 Componentes

| Componente | Fuente | Refresh | Descripción |
|-----------|--------|---------|-------------|
| **Evangelio** | API pública | 24h (cache) | Verso del día, Reina Valera |
| **Polymarket** | API pública | 5 min | Mercados hot Venezuela (volatilidad) |
| **Métricas** | Supabase | 1h | KPIs: emails, aperturas, galpones encontrados |
| **Tareas** | Gmail API | Real-time | Sincronización bidireccional con Gmail Tasks |
| **Cron Jobs** | Supabase | 1 min | Estado de scripts automatizados |

---

## 🔧 Desarrollo

### Comandos

```bash
npm run dev     # Desarrollo con HMR
npm run build   # Build producción
npm run preview # Preview del build
```

### Documentación

- **[CLAUDE.md](./CLAUDE.md)** - Reglas operativas, credenciales, roadmap
- **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios
- **[SETUP_SUPABASE.sql](./SETUP_SUPABASE.sql)** - Schema Supabase

---

**Last updated**: 2026-03-26
**Status**: 🟡 En construcción
