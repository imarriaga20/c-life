import { Router } from 'express';
import { enTransaccion, query } from '../db.js';
import { asyncHandler, exigir } from '../utils/http.js';
import { normalizarHora, texto } from '../utils/validators.js';

const router = Router();
const MAX_RECORDATORIOS = 6;

function horasDesdeHorario(horario) {
  const coincidencias = horario.match(/([01]?\d|2[0-3]):([0-5]\d)/g) || [];
  return [...new Set(coincidencias.map((h) => normalizarHora(h)).filter(Boolean))];
}

function normalizarRecordatorios(entrada, nombre, dosis, horario) {
  const lista = [];
  const verHora = (hora) => {
    const normalizada = normalizarHora(hora);
    exigir(Boolean(normalizada), 400, `La hora de recordatorio "${hora}" no es válida. Usa HH:MM.`);
    return normalizada;
  };

  if (Array.isArray(entrada)) {
    for (const item of entrada) {
      if (item === null || item === undefined || item === '') continue;
      if (typeof item === 'string' || typeof item === 'number') {
        lista.push({ hora: verHora(String(item)), mensaje: `Tomar ${nombre} ${dosis}` });
      } else if (typeof item === 'object') {
        const hora = verHora(item.hora);
        const mensaje = texto(item.mensaje);
        lista.push({
          hora,
          mensaje: mensaje || `Tomar ${nombre} ${dosis}`,
        });
      }
    }
  }

  if (!lista.length) {
    const horas = horasDesdeHorario(horario);
    for (const hora of horas) {
      lista.push({ hora, mensaje: `Tomar ${nombre} ${dosis}` });
    }
  }

  if (!lista.length) {
    lista.push({ hora: '08:00:00', mensaje: `Tomar ${nombre} ${dosis}` });
  }

  const unicos = [];
  const vistos = new Set();
  for (const recordatorio of lista) {
    if (vistos.has(recordatorio.hora)) continue;
    vistos.add(recordatorio.hora);
    unicos.push(recordatorio);
  }

  exigir(unicos.length <= MAX_RECORDATORIOS, 400, `Puedes configurar máximo ${MAX_RECORDATORIOS} recordatorios por medicamento.`);
  return unicos.sort((a, b) => a.hora.localeCompare(b.hora));
}

function leerMedicamento(body) {
  const nombre = texto(body?.nombre);
  const dosis = texto(body?.dosis);
  const horario = texto(body?.horario);

  exigir(nombre.length >= 2 && nombre.length <= 100, 400, 'El nombre del medicamento debe tener entre 2 y 100 caracteres.');
  exigir(dosis.length >= 1 && dosis.length <= 100, 400, 'La dosis es obligatoria (máximo 100 caracteres).');
  exigir(horario.length >= 2 && horario.length <= 50, 400, 'El horario es obligatorio (máximo 50 caracteres).');

  return { nombre, dosis, horario };
}

async function listarMedicamentos(idUsuario) {
  const medicamentos = await query(
    `SELECT id_medicamento, nombre, dosis, horario
     FROM Medicamento
     WHERE id_usuario = ?
     ORDER BY id_medicamento ASC`,
    [idUsuario],
  );

  const recordatorios = await query(
    `SELECT r.id_recordatorio, r.mensaje, r.hora, r.estado, r.id_medicamento
     FROM Recordatorio r
     JOIN Medicamento m ON m.id_medicamento = r.id_medicamento
     WHERE m.id_usuario = ?
     ORDER BY r.hora ASC`,
    [idUsuario],
  );

  return medicamentos.map((medicamento) => ({
    ...medicamento,
    recordatorios: recordatorios.filter((r) => r.id_medicamento === medicamento.id_medicamento),
  }));
}

// GET /api/medicamentos
router.get('/', asyncHandler(async (req, res) => {
  res.json(await listarMedicamentos(req.usuario.id_usuario));
}));

// POST /api/medicamentos
router.post('/', asyncHandler(async (req, res) => {
  const medicamento = leerMedicamento(req.body);
  const recordatorios = normalizarRecordatorios(
    req.body?.recordatorios ?? req.body?.horas,
    medicamento.nombre,
    medicamento.dosis,
    medicamento.horario,
  );

  const creado = await enTransaccion(async (conexion) => {
    const [resultado] = await conexion.query(
      `INSERT INTO Medicamento (nombre, dosis, horario, id_usuario)
       VALUES (?, ?, ?, ?)`,
      [medicamento.nombre, medicamento.dosis, medicamento.horario, req.usuario.id_usuario],
    );
    const idMedicamento = resultado.insertId;

    for (const recordatorio of recordatorios) {
      await conexion.query(
        `INSERT INTO Recordatorio (mensaje, hora, estado, id_medicamento)
         VALUES (?, ?, 'activo', ?)`,
        [recordatorio.mensaje, recordatorio.hora, idMedicamento],
      );
    }

    return { id_medicamento: idMedicamento, ...medicamento };
  });

  const [conRecordatorios] = (await listarMedicamentos(req.usuario.id_usuario)).filter(
    (m) => m.id_medicamento === creado.id_medicamento,
  );

  res.status(201).json({ mensaje: 'Medicamento registrado correctamente.', medicamento: conRecordatorios });
}));

// PUT /api/medicamentos/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const medicamento = leerMedicamento(req.body);
  const reemplazarRecordatorios = Array.isArray(req.body?.recordatorios) && req.body.recordatorios.length > 0;

  const recordatorios = reemplazarRecordatorios
    ? normalizarRecordatorios(req.body.recordatorios, medicamento.nombre, medicamento.dosis, medicamento.horario)
    : [];

  await enTransaccion(async (conexion) => {
    const [resultado] = await conexion.query(
      `UPDATE Medicamento
       SET nombre = ?, dosis = ?, horario = ?
       WHERE id_medicamento = ? AND id_usuario = ?`,
      [medicamento.nombre, medicamento.dosis, medicamento.horario, id, req.usuario.id_usuario],
    );
    exigir(resultado.affectedRows > 0, 404, 'El medicamento no existe o no pertenece a tu cuenta.');

    if (reemplazarRecordatorios) {
      await conexion.query('DELETE FROM Recordatorio WHERE id_medicamento = ?', [id]);
      for (const recordatorio of recordatorios) {
        await conexion.query(
          `INSERT INTO Recordatorio (mensaje, hora, estado, id_medicamento)
           VALUES (?, ?, 'activo', ?)`,
          [recordatorio.mensaje, recordatorio.hora, id],
        );
      }
    }
  });

  const [actualizado] = (await listarMedicamentos(req.usuario.id_usuario)).filter((m) => m.id_medicamento === id);
  res.json({ mensaje: 'Medicamento actualizado.', medicamento: actualizado });
}));

// DELETE /api/medicamentos/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const resultado = await query(
    'DELETE FROM Medicamento WHERE id_medicamento = ? AND id_usuario = ?',
    [Number(req.params.id), req.usuario.id_usuario],
  );
  exigir(resultado.affectedRows > 0, 404, 'El medicamento no existe o no pertenece a tu cuenta.');
  res.json({ mensaje: 'Medicamento eliminado junto con sus recordatorios e historial de tomas.' });
}));

export default router;
