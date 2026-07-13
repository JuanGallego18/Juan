const TITLES = {
  hub: ['Hub', 'Tu centro de mando personal.'],
  metas: ['Metas', 'Lo que estás construyendo, y qué tan cerca estás.'],
  calistenia: ['Calistenia', 'Rutinas y evidencia visual de tu progreso.'],
  gastos: ['Gastos', 'Control mensual de tus finanzas.'],
  juegos: ['Juegos', 'Tu backlog, tu librería, tu historial.'],
};

const EYEBROWS = {
  hub: 'SISTEMA — EN LÍNEA',
  metas: 'SEGUIMIENTO DE OBJETIVOS',
  calistenia: 'REGISTRO FÍSICO',
  gastos: 'CONTROL FINANCIERO',
  juegos: 'LIBRERÍA',
};

// Qué hace el botón flotante "+" en cada sección
const FAB_TARGETS = {
  hub: 'addGoalBtn',
  metas: 'addGoalBtn',
  gastos: 'addExpenseBtn',
  juegos: 'addGameBtn',
};

export function initNav() {
  const navDots = document.querySelectorAll('.nav-dot');
  const sections = document.querySelectorAll('.section');
  const fab = document.getElementById('fabAdd');

  function switchSection(name) {
    document.body.dataset.section = name;
    navDots.forEach((d) => d.classList.toggle('active', d.dataset.section === name));
    sections.forEach((s) => s.classList.toggle('visible', s.id === 'sec-' + name));
    // El topbar (título, subtítulo, "eyebrow") es su propia sección — si
    // se borró, la navegación entre pantallas debe seguir funcionando igual.
    const title = TITLES[name] || ['', ''];
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const eyebrowText = document.getElementById('eyebrowText');
    if (pageTitle) pageTitle.textContent = title[0];
    if (pageSubtitle) pageSubtitle.textContent = title[1];
    if (eyebrowText) eyebrowText.textContent = EYEBROWS[name] || '';

    if (!fab) return;
    if (name === 'calistenia') {
      const activeSub = document.querySelector('.subtab.active')?.dataset.sub || 'rutinas';
      fab.onclick = () => document.getElementById(activeSub === 'rutinas' ? 'addRoutineBtn' : 'addPhotoBtn')?.click();
    } else {
      const targetId = FAB_TARGETS[name];
      fab.onclick = () => document.getElementById(targetId)?.click();
    }
  }

  navDots.forEach((dot) => dot.addEventListener('click', () => switchSection(dot.dataset.section)));

  document.querySelectorAll('.subtab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.subtab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.subview').forEach((v) => v.classList.remove('visible'));
      document.getElementById('sub-' + tab.dataset.sub)?.classList.add('visible');
      if (fab && document.getElementById('sec-calistenia')?.classList.contains('visible')) {
        fab.onclick = () => document.getElementById(tab.dataset.sub === 'rutinas' ? 'addRoutineBtn' : 'addPhotoBtn')?.click();
      }
    });
  });

  switchSection('hub');

  function updateClock() {
    const clockBox = document.getElementById('clockBox');
    const greeting = document.getElementById('greeting');
    if (!clockBox && !greeting) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (clockBox) clockBox.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1) + ' · ' + timeStr;
    const h = now.getHours();
    const greet = h < 12 ? 'BUENOS DÍAS, COMANDANTE' : h < 19 ? 'BUENAS TARDES, COMANDANTE' : 'BUENAS NOCHES, COMANDANTE';
    if (greeting) greeting.textContent = greet;
  }
  updateClock();
  setInterval(updateClock, 30000);
}
