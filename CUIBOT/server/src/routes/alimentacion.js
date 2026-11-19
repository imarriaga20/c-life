import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler, exigir } from '../utils/http.js';
import {
  ahoraHora,
  esFechaFutura,
  fechaISOValida,
  hoyISO,
  limitarEntero,
  MOMENTOS_COMIDA,
  normalizarHora,
  texto,
} from '../utils/validators.js';

const router = Router();

function leerComida(body) {
  const descripcion = texto(body?.descripcion);
  const tipoSolicitado = texto(body?.tipo_comida);
  const fecha = texto(body?.fecha) || hoyISO();
  const hora = normalizarHora(texto(body?.hora) || ahoraHora());

  exigir(
    descripcion.length >= 3 && descripcion.length <= 255,
    400,
    'La descripción debe tener entre 3 y 255 caracteres.',
  );
  exigir(
    !tipoSolicitado || MOMENTOS_COMIDA.includes(tipoSolicitado),
    400,
    'El tipo de comida debe ser Desayuno, Almuerzo, Cena o Merienda.',
  );
  exigir(fechaISOValida(fecha), 400, 'La fecha no es válida. Usa el formato AAAA-MM-DD.');
  exigir(!esFechaFutura(fecha), 400, 'La fecha de la comida no puede ser futura.');
  exigir(Boolean(hora), 400, 'La hora no es válida. Usa el formato HH:MM.');

  return {
    descripcion,
    tipo_comida: tipoSolicitado || null,
    fecha,
    hora,
  };
}

// GET /api/alimentacion
router.get('/', asyncHandler(async (req, res) => {
  const limite = limitarEntero(req.query.limite, 1, 200, 50);
  const filas = await query(
    `SELECT id_alimento, descripcion, tipo_comida, fecha, hora
     FROM Alimentacion
     WHERE id_usuario = ?
     ORDER BY fecha DESC, hora DESC
     LIMIT ?`,
    [req.usuario.id_usuario, limite],
  );
  res.json(filas);
}));

// POST /api/alimentacion
router.post('/', asyncHandler(async (req, res) => {
  const comida = leerComida(req.body);
  const resultado = await query(
    `INSERT INTO Alimentacion (descripcion, tipo_comida, fecha, hora, id_usuario)
     VALUES (?, ?, ?, ?, ?)`,
    [comida.descripcion, comida.tipo_comida, comida.fecha, comida.hora, req.usuario.id_usuario],
  );

  res.status(201).json({
    mensaje: 'Comida registrada correctamente.',
    comida: { id_alimento: resultado.insertId, ...comida },
  });
}));

// PUT /api/alimentacion/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const comida = leerComida(req.body);

  const resultado = await query(
    `UPDATE Alimentacion
     SET descripcion = ?, tipo_comida = ?, fecha = ?, hora = ?
     WHERE id_alimento = ? AND id_usuario = ?`,
    [comida.descripcion, comida.tipo_comida, comida.fecha, comida.hora, id, req.usuario.id_usuario],
  );

  exigir(resultado.affectedRows > 0, 404, 'La comida no existe o no pertenece a tu cuenta.');
  res.json({ mensaje: 'Comida actualizada.', comida: { id_alimento: id, ...comida } });
}));

// DELETE /api/alimentacion/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const resultado = await query(
    'DELETE FROM Alimentacion WHERE id_alimento = ? AND id_usuario = ?',
    [Number(req.params.id), req.usuario.id_usuario],
  );
  exigir(resultado.affectedRows > 0, 404, 'La comida no existe o no pertenece a tu cuenta.');
  res.json({ mensaje: 'Registro de comida eliminado.' });
}));

export default router;
