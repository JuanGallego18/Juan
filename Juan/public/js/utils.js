export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[m]));
}

export function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

export function fmtMoney(n) {
  return '$' + Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

// Muestra una notificación breve en la esquina (arriba a la derecha).
// type: 'info' (por defecto) o 'error'.
export function toast(message, type = 'info') {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' toast-error' : '');
  el.innerHTML = `<span class="toast-dot"></span><span>${escapeHtml(message)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 320);
  }, 2600);
}

// Anima un número dentro de un elemento (para los contadores del Hub).
// format recibe el valor intermedio y debe devolver el texto a mostrar.
export function animateNumber(el, to, { duration = 700, format = (n) => Math.round(n).toString() } = {}) {
  if (!el) return;
  const from = Number(el.dataset.rawValue || 0);
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  el.dataset.rawValue = to;
  requestAnimationFrame(step);
}

// Redimensiona una imagen en el navegador y la devuelve como base64 (dataURL)
export function fileToResizedBase64(file, maxW = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = img.width * scale;
        const h = img.height * scale;
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
