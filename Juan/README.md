# NOVA — Hub personal

Hub personal con seguimiento de metas, calistenia (rutinas + fotos de progreso),
gastos mensuales y catálogo de juegos.

## Estructura del proyecto

```
nova-hub/
├── server/                 ← Backend (Node.js + Express)
│   ├── server.js           API REST + guardado en disco
│   ├── package.json
│   └── data/                (se crea solo al arrancar)
│       ├── db.json          "base de datos" en JSON
│       └── uploads/         fotos de progreso y portadas de juegos
│
└── public/                 ← Frontend (estático, sin frameworks)
    ├── index.html           solo estructura
    ├── css/
    │   └── styles.css       todos los estilos
    └── js/
        ├── main.js           orquesta el arranque de la app
        ├── api.js            cliente fetch hacia el backend
        ├── stars.js          fondo animado de estrellas
        ├── nav.js             navegación entre secciones
        ├── modals.js          apertura/cierre de modales
        ├── goals.js            módulo de Metas
        ├── routines.js         módulo de Rutinas
        ├── photos.js           módulo de Fotos de progreso
        ├── expenses.js         módulo de Gastos
        ├── games.js            módulo de Juegos
        ├── hub.js              resumen del panel principal
        └── utils.js            helpers compartidos
```

Cada módulo de `js/` tiene una sola responsabilidad: pide datos a la API, los
renderiza en su sección del HTML y maneja sus propios botones/formularios.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) 18 o superior instalado.

```bash
cd nova-hub/server
npm install
npm start
```

Abre **http://localhost:3000** en el navegador.

Para desarrollo con recarga automática del servidor al guardar cambios:
```bash
npm run dev
```

## Cómo funciona el backend

- Es un servidor **Express** real: expone una API REST (`/api/goals`,
  `/api/routines`, `/api/photos`, `/api/expenses`, `/api/games`) con
  operaciones GET/POST/PUT/DELETE.
- Los datos se guardan en `server/data/db.json`. No hay que instalar ni
  configurar ninguna base de datos externa.
- Las fotos de progreso y portadas de juegos se guardan como **archivos de
  imagen reales** en `server/data/uploads/`, no como texto base64 dentro del
  JSON — así el proyecto pesa poco y las imágenes cargan rápido.
- El frontend nunca toca el disco directamente: siempre habla con el backend
  vía `fetch()` (ver `public/js/api.js`).

## Notas

- Todo el diseño (paleta oscura violeta/cian, tipografías, animaciones del
  campo de estrellas, transiciones "warp" entre secciones) vive en
  `public/css/styles.css`.
- Si quieres desplegar esto en internet más adelante (para acceder desde el
  celular, por ejemplo), este mismo backend se puede subir tal cual a un
  servicio como Render, Railway o un VPS — solo habría que cambiar el
  almacenamiento en archivo por una base de datos real si esperas mucho
  tráfico concurrente, pero para uso personal el archivo JSON es suficiente.
