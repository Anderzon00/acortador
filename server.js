import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'urls.json');

// Middleware para JSON
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

// Crear enlace corto
app.post('/acortar', (req, res) => {
  const originalUrl = req.body.url;
  if (!originalUrl) return res.status(400).send('URL requerida');

  const datos = fs.existsSync(DB_FILE)
    ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    : {};

  const codigo = nanoid(6);
  datos[codigo] = originalUrl;
  fs.writeFileSync(DB_FILE, JSON.stringify(datos, null, 2));

  const shortUrl = `${req.protocol}://${req.get('host')}/${codigo}`;
  res.json({ shortUrl });
});

// Redirección
app.get('/:codigo', (req, res) => {
  const datos = fs.existsSync(DB_FILE)
    ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    : {};

  const url = datos[req.params.codigo];
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).send('Enlace no encontrado');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
