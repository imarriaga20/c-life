export function hoyISO(): string {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function ahoraHHMM(): string {
  const ahora = new Date();
  return `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function fechaLarga(fecha = new Date()): string {
  return capitalizar(
    new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(fecha),
  );
}

export function fechaCorta(fechaISO: string): string {
  const fecha = new Date(`${fechaISO.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return fechaISO;
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' }).format(fecha);
}

export function fechaHoraToma(valor: string): string {
  const fecha = new Date(valor.replace(' ', 'T'));
  if (Number.isNaN(fecha.getTime())) return valor;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}

export function horaCorta(hora: string): string {
  return hora.slice(0, 5);
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || '')
    .join('');
}

export function descargarJSON(nombreArchivo: string, datos: unknown) {
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
