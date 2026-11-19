import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler, exigir } from '../utils/http.js';
import { ESTADOS_RECORDATORIO, texto } from '../utils/validators.js';

const router = Router();

// GET /api/recordatorios
router.get('/', asyncHandler(async (req, res) => {
  const filas = await query(
    `SELECT r.id_recordatorio, r.mensaje, r.hora, r.estado,
            m.id_medicamento, m.nombre AS medicamento, m.dosis
     FROM Recordatorio r
     JOIN Medicamento m ON m.id_medicamento = r.id_medicamento
     WHERE m.id_usuario = ?
     ORDER BY r.hora ASC`,
    [req.usuario.id_usuario],
  );
  res.json(filas);
}));

// PUT /api/recordatorios/:id/toggle
router.put('/:id/toggle', asyncHandler(async (req, res) => {
  const estado = texto(req.body?.estado);
  exigir(
    ESTADOS_RECORDATORIO.includes(estado),
    400,
    "El estado debe ser 'activo' o 'inactivo'.",
  );

  const resultado = await query(
    `UPDATE Recordatorio r
     JOIN Medicamento m ON m.id_medicamento = r.id_medicamento
     SET r.estado = ?
     WHERE r.id_recordatorio = ? AND m.id_usuario = ?`,
    [estado, Number(req.params.id), req.usuario.id_usuario],
  );

  exigir(resultado.affectedRows > 0, 404, 'El recordatorio no existe o no pertenece a tu cuenta.');

  const [recordatorio] = await query(
    'SELECT id_recordatorio, mensaje, hora, estado, id_medicamento FROM Recordatorio WHERE id_recordatorio = ?',
    [Number(req.params.id)],
  );

  res.json({ mensaje: `Recordatorio ${estado === 'activo' ? 'activado' : 'pausado'}.`, recordatorio });
}));

export default router;
