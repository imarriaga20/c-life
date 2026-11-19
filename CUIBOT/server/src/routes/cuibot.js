import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler, exigir } from '../utils/http.js';
import { responderConsulta, SUGERENCIAS } from '../chatbot.js';
import { texto } from '../utils/validators.js';

const router = Router();

// GET /api/cuibot/sugerencias
router.get('/sugerencias', (req, res) => {
  res.json(SUGERENCIAS);
});

// POST /api/cuibot/consulta
router.post('/consulta', asyncHandler(async (req, res) => {
  const consulta = texto(req.body?.consulta);
  exigir(consulta.length >= 3, 400, 'Escribe una consulta de al menos 3 caracteres.');
  exigir(consulta.length <= 500, 400, 'La consulta no puede superar los 500 caracteres.');

  let tipoDiabetes = texto(req.body?.tipo_diabetes) || null;
  if (!tipoDiabetes) {
    const [usuario] = await query(
      'SELECT tipo_diabetes FROM Usuario WHERE id_usuario = ? LIMIT 1',
      [req.usuario.id_usuario],
    );
    tipoDiabetes = usuario?.tipo_diabetes || null;
  }

  const resultado = responderConsulta(consulta, tipoDiabetes);
  res.json({ ...resultado, tipo_diabetes: tipoDiabetes });
}));

export default router;
