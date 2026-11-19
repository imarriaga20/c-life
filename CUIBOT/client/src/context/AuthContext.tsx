import * as React from 'react';
import { api, cerrarSesionLocal, guardarSesion, guardarUsuario, leerUsuario } from '@/lib/api';
import type { Usuario } from '@/lib/types';

interface DatosRegistro {
  nombre: string;
  correo: string;
  contrasena: string;
  tipo_diabetes: string | null;
  autorizacion_datos: boolean;
}

interface AuthContextValue {
  usuario: Usuario | null;
  login: (correo: string, contrasena: string) => Promise<void>;
  registro: (datos: DatosRegistro) => Promise<string>;
  logout: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = React.useState<Usuario | null>(() => leerUsuario());

  React.useEffect(() => {
    const manejarExpiracion = () => setUsuario(null);
    window.addEventListener('cuibot:sesion-expirada', manejarExpiracion);
    return () => window.removeEventListener('cuibot:sesion-expirada', manejarExpiracion);
  }, []);

  React.useEffect(() => {
    const guardado = leerUsuario();
    if (!guardado) return;
    let activo = true;
    api
      .get<{ usuario: Usuario }>('/auth/me')
      .then((respuesta) => {
        if (!activo) return;
        setUsuario(respuesta.usuario);
        guardarUsuario(respuesta.usuario);
      })
      .catch(() => {
        /* Si el token expiró, el interceptor ya limpió la sesión. */
      });
    return () => {
      activo = false;
    };
  }, []);

  const login = React.useCallback(async (correo: string, contrasena: string) => {
    const respuesta = await api.post<{ token: string; usuario: Usuario }>('/auth/login', {
      correo,
      contrasena,
    });
    guardarSesion(respuesta.token, respuesta.usuario);
    setUsuario(respuesta.usuario);
  }, []);

  const registro = React.useCallback(async (datos: DatosRegistro) => {
    const respuesta = await api.post<{ mensaje: string }>('/auth/registro', datos);
    return respuesta.mensaje;
  }, []);

  const logout = React.useCallback(() => {
    cerrarSesionLocal();
    setUsuario(null);
  }, []);

  const actualizarUsuario = React.useCallback((nuevo: Usuario) => {
    setUsuario(nuevo);
    guardarUsuario(nuevo);
  }, []);

  const valor = React.useMemo(
    () => ({ usuario, login, registro, logout, actualizarUsuario }),
    [usuario, login, registro, logout, actualizarUsuario],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = React.useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return contexto;
}
