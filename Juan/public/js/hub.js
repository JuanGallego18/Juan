// Lógica exclusiva del Reloj Futurista para el Hub
export function initHub() {
  const relojEl = document.getElementById('relojPrincipal');
  const fechaEl = document.getElementById('fechaPrincipal');
  const anilloSeg = document.getElementById('anilloSegundos');

  if (!relojEl || !fechaEl) return;

  // El radio (142) debe coincidir con el que está en
  // partials/05-hub.html dentro del <svg class="reloj-anillo">.
  const CIRC_SEG = 2 * Math.PI * 142;
  if (anilloSeg) anilloSeg.style.strokeDasharray = `${CIRC_SEG}`;

  function actualizarReloj() {
    const ahora = new Date();

    // Formato de hora (ej. 14:05:09)
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    relojEl.textContent = `${horas}:${minutos}:${segundos}`;

    // Formato de fecha (ej. 12 JUL 2026)
    const opcionesFecha = { day: '2-digit', month: 'short', year: 'numeric' };
    const fechaStr = ahora.toLocaleDateString('es-ES', opcionesFecha).toUpperCase();
    fechaEl.textContent = fechaStr;

    // El anillo da una vuelta completa cada 60 segundos
    if (anilloSeg) {
      const progreso = ahora.getSeconds() / 60;
      anilloSeg.style.strokeDashoffset = `${CIRC_SEG * (1 - progreso)}`;
    }
  }

  // Ejecutar inmediatamente para evitar parpadeos y luego cada segundo
  actualizarReloj();
  setInterval(actualizarReloj, 1000);
}
