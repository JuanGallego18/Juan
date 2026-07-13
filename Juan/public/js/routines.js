import { api } from './api.js';
import { escapeHtml, escapeAttr, toast } from './utils.js';
import { openModal, closeModal, confirmAction } from './modals.js';

let ROUTINES = [];

function addExerciseRow(name = '', scheme = '') {
  const container = document.getElementById('exerciseRows');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'exercise-row';
  row.innerHTML = `
    <input placeholder="Ejercicio (ej. Dominadas)" class="ex-input-name" value="${escapeAttr(name)}">
    <input placeholder="4x8" class="ex-input-scheme" value="${escapeAttr(scheme)}">
    <button class="icon-x" data-remove-row="1">✕</button>`;
  row.querySelector('[data-remove-row]').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

function render() {
  const list = document.getElementById('routinesList');
  if (!list) return;
  if (!ROUTINES.length) {
    list.innerHTML = '<div class="empty">No has creado rutinas todavía. Arma tu primera sesión.</div>';
    return;
  }
  list.innerHTML = ROUTINES.map((r) => `
    <div class="card routine-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div class="goal-title">${escapeHtml(r.name)}</div>
          <span class="routine-tag">${escapeHtml(r.tag)}</span>
        </div>
        <button class="btn-danger btn" data-action="delete" data-id="${r.id}">Eliminar</button>
      </div>
      <ul>
        ${(r.exercises || []).map((e) => `<li><span class="ex-name">${escapeHtml(e.name)}</span><span class="ex-scheme">${escapeHtml(e.scheme)}</span></li>`).join('') || '<li><span class="ex-name">Sin ejercicios</span></li>'}
      </ul>
    </div>`).join('');
}

export async function refreshRoutines() {
  ROUTINES = await api.list('routines');
  render();
}

function openCreateModal() {
  document.getElementById('r-name').value = '';
  document.getElementById('r-tag').value = '';
  document.getElementById('exerciseRows').innerHTML = '';
  addExerciseRow();
  addExerciseRow();
  openModal('modal-routine');
}

async function handleSave() {
  const name = document.getElementById('r-name').value.trim();
  if (!name) return;
  const rows = document.querySelectorAll('#exerciseRows .exercise-row');
  const exercises = [];
  rows.forEach((r) => {
    const n = r.querySelector('.ex-input-name').value.trim();
    const s = r.querySelector('.ex-input-scheme').value.trim();
    if (n) exercises.push({ name: n, scheme: s || '—' });
  });
  await api.create('routines', { name, tag: document.getElementById('r-tag').value.trim() || 'General', exercises });
  closeModal('modal-routine');
  await refreshRoutines();
  toast('Rutina guardada');
}

async function handleListClick(e) {
  const btn = e.target.closest('[data-action="delete"]');
  if (!btn) return;
  if (!(await confirmAction('¿Eliminar esta rutina?'))) return;
  await api.remove('routines', btn.dataset.id);
  await refreshRoutines();
  toast('Rutina eliminada');
}

export function initRoutines() {
  document.getElementById('addRoutineBtn')?.addEventListener('click', openCreateModal);
  document.getElementById('addExerciseRowBtn')?.addEventListener('click', () => addExerciseRow());
  document.getElementById('saveRoutineBtn')?.addEventListener('click', handleSave);
  document.getElementById('routinesList')?.addEventListener('click', handleListClick);
}
