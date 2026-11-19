import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { asyncHandler, exigir } from '../utils/http.js';
import { usuarioPublico } from '../utils/serializers.js';
import { esCorreoValido, texto, TIPOS_DIABETES } from '../utils/validators.js';

const router = Router();

async function leerPerfil(idUsuario) {
  const [usuario] = await query(
    'SELECT id_usuario, nombre, correo, tipo_diabetes, rol, contrasena FROM Usuario WHERE id_usuario = ? LIMIT 1',
    [idUsuario],
  );
  return usuario;
}

// GET /api/usuarios/perfil
router.get('/perfil', asyncHandler(async (req, res) => {
  const usuario = await leerPerfil(req.usuario.id_usuario);
  exigir(usuario, 401, 'La cuenta ya no existe.');
  res.json({ usuario: usuarioPublico(usuario) });
}));

// PUT /api/usuarios/perfil
router.put('/perfil', asyncHandler(async (req, res) => {
  const actual = await leerPerfil(req.usuario.id_usuario);
  exigir(actual, 401, 'La cuenta ya no existe.');

  const nombre = req.body?.nombre === undefined ? actual.nombre : texto(req.body.nombre);
  const tipoSolicitado = req.body?.tipo_diabetes;
  const contrasenaActual = typeof req.body?.contrasena_actual === 'string' ? req.body.contrasena_actual : '';
  const contrasenaNueva = typeof req.body?.contrasena_nueva === 'string' ? req.body.contrasena_nueva : '';

  let tipoDiabetes = actual.tipo_diabetes;
  if (tipoSolicitado !== undefined) {
    const limpio = texto(tipoSolicitado);
    exigir(
      limpio === '' || TIPOS_DIABETES.includes(limpio),
      400,
      'El tipo de diabetes debe ser Tipo 1, Tipo 2, Gestacional u Otro.',
    );
    tipoDiabetes = limpio || null;
  }

  exigir(nombre.length >= 3 && nombre.length <= 100, 400, 'El nombre debe tener entre 3 y 100 caracteres.');

  let nuevoHash = null;
  if (contrasenaNueva) {
    exigir(contrasenaActual, 400, 'Debes ingresar tu contraseña actual para cambiarla.');
    const coincide = await bcrypt.compare(contrasenaActual, actual.contrasena);
    exigir(coincide, 401, 'La contraseña actual no es correcta.');
    exigir(contrasenaNueva.length >= 8, 400, 'La nueva contraseña debe tener al menos 8 caracteres.');
    exigir(contrasenaNueva.length <= 72, 400, 'La nueva contraseña no puede superar los 72 caracteres.');
    nuevoHash = await bcrypt.hash(contrasenaNueva, 12);
  }

  await query(
    `UPDATE Usuario
     SET nombre = ?, tipo_diabetes = ?${nuevoHash ? ', contrasena = ?' : ''}
     WHERE id_usuario = ?`,
    nuevoHash
      ? [nombre, tipoDiabetes, nuevoHash, req.usuario.id_usuario]
      : [nombre, tipoDiabetes, req.usuario.id_usuario],
  );

  const actualizado = await leerPerfil(req.usuario.id_usuario);
  res.json({ mensaje: 'Perfil actualizado correctamente.', usuario: usuarioPublico(actualizado) });
}));

// GET /api/usuarios/exportar (Ley 1581: derecho de acceso)
router.get('/exportar', asyncHandler(async (req, res) => {
  const idUsuario = req.usuario.id_usuario;
  const usuario = await leerPerfil(idUsuario);
  exigir(usuario, 401, 'La cuenta ya no existe.');

  const [alimentacion, actividad, medicamentos, recordatorios, tomas] = await Promise.all([
    query('SELECT id_alimento, descripcion, tipo_comida, fecha, hora FROM Alimentacion WHERE id_usuario = ? ORDER BY fecha, hora', [idUsuario]),
    query('SELECT id_actividad, tipo, duracion, fecha FROM Actividad WHERE id_usuario = ? ORDER BY fecha', [idUsuario]),
    query('SELECT id_medicamento, nombre, dosis, horario FROM Medicamento WHERE id_usuario = ? ORDER BY id_medicamento', [idUsuario]),
    query(
      `SELECT r.id_recordatorio, r.mensaje, r.hora, r.estado, m.nombre AS medicamento
       FROM Recordatorio r JOIN Medicamento m ON m.id_medicamento = r.id_medicamento
       WHERE m.id_usuario = ? ORDER BY r.hora`,
      [idUsuario],
    ),
    query(
      `SELECT t.id_toma, t.fecha_hora, t.confirmada, m.nombre AS medicamento
       FROM Registro_Toma t JOIN Medicamento m ON m.id_medicamento = t.id_medicamento
       WHERE m.id_usuario = ? ORDER BY t.fecha_hora`,
      [idUsuario],
    ),
  ]);

  res.json({
    exportado_en: new Date().toISOString(),
    marco_legal: 'Ley 1581 de 2012 (Colombia) - Protección de datos personales',
    usuario: usuarioPublico(usuario),
    alimentacion,
    actividad,
    medicamentos,
    recordatorios,
    registro_tomas: tomas.map((t) => ({ ...t, confirmada: Boolean(t.confirmada) })),
  });
}));

// DELETE /api/usuarios/cuenta (Ley 1581: derecho de supresión)
router.delete('/cuenta', asyncHandler(async (req, res) => {
  const contrasena = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';
  exigir(contrasena, 400, 'Debes ingresar tu contraseña para confirmar la eliminación de la cuenta.');

  const usuario = await leerPerfil(req.usuario.id_usuario);
  exigir(usuario, 401, 'La cuenta ya no existe.');

  const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
  exigir(coincide, 401, 'La contraseña no es correcta. La cuenta no fue eliminada.');

  await query('DELETE FROM Usuario WHERE id_usuario = ?', [req.usuario.id_usuario]);
  res.json({
    mensaje: 'Cuenta eliminada. Todos tus datos de salud asociados fueron borrados en cascada.',
  });
}));

// Valida el formato de correo al registrarse (se exporta para reutilizar si se requiere).
export { esCorreoValido };

export default router;
