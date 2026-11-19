import { Router } from 'express';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';
import { asyncHandler, exigir } from '../utils/http.js';
import { MOMENTOS_COMIDA, texto, TIPOS_DIABETES } from '../utils/validators.js';

const router = Router();
const TIPOS_MENU = ['Tipo 1', 'Tipo 2', 'Gestacional', 'General'];
const ORDEN_MOMENTOS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'];

// Devuelve una sugerencia por momento. Si el cliente envía los IDs que está
// mostrando (parámetro `excluir`), se evitan para que "Actualizar" siempre
// muestre alimentos diferentes mientras existan alternativas.
function seleccionarVariados(menus, excluidos) {
  const porMomento = new Map(ORDEN_MOMENTOS.map((momento) => [momento, []]));

  for (const menu of menus) {
    porMomento.get(menu.momento)?.push(menu);
  }

  const seleccionados = [];
  for (const momento of ORDEN_MOMENTOS) {
    const opciones = porMomento.get(momento) || [];
    if (!opciones.length) continue;

    const disponibles = opciones.filter((menu) => !excluidos.has(menu.id_menu));
    const candidatos = disponibles.length ? disponibles : opciones;
    seleccionados.push(candidatos[Math.floor(Math.random() * candidatos.length)]);
  }

  return seleccionados;
}

function validarMenu(body) {
  const tipoDiabetes = texto(body?.tipo_diabetes);
  const momento = texto(body?.momento);
  const descripcion = texto(body?.descripcion);

  exigir(TIPOS_MENU.includes(tipoDiabetes), 400, 'El tipo de diabetes del menú no es válido.');
  exigir(MOMENTOS_COMIDA.includes(momento), 400, 'El momento del menú no es válido.');
  exigir(
    descripcion.length >= 5 && descripcion.length <= 255,
    400,
    'La descripción del menú debe tener entre 5 y 255 caracteres.',
  );

  return { tipo_diabetes: tipoDiabetes, momento, descripcion };
}

// GET /api/menus?tipo_diabetes=Tipo%202&excluir=1,2,3,4
router.get('/', asyncHandler(async (req, res) => {
  // Los administradores pueden consultar el catálogo completo (RF17).
  if (req.query.todos === '1' && req.usuario.rol === 'administrador') {
    const todos = await query(
      `SELECT id_menu, tipo_diabetes, momento, descripcion
       FROM Menu_Recomendado
       ORDER BY FIELD(tipo_diabetes, 'Tipo 1', 'Tipo 2', 'Gestacional', 'General'),
                FIELD(momento, 'Desayuno', 'Almuerzo', 'Merienda', 'Cena')`,
    );
    res.json(todos);
    return;
  }

  let tipo = texto(req.query.tipo_diabetes);

  if (!TIPOS_MENU.includes(tipo)) {
    const [usuario] = await query('SELECT tipo_diabetes FROM Usuario WHERE id_usuario = ? LIMIT 1', [
      req.usuario.id_usuario,
    ]);
    tipo = TIPOS_DIABETES.includes(usuario?.tipo_diabetes) && usuario.tipo_diabetes !== 'Otro'
      ? usuario.tipo_diabetes
      : 'General';
  }

  let menus = await query(
    `SELECT id_menu, tipo_diabetes, momento, descripcion
     FROM Menu_Recomendado
     WHERE tipo_diabetes = ?
     ORDER BY FIELD(momento, 'Desayuno', 'Almuerzo', 'Merienda', 'Cena')`,
    [tipo],
  );

  if (!menus.length && tipo !== 'General') {
    tipo = 'General';
    menus = await query(
      `SELECT id_menu, tipo_diabetes, momento, descripcion
       FROM Menu_Recomendado
       WHERE tipo_diabetes = 'General'
       ORDER BY FIELD(momento, 'Desayuno', 'Almuerzo', 'Merienda', 'Cena')`,
    );
  }

  const excluidos = new Set(
    String(req.query.excluir || '')
      .split(',')
      .map((valor) => Number(valor))
      .filter((valor) => Number.isInteger(valor) && valor > 0),
  );

  res.json(seleccionarVariados(menus, excluidos));
}));

// POST /api/menus (solo administrador, RF17)
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const menu = validarMenu(req.body);
  const resultado = await query(
    `INSERT INTO Menu_Recomendado (tipo_diabetes, momento, descripcion)
     VALUES (?, ?, ?)`,
    [menu.tipo_diabetes, menu.momento, menu.descripcion],
  );
  res.status(201).json({ mensaje: 'Menú creado.', menu: { id_menu: resultado.insertId, ...menu } });
}));

// PUT /api/menus/:id (solo administrador)
router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const menu = validarMenu(req.body);
  const resultado = await query(
    `UPDATE Menu_Recomendado
     SET tipo_diabetes = ?, momento = ?, descripcion = ?
     WHERE id_menu = ?`,
    [menu.tipo_diabetes, menu.momento, menu.descripcion, Number(req.params.id)],
  );
  exigir(resultado.affectedRows > 0, 404, 'El menú no existe.');
  res.json({ mensaje: 'Menú actualizado.', menu: { id_menu: Number(req.params.id), ...menu } });
}));

// DELETE /api/menus/:id (solo administrador)
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const resultado = await query('DELETE FROM Menu_Recomendado WHERE id_menu = ?', [Number(req.params.id)]);
  exigir(resultado.affectedRows > 0, 404, 'El menú no existe.');
  res.json({ mensaje: 'Menú eliminado.' });
}));

export default router;
