import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BellOff,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Pill,
  Plus,
  RefreshCw,
  UtensilsCrossed,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';
import { api, mensajeDeError } from '@/lib/api';
import { fechaLarga, horaCorta } from '@/lib/format';
import type { RecordatorioDashboard, ResumenDashboard } from '@/lib/types';

const ACCIONES = [
  {
    ruta: '/alimentacion?nuevo=1',
    etiqueta: 'Registrar comida',
    detalle: 'Desayuno, almuerzo o cena',
    icono: UtensilsCrossed,
  },
  {
    ruta: '/actividad?nuevo=1',
    etiqueta: 'Registrar actividad',
    detalle: 'Suma minutos a tu meta',
    icono: Activity,
  },
  {
    ruta: '/medicamentos?nuevo=1',
    etiqueta: 'Registrar medicamento',
    detalle: 'Dosis y recordatorios',
    icono: Pill,
  },
  {
    ruta: '/cuibot',
    etiqueta: 'Consultar a Cuibot',
    detalle: 'Orientación inmediata',
    icono: Bot,
  },
];

export default function Dashboard() {
  const { usuario } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState<RecordatorioDashboard | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const cargarResumen = useCallback(async () => {
    setError('');
    try {
      const datos = await api.get<ResumenDashboard>('/dashboard/resumen');
      setResumen(datos);
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarResumen();
  }, [cargarResumen]);

  const confirmarToma = async () => {
    if (!seleccionado) return;
    setConfirmando(true);
    try {
      const respuesta = await api.post<{ mensaje: string; ya_confirmada: boolean }>('/tomas', {
        id_medicamento: seleccionado.id_medicamento,
        confirmada: true,
      });
      toast({
        titulo: respuesta.ya_confirmada ? 'Toma ya registrada' : '¡Toma confirmada!',
        descripcion: respuesta.mensaje,
        variante: respuesta.ya_confirmada ? 'info' : 'success',
      });
      setSeleccionado(null);
      await cargarResumen();
    } catch (fallo) {
      toast({ titulo: 'No se pudo confirmar', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setConfirmando(false);
    }
  };

  const nombreCorto = usuario?.nombre?.split(' ')[0] || 'paciente';
  const pendientes = resumen?.recordatorios.filter((r) => !r.confirmada_hoy).length ?? 0;

  return (
    <div>
      <PageHeader
        titulo={`Hola, ${nombreCorto}`}
        descripcion={`${fechaLarga()} · Este es el control de tu día. ${
          pendientes > 0 ? `Tienes ${pendientes} recordatorio${pendientes === 1 ? '' : 's'} pendiente${pendientes === 1 ? '' : 's'}.` : '¡No tienes recordatorios pendientes!'
        }`}
        icono={CalendarDays}
        acciones={
          <>
            <Badge variant="outline" className="hidden bg-white sm:inline-flex">
              {usuario?.tipo_diabetes || 'Sin tipo definido'}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => void cargarResumen()}>
              <RefreshCw className="h-3.5 w-3.5" /> Actualizar
            </Button>
          </>
        }
      />

      {error ? (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => void cargarResumen()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <section aria-label="Acciones rápidas" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ACCIONES.map(({ ruta, etiqueta, detalle, icono: Icono }) => (
          <Link
            key={ruta}
            to={ruta}
            className="pill-halo group flex flex-col items-start gap-3 rounded-2xl border border-primary/25 bg-white p-4 text-left shadow-sm transition-colors hover:border-primary/50"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/70 text-primary-ink ring-1 ring-primary/15 transition-transform group-hover:scale-105">
              <Icono className="h-5 w-5" />
            </span>
            <span>
              <span className="flex items-center gap-1 font-heading text-sm font-bold text-foreground">
                <Plus className="h-3.5 w-3.5 text-primary-ink" />
                {etiqueta}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{detalle}</span>
            </span>
          </Link>
        ))}
      </section>

      {cargando ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="space-y-5">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      ) : resumen ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* Recordatorios */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BellIcon /> Recordatorios próximos
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">Medicamentos activos para hoy</p>
                </div>
                <Badge variant={pendientes > 0 ? 'warning' : 'success'}>
                  {pendientes > 0 ? `${pendientes} pendiente${pendientes === 1 ? '' : 's'}` : 'Todo al día'}
                </Badge>
              </CardHeader>
              <CardContent>
                {resumen.recordatorios.length === 0 ? (
                  <EmptyState
                    icono={BellOff}
                    titulo="No tienes recordatorios activos"
                    descripcion="Registra un medicamento y programa sus horas para recibir avisos aquí."
                    accion={
                      <Button size="sm" asChild>
                        <Link to="/medicamentos?nuevo=1">
                          <Plus className="h-4 w-4" /> Registrar medicamento
                        </Link>
                      </Button>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-border/70">
                    {resumen.recordatorios.map((recordatorio) => (
                      <li
                        key={recordatorio.id_recordatorio}
                        className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 grid h-11 w-14 shrink-0 place-items-center rounded-xl bg-secondary/60 font-heading text-sm font-bold text-foreground ring-1 ring-primary/15">
                            {horaCorta(recordatorio.hora)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-heading text-sm font-bold text-foreground">
                              {recordatorio.medicamento}{' '}
                              <span className="font-normal text-muted-foreground">· {recordatorio.dosis}</span>
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">{recordatorio.mensaje}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 pl-14 sm:pl-0">
                          {recordatorio.confirmada_hoy ? (
                            <Badge variant="success">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Confirmada hoy
                            </Badge>
                          ) : (
                            <Button size="sm" onClick={() => setSeleccionado(recordatorio)}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar toma
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Últimos registros */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UtensilsCrossed className="h-4 w-4 text-primary-ink" /> Últimas comidas
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/alimentacion">Ver todo <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {resumen.ultimasComidas.length === 0 ? (
                    <p className="rounded-xl bg-secondary/20 p-4 text-xs text-muted-foreground">
                      Aún no registras comidas. ¡Empieza con tu primera comida del día!
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {resumen.ultimasComidas.map((comida) => (
                        <li key={comida.id_alimento} className="flex items-start gap-2.5">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-xs font-semibold text-foreground">{comida.descripcion}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {comida.tipo_comida || 'Comida'} · {horaCorta(comida.hora)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4 text-primary-ink" /> Última actividad
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/actividad">Ver todo <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {resumen.ultimasActividades.length === 0 ? (
                    <p className="rounded-xl bg-secondary/20 p-4 text-xs text-muted-foreground">
                      Aún no registras actividades hoy.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {resumen.ultimasActividades.map((actividad) => (
                        <li key={actividad.id_actividad} className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">{actividad.tipo}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{actividad.fecha}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {actividad.duracion} min
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resumen de hoy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    icono: UtensilsCrossed,
                    etiqueta: 'Comidas registradas',
                    valor: resumen.hoy.comidas,
                    unidad: resumen.hoy.comidas === 1 ? 'comida' : 'comidas',
                  },
                  {
                    icono: Activity,
                    etiqueta: 'Minutos de actividad',
                    valor: resumen.hoy.minutos_actividad,
                    unidad: 'min',
                  },
                  {
                    icono: Pill,
                    etiqueta: 'Tomas confirmadas',
                    valor: resumen.hoy.tomas_confirmadas,
                    unidad: resumen.hoy.tomas_confirmadas === 1 ? 'toma' : 'tomas',
                  },
                ].map(({ icono: Icono, etiqueta, valor, unidad }) => (
                  <div key={etiqueta} className="flex items-center gap-3 rounded-xl bg-secondary/20 p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-primary-ink ring-1 ring-primary/15">
                      <Icono className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-[11px] text-muted-foreground">{etiqueta}</p>
                      <p className="font-heading text-lg font-extrabold leading-tight text-foreground">
                        {valor} <span className="text-xs font-medium text-muted-foreground">{unidad}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary-ink" /> Meta semanal ADA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-end justify-between">
                  <p className="font-heading text-2xl font-extrabold text-foreground">
                    {resumen.actividadSemanal.total}
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      / {resumen.actividadSemanal.meta} min
                    </span>
                  </p>
                  <Badge variant={resumen.actividadSemanal.cumplida ? 'success' : 'outline'}>
                    {resumen.actividadSemanal.porcentaje}%
                  </Badge>
                </div>
                <Progress
                  value={resumen.actividadSemanal.porcentaje}
                  aria-label="Progreso de la meta semanal de actividad física"
                />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {resumen.actividadSemanal.cumplida
                    ? '¡Meta semanal cumplida! Mantén el ritmo.'
                    : `Faltan ${Math.max(0, resumen.actividadSemanal.meta - resumen.actividadSemanal.total)} minutos para cumplir la meta.`}
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                  <Link to="/actividad">
                    <Plus className="h-3.5 w-3.5" /> Registrar actividad
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <section className="relative overflow-hidden rounded-2xl bg-[#121A18] p-5 text-white shadow-lg">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                style={{ background: 'radial-gradient(circle, #A8FFE6 0%, transparent 70%)' }}
              />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#A8FFE6] ring-1 ring-white/10">
                    <Bot className="h-5 w-5" />
                  </span>
                  <p className="font-heading text-sm font-bold">Asistente Cuibot</p>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-white/70">
                  ¿Tienes dudas sobre tu alimentación o cómo actuar ante un bajón de azúcar? Cuibot puede
                  orientarte en segundos.
                </p>
                <Button size="sm" className="mt-4 w-full bg-[#A8FFE6] text-[#121A18] hover:bg-[#A8FFE6]/90" asChild>
                  <Link to="/cuibot">
                    <Bot className="h-4 w-4" /> Conversar ahora
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      <Dialog open={Boolean(seleccionado)} onOpenChange={(abierto) => !abierto && setSeleccionado(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar toma</DialogTitle>
            <DialogDescription>Verifica que vas a registrar la toma de hoy.</DialogDescription>
          </DialogHeader>
          {seleccionado ? (
            <div className="rounded-xl border border-primary/20 bg-secondary/20 p-4">
              <p className="font-heading text-lg font-bold text-foreground">{seleccionado.medicamento}</p>
              <p className="text-sm text-muted-foreground">
                {seleccionado.dosis} · Programada a las {horaCorta(seleccionado.hora)}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Se registrará con la fecha y hora actuales.
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeleccionado(null)} disabled={confirmando}>
              Cancelar
            </Button>
            <Button onClick={() => void confirmarToma()} disabled={confirmando}>
              {confirmando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirmar toma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BellIcon() {
  return <Clock className="h-4 w-4 text-primary-ink" />;
}
