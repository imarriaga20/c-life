import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Flame,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  Timer,
  Trash2,
  Trophy,
} from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { api, mensajeDeError } from '@/lib/api';
import { fechaCorta, hoyISO } from '@/lib/format';
import type { Actividad as ActividadTipo, Semana } from '@/lib/types';

const TIPOS_ACTIVIDAD = ['Caminar', 'Correr', 'Bicicleta', 'Natación', 'Gimnasio', 'Otro'];

interface RespuestaActividad {
  actividades: ActividadTipo[];
  semana: Semana;
}

export default function Actividad() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [actividades, setActividades] = useState<ActividadTipo[]>([]);
  const [semana, setSemana] = useState<Semana | null>(null);
  const [cargando, setCargando] = useState(true);

  const [tipo, setTipo] = useState('Caminar');
  const [tipoOtro, setTipoOtro] = useState('');
  const [duracion, setDuracion] = useState('30');
  const [fecha, setFecha] = useState(hoyISO());
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  const [actividadEliminar, setActividadEliminar] = useState<ActividadTipo | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await api.get<RespuestaActividad>('/actividad');
      setActividades(datos.actividades);
      setSemana(datos.semana);
    } catch (fallo) {
      toast({ titulo: 'No se pudo cargar la actividad', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const registrar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrorFormulario('');

    const tipoFinal = tipo === 'Otro' ? tipoOtro.trim() : tipo;
    const minutos = Number(duracion);

    if (!tipoFinal) {
      setErrorFormulario('Especifica el tipo de actividad.');
      return;
    }
    if (!Number.isInteger(minutos) || minutos <= 0) {
      setErrorFormulario('La duración debe ser un número entero mayor que 0.');
      return;
    }
    if (minutos > 600) {
      setErrorFormulario('La duración no puede superar los 600 minutos en un solo registro.');
      return;
    }
    if (!fecha) {
      setErrorFormulario('La fecha es obligatoria.');
      return;
    }
    if (fecha > hoyISO()) {
      setErrorFormulario('La fecha no puede ser futura.');
      return;
    }

    setGuardando(true);
    try {
      const respuesta = await api.post<{ mensaje: string; semana: Semana }>('/actividad', {
        tipo: tipoFinal,
        duracion: minutos,
        fecha,
      });
      setSemana(respuesta.semana);
      toast({
        titulo: 'Actividad registrada',
        descripcion: `Sumaste ${minutos} minutos a tu meta semanal.`,
      });
      setDuracion('30');
      setFecha(hoyISO());
      if (tipo === 'Otro') setTipoOtro('');
      await cargar();
    } catch (fallo) {
      setErrorFormulario(mensajeDeError(fallo));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!actividadEliminar) return;
    setEliminando(true);
    try {
      const respuesta = await api.delete<{ mensaje: string; semana: Semana }>(
        `/actividad/${actividadEliminar.id_actividad}`,
      );
      setSemana(respuesta.semana);
      toast({ titulo: 'Actividad eliminada', descripcion: respuesta.mensaje });
      setActividadEliminar(null);
      await cargar();
    } catch (fallo) {
      toast({ titulo: 'No se pudo eliminar', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setEliminando(false);
    }
  };

  const faltan = semana ? Math.max(0, semana.meta - semana.total) : 0;

  return (
    <div>
      <PageHeader
        titulo="Actividad física"
        descripcion="Registra tus sesiones y controla el avance hacia la meta de 150 minutos semanales recomendada por la ADA."
        icono={Activity}
        acciones={
          <Badge variant={semana?.cumplida ? 'success' : 'outline'} className="bg-white">
            {semana ? `${semana.total} / ${semana.meta} min` : 'Meta 150 min'}
          </Badge>
        }
      />

      {/* Barra de progreso */}
      <Card className="mb-5 overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          {cargando || !semana ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full bg-secondary/50 ring-4 ring-primary/15">
                {semana.cumplida ? (
                  <Trophy className="h-9 w-9 text-primary-ink" />
                ) : (
                  <Target className="h-9 w-9 text-primary-ink" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Meta semanal ADA
                    </p>
                    <p className="font-heading text-3xl font-extrabold leading-tight text-foreground">
                      {semana.total}
                      <span className="ml-1 text-base font-medium text-muted-foreground">/ {semana.meta} min</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={semana.cumplida ? 'success' : 'outline'}>{semana.porcentaje}%</Badge>
                    {semana.cumplida ? (
                      <Badge variant="success" className="gap-1">
                        <Trophy className="h-3.5 w-3.5" /> ¡Meta cumplida!
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <Progress
                  value={semana.porcentaje}
                  className="mt-3 h-4"
                  aria-label="Progreso de la meta semanal de actividad física"
                />
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {semana.cumplida ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary-ink" />
                      Excelente: cumples los 150 minutos semanales. Mantén el ritmo.
                    </>
                  ) : (
                    <>
                      <Timer className="h-3.5 w-3.5 text-primary-ink" />
                      Faltan {faltan} minutos para la meta. Puedes repartirlos en varios días.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Registro */}
        <Card className="h-fit lg:col-span-2">
          <CardHeader>
            <CardTitle>Registrar actividad</CardTitle>
            <CardDescription>Anota la duración total de la sesión.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={registrar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="actividad-tipo">Tipo de actividad</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger id="actividad-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_ACTIVIDAD.map((opcion) => (
                      <SelectItem key={opcion} value={opcion}>
                        {opcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tipo === 'Otro' ? (
                  <Input
                    placeholder="¿Qué actividad realizaste?"
                    value={tipoOtro}
                    onChange={(e) => setTipoOtro(e.target.value)}
                    maxLength={100}
                  />
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="actividad-duracion">Duración (min)</Label>
                  <Input
                    id="actividad-duracion"
                    type="number"
                    min={1}
                    max={600}
                    step={1}
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    autoFocus={searchParams.get('nuevo') === '1'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actividad-fecha">Fecha</Label>
                  <Input
                    id="actividad-fecha"
                    type="date"
                    max={hoyISO()}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>
              </div>

              {errorFormulario ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {errorFormulario}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={guardando}>
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
                {guardando ? 'Guardando…' : 'Guardar actividad'}
              </Button>
            </form>

            <div className="mt-5 rounded-xl bg-secondary/20 p-3 text-[11px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Recomendación:</strong> 150 minutos semanales repartidos en
              al menos 3 días, combinando actividad aeróbica y ejercicios de fuerza.
            </div>
          </CardContent>
        </Card>

        {/* Historial */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Historial de sesiones</CardTitle>
              <CardDescription>Tus registros más recientes.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex">
                <CalendarDays className="mr-1 h-3 w-3" /> {semana ? `${fechaCorta(semana.desde)} – ${fechaCorta(semana.hasta)}` : ''}
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={() => void cargar()}
                disabled={cargando}
                aria-label="Actualizar historial de actividad"
              >
                <RefreshCw className={cargando ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : actividades.length === 0 ? (
              <EmptyState
                icono={Activity}
                titulo="Aún no registras actividades"
                descripcion="Empieza con una caminata corta y ve sumando minutos. Todo cuenta para tu meta."
                accion={
                  <Button size="sm" onClick={() => document.getElementById('actividad-duracion')?.focus()}>
                    <Plus className="h-4 w-4" /> Registrar primera sesión
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2.5">
                {actividades.map((actividad) => (
                  <li
                    key={actividad.id_actividad}
                    className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white p-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/60 text-primary-ink ring-1 ring-primary/15">
                        <Activity className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-heading text-sm font-bold text-foreground">{actividad.tipo}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {fechaCorta(actividad.fecha)} · {actividad.duracion} min
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{actividad.duracion} min</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActividadEliminar(actividad)}
                        aria-label={`Eliminar ${actividad.tipo}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(actividadEliminar)} onOpenChange={(abierto) => !abierto && setActividadEliminar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar actividad</DialogTitle>
            <DialogDescription>
              Se restarán {actividadEliminar?.duracion} minutos de tu progreso semanal.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-xl bg-secondary/25 p-3 text-sm">
            {actividadEliminar?.tipo} · {actividadEliminar ? fechaCorta(actividadEliminar.fecha) : ''}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActividadEliminar(null)} disabled={eliminando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void eliminar()} disabled={eliminando}>
              {eliminando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
