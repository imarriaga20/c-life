export const TIPOS_DIABETES = ['Tipo 1', 'Tipo 2', 'Gestacional', 'Otro'];
export const MOMENTOS_COMIDA = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'];
export const ESTADOS_RECORDATORIO = ['activo', 'inactivo'];

export function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

export function esCorreoValido(correo) {
  return (
    typeof correo === 'string' &&
    correo.length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)
  );
}

export function fechaISOValida(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const date = new Date(anio, mes - 1, dia);
  return (
    date.getFullYear() === anio &&
    date.getMonth() === mes - 1 &&
    date.getDate() === dia
  );
}

/** Fecha local en formato YYYY-MM-DD (evita desfases por zona horaria). */
export function hoyISO() {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/** Hora local en formato HH:MM:SS. */
export function ahoraHora() {
  const ahora = new Date();
  return [ahora.getHours(), ahora.getMinutes(), ahora.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

/** Acepta HH:MM o HH:MM:SS y devuelve HH:MM:SS, o null si es inválida. */
export function normalizarHora(hora) {
  if (typeof hora !== 'string') return null;
  const coincidencia = hora.trim().match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!coincidencia) return null;
  return `${coincidencia[1]}:${coincidencia[2]}:${coincidencia[3] || '00'}`;
}

export function esFechaFutura(fecha) {
  return fechaISOValida(fecha) && fecha > hoyISO();
}

/** Lunes y domingo de la semana actual en formato ISO. */
export function rangoSemanaActual() {
  const hoy = new Date();
  const diaSemana = (hoy.getDay() + 6) % 7; // lunes = 0
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - diaSemana);
  const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6);
  const aISO = (d) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };
  return { desde: aISO(lunes), hasta: aISO(domingo) };
}

export function idEntero(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

export function limitarEntero(valor, minimo, maximo, porDefecto) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return porDefecto;
  return Math.min(maximo, Math.max(minimo, Math.trunc(numero)));
}
