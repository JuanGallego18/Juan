# Guía de edición de NOVA — Hub Personal

Este proyecto está organizado en archivos pequeños y con nombres
descriptivos, cada uno responsable de UNA sola cosa: **una sección
visual = un archivo de HTML = (normalmente) un archivo de CSS = un
archivo de JS.** La idea es que cualquier IA (o persona) pueda editar
o incluso borrar una parte sin tocar ni romper el resto.

**Si estás usando otra IA (Gemini, etc.) para modificar este
proyecto, pégale este archivo completo al principio de la
conversación.** Así entiende la estructura de una vez y tú solo
tienes que decirle el nombre del archivo o de la sección que quieres
cambiar.

---

## 1. Estructura general

```
nova-hub/
├── public/
│   ├── index.html              ← SOLO el esqueleto: casi no tiene contenido,
│   │                              solo apunta a los archivos de partials/
│   ├── partials/                ← aquí vive el HTML real, un archivo por sección
│   │   ├── 01-fondo-galactico.html
│   │   ├── 02-marca-flotante.html
│   │   ├── 03-dock-navegacion.html
│   │   ├── 04-topbar.html
│   │   ├── 05-hub.html
│   │   ├── 06-metas.html
│   │   ├── 07-calistenia.html
│   │   ├── 08-gastos.html
│   │   ├── 09-juegos.html
│   │   ├── 10-boton-flotante.html
│   │   ├── 11-modal-meta.html
│   │   ├── 12-modal-rutina.html
│   │   ├── 13-modal-foto.html
│   │   ├── 14-modal-gasto.html
│   │   ├── 15-modal-juego.html
│   │   └── 16-modal-confirmar.html
│   ├── css/
│   │   ├── styles.css          ← SOLO importa los archivos de abajo, no tocar
│   │   └── secciones/          ← aquí vive el CSS real, un archivo por tema
│   │       ├── 01-colores-y-fuentes.css
│   │       ├── 02-fondo-galactico.css
│   │       ├── 03-marca-flotante.css
│   │       ├── 04-dock-navegacion.css
│   │       ├── 05-layout-topbar.css
│   │       ├── 06-tarjetas-base.css
│   │       ├── 07-botones.css
│   │       ├── 08-hero-hub.css
│   │       ├── 09-encabezados-subtabs.css
│   │       ├── 10-metas.css
│   │       ├── 11-calistenia.css
│   │       ├── 12-gastos.css
│   │       ├── 13-juegos.css
│   │       ├── 14-modales.css
│   │       ├── 15-boton-flotante.css
│   │       ├── 16-utilidades.css
│   │       └── 17-interactividad.css   ← toasts, confirmar borrado, pantalla de carga
│   └── js/                     ← dividido por función, un módulo = una sección
│       ├── include.js          ← carga los archivos de partials/ dentro de index.html
│       ├── main.js             ← arranca todo, en orden
│       ├── nav.js, modals.js, stars.js, utils.js, api.js
│       ├── hub.js              ← SOLO arma el resumen del Hub (lee datos de los demás)
│       ├── goals.js, routines.js, photos.js, expenses.js, games.js
└── server/                     ← backend (Express), no relacionado al diseño
```

### ¿Por qué está dividido así? (el problema que esto resuelve)

Antes, todo el HTML vivía en un solo `index.html`, y algunas pantallas
escribían directamente sobre el HTML de otras (por ejemplo, la lógica
de Metas y de Gastos escribía directamente dentro del Hub). Por eso,
si borrabas algo del Hub, sin querer rompías Metas o Gastos también.

Ahora:
- **Cada sección vive en su propio archivo** dentro de `partials/`.
  Borrar o dañar uno de esos archivos SOLO afecta a esa sección — el
  resto de la página sigue funcionando.
- **El Hub ya no depende de que otras secciones "le escriban
  encima".** `hub.js` arma su propio resumen leyendo datos de los
  demás módulos (`getGoals()`, `getGames()`, etc.), sin tocar el HTML
  de Metas, Gastos o Juegos. Y si el Hub se borra, esos módulos ni se
  enteran: siguen funcionando en su propia pantalla.
- **Todo el código revisa que el elemento exista antes de usarlo.**
  Si accidentalmente borras un botón o un contenedor, esa sola pieza
  deja de actualizarse — no se cae toda la aplicación.

## 2. "Quiero cambiar..." → "edita este archivo"

| Quiero cambiar...                                             | Archivo(s)                                  |
|-----------------------------------------------------------------|--------------------------------------------|
| El contenido/estructura de la pantalla Hub                      | `partials/05-hub.html`                     |
| El contenido/estructura de la pantalla Metas                    | `partials/06-metas.html`                   |
| El contenido/estructura de Calistenia (rutinas y fotos)         | `partials/07-calistenia.html`              |
| El contenido/estructura de Gastos                                | `partials/08-gastos.html`                  |
| El contenido/estructura de Juegos                                | `partials/09-juegos.html`                  |
| El formulario de una meta / rutina / foto / gasto / juego        | `partials/11` a `15-modal-*.html`          |
| El texto del cuadro de "¿Eliminar?"                              | `partials/16-modal-confirmar.html`         |
| El logo NOVA, el dock de navegación, el fondo, el reloj          | `partials/01` a `04-*.html`                |
| Colores generales, tipografía, paleta por sección                | `css/secciones/01-colores-y-fuentes.css`   |
| El fondo (estrellas, nebulosa, grid del piso)                    | `css/secciones/02-fondo-galactico.css`     |
| El logo "NOVA" de arriba a la izquierda                          | `css/secciones/03-marca-flotante.css`      |
| El dock/menú flotante de iconos de abajo                         | `css/secciones/04-dock-navegacion.css`     |
| El ancho del contenido, el reloj, el título de cada pantalla     | `css/secciones/05-layout-topbar.css`       |
| El estilo general de las tarjetas (cards)                        | `css/secciones/06-tarjetas-base.css`       |
| Los botones                                                      | `css/secciones/07-botones.css`             |
| La tarjeta grande de bienvenida del Hub                          | `css/secciones/08-hero-hub.css`            |
| Los títulos de sección y las pestañas (subtabs)                  | `css/secciones/09-encabezados-subtabs.css` |
| El estilo de la pantalla de Metas                                | `css/secciones/10-metas.css`               |
| El estilo de Calistenia (rutinas y fotos)                        | `css/secciones/11-calistenia.css`          |
| El estilo de Gastos (dona, tarjetas de vidrio)                   | `css/secciones/12-gastos.css`              |
| El estilo de Juegos                                              | `css/secciones/13-juegos.css`              |
| El estilo de las ventanas emergentes (modales)                   | `css/secciones/14-modales.css`             |
| El botón circular flotante "+"                                   | `css/secciones/15-boton-flotante.css`      |
| Ajustes para pantallas pequeñas (celular)                        | `css/secciones/16-utilidades.css`          |
| Notificaciones, confirmar borrado, pantalla de carga              | `css/secciones/17-interactividad.css`      |
| La lógica de gastos (sumar, guardar, listar)                     | `public/js/expenses.js`                    |
| La lógica de metas                                               | `public/js/goals.js`                       |
| La lógica de rutinas                                             | `public/js/routines.js`                    |
| La lógica de fotos de progreso                                   | `public/js/photos.js`                      |
| La lógica del catálogo de juegos                                 | `public/js/games.js`                       |
| El resumen del Hub (tarjetas de stats y vistas previas)          | `public/js/hub.js`                         |
| A qué pantalla lleva cada botón del dock, el reloj               | `public/js/nav.js`                         |
| Cómo abren/cierran las ventanas emergentes, el cuadro de confirmar | `public/js/modals.js`                    |
| Las notificaciones ("toast") y el contador animado de números    | `public/js/utils.js`                       |
| La animación de estrellas del fondo                              | `public/js/stars.js`                       |
| Cómo se cargan los archivos de `partials/` dentro de la página   | `public/js/include.js`                     |

## 3. Cómo pedir un cambio (ejemplos de mensajes para una IA)

- "Abre `css/secciones/04-dock-navegacion.css` y hazlo más grande."
- "En `partials/08-gastos.html`, cambia el ícono 🪐 por otro emoji."
- "En `css/secciones/01-colores-y-fuentes.css`, cambia el color
  `--violet` por un azul más oscuro."
- "Borra la sección de Juegos" → basta con quitar su botón en
  `partials/03-dock-navegacion.html` y ya no aparece; el resto de la
  página no se ve afectada.

## 4. Reglas para que nada se rompa

- No renombres las clases CSS que empiezan con `nav-dot`, `data-section`,
  `glass-card`, `expense-item`, `card`, `modal-bg`, `subtab`, `subview`
  ni los `id` del HTML (`sec-hub`, `modal-goal`, `fabAdd`, etc.) — el
  JavaScript depende de esos nombres exactos para funcionar.
- `css/styles.css` no tiene estilos propios, solo `@import` hacia
  `css/secciones/`. Si agregas un archivo CSS nuevo, agrégalo también
  ahí con `@import url("secciones/nombre.css");`.
- `index.html` no tiene contenido propio, solo `<div data-include="partials/archivo.html">`.
  Si agregas una sección nueva, créala en `partials/` y agrega su
  `data-include` en `index.html`.
- Si agregas una pantalla nueva (como Hub, Metas, etc.), necesitas 3
  cosas: su botón en `partials/03-dock-navegacion.html`, su contenido
  en un `partials/NN-nombre.html` nuevo (con `<section class="section" id="sec-NOMBRE">`),
  y su entrada en `TITLES`/`EYEBROWS` dentro de `public/js/nav.js`.
- Los archivos `.js` ya estaban divididos por función; ahora además
  cada uno revisa que sus elementos existan antes de usarlos, así que
  es seguro borrar una sección completa sin miedo a romper las demás.
