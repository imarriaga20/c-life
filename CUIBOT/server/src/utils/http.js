export class HttpError extends Error {
  constructor(estado, mensaje, detalles = null) {
    super(mensaje);
    this.name = 'HttpError';
    this.estado = estado;
    this.detalles = detalles;
  }
}

/** Envuelve controladores async para que los errores lleguen al middleware. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Lanza un error HTTP si la condición no se cumple. */
export function exigir(condicion, estado, mensaje, detalles = null) {
  if (!condicion) throw new HttpError(estado, mensaje, detalles);
}

export function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  if (error instanceof HttpError) {
    return res.status(error.estado).json({
      mensaje: error.mensaje,
      ...(error.detalles ? { detalles: error.detalles } : {}),
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la solicitud no es un JSON válido.' });
  }

  if (error?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensaje: 'Ya existe un registro con esos datos.' });
  }

  if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ mensaje: 'El registro relacionado no existe.' });
  }

  console.error('[CUIBOT] Error no controlado:', error);
  return res.status(500).json({ mensaje: 'Ocurrió un error interno. Intenta de nuevo.' });
}
