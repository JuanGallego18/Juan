// Ojo: getElementById puede devolver null si alguien borró ese modal
// del HTML — por eso todo aquí usa "?." en vez de asumir que existe.

export function openModal(id) {
  document.getElementById(id)?.classList.add('visible');
}

export function closeModal(id) {
  document.getElementById(id)?.classList.remove('visible');
}

export function initModals() {
  document.querySelectorAll('.modal-bg').forEach((bg) => {
    bg.addEventListener('click', (e) => {
      if (e.target === bg) bg.classList.remove('visible');
    });
  });
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
}

/**
 * Modal de confirmación reutilizable — se usa antes de borrar cualquier
 * meta, gasto, rutina, foto o juego, para evitar borrados accidentales.
 * Devuelve una promesa: true si el usuario confirma, false si cancela.
 * Si el modal "modal-confirm" no existe en la página (por ejemplo, si
 * alguien borró partials/16-modal-confirmar.html), no bloquea la acción.
 */
export function confirmAction(message, title = '¿Eliminar este registro?') {
  return new Promise((resolve) => {
    const bg = document.getElementById('modal-confirm');
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOkBtn');

    if (!bg || !titleEl || !msgEl || !okBtn) {
      resolve(true);
      return;
    }

    titleEl.textContent = title;
    msgEl.textContent = message;

    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      okBtn.removeEventListener('click', onOk);
      observer.disconnect();
      resolve(result);
    };
    const onOk = () => {
      closeModal('modal-confirm');
      finish(true);
    };
    // Si el modal se cierra por "Cancelar" o por clic fuera, resolvemos false.
    const observer = new MutationObserver(() => {
      if (!bg.classList.contains('visible')) finish(false);
    });

    okBtn.addEventListener('click', onOk);
    observer.observe(bg, { attributes: true, attributeFilter: ['class'] });
    openModal('modal-confirm');
  });
}
