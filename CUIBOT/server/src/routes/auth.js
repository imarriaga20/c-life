import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { firmarToken, requireAuth } from '../auth.js';
import { asyncHandler, exigir, HttpError } from '../utils/http.js';
import { usuarioPublico } from '../utils/serializers.js';
import {
  esCorreoValido,
  texto,
  TIPOS_DIABETES,
} from '../utils/validators.js';

const router = Router();

const MAX_INTENTOS = 20;
const VENTANA_MS = 15 * 60 * 1000;
const intentosPorIp = new Map();

function obtenerRegistro(clave) {
  const ahora = Date.now();
  const registro = intentosPorIp.get(clave) || { conteo: 0, reinicio: ahora + VENTANA_MS };
  if (ahora > registro.reinicio) {
    registro.conteo = 0;
    registro.reinicio = ahora + VENTANA_MS;
  }
  intentosPorIp.set(clave, registro);
  return registro;
}

function limitarIntentos(req, res, next) {
  // Se limita por cuenta (correo) y no por IP: varios estudiantes pueden entrar
  // desde la misma red o detrás de un túnel sin bloquearse entre ellos.
  const correo = texto(req.body?.correo).toLowerCase();
  const clave = correo || `ip:${req.ip || 'desconocido'}`;
  const registro = obtenerRegistro(clave);

  if (registro.conteo >= MAX_INTENTOS) {
    return next(new HttpError(429, 'Demasiados intentos de acceso. Espera 15 minutos e inténtalo de nuevo.'));
  }

  req.claveIntentos = clave;
  return next();
}

// POST /api/auth/login
router.post('/login', limitarIntentos, asyncHandler(async (req, res) => {
  const correo = texto(req.body?.correo).toLowerCase();
  const contrasena = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';

  exigir(correo && contrasena, 400, 'Ingresa tu correo y tu contraseña.');

  const [usuario] = await query('SELECT * FROM Usuario WHERE correo = ? LIMIT 1', [correo]);

  // Se compara siempre para reducir diferencias de tiempo entre correo existente y no existente.
  const hashReferencia = '$2b$12$ifl2cqKV5TzpbUszUhJHW.NXoEMMt3ITM8xo1k1Bnn52Y4r6PIpou';
  const coincide = await bcrypt.compare(contrasena, usuario?.contrasena || hashReferencia);

  if (!usuario || !coincide) {
    obtenerRegistro(req.claveIntentos).conteo += 1;
    throw new HttpError(401, 'Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.');
  }

  intentosPorIp.delete(req.claveIntentos);

  res.json({
    token: firmarToken(usuario),
    usuario: usuarioPublico(usuario),
  });
}));

// POST /api/auth/registro
router.post('/registro', asyncHandler(async (req, res) => {
  const nombre = texto(req.body?.nombre);
  const correo = texto(req.body?.correo).toLowerCase();
  const contrasena = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';
  const tipoSolicitado = texto(req.body?.tipo_diabetes);
  const autorizacion = req.body?.autorizacion_datos === true;
  const tipoDiabetes = tipoSolicitado || null;

  exigir(nombre.length >= 3 && nombre.length <= 100, 400, 'El nombre debe tener entre 3 y 100 caracteres.');
  exigir(esCorreoValido(correo), 400, 'Ingresa un correo electrónico válido.');
  exigir(contrasena.length >= 8, 400, 'La contraseña debe tener al menos 8 caracteres.');
  exigir(contrasena.length <= 72, 400, 'La contraseña no puede superar los 72 caracteres.');
  exigir(autorizacion, 400, 'Debes autorizar el tratamiento de tus datos de salud (Ley 1581 de 2012).');
  exigir(
    tipoDiabetes === null || TIPOS_DIABETES.includes(tipoDiabetes),
    400,
    'El tipo de diabetes seleccionado no es válido.',
  );

  const existente = await query('SELECT id_usuario FROM Usuario WHERE correo = ? LIMIT 1', [correo]);
  exigir(existente.length === 0, 409, 'Ya existe una cuenta registrada con este correo.');

  const hash = await bcrypt.hash(contrasena, 12);
  const resultado = await query(
    `INSERT INTO Usuario (nombre, correo, contrasena, tipo_diabetes, rol)
     VALUES (?, ?, ?, ?, 'paciente')`,
    [nombre, correo, hash, tipoDiabetes],
  );

  res.status(201).json({
    mensaje: 'Cuenta creada correctamente. Ya puedes iniciar sesión.',
    id_usuario: resultado.insertId,
  });
}));

// GET /api/auth/me
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const [usuario] = await query(
    'SELECT id_usuario, nombre, correo, tipo_diabetes, rol FROM Usuario WHERE id_usuario = ? LIMIT 1',
    [req.usuario.id_usuario],
  );
  exigir(usuario, 401, 'La cuenta ya no existe.');
  res.json({ usuario: usuarioPublico(usuario) });
}));

export default router;
