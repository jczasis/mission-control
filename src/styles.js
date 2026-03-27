export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #070a08;
  --card: #0c110e;
  --acc: #00d45e;
  --amb: #d08800;
  --red: #c43030;
  --tx: #b8cec0;
  --td: #507060;
  --b: #162018;
  --ba: #1c3022;
  --font: 'Space Mono', monospace;
}

html, body, #root {
  height: 100%;
  background: var(--bg);
  color: var(--tx);
  font-family: var(--font);
  font-size: 10px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* TABULAR NUMS */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* SCROLLBAR */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--b); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--ba); }

/* TOPBAR */
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--card);
  border-bottom: 1px solid var(--b);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 20px;
  flex-wrap: wrap;
}

.topbar-logo {
  font-size: 15px;
  font-weight: 700;
  color: var(--acc);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.topbar-tag {
  font-size: 8px;
  color: var(--td);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.topbar-sep {
  flex: 1;
}

.topbar-clock {
  font-size: 13px;
  font-weight: 700;
  color: var(--tx);
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.sys-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.sys-dot.ok { background: var(--acc); }
.sys-dot.warn { background: var(--amb); }
.sys-dot.err { background: var(--red); }
.sys-dot.off { background: var(--td); }

.sys-counter {
  font-size: 9px;
  color: var(--td);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.sys-counter .ok { color: var(--acc); }
.sys-counter .warn { color: var(--amb); }
.sys-counter .err { color: var(--red); }

/* LOCK TOGGLE */
.lock-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.lock-label {
  font-size: 8px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--td);
}
.lock-label.unlocked { color: var(--amb); }

.switch {
  position: relative;
  width: 36px;
  height: 18px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  inset: 0;
  background: var(--b);
  border: 1px solid var(--ba);
  border-radius: 9px;
  transition: background 0.2s;
  cursor: pointer;
}
.slider::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  left: 2px;
  top: 2px;
  background: var(--td);
  border-radius: 50%;
  transition: transform 0.2s, background 0.2s;
}
input:checked + .slider { background: color-mix(in srgb, var(--amb) 20%, var(--b)); border-color: var(--amb); }
input:checked + .slider::before { transform: translateX(18px); background: var(--amb); }

/* ADD BUTTON */
.btn-add {
  position: relative;
  background: var(--b);
  border: 1px solid var(--ba);
  color: var(--acc);
  font-family: var(--font);
  font-size: 9px;
  padding: 5px 12px;
  cursor: pointer;
  letter-spacing: 0.06em;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.btn-add:hover { background: var(--ba); border-color: var(--acc); }

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--card);
  border: 1px solid var(--ba);
  min-width: 220px;
  z-index: 200;
  padding: 6px 0;
}

.dropdown-section {
  padding: 4px 12px 2px;
  font-size: 8px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--td);
  border-top: 1px solid var(--b);
  margin-top: 4px;
}
.dropdown-section:first-child { border-top: none; margin-top: 0; }

.dropdown-item {
  display: block;
  width: 100%;
  padding: 5px 12px;
  background: none;
  border: none;
  color: var(--tx);
  font-family: var(--font);
  font-size: 10px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}
.dropdown-item:hover { background: var(--ba); color: var(--acc); }

/* GRID */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px;
  padding: 16px 20px 40px;
}

/* CARD */
.card {
  background: var(--card);
  border: 1px solid var(--b);
  border-left: 2px solid transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, box-shadow 0.2s, border-left-color 0.2s, opacity 0.4s;
  min-height: 120px;
  opacity: 0;
}
.card.card-visible {
  opacity: 1;
}
.card:hover {
  border-color: var(--ba);
  border-left-color: var(--acc);
  box-shadow: inset 0 0 0 1px rgba(0,212,94,0.025);
}

.card.cols-3 { grid-column: span 3; }
.card.cols-4 { grid-column: span 4; }
.card.cols-6 { grid-column: span 6; }
.card.cols-8 { grid-column: span 8; }
.card.cols-12 { grid-column: span 12; }

.card.dragging { opacity: 0.5; }
.card.drag-over { border-color: var(--acc); }

/* CARD HEADER */
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--b);
  min-height: 36px;
  transition: background 0.2s;
}
.card-header:hover {
  background: rgba(0,212,94,0.02);
}

.drag-handle {
  color: var(--td);
  cursor: grab;
  font-size: 12px;
  letter-spacing: 2px;
  padding: 2px 4px;
  user-select: none;
  flex-shrink: 0;
}
.drag-handle:active { cursor: grabbing; }

.card-title {
  font-size: 8px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--td);
  flex: 1;
}

.card-badge {
  font-size: 8px;
  padding: 1px 6px;
  border: 1px solid var(--b);
  color: var(--td);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.card-badge.acc { border-color: var(--acc); color: var(--acc); }
.card-badge.amb { border-color: var(--amb); color: var(--amb); }

.btn-remove {
  background: none;
  border: 1px solid var(--b);
  color: var(--red);
  font-family: var(--font);
  font-size: 11px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.btn-remove:hover { background: color-mix(in srgb, var(--red) 15%, var(--card)); }

/* CARD BODY */
.card-body {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* SKELETON */
@keyframes skeleton-pulse {
  0%   { background: rgba(0,212,94,0.02); }
  50%  { background: rgba(0,212,94,0.06); }
  100% { background: rgba(0,212,94,0.02); }
}

.skeleton-card {
  opacity: 1 !important;
}

.skeleton-line {
  display: block;
  border-radius: 2px;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

/* EMPTY PLACEHOLDER */
.empty-placeholder {
  color: var(--td);
  font-size: 10px;
  padding: 10px 0;
  text-align: center;
}
.empty-placeholder.dashed {
  border: 1px dashed var(--b);
  padding: 12px;
  color: var(--td);
  font-size: 10px;
  text-align: center;
}

/* CLOCK CARD */
.clock-time {
  font-size: 44px;
  font-weight: 700;
  color: var(--acc);
  letter-spacing: 0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.clock-seconds {
  font-size: 28px;
  opacity: 0.7;
}
.clock-date {
  font-size: 10px;
  color: var(--td);
  margin-top: 2px;
  margin-bottom: 6px;
  line-height: 1.6;
}

.kpi-mini-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-mini-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.kpi-mini-label {
  font-size: 8px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--td);
  display: flex;
  justify-content: space-between;
}

.progress-bar-bg {
  height: 3px;
  background: var(--b);
  border-radius: 0;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--acc);
}
.progress-bar-fill.amb { background: var(--amb); }
.progress-bar-fill.red { background: var(--red); }
.progress-bar-fill.td { background: var(--td); }

/* KPI CARD */
.kpi-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kpi-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kpi-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.kpi-label { font-size: 10px; color: var(--tx); line-height: 1.6; }
.kpi-value { font-size: 10px; font-weight: 700; text-align: right; }
.kpi-bar-bg {
  height: 3px;
  background: var(--b);
  overflow: hidden;
}
.kpi-bar-fill {
  height: 100%;
}

/* REMINDER CARD */
.rem-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  max-height: 260px;
}

.rem-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid var(--b);
  background: var(--bg);
}

.rem-bullet {
  color: var(--acc);
  font-size: 14px;
  line-height: 1.4;
  flex-shrink: 0;
}

.rem-text {
  flex: 1;
  font-size: 10px;
  color: var(--tx);
  line-height: 1.6;
  word-break: break-word;
}

.btn-del {
  background: none;
  border: none;
  color: var(--td);
  font-family: var(--font);
  font-size: 13px;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
  line-height: 1;
  transition: color 0.15s;
}
.btn-del:hover { color: var(--red); }

.add-row {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.input-field {
  flex: 1;
  background: var(--bg);
  border: 1px solid var(--b);
  color: var(--tx);
  font-family: var(--font);
  font-size: 10px;
  padding: 5px 8px;
  outline: none;
  transition: border-color 0.2s;
}
.input-field:focus { border-color: var(--ba); }
.input-field::placeholder { color: var(--td); }

.btn-sm {
  background: var(--b);
  border: 1px solid var(--ba);
  color: var(--acc);
  font-family: var(--font);
  font-size: 9px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-sm:hover { background: var(--ba); }
.btn-sm.amb { color: var(--amb); }
.btn-sm.red { color: var(--red); }

/* TODO CARD */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  overflow-y: auto;
  max-height: 220px;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 5px 7px;
  border: 1px solid var(--b);
  background: var(--bg);
  transition: border-color 0.15s, background 0.15s;
}
.todo-item:hover {
  border-color: var(--ba);
  background: rgba(0,212,94,0.03);
}

.todo-cb {
  appearance: none;
  width: 13px;
  height: 13px;
  border: 1px solid var(--ba);
  background: var(--bg);
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
  transition: background 0.15s, border-color 0.15s;
}
.todo-cb:checked {
  background: var(--acc);
  border-color: var(--acc);
}
.todo-cb.amb:checked { background: var(--amb); border-color: var(--amb); }
.todo-cb:checked::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 1px;
  width: 5px;
  height: 7px;
  border: 2px solid var(--bg);
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.todo-text {
  flex: 1;
  font-size: 10px;
  color: var(--tx);
  line-height: 1.6;
  word-break: break-word;
  cursor: pointer;
}
.todo-text.done {
  text-decoration: line-through;
  color: var(--td);
}

.todo-del {
  transition: opacity 0.15s, transform 0.15s, color 0.15s;
  flex-shrink: 0;
}

/* NOTES CARD */
.notes-textarea {
  flex: 1;
  min-height: 180px;
  background: var(--bg);
  border: 1px solid var(--b);
  color: var(--tx);
  font-family: var(--font);
  font-size: 10px;
  line-height: 1.6;
  padding: 8px;
  outline: none;
  resize: vertical;
  width: 100%;
  transition: border-color 0.2s;
}
.notes-textarea:focus { border-color: var(--ba); }
.notes-textarea::placeholder { color: var(--td); }

/* TOOLS CARD */
.tools-table {
  width: 100%;
  border-collapse: collapse;
}

.tools-table th {
  text-align: left;
  font-size: 8px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--td);
  padding: 4px 8px;
  border-bottom: 1px solid var(--b);
  white-space: nowrap;
}

.tools-table td {
  padding: 6px 8px;
  font-size: 10px;
  color: var(--tx);
  border-bottom: 1px solid var(--b);
  vertical-align: middle;
  line-height: 1.6;
}

.tools-table tr:last-child td { border-bottom: none; }
.tools-table tbody tr:hover td { background: rgba(0,212,94,0.03); }

.status-dot-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 4px;
  font-family: var(--font);
  font-size: 10px;
  transition: opacity 0.15s;
}
.status-dot-btn:hover { opacity: 0.8; }

.status-label { color: var(--td); font-size: 8px; letter-spacing: 0.1em; }

.tool-cron { font-size: 10px; color: var(--td); }
.tool-scripts { font-size: 10px; color: var(--td); }
.tool-lastrun { font-size: 10px; color: var(--td); font-variant-numeric: tabular-nums; }

/* POMODORO CARD */
.pom-ring-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px auto;
  width: 128px;
  height: 128px;
}

.pom-ring-svg {
  position: absolute;
  inset: 0;
}

.pom-ring-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.pom-time {
  font-size: 44px;
  font-weight: 700;
  color: var(--acc);
  letter-spacing: 0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.pom-time.paused { color: var(--amb); }
.pom-time.break { color: var(--td); }

.pom-label {
  font-size: 8px;
  color: var(--td);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  margin-top: 4px;
}

.pom-bar-wrap {
  margin: 8px 0;
}

.pom-presets {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 6px;
}

.btn-preset {
  background: var(--bg);
  border: 1px solid var(--b);
  color: var(--td);
  font-family: var(--font);
  font-size: 9px;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.btn-preset:hover, .btn-preset.active {
  background: var(--b);
  border-color: var(--acc);
  color: var(--acc);
}

.pom-controls {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-pom {
  background: var(--b);
  border: 1px solid var(--ba);
  color: var(--tx);
  font-family: var(--font);
  font-size: 9px;
  padding: 5px 14px;
  cursor: pointer;
  letter-spacing: 0.06em;
  transition: background 0.15s, border-color 0.15s;
}
.btn-pom:hover { background: var(--ba); }
.btn-pom.start { border-color: var(--acc); color: var(--acc); }
.btn-pom.start:hover { background: color-mix(in srgb, var(--acc) 15%, var(--b)); }

/* RESPONSIVE */
@media (max-width: 1100px) {
  .card.cols-3, .card.cols-4 { grid-column: span 6; }
  .card.cols-6, .card.cols-8, .card.cols-12 { grid-column: span 12; }
}

@media (max-width: 700px) {
  .card.cols-3, .card.cols-4, .card.cols-6, .card.cols-8, .card.cols-12 { grid-column: span 12; }
  .topbar { gap: 10px; }
}

/* SEIA PIPELINE */
.seia-row { cursor: pointer; }
.seia-row:hover td { background: rgba(0,212,94,0.05) !important; color: var(--acc); }

/* LIVE LOG */
.log-pre { background: var(--bg); border: 1px solid var(--b); padding: 8px; font-size: 9px; line-height: 1.5; overflow-y: auto; max-height: 200px; color: var(--td); white-space: pre-wrap; word-break: break-all; flex: 1; }
.log-pre .log-err { color: var(--red); }
.log-pre .log-warn { color: var(--amb); }
.log-pre .log-ok { color: var(--acc); }

/* ALERTS */
.alert-item { display: flex; gap: 8px; align-items: flex-start; padding: 5px 7px; border: 1px solid var(--b); background: var(--bg); margin-bottom: 4px; }
.alert-badge { font-size: 7px; letter-spacing: 0.1em; padding: 1px 5px; flex-shrink: 0; }
.alert-badge.err { background: rgba(196,48,48,0.15); color: var(--red); border: 1px solid var(--red); }
.alert-badge.warn { background: rgba(208,136,0,0.15); color: var(--amb); border: 1px solid var(--amb); }
.alert-ts { font-size: 9px; color: var(--td); flex-shrink: 0; }
.alert-msg { font-size: 10px; color: var(--tx); flex: 1; }

/* EMPEX PIPELINE */
.stage-badge { font-size: 7px; letter-spacing: 0.08em; padding: 1px 6px; border: 1px solid; text-transform: uppercase; }
.stage-badge.prospecto { color: var(--td); border-color: var(--td); }
.stage-badge.cotizado { color: var(--amb); border-color: var(--amb); }
.stage-badge.en_ejecucion { color: var(--acc); border-color: var(--acc); }

/* INBOX */
.inbox-row { display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid var(--b); background: var(--bg); }
.inbox-count { font-size: 28px; font-weight: 700; color: var(--acc); font-variant-numeric: tabular-nums; }
.inbox-label { font-size: 9px; color: var(--td); letter-spacing: 0.06em; }

/* META SNAPSHOT */
.meta-campaign { border: 1px solid var(--b); padding: 8px; background: var(--bg); margin-bottom: 6px; }
.meta-campaign-name { font-size: 8px; letter-spacing: 0.1em; color: var(--td); text-transform: uppercase; margin-bottom: 6px; }
.meta-metrics { display: flex; gap: 12px; }
.meta-metric { text-align: center; }
.meta-metric-val { font-size: 16px; font-weight: 700; color: var(--acc); font-variant-numeric: tabular-nums; }
.meta-metric-label { font-size: 8px; color: var(--td); letter-spacing: 0.06em; }

/* SEIA LIVE BADGE */
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--acc); display: inline-block; animation: blink 2s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
.live-label { font-size: 8px; color: var(--acc); letter-spacing: 0.08em; }

/* TOPBAR ERR BADGE */
.topbar-err-badge { background: rgba(196,48,48,0.2); border: 1px solid var(--red); color: var(--red); font-size: 8px; padding: 2px 8px; letter-spacing: 0.1em; animation: pulse-red 2s ease-in-out infinite; }
@keyframes pulse-red { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* MOCK BADGE */
.mock-badge { font-size: 7px; padding: 1px 5px; border: 1px solid var(--amb); color: var(--amb); letter-spacing: 0.06em; }
`;
