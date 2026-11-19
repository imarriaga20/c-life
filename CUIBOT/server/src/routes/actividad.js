import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler, exigir } from '../utils/http.js';
import {
  esFechaFutura,
  fechaISOValida,
  hoyISO,
  limitarEntero,
  rangoSemanaActual,
  texto,
} from '../utils/validators.js';

const router = Router();
const META_SEMANAL = 150;

function leerActividad(body) {
  const tipo = texto(body?.tipo);
  const duracion = Number(body?.duracion);
  const fecha = texto(body?.fecha) || hoyISO();

  exigir(tipo.length >= 2 && tipo.length <= 100, 400, 'El tipo de actividad debe tener entre 2 y 100 caracteres.');
  exigir(Number.isInteger(duracion) && duracion > 0, 400, 'La duración debe ser un número entero mayor que 0.');
  exigir(duracion <= 600, 400, 'La duración no puede superar los 600 minutos en un solo registro.');
  exigir(fechaISOValida(fecha), 400, 'La fecha no es válida. Usa el formato AAAA-MM-DD.');
  exigir(!esFechaFutura(fecha), 400, 'La fecha de la actividad no puede ser futura.');

  return { tipo, duracion, fecha };
}

async function resumenSemanal(idUsuario) {
  const { desde, hasta } = rangoSemanaActual();
  const [fila] = await query(
    `SELECT COALESCE(SUM(duracion), 0) AS total
     FROM Actividad
     WHERE id_usuario = ? AND fecha BETWEEN ? AND ?`,
    [idUsuario, desde, hasta],
  );
  const total = Number(fila?.total || 0);
  return {
    total,
    meta: META_SEMANAL,
    porcentaje: Math.min(100, Math.round((total / META_SEMANAL) * 100)),
    cumplida: total >= META_SEMANAL,
    desde,
    hasta,
  };
}

// GET /api/actividad
router.get('/', asyncHandler(async (req, res) => {
  const limite = limitarEntero(req.query.limite, 1, 200, 60);
  const [actividades, semana] = await Promise.all([
    query(
      `SELECT id_actividad, tipo, duracion, fecha
       FROM Actividad
       WHERE id_usuario = ?
       ORDER BY fecha DESC, id_actividad DESC
       LIMIT ?`,
      [req.usuario.id_usuario, limite],
    ),
    resumenSemanal(req.usuario.id_usuario),
  ]);

  res.json({ actividades, semana });
}));

// POST /api/actividad
router.post('/', asyncHandler(async (req, res) => {
  const actividad = leerActividad(req.body);
  const resultado = await query(
    `INSERT INTO Actividad (tipo, duracion, fecha, id_usuario)
     VALUES (?, ?, ?, ?)`,
    [actividad.tipo, actividad.duracion, actividad.fecha, req.usuario.id_usuario],
  );

  const semana = await resumenSemanal(req.usuario.id_usuario);

  res.status(201).json({
    mensaje: 'Actividad registrada correctamente.',
    actividad: { id_actividad: resultado.insertId, ...actividad },
    semana,
  });
}));

// DELETE /api/actividad/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const resultado = await query(
    'DELETE FROM Actividad WHERE id_actividad = ? AND id_usuario = ?',
    [Number(req.params.id), req.usuario.id_usuario],
  );
  exigir(resultado.affectedRows > 0, 404, 'La actividad no existe o no pertenece a tu cuenta.');
  res.json({ mensaje: 'Actividad eliminada.', semana: await resumenSemanal(req.usuario.id_usuario) });
}));

export default router;
