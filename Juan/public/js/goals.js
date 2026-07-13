import { api } from './api.js';
import { escapeHtml, toast } from './utils.js';
import { openModal, closeModal, confirmAction } from './modals.js';

let GOALS = [];

export function getGoals() {
  return GOALS;
}

// Exportada para que hub.js pueda reusar exactamente la misma tarjeta
// en su vista previa de "Metas activas", sin duplicar el HTML.
export function goalCardHtml(g) {
  return `
    <div class="card goal-card">
      <div class="goal-top">
        <div>
          <div class="goal-title">${escapeHtml(g.title)}</div>
          <span class="goal-cat">${escapeHtml(g.cat)}</span>
        </div>
        <div class="goal-pct">${g.pct}%</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${g.pct}%"></div></div>
      ${g.notes ? `<div class="goal-notes">${escapeHtml(g.notes)}</div>` : ''}
      <div class="goal-meta">${g.date ? 'Meta: ' + g.date : 'Sin fecha límite'}</div>
      <div class="modal-actions" style="margin-top:14px;justify-content:space-between;">
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost" style="padding:4px 9px;font-size:12px;" data-action="bump" data-id="${g.id}" data-delta="-10">-10</button>
          <button class="btn btn-ghost" style="padding:4px 9px;font-size:12px;" data-action="bump" data-id="${g.id}" data-delta="10">+10</button>
        </div>
        <button class="btn-danger btn" data-action="delete" data-id="${g.id}">Eliminar</button>
      </div>
    </div>`;
}

// Esta sección SOLO pinta #goalsList. La vista previa del Hub la arma
// hub.js por su cuenta, reusando goalCardHtml() de arriba — así que si
// #goalsList no existe (por ejemplo, se borró esta sección del HTML),
// esto no rompe nada más.
function render() {
  const list = document.getElementById('goalsList');
  if (!list) return;
  if (!GOALS.length) {
    list.innerHTML = '<div class="empty">Aún no tienes metas registradas. Crea la primera y empieza a trazar tu órbita.</div>';
    return;
  }
  list.innerHTML = GOALS.map(goalCardHtml).join('');
}

export async function refreshGoals() {
  GOALS = await api.list('goals');
  render();
  document.dispatchEvent(new CustomEvent('nova:data-changed'));
}

function openCreateModal() {
  document.getElementById('g-title').value = '';
  document.getElementById('g-cat').value = '';
  document.getElementById('g-pct').value = 0;
  document.getElementById('g-date').value = '';
  document.getElementById('g-notes').value = '';
  openModal('modal-goal');
}

async function handleSave() {
  const title = document.getElementById('g-title').value.trim();
  if (!title) return;
  await api.create('goals', {
    title,
    cat: document.getElementById('g-cat').value.trim() || 'General',
    pct: Number(document.getElementById('g-pct').value) || 0,
    date: document.getElementById('g-date').value,
    notes: document.getElementById('g-notes').value.trim(),
  });
  closeModal('modal-goal');
  await refreshGoals();
  toast('Meta guardada');
}

// Exportado: hub.js lo reusa para que los botones (+10/-10/Eliminar)
// funcionen igual en la vista previa del Hub que en la pantalla de Metas.
export async function handleGoalActionClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === 'delete') {
    if (!(await confirmAction('¿Eliminar esta meta? Se perderá su progreso.'))) return;
    await api.remove('goals', id);
    await refreshGoals();
    toast('Meta eliminada');
  } else if (btn.dataset.action === 'bump') {
    const g = GOALS.find((x) => x.id === id);
    if (!g) return;
    const pct = Math.max(0, Math.min(100, g.pct + Number(btn.dataset.delta)));
    await api.update('goals', id, { pct });
    await refreshGoals();
  }
}

export function initGoals() {
  document.getElementById('addGoalBtn')?.addEventListener('click', openCreateModal);
  document.getElementById('saveGoalBtn')?.addEventListener('click', handleSave);
  document.getElementById('goalsList')?.addEventListener('click', handleGoalActionClick);
}
