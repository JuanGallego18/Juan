import { api } from './api.js';
import { escapeHtml, fileToResizedBase64, toast } from './utils.js';
import { openModal, closeModal, confirmAction } from './modals.js';

let PHOTOS = [];

function render() {
  const grid = document.getElementById('photosList');
  if (!grid) return;
  if (!PHOTOS.length) {
    grid.innerHTML = '<div class="empty">Sin fotos de progreso todavía. Documenta tu evolución.</div>';
    return;
  }
  grid.innerHTML = PHOTOS.map((p) => `
    <div class="photo-item">
      <img src="${p.file}" alt="progreso" loading="lazy">
      <button class="btn-danger btn" data-action="delete" data-id="${p.id}">✕</button>
      <div class="photo-overlay">${p.date || ''}${p.note ? ' · ' + escapeHtml(p.note) : ''}</div>
    </div>`).join('');
}

export async function refreshPhotos() {
  PHOTOS = await api.list('photos');
  render();
}

function openCreateModal() {
  document.getElementById('p-file').value = '';
  document.getElementById('p-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('p-note').value = '';
  openModal('modal-photo');
}

async function handleSave() {
  const fileInput = document.getElementById('p-file');
  const file = fileInput.files[0];
  if (!file) return;
  const image = await fileToResizedBase64(file, 900);
  await api.create('photos', {
    image,
    date: document.getElementById('p-date').value,
    note: document.getElementById('p-note').value.trim(),
  });
  closeModal('modal-photo');
  await refreshPhotos();
  toast('Foto guardada');
}

async function handleListClick(e) {
  const btn = e.target.closest('[data-action="delete"]');
  if (!btn) return;
  if (!(await confirmAction('¿Eliminar esta foto de progreso?'))) return;
  await api.remove('photos', btn.dataset.id);
  await refreshPhotos();
  toast('Foto eliminada');
}

export function initPhotos() {
  document.getElementById('addPhotoBtn')?.addEventListener('click', openCreateModal);
  document.getElementById('savePhotoBtn')?.addEventListener('click', handleSave);
  document.getElementById('photosList')?.addEventListener('click', handleListClick);
}
