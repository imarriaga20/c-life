import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  Home,
  LogOut,
  Pill,
  ShieldCheck,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { iniciales } from '@/lib/format';
import { cn } from '@/lib/utils';

const ENLACES = [
  { ruta: '/', etiqueta: 'Inicio', icono: Home, exacto: true },
  { ruta: '/alimentacion', etiqueta: 'Alimentación', icono: UtensilsCrossed },
  { ruta: '/actividad', etiqueta: 'Actividad', icono: Activity },
  { ruta: '/medicamentos', etiqueta: 'Medicamentos', icono: Pill },
  { ruta: '/cuibot', etiqueta: 'Cuibot', icono: Bot },
  { ruta: '/perfil', etiqueta: 'Perfil', icono: UserRound },
];

export function AppLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-primary/20 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <NavLink to="/" className="shrink-0">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            {ENLACES.map(({ ruta, etiqueta, icono: Icono, exacto }) => (
              <NavLink
                key={ruta}
                to={ruta}
                end={exacto}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                  )
                }
              >
                <Icono className="h-4 w-4" />
                {etiqueta}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-2.5 rounded-full border border-primary/20 bg-white py-1 pl-1 pr-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
                {iniciales(usuario?.nombre || 'CU')}
              </span>
              <div className="leading-tight">
                <p className="max-w-[140px] truncate text-xs font-bold text-foreground">{usuario?.nombre}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{usuario?.rol}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={cerrarSesion} title="Cerrar sesión" aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
              {iniciales(usuario?.nombre || 'CU')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={cerrarSesion}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-28 sm:px-6 lg:pb-10">
        <Outlet />
      </main>

      <footer className="hidden border-t border-primary/15 bg-white/60 py-6 lg:block">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-6 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary-ink" />
            CUIBOT · Proyecto C-LIFE · Datos de salud protegidos conforme a la Ley 1581 de 2012.
          </p>
          <p>
            Cuibot es una guía orientativa de hábitos saludables y no sustituye la valoración médica profesional.
          </p>
        </div>
      </footer>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/20 bg-white/95 backdrop-blur-md lg:hidden"
        aria-label="Navegación móvil"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {ENLACES.map(({ ruta, etiqueta, icono: Icono, exacto }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={exacto}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 text-[9px] font-semibold transition-colors sm:text-[10px]',
                  isActive ? 'text-primary-ink' : 'text-muted-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icono className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_rgba(168,255,230,0.9)]')} />
                  <span className="leading-none">{etiqueta}</span>
                  <span
                    className={cn(
                      'mt-0.5 h-1 w-1 rounded-full',
                      isActive ? 'bg-primary' : 'bg-transparent',
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function InsigniaRol({ rol }: { rol: string }) {
  return rol === 'administrador' ? (
    <Badge variant="outline" className="gap-1 border-primary/50 bg-white">
      <ShieldCheck className="h-3 w-3" /> Administrador
    </Badge>
  ) : (
    <Badge variant="secondary">Paciente</Badge>
  );
}
