import { loadPartials } from './include.js';
import { initStars } from './stars.js';
import { initNav } from './nav.js';
import { initModals } from './modals.js';
import { initGoals, refreshGoals } from './goals.js';
import { initRoutines, refreshRoutines } from './routines.js';
import { initPhotos, refreshPhotos } from './photos.js';
import { initExpenses, refreshExpenses } from './expenses.js';
import { initGames, refreshGames } from './games.js';
import { initHub } from './hub.js';

async function init() {
  // 1. Traer cada sección desde partials/ e insertarla en la página.
  await loadPartials();

  // 2. Con el HTML ya en el DOM, inicializar cada módulo. Cada init()
  //    solo engancha eventos de SU sección — si otra sección falta o
  //    tiene un error, esta llamada no se ve afectada.
  initStars();
  initNav();
  initModals();

  initGoals();
  initRoutines();
  initPhotos();
  initExpenses();
  initGames();
  initHub();

  // 3. Traer los datos guardados. Cada refresh() está aislado: si uno
  //    falla, los demás igual terminan de cargar sus datos.
  await Promise.allSettled([
    refreshGoals(),
    refreshRoutines(),
    refreshPhotos(),
    refreshExpenses(),
    refreshGames(),
  ]);

  // 4. Ocultar la pantalla de carga.
  document.getElementById('bootVeil')?.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', init);

