import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler } from '../utils/http.js';
import { usuarioPublico } from '../utils/serializers.js';
import { rangoSemanaActual } from '../utils/validators.js';

const router = Router();
const META_SEMANAL = 150;

// GET /api/dashboard/resumen
router.get('/resumen', asyncHandler(async (req, res) => {
  const idUsuario = req.usuario.id_usuario;
  const { desde, hasta } = rangoSemanaActual();

  const [
    usuarios,
    recordatorios,
    ultimasComidas,
    ultimasActividades,
    resumenSemana,
    resumenHoy,
  ] = await Promise.all([
    query(
      'SELECT id_usuario, nombre, correo, tipo_diabetes, rol FROM Usuario WHERE id_usuario = ? LIMIT 1',
      [idUsuario],
    ),
    query(
      `SELECT r.id_recordatorio, r.mensaje, r.hora, r.estado,
              m.id_medicamento, m.nombre AS medicamento, m.dosis,
              (
                SELECT COUNT(*) FROM Registro_Toma t
                WHERE t.id_medicamento = m.id_medicamento
                  AND t.confirmada = 1
                  AND DATE(t.fecha_hora) = CURDATE()
              ) AS tomas_hoy
       FROM Recordatorio r
       JOIN Medicamento m ON m.id_medicamento = r.id_medicamento
       WHERE m.id_usuario = ? AND r.estado = 'activo'
       ORDER BY r.hora ASC`,
      [idUsuario],
    ),
    query(
      `SELECT id_alimento, descripcion, tipo_comida, fecha, hora
       FROM Alimentacion
       WHERE id_usuario = ?
       ORDER BY fecha DESC, hora DESC
       LIMIT 3`,
      [idUsuario],
    ),
    query(
      `SELECT id_actividad, tipo, duracion, fecha
       FROM Actividad
       WHERE id_usuario = ?
       ORDER BY fecha DESC, id_actividad DESC
       LIMIT 3`,
      [idUsuario],
    ),
    query(
      `SELECT COALESCE(SUM(duracion), 0) AS total
       FROM Actividad
       WHERE id_usuario = ? AND fecha BETWEEN ? AND ?`,
      [idUsuario, desde, hasta],
    ),
    query(
      `SELECT
         (SELECT COUNT(*) FROM Alimentacion WHERE id_usuario = ? AND fecha = CURDATE()) AS comidas_hoy,
         (SELECT COALESCE(SUM(duracion), 0) FROM Actividad WHERE id_usuario = ? AND fecha = CURDATE()) AS minutos_hoy,
         (SELECT COUNT(*) FROM Registro_Toma rt
            JOIN Medicamento m2 ON m2.id_medicamento = rt.id_medicamento
          WHERE m2.id_usuario = ? AND rt.confirmada = 1 AND DATE(rt.fecha_hora) = CURDATE()) AS tomas_hoy`,
      [idUsuario, idUsuario, idUsuario],
    ),
  ]);

  if (!usuarios.length) {
    res.status(401).json({ mensaje: 'La cuenta ya no existe.' });
    return;
  }

  const totalSemana = Number(resumenSemana[0]?.total || 0);
  const porcentaje = Math.min(100, Math.round((totalSemana / META_SEMANAL) * 100));

  // Cada toma confirmada cubre una dosis del día (la primera pendiente por hora).
  const dosisCubiertas = new Map();
  const recordatoriosConEstado = recordatorios.map((recordatorio) => {
    const totalTomas = Number(recordatorio.tomas_hoy || 0);
    const cubiertas = dosisCubiertas.get(recordatorio.id_medicamento) || 0;
    const confirmadaHoy = cubiertas < totalTomas;
    dosisCubiertas.set(recordatorio.id_medicamento, cubiertas + (confirmadaHoy ? 1 : 0));
    const { tomas_hoy: _tomasHoy, ...resto } = recordatorio;

    return { ...resto, confirmada_hoy: confirmadaHoy };
  });

  res.json({
    usuario: usuarioPublico(usuarios[0]),
    recordatorios: recordatoriosConEstado,
    ultimasComidas,
    ultimasActividades,
    actividadSemanal: {
      total: totalSemana,
      meta: META_SEMANAL,
      porcentaje,
      cumplida: totalSemana >= META_SEMANAL,
      desde,
      hasta,
    },
    hoy: {
      comidas: Number(resumenHoy[0]?.comidas_hoy || 0),
      minutos_actividad: Number(resumenHoy[0]?.minutos_hoy || 0),
      tomas_confirmadas: Number(resumenHoy[0]?.tomas_hoy || 0),
    },
  });
}));

export default router;
