import jwt from 'jsonwebtoken';
import { HttpError } from './utils/http.js';

const SECRETO = process.env.JWT_SECRET || 'cuibot-dev-secret';
const VIGENCIA = process.env.JWT_EXPIRES_IN || '8h';

export function firmarToken(usuario) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
    SECRETO,
    { expiresIn: VIGENCIA },
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Debes iniciar sesión para continuar.'));
  }

  try {
    const payload = jwt.verify(token, SECRETO);
    req.usuario = payload;
    return next();
  } catch {
    return next(new HttpError(401, 'La sesión expiró o el token no es válido.'));
  }
}

export function requireAdmin(req, res, next) {
  if (req.usuario?.rol !== 'administrador') {
    return next(new HttpError(403, 'Esta acción requiere el rol de administrador.'));
  }
  return next();
}
