import * as React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type VarianteToast = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  titulo: string;
  descripcion?: string;
  variante: VarianteToast;
}

interface ToastContextValue {
  toast: (opciones: { titulo: string; descripcion?: string; variante?: VarianteToast }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const ICONOS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const ESTILOS: Record<VarianteToast, string> = {
  success: 'border-l-primary bg-white',
  error: 'border-l-red-500 bg-white',
  info: 'border-l-amber-500 bg-white',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const contador = React.useRef(0);

  const cerrar = React.useCallback((id: string) => {
    setToasts((actuales) => actuales.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue['toast']>(
    ({ titulo, descripcion, variante = 'success' }) => {
      contador.current += 1;
      const id = `toast-${Date.now()}-${contador.current}`;
      setToasts((actuales) => [...actuales.slice(-3), { id, titulo, descripcion, variante }]);
      window.setTimeout(() => cerrar(id), 5200);
    },
    [cerrar],
  );

  const valor = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-24 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 lg:bottom-6 lg:right-6"
      >
        {toasts.map((item) => {
          const Icono = ICONOS[item.variante];
          return (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border border-border border-l-4 p-4 shadow-xl animate-slide-up',
                ESTILOS[item.variante],
              )}
            >
              <Icono
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  item.variante === 'success' && 'text-primary-ink',
                  item.variante === 'error' && 'text-red-500',
                  item.variante === 'info' && 'text-amber-500',
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-bold text-foreground">{item.titulo}</p>
                {item.descripcion ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.descripcion}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => cerrar(item.id)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                aria-label="Cerrar notificación"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = React.useContext(ToastContext);
  if (!contexto) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  }
  return contexto;
}
