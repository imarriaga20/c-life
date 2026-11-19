import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler, exigir } from '../utils/http.js';
import { aBooleano } from '../utils/serializers.js';
import { limitarEntero } from '../utils/validators.js';

const router = Router();

function fechaHoraValida(valor) {
  return typeof valor === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(valor);
}

// GET /api/tomas?limite=50
router.get('/', asyncHandler(async (req, res) => {
  const limite = limitarEntero(req.query.limite, 1, 200, 50);
  const filas = await query(
    `SELECT t.id_toma, t.fecha_hora, t.confirmada,
            m.id_medicamento, m.nombre AS medicamento, m.dosis
     FROM Registro_Toma t
     JOIN Medicamento m ON m.id_medicamento = t.id_medicamento
     WHERE m.id_usuario = ?
     ORDER BY t.fecha_hora DESC
     LIMIT ?`,
    [req.usuario.id_usuario, limite],
  );
  res.json(
    filas.map((fila) => ({
      ...fila,
      confirmada: Boolean(fila.confirmada),
    })),
  );
}));

// POST /api/tomas  (confirmar toma)
router.post('/', asyncHandler(async (req, res) => {
  const idMedicamento = Number(req.body?.id_medicamento);
  const confirmada = req.body?.confirmada === undefined ? true : aBooleano(req.body.confirmada);
  const fechaHora = req.body?.fecha_hora;

  exigir(Number.isInteger(idMedicamento) && idMedicamento > 0, 400, 'Debes indicar un medicamento válido.');
  exigir(
    fechaHora === undefined || fechaHora === null || fechaHora === '' || fechaHoraValida(fechaHora),
    400,
    'La fecha y hora deben tener el formato AAAA-MM-DD HH:MM:SS.',
  );

  const [medicamento] = await query(
    'SELECT id_medicamento FROM Medicamento WHERE id_medicamento = ? AND id_usuario = ? LIMIT 1',
    [idMedicamento, req.usuario.id_usuario],
  );
  exigir(medicamento, 404, 'El medicamento no existe o no pertenece a tu cuenta.');

  if (confirmada) {
    const [resumen] = await query(
      `SELECT
         (SELECT COUNT(*) FROM Recordatorio WHERE id_medicamento = ? AND estado = 'activo') AS dosis_activas,
         (SELECT COUNT(*) FROM Registro_Toma
          WHERE id_medicamento = ? AND confirmada = 1 AND DATE(fecha_hora) = CURDATE()) AS confirmadas_hoy`,
      [idMedicamento, idMedicamento],
    );

    const dosisEsperadas = Math.max(1, Number(resumen?.dosis_activas || 0));
    const confirmadasHoy = Number(resumen?.confirmadas_hoy || 0);

    if (confirmadasHoy >= dosisEsperadas) {
      const [ultima] = await query(
        `SELECT id_toma, fecha_hora
         FROM Registro_Toma
         WHERE id_medicamento = ? AND confirmada = 1 AND DATE(fecha_hora) = CURDATE()
         ORDER BY fecha_hora DESC
         LIMIT 1`,
        [idMedicamento],
      );

      res.json({
        mensaje: 'Las dosis programadas para hoy ya estaban confirmadas. ¡Buen trabajo manteniendo tu adherencia!',
        ya_confirmada: true,
        toma: { ...ultima, confirmada: true, id_medicamento: idMedicamento },
      });
      return;
    }
  }

  const resultado = await query(
    `INSERT INTO Registro_Toma (fecha_hora, confirmada, id_medicamento)
     VALUES (COALESCE(?, NOW()), ?, ?)`,
    [fechaHora || null, confirmada ? 1 : 0, idMedicamento],
  );

  const [toma] = await query(
    'SELECT id_toma, fecha_hora, confirmada FROM Registro_Toma WHERE id_toma = ?',
    [resultado.insertId],
  );

  res.status(201).json({
    mensaje: confirmada ? 'Toma confirmada. Tu adherencia quedó registrada.' : 'Toma registrada como omitida.',
    ya_confirmada: false,
    toma: { ...toma, confirmada: Boolean(toma.confirmada), id_medicamento: idMedicamento },
  });
}));

export default router;
