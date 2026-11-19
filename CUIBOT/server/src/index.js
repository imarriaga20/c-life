import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool, query } from './db.js';
import { asyncHandler, errorHandler } from './utils/http.js';
import { requireAuth } from './auth.js';

import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import alimentacionRouter from './routes/alimentacion.js';
import menusRouter from './routes/menus.js';
import actividadRouter from './routes/actividad.js';
import medicamentosRouter from './routes/medicamentos.js';
import recordatoriosRouter from './routes/recordatorios.js';
import tomasRouter from './routes/tomas.js';
import cuibotRouter from './routes/cuibot.js';
import perfilRouter from './routes/perfil.js';

const app = express();
const PUERTO = Number(process.env.PORT || 4000);

const origenesPermitidos = new Set(
  [
    process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ]
    .flatMap((valor) => String(valor).split(','))
    .map((valor) => valor.trim())
    .filter(Boolean),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || origenesPermitidos.has(origin)),
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    console.log(`[CUIBOT] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio} ms)`);
  });
  next();
});

app.get('/api/salud', asyncHandler(async (req, res) => {
  await query('SELECT 1');
  res.json({
    ok: true,
    servicio: 'CUIBOT API',
    base_datos: 'conectada',
    hora: new Date().toISOString(),
  });
}));

// Rutas públicas
app.use('/api/auth', authRouter);

// Rutas protegidas por JWT
app.use('/api/dashboard', requireAuth, dashboardRouter);
app.use('/api/alimentacion', requireAuth, alimentacionRouter);
app.use('/api/menus', requireAuth, menusRouter);
app.use('/api/actividad', requireAuth, actividadRouter);
app.use('/api/medicamentos', requireAuth, medicamentosRouter);
app.use('/api/recordatorios', requireAuth, recordatoriosRouter);
app.use('/api/tomas', requireAuth, tomasRouter);
app.use('/api/cuibot', requireAuth, cuibotRouter);
app.use('/api/usuarios', requireAuth, perfilRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ mensaje: `La ruta ${req.method} ${req.originalUrl} no existe.` });
});

// En producción (después de `npm run build` en client/) el backend sirve el frontend.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clienteDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(path.join(clienteDist, 'index.html'))) {
  app.use(express.static(clienteDist));
  app.get('*', (req, res) => res.sendFile(path.join(clienteDist, 'index.html')));
}

app.use(errorHandler);

pool
  .query('SELECT 1')
  .then(() => {
    app.listen(PUERTO, () => {
      console.log(`[CUIBOT] API escuchando en http://localhost:${PUERTO}`);
      console.log('[CUIBOT] Base de datos: ' + (process.env.DB_NAME || 'cuibot_db'));
    });
  })
  .catch((error) => {
    console.error('[CUIBOT] No se pudo conectar a MySQL. Verifica que el servicio esté iniciado.');
    console.error('[CUIBOT] Detalle:', error.message);
    process.exit(1);
  });
