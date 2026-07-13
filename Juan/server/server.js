import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const DEFAULT_DB = { goals: [], routines: [], photos: [], expenses: [], games: [] };

/* ---------- almacenamiento simple en archivo JSON ---------- */
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
}
function readDb() {
  ensureStorage();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}
function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/* ---------- helper para guardar imágenes base64 como archivos reales ---------- */
function saveBase64Image(dataUrl, baseName) {
  const match = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) return null;
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const filename = `${baseName}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}
function deleteUpload(fileUrl) {
  if (!fileUrl) return;
  const filePath = path.join(UPLOADS_DIR, path.basename(fileUrl));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/* ---------- app ---------- */
const app = express();
app.use(express.json({ limit: '15mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(PUBLIC_DIR));

/* ---------- CRUD genérico para recursos simples (goals, routines, expenses) ---------- */
function registerCrud(resource) {
  app.get(`/api/${resource}`, (req, res) => {
    res.json(readDb()[resource]);
  });

  app.post(`/api/${resource}`, (req, res) => {
    const db = readDb();
    const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...req.body };
    db[resource].unshift(item);
    writeDb(db);
    res.status(201).json(item);
  });

  app.put(`/api/${resource}/:id`, (req, res) => {
    const db = readDb();
    const idx = db[resource].findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
    db[resource][idx] = { ...db[resource][idx], ...req.body };
    writeDb(db);
    res.json(db[resource][idx]);
  });

  app.delete(`/api/${resource}/:id`, (req, res) => {
    const db = readDb();
    db[resource] = db[resource].filter((i) => i.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });
}
['goals', 'routines', 'expenses'].forEach(registerCrud);

/* ---------- Fotos de progreso: manejan archivo real en /uploads ---------- */
app.get('/api/photos', (req, res) => res.json(readDb().photos));

app.post('/api/photos', (req, res) => {
  const { date, note, image } = req.body;
  const db = readDb();
  const id = crypto.randomUUID();
  const file = saveBase64Image(image, `photo-${id}`);
  const item = { id, date: date || null, note: note || '', file, createdAt: new Date().toISOString() };
  db.photos.unshift(item);
  writeDb(db);
  res.status(201).json(item);
});

app.delete('/api/photos/:id', (req, res) => {
  const db = readDb();
  const item = db.photos.find((p) => p.id === req.params.id);
  if (item) deleteUpload(item.file);
  db.photos = db.photos.filter((p) => p.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

/* ---------- Juegos: portada opcional también como archivo ---------- */
app.get('/api/games', (req, res) => res.json(readDb().games));

app.post('/api/games', (req, res) => {
  const { title, platform, status, rating, hours, cover } = req.body;
  const db = readDb();
  const id = crypto.randomUUID();
  const coverFile = cover ? saveBase64Image(cover, `game-${id}`) : null;
  const item = {
    id,
    title,
    platform: platform || '—',
    status: status || 'backlog',
    rating: Number(rating) || 0,
    hours: Number(hours) || 0,
    cover: coverFile,
    createdAt: new Date().toISOString(),
  };
  db.games.unshift(item);
  writeDb(db);
  res.status(201).json(item);
});

app.put('/api/games/:id', (req, res) => {
  const db = readDb();
  const idx = db.games.findIndex((g) => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  db.games[idx] = { ...db.games[idx], ...req.body };
  writeDb(db);
  res.json(db.games[idx]);
});

app.delete('/api/games/:id', (req, res) => {
  const db = readDb();
  const item = db.games.find((g) => g.id === req.params.id);
  if (item) deleteUpload(item.cover);
  db.games = db.games.filter((g) => g.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

/* ---------- fallback SPA ---------- */
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const PORT = process.env.PORT || 3000;
ensureStorage();
app.listen(PORT, () => {
  console.log(`\n  NOVA hub corriendo en http://localhost:${PORT}\n`);
});
