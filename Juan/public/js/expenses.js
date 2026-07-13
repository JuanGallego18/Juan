import { api } from './api.js';
import { escapeHtml, fmtMoney, toast } from './utils.js';
import { openModal, closeModal, confirmAction } from './modals.js';

let EXPENSES = [];

const CAT_ICON = {
  Vivienda: '🏠', Comida: '🍽️', Transporte: '🚌', 'Moto/Carro': '🚗',
  Tecnología: '💻', Entretenimiento: '🎮', Salud: '💊', Otros: '✨',
};

export function getExpenses() {
  return EXPENSES;
}

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

// Usado por hub.js para el stat "Gasto del mes": lo fijo + lo variable de este mes (el ahorro no es gasto)
export function currentMonthExpenses() {
  return EXPENSES.filter((e) => e.type === 'fijo' || (e.type === 'variable' && isThisMonth(e.date)));
}

// Usado por hub.js para su vista previa "Últimos gastos".
export function recentExpenses(n = 5) {
  return [...EXPENSES]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, n);
}

// Exportada para que hub.js pueda pintar la misma fila sin duplicar el HTML.
export function expenseRowHtml(e) {
  return `
    <div class="exp-row">
      <div class="exp-left">
        <span class="exp-dot" style="background:var(--${e.type});"></span>
        <span>${escapeHtml(e.desc)}</span>
        <span class="exp-cat">${escapeHtml(e.cat || e.type)}</span>
      </div>
      <span class="exp-amount">${fmtMoney(e.amount)}</span>
    </div>`;
}

function byType(type) {
  return EXPENSES.filter((e) => e.type === type);
}

/* ---------------- Resumen / Donut ---------------- */

function renderResumen() {
  const totalEl = document.getElementById('total-balance');
  const donut = document.getElementById('expenseDonut');
  const legend = document.getElementById('expenseLegend');
  if (!totalEl || !donut || !legend) return;

  const fijos = byType('fijo').reduce((s, e) => s + Number(e.amount || 0), 0);
  const variables = byType('variable').filter((e) => isThisMonth(e.date)).reduce((s, e) => s + Number(e.amount || 0), 0);
  const ahorro = byType('ahorro').reduce((s, e) => s + Number(e.amount || 0), 0);
  const total = fijos + variables + ahorro;

  totalEl.textContent = fmtMoney(total);

  if (total > 0) {
    const p1 = (fijos / total) * 100;
    const p2 = (variables / total) * 100;
    donut.style.background = `conic-gradient(var(--fijo) 0% ${p1}%, var(--variable) ${p1}% ${p1 + p2}%, var(--ahorro) ${p1 + p2}% 100%)`;
  } else {
    donut.style.background = 'conic-gradient(var(--border) 0% 100%)';
  }

  const rows = [
    ['Gastos fijos', fijos, 'var(--fijo)'],
    ['Gastos variables', variables, 'var(--variable)'],
    ['Ahorro acumulado', ahorro, 'var(--ahorro)'],
  ];
  legend.innerHTML = rows.map(([label, val, color]) => `
    <div class="legend-row">
      <span class="dot" style="background:${color};"></span>
      <span class="legend-label">${label}</span>
      <span class="legend-val">${fmtMoney(val)}</span>
      <span class="legend-pct">${total > 0 ? Math.round((val / total) * 100) : 0}%</span>
    </div>`).join('');
}

/* ---------------- Gastos Fijos ---------------- */

function renderFijos() {
  const list = document.getElementById('lista-fijos');
  if (!list) return;
  const items = byType('fijo');
  if (!items.length) {
    list.innerHTML = '<div class="empty" style="padding:20px 10px;">Sin gastos fijos todavía.</div>';
    return;
  }
  list.innerHTML = items.map((e) => `
    <li class="expense-item fijo-item">
      <div class="exp-top">
        <span class="exp-icon">${CAT_ICON[e.cat] || '✨'}</span>
        <div class="exp-info">
          <span class="exp-name">${escapeHtml(e.desc)}</span>
          <span class="exp-cat">${escapeHtml(e.cat || '')}</span>
        </div>
        <strong class="exp-amount">${fmtMoney(e.amount)}</strong>
        <button class="btn-danger btn" data-action="delete" data-id="${e.id}">✕</button>
      </div>
      <div class="exp-bottom">
        <button class="pill ${e.paid ? 'pill-paid' : 'pill-pending'}" data-action="toggle-paid" data-id="${e.id}">${e.paid ? 'Pagado' : 'Pendiente'}</button>
        <div class="mini-track"><div class="mini-fill fijo-fill" style="width:${e.paid ? 100 : 35}%"></div></div>
      </div>
    </li>`).join('');
}

/* ---------------- Gastos Variables ---------------- */

function renderVariables() {
  const list = document.getElementById('lista-variables');
  const bars = document.getElementById('variablesBars');
  if (!list || !bars) return;
  const items = byType('variable').filter((e) => isThisMonth(e.date));
  if (!items.length) {
    list.innerHTML = '<div class="empty" style="padding:20px 10px;">Sin gastos variables este mes.</div>';
  } else {
    list.innerHTML = items.map((e) => `
      <li class="expense-item">
        <span class="exp-icon">${CAT_ICON[e.cat] || '✨'}</span>
        <div class="exp-info">
          <span class="exp-name">${escapeHtml(e.desc)}</span>
          <span class="exp-cat">${escapeHtml(e.cat || '')}</span>
        </div>
        <strong class="exp-amount">${fmtMoney(e.amount)}</strong>
        <button class="btn-danger btn" data-action="delete" data-id="${e.id}">✕</button>
      </li>`).join('');
  }

  // Mini gráfico de barras por categoría
  const byCat = {};
  items.forEach((e) => { byCat[e.cat] = (byCat[e.cat] || 0) + Number(e.amount || 0); });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = cats.length ? cats[0][1] : 0;
  bars.innerHTML = cats.map(([cat, val]) => `
    <div class="mini-bar-row">
      <span class="mini-bar-label">${escapeHtml(cat)}</span>
      <div class="mini-track"><div class="mini-fill variable-fill" style="width:${max ? (val / max) * 100 : 0}%"></div></div>
      <span class="mini-bar-val">${fmtMoney(val)}</span>
    </div>`).join('');
}

/* ---------------- Ahorros ---------------- */

function renderAhorros() {
  const list = document.getElementById('lista-ahorros');
  if (!list) return;
  const items = byType('ahorro');
  if (!items.length) {
    list.innerHTML = '<div class="empty" style="padding:20px 10px;">Aún no tienes metas de ahorro.</div>';
    return;
  }
  list.innerHTML = items.map((e) => {
    const meta = Number(e.meta || 0);
    const pct = meta > 0 ? Math.min(100, Math.round((e.amount / meta) * 100)) : null;
    return `
    <li class="expense-item savings-item">
      <div class="exp-top">
        <span class="exp-icon">⭐</span>
        <div class="exp-info">
          <span class="exp-name">${escapeHtml(e.desc)}</span>
          <span class="exp-cat">${meta > 0 ? `Meta: ${fmtMoney(meta)}` : 'Sin meta fija'}</span>
        </div>
        <strong class="exp-amount">${fmtMoney(e.amount)}</strong>
        <button class="btn-danger btn" data-action="delete" data-id="${e.id}">✕</button>
      </div>
      <div class="mini-track"><div class="mini-fill ahorro-fill" style="width:${pct !== null ? pct : 100}%"></div></div>
      ${pct !== null ? `<span class="savings-pct">${pct}%</span>` : ''}
    </li>`;
  }).join('');
}

// Esta sección SOLO pinta el resumen, fijos, variables y ahorros de
// #sec-gastos. La vista previa "Últimos gastos" del Hub la arma hub.js
// por su cuenta con recentExpenses()/expenseRowHtml() — así que si
// #sec-gastos se borra del HTML, el Hub y las demás pantallas no se
// ven afectados.
function render() {
  renderResumen();
  renderFijos();
  renderVariables();
  renderAhorros();
}

export async function refreshExpenses() {
  EXPENSES = await api.list('expenses');
  render();
  document.dispatchEvent(new CustomEvent('nova:data-changed'));
}

/* ---------------- Modal ---------------- */

const TYPE_LABELS = {
  fijo: { title: 'Nuevo gasto fijo', desc: 'Ej. Renta, Internet, Netflix', amount: 'Monto mensual' },
  variable: { title: 'Nuevo gasto variable', desc: 'Ej. Mercado, Gasolina, Salida', amount: 'Monto' },
  ahorro: { title: 'Nueva meta de ahorro', desc: 'Ej. Viaje a Andrómeda', amount: 'Monto ahorrado hasta ahora' },
};

function syncModalFields() {
  const type = document.getElementById('e-type').value;
  const t = TYPE_LABELS[type];
  document.getElementById('expenseModalTitle').textContent = t.title;
  document.getElementById('e-desc-label').textContent = t.desc;
  document.getElementById('e-amount-label').textContent = t.amount;
  document.getElementById('e-cat-field').style.display = type === 'ahorro' ? 'none' : '';
  document.getElementById('e-meta-field').style.display = type === 'ahorro' ? '' : 'none';
  document.getElementById('e-paid-field').style.display = type === 'fijo' ? '' : 'none';
}

function openCreateModal(presetType) {
  document.getElementById('e-type').value = presetType || 'variable';
  document.getElementById('e-desc').value = '';
  document.getElementById('e-amount').value = '';
  document.getElementById('e-meta').value = '';
  document.getElementById('e-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('e-cat').value = 'Otros';
  document.getElementById('e-paid').checked = false;
  syncModalFields();
  openModal('modal-expense');
}

async function handleSave() {
  const type = document.getElementById('e-type').value;
  const desc = document.getElementById('e-desc').value.trim();
  const amount = Number(document.getElementById('e-amount').value);
  if (!desc || !amount || amount <= 0) return;

  const payload = {
    type,
    desc,
    amount,
    date: document.getElementById('e-date').value || new Date().toISOString().slice(0, 10),
  };
  if (type === 'ahorro') {
    payload.meta = Number(document.getElementById('e-meta').value) || 0;
  } else {
    payload.cat = document.getElementById('e-cat').value;
  }
  if (type === 'fijo') {
    payload.paid = document.getElementById('e-paid').checked;
  }

  await api.create('expenses', payload);
  closeModal('modal-expense');
  await refreshExpenses();
  toast('Registro guardado');
}

async function handleListClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === 'delete') {
    if (!(await confirmAction('¿Eliminar este registro?'))) return;
    await api.remove('expenses', id);
    await refreshExpenses();
    toast('Registro eliminado');
  } else if (btn.dataset.action === 'toggle-paid') {
    const item = EXPENSES.find((x) => x.id === id);
    if (!item) return;
    await api.update('expenses', id, { paid: !item.paid });
    await refreshExpenses();
  }
}

export function initExpenses() {
  document.getElementById('addExpenseBtn')?.addEventListener('click', () => openCreateModal('variable'));
  document.getElementById('e-type')?.addEventListener('change', syncModalFields);
  document.getElementById('saveExpenseBtn')?.addEventListener('click', handleSave);

  document.querySelectorAll('[data-open-type]').forEach((btn) => {
    btn.addEventListener('click', () => openCreateModal(btn.dataset.openType));
  });

  document.getElementById('lista-fijos')?.addEventListener('click', handleListClick);
  document.getElementById('lista-variables')?.addEventListener('click', handleListClick);
  document.getElementById('lista-ahorros')?.addEventListener('click', handleListClick);
}
