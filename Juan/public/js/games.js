import { api } from './api.js';
import { escapeHtml, fileToResizedBase64, toast } from './utils.js';
import { openModal, closeModal, confirmAction } from './modals.js';

let GAMES = [];
const STATUS_ORDER = ['backlog', 'jugando', 'completado'];

export function getGames() {
  return GAMES;
}

function starString(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function render() {
  const list = document.getElementById('gamesList');
  if (!list) return;
  if (!GAMES.length) {
    list.innerHTML = '<div class="empty">Tu backlog está vacío. Agrega el primer juego.</div>';
    return;
  }
  list.innerHTML = GAMES.map((g) => `
    <div class="card game-card">
      <div class="game-cover">
        ${g.cover ? `<img src="${g.cover}" loading="lazy">` : `<svg width="30" height="30" viewBox="0 0 24 24" stroke="var(--text-faint)" fill="none" stroke-width="1.4"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v4M5 12h4M16.5 11.5h.01M19 13.5h.01"/></svg>`}
        <span class="game-status status-${g.status}" data-action="cycle-status" data-id="${g.id}">${g.status}</span>
      </div>
      <div class="game-body">
        <div class="game-title">${escapeHtml(g.title)}</div>
        <div class="game-plat">${escapeHtml(g.platform)} · ${g.hours}h</div>
        <div class="game-foot">
          <span class="stars-rating">${starString(g.rating)}</span>
          <button class="btn-danger btn" data-action="delete" data-id="${g.id}">✕</button>
        </div>
      </div>
    </div>`).join('');
}

export async function refreshGames() {
  GAMES = await api.list('games');
  render();
  document.dispatchEvent(new CustomEvent('nova:data-changed'));
}

function openCreateModal() {
  document.getElementById('j-title').value = '';
  document.getElementById('j-plat').value = '';
  document.getElementById('j-status').value = 'backlog';
  document.getElementById('j-rating').value = 0;
  document.getElementById('j-hours').value = 0;
  document.getElementById('j-file').value = '';
  openModal('modal-game');
}

async function handleSave() {
  const title = document.getElementById('j-title').value.trim();
  if (!title) return;
  let cover;
  const file = document.getElementById('j-file').files[0];
  if (file) cover = await fileToResizedBase64(file, 500);
  await api.create('games', {
    title,
    platform: document.getElementById('j-plat').value.trim() || '—',
    status: document.getElementById('j-status').value,
    rating: Number(document.getElementById('j-rating').value) || 0,
    hours: Number(document.getElementById('j-hours').value) || 0,
    cover,
  });
  closeModal('modal-game');
  await refreshGames();
  toast('Juego agregado');
}

async function handleListClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === 'delete') {
    if (!(await confirmAction('¿Eliminar este juego de tu catálogo?'))) return;
    await api.remove('games', id);
    await refreshGames();
    toast('Juego eliminado');
  } else if (btn.dataset.action === 'cycle-status') {
    const g = GAMES.find((x) => x.id === id);
    if (!g) return;
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(g.status) + 1) % STATUS_ORDER.length];
    await api.update('games', id, { status: next });
    await refreshGames();
  }
}

export function initGames() {
  document.getElementById('addGameBtn')?.addEventListener('click', openCreateModal);
  document.getElementById('saveGameBtn')?.addEventListener('click', handleSave);
  document.getElementById('gamesList')?.addEventListener('click', handleListClick);
}
