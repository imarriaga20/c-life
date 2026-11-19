import type { Usuario } from './types';

const TOKEN_KEY = 'cuibot.token';
const USUARIO_KEY = 'cuibot.usuario';

export class ApiError extends Error {
  estado: number;
  detalles?: unknown;

  constructor(mensaje: string, estado: number, detalles?: unknown) {
    super(mensaje);
    this.name = 'ApiError';
    this.estado = estado;
    this.detalles = detalles;
  }
}

export function guardarSesion(token: string, usuario: Usuario) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function guardarUsuario(usuario: Usuario) {
  sessionStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function leerToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function leerUsuario(): Usuario | null {
  const crudo = sessionStorage.getItem(USUARIO_KEY);
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as Usuario;
  } catch {
    return null;
  }
}

export function cerrarSesionLocal() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USUARIO_KEY);
}

async function solicitar<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const headers = new Headers(opciones.headers);
  const token = leerToken();

  if (opciones.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const respuesta = await fetch(`/api${ruta}`, { ...opciones, headers });
  const tipoContenido = respuesta.headers.get('content-type') || '';
  const datos = tipoContenido.includes('application/json') ? await respuesta.json() : null;

  if (!respuesta.ok) {
    if (respuesta.status === 401 && !ruta.startsWith('/auth/login')) {
      cerrarSesionLocal();
      window.dispatchEvent(new Event('cuibot:sesion-expirada'));
    }
    throw new ApiError(
      datos?.mensaje || 'Ocurrió un error inesperado. Intenta de nuevo.',
      respuesta.status,
      datos?.detalles,
    );
  }

  return datos as T;
}

export const api = {
  get: <T>(ruta: string) => solicitar<T>(ruta),
  post: <T>(ruta: string, cuerpo?: unknown) =>
    solicitar<T>(ruta, { method: 'POST', body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) }),
  put: <T>(ruta: string, cuerpo?: unknown) =>
    solicitar<T>(ruta, { method: 'PUT', body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) }),
  delete: <T>(ruta: string, cuerpo?: unknown) =>
    solicitar<T>(ruta, { method: 'DELETE', body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) }),
};

export function mensajeDeError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}
