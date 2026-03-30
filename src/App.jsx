import { useState, useEffect, useRef, useCallback } from 'react';
import { CSS } from './styles.js';
import { sGet, sSet } from './db.js';
import { MailerCard } from './components/MailerCard';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MASTER_KEY = 'Empex2026';

const CARD_DEFS = {
  clock:          { title: 'Reloj / Sistema',    cols: 3,  section: 'SISTEMA' },
  kpi:            { title: 'KPIs',               cols: 3,  section: 'SISTEMA' },
  tools:          { title: 'Control de Tools',   cols: 8,  section: 'SISTEMA' },
  rem:            { title: 'Recordatorios',      cols: 6,  section: 'UTILIDADES' },
  notes:          { title: 'Notas Rapidas',      cols: 8,  section: 'UTILIDADES' },
  pom:            { title: 'Pomodoro',           cols: 4,  section: 'UTILIDADES' },
  todo_personal:  { title: 'Tareas Personal',    cols: 4,  section: 'TAREAS', entity: 'personal' },
  todo_empex:     { title: 'Tareas EMPEX',       cols: 4,  section: 'TAREAS', entity: 'empex' },
  todo_infinity:  { title: 'Tareas InfinityBox', cols: 4,  section: 'TAREAS', entity: 'infinity' },
  cron_status:    { title: 'Cron Status',        cols: 4,  section: 'SISTEMA' },
  // DATOS
  seia_pipeline:  { title: 'SEIA Pipeline',      cols: 6,  section: 'DATOS' },
  infinity_mailer: { title: 'Infinity Mailer',   cols: 6,  section: 'DATOS' },
  live_log:       { title: 'Log en Vivo',        cols: 6,  section: 'DATOS' },
  alerts:         { title: 'Alertas',            cols: 4,  section: 'DATOS' },
  // NEGOCIO
  empex_pipeline: { title: 'Pipeline EMPEX',     cols: 6,  section: 'NEGOCIO' },
  inbox:          { title: 'Inbox',              cols: 3,  section: 'NEGOCIO' },
  meta_snapshot:  { title: 'Meta Ads',           cols: 3,  section: 'NEGOCIO' },
  // SISTEMA (extra)
  server_health:  { title: 'Server Health',      cols: 4,  section: 'SISTEMA' },
  github_commits: { title: 'GitHub — Commits',   cols: 4,  section: 'SISTEMA' },
  uptime:         { title: 'Uptime Procesos',    cols: 4,  section: 'SISTEMA' },
};

// 'pom' and 'cron_status' removed from INITIAL_CARDS (available via + AGREGAR)
const INITIAL_CARDS = [
  'clock','kpi','rem',
  'todo_personal','todo_empex','todo_infinity',
  'tools',
  'notes',
  'seia_pipeline','infinity_mailer','live_log','alerts',
  'empex_pipeline','inbox','meta_snapshot',
  'server_health','github_commits','uptime',
];

const DEFAULT_REMINDERS = [
  'Rotar credenciales Supabase/Vercel/Anthropic',
  'Deploy VersaSteel configurador 3D',
  'Per-project CLAUDE.md + .env isolation',
];

const INITIAL_TOOLS = [
  { id: 'seia',    name: 'SEIA Scraper',      status: 'ok',   cron: 'cron 08:00',  scripts: '7 scripts',         lastRun: Date.now() - 12 * 60000 },
  { id: 'emailer', name: 'EMPEX Mailer',       status: 'off',  cron: '',            scripts: '5 scripts',         lastRun: null },
  { id: 'ewapp',   name: 'EMPEX WhatsApp',     status: 'warn', cron: '',            scripts: 'Selenium headless', lastRun: Date.now() - 47 * 60000 },
  { id: 'imailer', name: 'InfinityBox Mailer', status: 'ok',   cron: '08:45,09:00', scripts: '5 crons',           lastRun: Date.now() - 2 * 60000 },
  { id: 'meta',    name: 'Meta Ads Manager',   status: 'off',  cron: '',            scripts: '8 scripts+Remotion',lastRun: null },
  { id: 'school',  name: 'School Monitor',     status: 'ok',   cron: 'cron 07:00',  scripts: '',                  lastRun: Date.now() - 3 * 60000 },
  { id: 'mc',      name: 'Mission Control',    status: 'ok',   cron: 'activo',      scripts: '',                  lastRun: Date.now() - 1 * 60000 },
];

const STATUS_CYCLE = ['ok', 'warn', 'err', 'off'];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }
function uid() { return Math.random().toString(36).slice(2, 9); }

function relTime(ts) {
  if (!ts) return '-';
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return 'hace <1m';
  if (diff < 60) return `hace ${diff}m`;
  const h = Math.floor(diff / 60);
  return `hace ${h}h`;
}

function fmtTs(ts) {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function usePersistedState(key, defaultVal) {
  const [state, setState] = useState(defaultVal);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    sGet(key).then(val => {
      if (val !== null) {
        try { setState(JSON.parse(val)); } catch { setState(val); }
      }
      loadedRef.current = true;
      setLoaded(true);
    });
  }, [key]);

  const setAndPersist = useCallback((valOrFn) => {
    setState(prev => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      if (loadedRef.current) {
        sSet(key, JSON.stringify(next));
      }
      return next;
    });
  }, [key]);

  return [state, setAndPersist, loaded];
}

// ─── SKELETON LOADER ──────────────────────────────────────────────────────────
function SkeletonCard({ cols }) {
  return (
    <div className={`card cols-${cols} skeleton-card`}>
      <div className="card-header">
        <span className="skeleton-line" style={{ width: '40%', height: '8px' }} />
      </div>
      <div className="card-body" style={{ gap: '8px' }}>
        <span className="skeleton-line" style={{ width: '90%', height: '10px' }} />
        <span className="skeleton-line" style={{ width: '70%', height: '10px' }} />
        <span className="skeleton-line" style={{ width: '80%', height: '10px' }} />
      </div>
    </div>
  );
}

// ─── TOPBAR CLOCK ─────────────────────────────────────────────────────────────
function TopbarClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="topbar-clock">
      {pad(time.getHours())}:{pad(time.getMinutes())}
    </span>
  );
}

// ─── CLOCK CARD ───────────────────────────────────────────────────────────────
function ClockCard({ tools }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const okCount = tools.filter(t => t.status === 'ok').length;
  const pendingTasks = 3;

  return (
    <div className="card-body">
      <div className="clock-time">
        {pad(time.getHours())}:{pad(time.getMinutes())}
        <span className="clock-seconds">:{pad(time.getSeconds())}</span>
      </div>
      <div className="clock-date">
        {time.toLocaleDateString('es-CL', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}
      </div>
      <div className="kpi-mini-row">
        <MiniBar label="Tools activos" value={(okCount / tools.length) * 100} display={`${okCount}/${tools.length}`} color="var(--acc)" />
        <MiniBar label="Tareas pendientes" value={Math.min(pendingTasks / 10 * 100, 100)} display={pendingTasks} color="var(--amb)" />
        <MiniBar label="SEIA leads" value={47} display="47" color="var(--td)" />
      </div>
    </div>
  );
}

function MiniBar({ label, value, display, color }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 50);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="kpi-mini-item">
      <div className="kpi-mini-label">
        <span>{label}</span>
        <span className="tabular-nums" style={{ color }}>{display}</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${w}%`, background: color, transition: 'width 0.8s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KpiCard() {
  const kpiData = [
    { label: 'Proyectos EMPEX',   value: 35, color: 'acc' },
    { label: 'SEIA leads/mes',    value: 60, color: 'acc' },
    { label: 'InfinityBox leads', value: 20, color: 'amb' },
    { label: 'Scripts activos',   value: 43, color: 'acc' },
    { label: 'Tareas pendientes', value: 30, color: 'red' },
  ];

  const colorVar = (c) => {
    if (c === 'acc') return 'var(--acc)';
    if (c === 'amb') return 'var(--amb)';
    if (c === 'red') return 'var(--red)';
    return 'var(--td)';
  };

  return (
    <div className="card-body">
      <div className="kpi-row">
        {kpiData.map((k, idx) => (
          <KpiBar key={k.label} label={k.label} value={k.value} color={colorVar(k.color)} delay={idx * 80} />
        ))}
      </div>
    </div>
  );
}

function KpiBar({ label, value, color, delay }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), delay + 50);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="kpi-item">
      <div className="kpi-label-row">
        <span className="kpi-label">{label}</span>
        <span className="kpi-value tabular-nums" style={{ color }}>{value}%</span>
      </div>
      <div className="kpi-bar-bg">
        <div
          className="kpi-bar-fill"
          style={{
            width: `${w}%`,
            background: color,
            transition: `width 0.8s cubic-bezier(.4,0,.2,1) ${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ─── REMINDER CARD ────────────────────────────────────────────────────────────
function ReminderCard() {
  const [items, setItems] = usePersistedState('mc-reminders', DEFAULT_REMINDERS);
  const [input, setInput] = useState('');

  const add = () => {
    const t = input.trim();
    if (!t) return;
    setItems(prev => [...prev, t]);
    setInput('');
  };

  const del = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="card-body">
      <div className="rem-list">
        {items.map((r, i) => (
          <div className="rem-item" key={i}>
            <span className="rem-bullet">*</span>
            <span className="rem-text">{r}</span>
            <button className="btn-del" onClick={() => del(i)}>x</button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="empty-placeholder">Sin recordatorios</div>
        )}
      </div>
      <div className="add-row">
        <input
          className="input-field"
          placeholder="Nuevo recordatorio..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button className="btn-sm" onClick={add}>+ ADD</button>
      </div>
    </div>
  );
}

// ─── NOTES CARD ───────────────────────────────────────────────────────────────
function NotesCard() {
  const [text, setText] = usePersistedState('mc-notes', '');

  return (
    <div className="card-body" style={{ padding: '12px' }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Notas libres..."
        className="notes-textarea"
      />
    </div>
  );
}

// ─── TODO CARD ────────────────────────────────────────────────────────────────
function TodoCard({ entity, inputRef }) {
  const [items, setItems] = usePersistedState(`mc-todos-${entity}`, []);
  const [input, setInput] = useState('');
  const [hoverId, setHoverId] = useState(null);
  const isAmb = entity === 'empex';
  const localInputRef = useRef(null);
  const resolvedRef = inputRef || localInputRef;

  const add = () => {
    const t = input.trim();
    if (!t) return;
    setItems(prev => [...prev, { id: uid(), text: t, done: false }]);
    setInput('');
  };

  const toggle = (id) => setItems(prev =>
    prev.map(it => it.id === id ? { ...it, done: !it.done } : it)
  );

  const del = (id) => setItems(prev => prev.filter(it => it.id !== id));

  return (
    <div className="card-body">
      <div className="todo-list">
        {items.map(it => (
          <div
            className="todo-item"
            key={it.id}
            onMouseEnter={() => setHoverId(it.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            <input
              type="checkbox"
              className={`todo-cb${isAmb ? ' amb' : ''}`}
              checked={it.done}
              onChange={() => toggle(it.id)}
            />
            <span
              className={`todo-text${it.done ? ' done' : ''}`}
              onClick={() => toggle(it.id)}
            >{it.text}</span>
            <button
              className="btn-del todo-del"
              style={{ opacity: hoverId === it.id ? 1 : 0, transform: hoverId === it.id ? 'translateX(0)' : 'translateX(8px)' }}
              onClick={() => del(it.id)}
            >x</button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="empty-placeholder dashed">Sin tareas</div>
        )}
      </div>
      <div className="add-row">
        <input
          ref={resolvedRef}
          className="input-field"
          placeholder="Nueva tarea..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button className={`btn-sm${isAmb ? ' amb' : ''}`} onClick={add}>+ ADD</button>
      </div>
    </div>
  );
}

// ─── TOOLS CARD ───────────────────────────────────────────────────────────────
function ToolsCard({ tools, setTools }) {
  const cycleStatus = (id) => {
    setTools(prev => prev.map(t => {
      if (t.id !== id) return t;
      const idx = STATUS_CYCLE.indexOf(t.status);
      return { ...t, status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] };
    }));
  };

  const statusColor = (s) => {
    if (s === 'ok')   return 'var(--acc)';
    if (s === 'warn') return 'var(--amb)';
    if (s === 'err')  return 'var(--red)';
    return 'var(--td)';
  };

  return (
    <div className="card-body" style={{ padding: '0', overflowX: 'auto' }}>
      <table className="tools-table">
        <thead>
          <tr>
            <th>Herramienta</th>
            <th>Estado</th>
            <th>Cron / Modo</th>
            <th>Scripts</th>
            <th>Última ejecución</th>
          </tr>
        </thead>
        <tbody>
          {tools.map(t => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>
                <button
                  className="status-dot-btn"
                  onClick={() => cycleStatus(t.id)}
                  title="Click para cambiar estado"
                >
                  <span className="sys-dot" style={{ background: statusColor(t.status) }} />
                  <span className="status-label" style={{ color: statusColor(t.status) }}>
                    {t.status.toUpperCase()}
                  </span>
                </button>
              </td>
              <td className="tool-cron">{t.cron || '-'}</td>
              <td className="tool-scripts">{t.scripts || '-'}</td>
              <td className="tool-lastrun tabular-nums">{relTime(t.lastRun)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CRON STATUS CARD ─────────────────────────────────────────────────────────
function CronStatusCard({ tools, setTools }) {
  const okTools = tools.filter(t => t.status === 'ok');

  const cycleStatus = (id) => {
    setTools(prev => prev.map(t => {
      if (t.id !== id) return t;
      const idx = STATUS_CYCLE.indexOf(t.status);
      return { ...t, status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] };
    }));
  };

  return (
    <div className="card-body" style={{ padding: '0', overflowX: 'auto' }}>
      {okTools.length === 0 && (
        <div className="card-body">
          <div className="empty-placeholder">Sin tools activos</div>
        </div>
      )}
      {okTools.length > 0 && (
        <table className="tools-table">
          <thead>
            <tr>
              <th>Tool</th>
              <th>Cron</th>
              <th>Última ejecución</th>
            </tr>
          </thead>
          <tbody>
            {okTools.map(t => (
              <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => cycleStatus(t.id)} title="Click para cambiar estado">
                <td style={{ color: 'var(--acc)' }}>{t.name}</td>
                <td className="tool-cron">{t.cron || '-'}</td>
                <td className="tool-lastrun tabular-nums">{relTime(t.lastRun)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── POMODORO CARD ────────────────────────────────────────────────────────────
const POM_PRESETS = [
  { label: '25 min', secs: 25 * 60 },
  { label: '5 min',  secs:  5 * 60 },
  { label: '15 min', secs: 15 * 60 },
];

const POM_R = 54;
const POM_CIRC = 2 * Math.PI * POM_R;

function PomCard() {
  const [preset,  setPreset]  = useState(0);
  const [total,   setTotal]   = useState(POM_PRESETS[0].secs);
  const [rem,     setRem]     = useState(POM_PRESETS[0].secs);
  const [running, setRunning] = useState(false);
  const intRef = useRef(null);

  const selectPreset = (i) => {
    if (running) return;
    setPreset(i);
    setTotal(POM_PRESETS[i].secs);
    setRem(POM_PRESETS[i].secs);
  };

  useEffect(() => {
    if (running) {
      intRef.current = setInterval(() => {
        setRem(r => {
          if (r <= 1) { clearInterval(intRef.current); setRunning(false); return 0; }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intRef.current);
    }
    return () => clearInterval(intRef.current);
  }, [running]);

  const reset = () => { setRunning(false); setRem(total); };
  const pct = total > 0 ? (total - rem) / total : 0;
  const dashOffset = POM_CIRC * (1 - pct);
  const mins = Math.floor(rem / 60);
  const secs = rem % 60;

  return (
    <div className="card-body">
      <div className="pom-presets">
        {POM_PRESETS.map((p, i) => (
          <button
            key={p.label}
            className={`btn-preset${preset === i ? ' active' : ''}`}
            onClick={() => selectPreset(i)}
          >{p.label}</button>
        ))}
      </div>

      <div className="pom-ring-wrap">
        <svg className="pom-ring-svg" viewBox="0 0 128 128" width="128" height="128">
          <circle cx="64" cy="64" r={POM_R} fill="none" stroke="var(--b)" strokeWidth="3" />
          <circle
            cx="64" cy="64" r={POM_R}
            fill="none" stroke="var(--acc)" strokeWidth="3"
            strokeDasharray={POM_CIRC} strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px', transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="pom-ring-inner">
          <div className={`pom-time${!running && rem < total && rem > 0 ? ' paused' : ''}`}>
            {pad(mins)}:{pad(secs)}
          </div>
          <div className="pom-label">
            {running ? 'EN CURSO' : rem === 0 ? 'LISTO!' : rem === total ? 'READY' : 'PAUSADO'}
          </div>
        </div>
      </div>

      <div className="pom-controls">
        <button
          className={`btn-pom${!running ? ' start' : ''}`}
          onClick={() => rem > 0 && setRunning(r => !r)}
        >{running ? 'PAUSA' : 'START'}</button>
        <button className="btn-pom" onClick={reset}>RESET</button>
      </div>
    </div>
  );
}

// ─── SEIA PIPELINE CARD ───────────────────────────────────────────────────────
const SEIA_URL = 'https://lirzzskabepwdlhvdmla.supabase.co/rest/v1/seia_projects?select=expediente_id,project_name,region,investment,status,url_ficha,presentation_date&limit=100';

function parseInvestment(inv) {
  if (!inv) return null;
  // e.g. "1,2345 Millones de Dólares" → extract numeric part
  const match = inv.match(/([\d.,]+)/);
  if (!match) return null;
  const num = parseFloat(match[1].replace(',', '.'));
  if (isNaN(num)) return null;
  return `${num.toFixed(1)}M USD`;
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function SeiaPipelineCard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const load = useCallback(() => {
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!key) { setFetchErr(true); setLoading(false); return; }
    fetch(SEIA_URL, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      }
    })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) throw new Error('bad response');
        // Filter client-side: only rows with non-null project_name and investment
        const valid = data.filter(r =>
          r.project_name && r.project_name !== 'null' &&
          r.investment && r.investment !== 'null'
        ).slice(0, 8);
        setRows(valid);
        setFetchErr(false);
        setLastSync(Date.now());
        setLoading(false);
      })
      .catch(() => { setFetchErr(true); setLoading(false); });
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 300000); // 5 min
    return () => clearInterval(t);
  }, [load]);

  if (loading) {
    return (
      <div className="card-body" style={{ padding: '0', overflowX: 'auto' }}>
        <div className="empty-placeholder">Cargando SEIA...</div>
      </div>
    );
  }

  if (fetchErr) {
    return (
      <div className="card-body" style={{ padding: '0', overflowX: 'auto' }}>
        <div className="empty-placeholder">Error al cargar SEIA</div>
      </div>
    );
  }

  return (
    <div className="card-body" style={{ padding: '0', overflowX: 'auto' }}>
      <table className="tools-table">
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Región</th>
            <th>Monto</th>
            <th>Días</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const dias = daysSince(row.presentation_date);
            const monto = parseInvestment(row.investment);
            const url = row.url_ficha || '#';
            return (
              <tr
                key={row.expediente_id}
                className="seia-row"
                onClick={() => window.open(url, '_blank')}
              >
                <td>{row.project_name}</td>
                <td style={{ color: 'var(--td)' }}>{row.region || '-'}</td>
                <td style={{ color: 'var(--acc)', fontVariantNumeric: 'tabular-nums' }}>
                  {monto || '-'}
                </td>
                <td style={{
                  color: dias === null ? 'var(--td)'
                       : dias <= 7  ? 'var(--acc)'
                       : dias <= 14 ? 'var(--amb)'
                       : 'var(--td)',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {dias !== null ? `${dias}d` : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {lastSync && (
        <div style={{ padding: '4px 8px', fontSize: '8px', color: 'var(--td)', textAlign: 'right' }}>
          sync {relTime(lastSync)}
        </div>
      )}
    </div>
  );
}

// ─── LIVE LOG CARD ────────────────────────────────────────────────────────────
const MOCK_LOG_LINES = [
  '[10:00:01] [OK] SEIA scraper iniciado',
  '[10:00:04] [OK] 150 páginas en cola',
  '[10:01:23] [WARN] Rate limit detectado, backoff 2s',
  '[10:02:45] [OK] 1240 proyectos procesados',
  '[10:03:01] [OK] Sync Supabase completado',
];

function LiveLogCard() {
  const [lines, setLines] = useState(MOCK_LOG_LINES);
  const [error, setError] = useState(false);
  const preRef = useRef(null);

  useEffect(() => {
    const fetch_ = () => {
      fetch('https://asn-disk-opera-feature.trycloudflare.com/log')
        .then(r => r.json())
        .then(data => {
          setError(false);
          setLines(Array.isArray(data.lines) ? data.lines : MOCK_LOG_LINES);
        })
        .catch(() => setError(true));
    };
    const t = setInterval(fetch_, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
  }, [lines]);

  const colorLine = (l) => {
    if (l.includes('[ERR]') || l.includes('ERROR')) return 'log-err';
    if (l.includes('[WARN]') || l.includes('WARN')) return 'log-warn';
    if (l.includes('[OK]') || l.includes('OK')) return 'log-ok';
    return '';
  };

  return (
    <div className="card-body">
      {error
        ? <div className="empty-placeholder">servidor local no disponible</div>
        : (
          <pre className="log-pre" ref={preRef}>
            {lines.map((l, i) => (
              <span key={i} className={colorLine(l)}>{l + '\n'}</span>
            ))}
          </pre>
        )
      }
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-sm" onClick={() => setLines([])}>LIMPIAR</button>
      </div>
    </div>
  );
}

// ─── INFINITY MAILER CARD ─────────────────────────────────────────────────────
function InfinityMailerCard() {
  return <MailerCard />;
}

// ─── ALERTS CARD ─────────────────────────────────────────────────────────────
const DEFAULT_ALERTS = [
  { id: uid(), ts: Date.now() - 3600000, level: 'warn', message: 'Meta Ads token expira en 5 días' },
  { id: uid(), ts: Date.now() - 7200000, level: 'err',  message: 'SEIA scraper: timeout en página 83' },
];

function sortAlerts(alerts) {
  return [...alerts].sort((a, b) => {
    if (a.level === 'err' && b.level !== 'err') return -1;
    if (b.level === 'err' && a.level !== 'err') return 1;
    if (a.level === 'warn' && b.level !== 'warn') return -1;
    if (b.level === 'warn' && a.level !== 'warn') return 1;
    return b.ts - a.ts;
  });
}

function AlertsCard() {
  const [alerts, setAlerts] = usePersistedState('mc-alerts', DEFAULT_ALERTS);
  const [input, setInput] = useState('');
  const [level, setLevel] = useState('warn');

  const add = () => {
    const msg = input.trim();
    if (!msg) return;
    setAlerts(prev => [{ id: uid(), ts: Date.now(), level, message: msg }, ...prev]);
    setInput('');
  };

  const del = (id, alertLevel) => {
    if (alertLevel === 'err') {
      if (!window.confirm('Eliminar alerta ERR?')) return;
    }
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const sorted = sortAlerts(alerts);

  return (
    <div className="card-body">
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 200 }}>
        {sorted.length === 0 && <div className="empty-placeholder">Sin alertas</div>}
        {sorted.map(a => (
          <div className="alert-item" key={a.id}>
            <span className={`alert-badge ${a.level}`}>{a.level.toUpperCase()}</span>
            <span className="alert-ts">{fmtTs(a.ts)}</span>
            <span className="alert-msg">{a.message}</span>
            <button className="btn-del" onClick={() => del(a.id, a.level)}>x</button>
          </div>
        ))}
      </div>
      <div className="add-row">
        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          style={{ background: 'var(--bg)', border: '1px solid var(--b)', color: 'var(--tx)', fontFamily: 'var(--font)', fontSize: '10px', padding: '5px 4px', flexShrink: 0 }}
        >
          <option value="warn">WARN</option>
          <option value="err">ERR</option>
        </select>
        <input className="input-field" placeholder="Nueva alerta..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <button className="btn-sm red" onClick={add}>+ ADD</button>
      </div>
    </div>
  );
}

// ─── EMPEX PIPELINE CARD ──────────────────────────────────────────────────────
const DIAS_WARN = 7;

const STAGE_CYCLE = ['prospecto', 'cotizado', 'en_ejecucion'];

const DEFAULT_EMPEX = [
  { id: uid(), name: 'Bodega Quilicura 1200m2',   stage: 'cotizado',     valor_usd: 85000,  dias_sin_contacto: 3,  proxima_accion: '' },
  { id: uid(), name: 'Taller Rancagua Industrial', stage: 'prospecto',    valor_usd: 42000,  dias_sin_contacto: 12, proxima_accion: '' },
  { id: uid(), name: 'Galpón Antofagasta',         stage: 'en_ejecucion', valor_usd: 120000, dias_sin_contacto: 1,  proxima_accion: '' },
];

function EmpexPipelineCard() {
  const [projects, setProjects] = usePersistedState('mc-empex-pipeline', DEFAULT_EMPEX);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', stage: 'prospecto', valor_usd: '', dias_sin_contacto: 0, proxima_accion: '' });
  const [editingAction, setEditingAction] = useState(null); // id of project being edited
  const [actionInput, setActionInput] = useState('');

  const addProject = () => {
    if (!form.name.trim()) return;
    setProjects(prev => [...prev, { ...form, id: uid(), valor_usd: Number(form.valor_usd) || 0, dias_sin_contacto: Number(form.dias_sin_contacto) || 0 }]);
    setForm({ name: '', stage: 'prospecto', valor_usd: '', dias_sin_contacto: 0, proxima_accion: '' });
    setShowForm(false);
  };

  const del = (id) => setProjects(prev => prev.filter(p => p.id !== id));

  const cycleStage = (id) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const idx = STAGE_CYCLE.indexOf(p.stage);
      const next = STAGE_CYCLE[(idx + 1) % STAGE_CYCLE.length];
      return { ...p, stage: next };
    }));
  };

  const startEditAction = (p) => {
    setEditingAction(p.id);
    setActionInput(p.proxima_accion || '');
  };

  const saveAction = (id) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, proxima_accion: actionInput } : p
    ));
    setEditingAction(null);
  };

  const diasColor = (d) => {
    if (d >= DIAS_WARN * 2) return 'var(--red)';
    if (d >= DIAS_WARN)     return 'var(--amb)';
    return 'var(--acc)';
  };

  return (
    <div className="card-body" style={{ padding: '0', overflowX: 'auto' }}>
      <table className="tools-table">
        <thead>
          <tr><th>Proyecto</th><th>Stage</th><th>USD</th><th>Sin contacto</th><th></th></tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id}>
              <td>
                <div>{p.name}</div>
                {editingAction === p.id ? (
                  <input
                    className="input-field"
                    style={{ marginTop: '3px', fontSize: '9px', padding: '2px 5px' }}
                    value={actionInput}
                    autoFocus
                    onChange={e => setActionInput(e.target.value)}
                    onBlur={() => saveAction(p.id)}
                    onKeyDown={e => e.key === 'Enter' && saveAction(p.id)}
                  />
                ) : (
                  <div
                    style={{ fontSize: '9px', color: 'var(--td)', marginTop: '2px', cursor: 'text', minHeight: '12px' }}
                    onDoubleClick={() => startEditAction(p)}
                    title="Doble click para editar próxima acción"
                  >
                    {p.proxima_accion || <span style={{ opacity: 0.4 }}>sin próxima acción</span>}
                  </div>
                )}
              </td>
              <td>
                <button
                  className={`stage-badge ${p.stage}`}
                  style={{ background: 'none', cursor: 'pointer', border: '1px solid' }}
                  onClick={() => cycleStage(p.id)}
                  title="Click para avanzar stage"
                >
                  {p.stage.replace('_', ' ')}
                </button>
              </td>
              <td style={{ color: 'var(--acc)', fontVariantNumeric: 'tabular-nums' }}>${(p.valor_usd / 1000).toFixed(0)}K</td>
              <td style={{ color: diasColor(p.dias_sin_contacto), fontVariantNumeric: 'tabular-nums' }}>{p.dias_sin_contacto}d</td>
              <td><button className="btn-del" onClick={() => del(p.id)}>x</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <div style={{ padding: '8px', borderTop: '1px solid var(--b)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <input className="input-field" placeholder="Nombre proyecto" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ flex: '2 1 140px' }} />
          <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} style={{ background: 'var(--bg)', border: '1px solid var(--b)', color: 'var(--tx)', fontFamily: 'var(--font)', fontSize: '10px', padding: '5px 4px' }}>
            <option value="prospecto">Prospecto</option>
            <option value="cotizado">Cotizado</option>
            <option value="en_ejecucion">En Ejecución</option>
          </select>
          <input className="input-field" placeholder="USD" type="number" value={form.valor_usd} onChange={e => setForm(f => ({ ...f, valor_usd: e.target.value }))} style={{ flex: '1 1 70px' }} />
          <input className="input-field" placeholder="Próxima acción" value={form.proxima_accion} onChange={e => setForm(f => ({ ...f, proxima_accion: e.target.value }))} style={{ flex: '2 1 140px' }} />
          <button className="btn-sm" onClick={addProject}>GUARDAR</button>
          <button className="btn-sm" style={{ color: 'var(--td)' }} onClick={() => setShowForm(false)}>CANCEL</button>
        </div>
      )}
      {!showForm && (
        <div style={{ padding: '6px 8px' }}>
          <button className="btn-sm" onClick={() => setShowForm(true)}>+ PROYECTO</button>
        </div>
      )}
    </div>
  );
}

// ─── INBOX CARD ───────────────────────────────────────────────────────────────
const INBOX_ACCOUNTS = [
  { label: 'cotizar@infinitybox.cl', count: 3, mailto: 'mailto:cotizar@infinitybox.cl' },
  { label: 'juan@grupoempex.com',    count: 7, mailto: 'mailto:juan@grupoempex.com' },
];

function InboxCard() {
  const [counts, setCounts] = useState(INBOX_ACCOUNTS);
  const [lastSync, setLastSync] = useState(null);

  const refresh = () => {
    // Mock refresh — replace with real API when available
    setCounts(prev => prev.map(c => ({ ...c })));
    setLastSync(Date.now());
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 300000); // 5 min
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card-body">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {counts.map(c => (
          <div
            className="inbox-row"
            key={c.label}
            style={{ cursor: 'pointer' }}
            onClick={() => window.location.href = c.mailto}
          >
            <span className="inbox-label">{c.label}</span>
            <span className="inbox-count">{c.count}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {lastSync
          ? <span style={{ fontSize: '8px', color: 'var(--td)' }}>Última sync: {relTime(lastSync)}</span>
          : <span />
        }
        <button className="btn-sm" onClick={refresh}>REFRESH</button>
      </div>
    </div>
  );
}

// ─── META SNAPSHOT CARD ───────────────────────────────────────────────────────
const META_MOCK = [
  { name: 'VersaSteel — Leads',    cpm: '$2.40', ctr: '1.8%', spend: '$12/día' },
  { name: 'EMPEX — Awareness',     cpm: '$1.90', ctr: '0.9%', spend: '$8/día'  },
];

function MetaSnapshotCard() {
  return (
    <div className="card-body">
      {META_MOCK.map(c => (
        <div className="meta-campaign" key={c.name}>
          <div className="meta-campaign-name">{c.name}</div>
          <div className="meta-metrics">
            <div className="meta-metric">
              <div className="meta-metric-val">{c.cpm}</div>
              <div className="meta-metric-label">CPM</div>
            </div>
            <div className="meta-metric">
              <div className="meta-metric-val">{c.ctr}</div>
              <div className="meta-metric-label">CTR</div>
            </div>
            <div className="meta-metric">
              <div className="meta-metric-val">{c.spend}</div>
              <div className="meta-metric-label">SPEND</div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: '8px', color: 'var(--td)', marginTop: '6px', textAlign: 'center', letterSpacing: '0.04em' }}>
        Conectar Meta Ads API para datos reales
      </div>
    </div>
  );
}

// ─── SERVER HEALTH CARD ───────────────────────────────────────────────────────
function ServerHealthCard() {
  const [metrics, setMetrics] = useState({ cpu: 45, ram: 67, disk: 23 });
  const [unavail, setUnavail] = useState(false);

  useEffect(() => {
    const fetch_ = () => {
      fetch('https://asn-disk-opera-feature.trycloudflare.com/health')
        .then(r => r.json())
        .then(data => { setMetrics(data); setUnavail(false); })
        .catch(() => setUnavail(true));
    };
    fetch_();
    const t = setInterval(fetch_, 30000);
    return () => clearInterval(t);
  }, []);

  const barColor = (val, type) => {
    const hi = type === 'disk' ? 85 : 80;
    const mid = type === 'disk' ? 70 : 60;
    if (val >= hi) return 'var(--red)';
    if (val >= mid) return 'var(--amb)';
    return 'var(--acc)';
  };

  if (unavail) return (
    <div className="card-body">
      <div className="empty-placeholder">endpoint no disponible</div>
    </div>
  );

  return (
    <div className="card-body">
      {[
        { key: 'cpu',  label: 'CPU',  val: metrics.cpu  },
        { key: 'ram',  label: 'RAM',  val: metrics.ram  },
        { key: 'disk', label: 'DISK', val: metrics.disk },
      ].map(m => (
        <div className="kpi-mini-item" key={m.key}>
          <div className="kpi-mini-label">
            <span>{m.label}</span>
            <span className="tabular-nums" style={{ color: barColor(m.val, m.key) }}>{m.val}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '5px' }}>
            <div className="progress-bar-fill" style={{ width: `${m.val}%`, background: barColor(m.val, m.key), transition: 'width 0.8s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── GITHUB COMMITS CARD ─────────────────────────────────────────────────────
const COMMITS_MOCK = [
  { repo: 'mission-control', message: 'feat: add new dashboard cards', sha: 'a1b2c3d', ts: Date.now() - 3600000 },
  { repo: 'seia-scraper',    message: 'fix: handle timeout on page 83', sha: 'e4f5g6h', ts: Date.now() - 7200000 },
  { repo: 'empex-tools',     message: 'chore: update Meta Ads token',   sha: 'i7j8k9l', ts: Date.now() - 14400000 },
];

function GithubCommitsCard() {
  return (
    <div className="card-body" style={{ padding: '0', overflowX: 'auto' }}>
      <table className="tools-table">
        <thead>
          <tr><th>Repo</th><th>Commit</th><th>Hace</th></tr>
        </thead>
        <tbody>
          {COMMITS_MOCK.map(c => (
            <tr key={c.sha}>
              <td style={{ color: 'var(--td)', whiteSpace: 'nowrap' }}>{c.repo}</td>
              <td>
                <div style={{ fontSize: '10px' }}>{c.message}</div>
                <div style={{ fontSize: '9px', color: 'var(--td)', fontVariantNumeric: 'tabular-nums' }}>{c.sha}</div>
              </td>
              <td style={{ color: 'var(--td)', whiteSpace: 'nowrap' }}>{relTime(c.ts)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── UPTIME CARD ─────────────────────────────────────────────────────────────
const UPTIME_MOCK = [
  { service: 'seia-scraper.service',      status: 'active',   uptime_str: '3d 14h' },
  { service: 'telegram-handler.service',  status: 'active',   uptime_str: '5d 2h'  },
  { service: 'n8n.service',               status: 'active',   uptime_str: '12d 7h' },
  { service: 'mission-control.service',   status: 'inactive', uptime_str: '-'       },
];

function UptimeCard() {
  const statusColor = (s) => s === 'active' ? 'var(--acc)' : 'var(--td)';

  return (
    <div className="card-body" style={{ padding: '0', overflowX: 'auto' }}>
      <table className="tools-table">
        <thead>
          <tr><th>Servicio</th><th>Estado</th><th>Uptime</th></tr>
        </thead>
        <tbody>
          {UPTIME_MOCK.map(s => (
            <tr key={s.service}>
              <td style={{ fontSize: '9px', color: 'var(--td)' }}>{s.service}</td>
              <td>
                <span style={{ color: statusColor(s.status), fontSize: '9px', letterSpacing: '0.06em' }}>
                  {s.status.toUpperCase()}
                </span>
              </td>
              <td style={{ color: 'var(--tx)', fontVariantNumeric: 'tabular-nums' }}>{s.uptime_str}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
function CardWrapper({ id, unlocked, onRemove, onDragStart, onDragOver, onDrop,
  isDragging, isDragOver, children, title, cols, badge, badgeType, visible,
  extraHeader }) {
  return (
    <div
      className={`card cols-${cols}${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}${visible ? ' card-visible' : ''}`}
      draggable={unlocked}
      onDragStart={unlocked ? () => onDragStart(id) : undefined}
      onDragOver={unlocked ? (e) => { e.preventDefault(); onDragOver(id); } : undefined}
      onDrop={unlocked ? (e) => { e.preventDefault(); onDrop(id); } : undefined}
    >
      <div className="card-header">
        {unlocked && <span className="drag-handle" title="Arrastrar">:::::</span>}
        <span className="card-title">{title}</span>
        {badge && (
          <span className={`card-badge${badgeType ? ' ' + badgeType : ''}`}>{badge}</span>
        )}
        {extraHeader}
        {unlocked && (
          <button className="btn-remove" onClick={() => onRemove(id)} title="Eliminar">x</button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── ADD MENU CONFIG ──────────────────────────────────────────────────────────
const ADD_MENU = [
  {
    section: 'SISTEMA',
    items: [
      { id: 'clock',         label: 'Reloj / Sistema' },
      { id: 'kpi',           label: 'KPIs' },
      { id: 'tools',         label: 'Control de Tools' },
      { id: 'cron_status',   label: 'Cron Status' },
      { id: 'server_health', label: 'Server Health' },
      { id: 'github_commits',label: 'GitHub — Commits' },
      { id: 'uptime',        label: 'Uptime Procesos' },
    ],
  },
  {
    section: 'TAREAS',
    items: [
      { id: 'todo_personal', label: 'Tareas Personal' },
      { id: 'todo_empex',    label: 'Tareas EMPEX' },
      { id: 'todo_infinity', label: 'Tareas InfinityBox' },
    ],
  },
  {
    section: 'UTILIDADES',
    items: [
      { id: 'rem',   label: 'Recordatorios' },
      { id: 'notes', label: 'Notas Rapidas' },
      { id: 'pom',   label: 'Pomodoro' },
    ],
  },
  {
    section: 'DATOS',
    items: [
      { id: 'seia_pipeline', label: 'SEIA Pipeline' },
      { id: 'live_log',      label: 'Log en Vivo' },
      { id: 'alerts',        label: 'Alertas' },
    ],
  },
  {
    section: 'NEGOCIO',
    items: [
      { id: 'empex_pipeline', label: 'Pipeline EMPEX' },
      { id: 'inbox',          label: 'Inbox' },
      { id: 'meta_snapshot',  label: 'Meta Ads' },
    ],
  },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Si el query param "page=mailer2", mostrar Mailer2
  if (new URL(window.location).searchParams.get('page') === 'mailer2') {
    return <Mailer2 />;
  }

  const [cards,    setCards]    = usePersistedState('mc-cards', INITIAL_CARDS);
  const [tools,    setTools]    = usePersistedState('mc-tools', INITIAL_TOOLS);
  const [alerts,   setAlerts]   = usePersistedState('mc-alerts', DEFAULT_ALERTS);
  const [unlocked, setUnlocked] = useState(false);
  const [showAdd,  setShowAdd]  = useState(false);
  const [dragId,   setDragId]   = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [appReady, setAppReady] = useState(false);
  const addRef = useRef(null);
  const firstTodoRef = useRef(null);

  // Inject CSS + fonts
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(style); } catch {} };
  }, []);

  // Skeleton: after a short delay mark ready (min 400ms UX)
  useEffect(() => {
    const t = setTimeout(() => setAppReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Close dropdown outside click
  useEffect(() => {
    const handler = (e) => {
      if (addRef.current && !addRef.current.contains(e.target)) setShowAdd(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'l' || e.key === 'L') {
        if (!unlocked) {
          const key = prompt('Clave para desbloquear:');
          if (key === MASTER_KEY) setUnlocked(true);
          else if (key !== null) alert('❌ Clave incorrecta');
        } else {
          setUnlocked(false);
        }
      }
      if ((e.key === 'n' || e.key === 'N') && firstTodoRef.current) firstTodoRef.current.focus();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [unlocked]);

  const removeCard = (id) => setCards(prev => prev.filter(c => c !== id));
  const addCard    = (id) => {
    if (!cards.includes(id)) setCards(prev => [...prev, id]);
    setShowAdd(false);
  };

  const handleDragStart = (id) => setDragId(id);
  const handleDragOver  = (id) => setDragOver(id);
  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOver(null); return; }
    setCards(prev => {
      const arr = [...prev];
      const fi = arr.indexOf(dragId);
      const ti = arr.indexOf(targetId);
      if (fi === -1 || ti === -1) return prev;
      arr.splice(fi, 1);
      arr.splice(ti, 0, dragId);
      return arr;
    });
    setDragId(null);
    setDragOver(null);
  };

  const okCount   = tools.filter(t => t.status === 'ok').length;
  const warnCount = tools.filter(t => t.status === 'warn').length;
  // errCount = tools with err status + alerts with level err
  const toolsErrCount  = tools.filter(t => t.status === 'err').length;
  const alertsErrCount = alerts.filter(a => a.level === 'err').length;
  const errCount  = toolsErrCount + alertsErrCount;
  const sysStatus = errCount > 0 ? 'err' : warnCount > 0 ? 'warn' : 'ok';

  const firstTodoId = cards.find(id => id.startsWith('todo_'));

  const renderCard = (id) => {
    const def = CARD_DEFS[id];
    if (!def) return null;
    const { cols, title } = def;
    const wp = {
      id, unlocked, cols, title,
      onRemove: removeCard,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      isDragging: dragId === id,
      isDragOver: dragOver === id,
      visible: appReady,
    };

    switch (id) {
      case 'clock':
        return <CardWrapper key={id} {...wp}><ClockCard tools={tools} /></CardWrapper>;
      case 'kpi':
        return <CardWrapper key={id} {...wp}><KpiCard /></CardWrapper>;
      case 'rem':
        return <CardWrapper key={id} {...wp}><ReminderCard /></CardWrapper>;
      case 'notes':
        return <CardWrapper key={id} {...wp}><NotesCard /></CardWrapper>;
      case 'pom':
        return <CardWrapper key={id} {...wp}><PomCard /></CardWrapper>;
      case 'todo_personal':
        return (
          <CardWrapper key={id} {...wp} badge="personal">
            <TodoCard entity="personal" inputRef={firstTodoId === 'todo_personal' ? firstTodoRef : undefined} />
          </CardWrapper>
        );
      case 'todo_empex':
        return (
          <CardWrapper key={id} {...wp} badge="empex" badgeType="amb">
            <TodoCard entity="empex" inputRef={firstTodoId === 'todo_empex' ? firstTodoRef : undefined} />
          </CardWrapper>
        );
      case 'todo_infinity':
        return (
          <CardWrapper key={id} {...wp} badge="infinity" badgeType="acc">
            <TodoCard entity="infinity" inputRef={firstTodoId === 'todo_infinity' ? firstTodoRef : undefined} />
          </CardWrapper>
        );
      case 'tools':
        return <CardWrapper key={id} {...wp}><ToolsCard tools={tools} setTools={setTools} /></CardWrapper>;
      case 'cron_status':
        return <CardWrapper key={id} {...wp}><CronStatusCard tools={tools} setTools={setTools} /></CardWrapper>;
      case 'seia_pipeline':
        return (
          <CardWrapper key={id} {...wp} extraHeader={
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="live-dot" />
              <span className="live-label">LIVE</span>
            </span>
          }>
            <SeiaPipelineCard />
          </CardWrapper>
        );
      case 'infinity_mailer':
        return (
          <CardWrapper key={id} {...wp} extraHeader={
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="live-dot" />
              <span className="live-label">CRON</span>
            </span>
          }>
            <InfinityMailerCard />
          </CardWrapper>
        );
      case 'live_log':
        return <CardWrapper key={id} {...wp}><LiveLogCard /></CardWrapper>;
      case 'alerts':
        return <CardWrapper key={id} {...wp}><AlertsCard /></CardWrapper>;
      case 'empex_pipeline':
        return <CardWrapper key={id} {...wp}><EmpexPipelineCard /></CardWrapper>;
      case 'inbox':
        return <CardWrapper key={id} {...wp}><InboxCard /></CardWrapper>;
      case 'meta_snapshot':
        return (
          <CardWrapper key={id} {...wp} extraHeader={
            <span className="mock-badge">MOCK</span>
          }>
            <MetaSnapshotCard />
          </CardWrapper>
        );
      case 'server_health':
        return <CardWrapper key={id} {...wp}><ServerHealthCard /></CardWrapper>;
      case 'github_commits':
        return <CardWrapper key={id} {...wp}><GithubCommitsCard /></CardWrapper>;
      case 'uptime':
        return <CardWrapper key={id} {...wp}><UptimeCard /></CardWrapper>;
      default:
        return null;
    }
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <span className="topbar-logo">Mission Control</span>
        {errCount > 0 && (
          <span className="topbar-err-badge">{errCount} ERR</span>
        )}
        <span className="topbar-tag">EMPEX + InfinityBox</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`sys-dot ${sysStatus}`} />
          <span className="sys-counter">
            <span className="ok">{okCount}&nbsp;OK</span>
            <span className="warn">{warnCount}&nbsp;WARN</span>
            <span className="err">{toolsErrCount}&nbsp;ERR</span>
          </span>
        </div>

        <div className="topbar-sep" />

        <TopbarClock />

        <label className="lock-wrap">
          <span className={`lock-label${unlocked ? ' unlocked' : ''}`}>
            {unlocked ? 'UNLOCKED' : 'LOCKED'}
          </span>
          <div className="switch">
            <input
              type="checkbox"
              checked={unlocked}
              onChange={e => {
                if (e.target.checked) {
                  const key = prompt('Clave para desbloquear:');
                  if (key === MASTER_KEY) setUnlocked(true);
                  else if (key !== null) alert('❌ Clave incorrecta');
                  e.target.checked = false;
                } else {
                  setUnlocked(false);
                }
              }}
            />
            <span className="slider" />
          </div>
        </label>

        <div style={{ position: 'relative' }} ref={addRef}>
          <button className="btn-add" onClick={() => setShowAdd(s => !s)}>
            + AGREGAR
          </button>
          {showAdd && (
            <div className="dropdown">
              {ADD_MENU.map(group => (
                <div key={group.section}>
                  <div className="dropdown-section">{group.section}</div>
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      className="dropdown-item"
                      onClick={() => addCard(item.id)}
                    >
                      {item.label}
                      {cards.includes(item.id) && (
                        <span style={{ color: 'var(--td)', fontSize: '10px', marginLeft: '6px' }}>
                          [activa]
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CARD GRID */}
      <div className="grid-container">
        {!appReady
          ? INITIAL_CARDS.map((id) => {
              const def = CARD_DEFS[id];
              if (!def) return null;
              return <SkeletonCard key={id} cols={def.cols} />;
            })
          : cards.map(id => renderCard(id))
        }
      </div>
    </>
  );
}

// Mailer2 standalone component
function Mailer2() {
  const [campaigns, setCampaigns] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [recipients, setRecipients] = React.useState([]);

  const API = 'https://lirzzskabepwdlhvdmla.supabase.co/rest/v1';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw';

  React.useEffect(() => {
    fetch(API + '/email_campaigns?order=created_at.desc', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    }).then(r => r.json()).then(setCampaigns);
  }, []);

  const selectCampaign = (id) => {
    setSelected(campaigns.find(c => c.id === id));
    fetch(API + '/email_recipients?campaign_id=eq.' + id, {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    }).then(r => r.json()).then(setRecipients);
  };

  const approve = (id) => {
    if (!confirm('¿Aprobar?')) return;
    fetch(API + '/email_campaigns?id=eq.' + id, {
      method: 'PATCH',
      headers: {
        apikey: KEY,
        Authorization: 'Bearer ' + KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'approved', approved_at: new Date().toISOString() })
    }).then(() => { alert('✅ Aprobada'); location.reload(); });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold">📧 Infinity Mailer</h1>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
        <div className="bg-white rounded border p-4">
          <div className="font-bold mb-4 pb-2 border-b">Campañas ({campaigns.length})</div>
          {campaigns.map(c => (
            <button
              key={c.id}
              onClick={() => selectCampaign(c.id)}
              className={`w-full text-left p-3 text-sm mb-2 rounded hover:bg-gray-50 ${
                selected?.id === c.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
              }`}
              style={{border: 'none'}}
            >
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-gray-600 mt-1">Status: <span className="font-bold" style={{color: c.status === 'draft' ? '#ca8a04' : '#16a34a'}}>{c.status}</span></div>
              <div className="text-xs text-gray-600">Contactos: {c.recipient_count}</div>
            </button>
          ))}
        </div>
        <div className="col-span-2">
          {!selected ? (
            <div className="bg-white rounded border p-6 text-center text-gray-500">Selecciona una campaña</div>
          ) : (
            <div className="bg-white rounded border p-6">
              <h2 className="text-2xl font-bold mb-4">{selected.name}</h2>
              <div className="bg-gray-50 p-4 rounded mb-6">
                <p className="text-xs font-bold text-gray-600 mb-2">Contactos: {selected.recipient_count}</p>
                <p className="text-xs font-bold text-gray-600 mb-2">Status: <span style={{color: selected.status === 'draft' ? '#ca8a04' : '#16a34a'}}>{selected.status}</span></p>
              </div>
              {selected.status === 'draft' && (
                <button
                  onClick={() => approve(selected.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold mb-6"
                >
                  ✅ APROBAR CAMPAÑA
                </button>
              )}
              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">Destinatarios ({recipients.length})</h3>
                <div className="space-y-1">
                  {recipients.slice(0, 20).map(r => (
                    <div key={r.email} className="text-sm bg-gray-100 p-2 rounded flex justify-between">
                      <span>{r.email}</span>
                      <span className="text-xs text-gray-500">{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
