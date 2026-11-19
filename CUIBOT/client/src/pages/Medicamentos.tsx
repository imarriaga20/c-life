import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Pencil,
  Pill,
  Plus,
  RefreshCw,
  Trash2,
  X,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { api, mensajeDeError } from '@/lib/api';
import { ahoraHHMM, fechaHoraToma, horaCorta } from '@/lib/format';
import type { Medicamento, Recordatorio, Toma } from '@/lib/types';

export default function Medicamentos() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [dialogo, setDialogo] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Medicamento | null>(null);
  const [nombre, setNombre] = useState('');
  const [dosis, setDosis] = useState('');
  const [horario, setHorario] = useState('');
  const [horas, setHoras] = useState<string[]>(['08:00']);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  const [eliminar, setEliminar] = useState<Medicamento | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [confirmar, setConfirmar] = useState<Medicamento | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [tomas, setTomas] = useState<Toma[]>([]);
  const [cargandoTomas, setCargandoTomas] = useState(false);
  const [cambiandoId, setCambiandoId] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setMedicamentos(await api.get<Medicamento[]>('/medicamentos'));
    } catch (fallo) {
      toast({ titulo: 'No se pudieron cargar los medicamentos', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setCargando(false);
    }
  }, [toast]);

  const cargarTomas = useCallback(async () => {
    setCargandoTomas(true);
    try {
      setTomas(await api.get<Toma[]>('/tomas?limite=100'));
    } catch (fallo) {
      toast({ titulo: 'No se pudo cargar el historial', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setCargandoTomas(false);
    }
  }, [toast]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      abrirNuevo();
    }
    // Solo al montar la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirNuevo = () => {
    setEnEdicion(null);
    setNombre('');
    setDosis('');
    setHorario('');
    setHoras([ahoraHHMM()]);
    setErrorFormulario('');
    setDialogo(true);
  };

  const abrirEdicion = (medicamento: Medicamento) => {
    setEnEdicion(medicamento);
    setNombre(medicamento.nombre);
    setDosis(medicamento.dosis);
    setHorario(medicamento.horario);
    setHoras(medicamento.recordatorios.length ? medicamento.recordatorios.map((r) => horaCorta(r.hora)) : ['08:00']);
    setErrorFormulario('');
    setDialogo(true);
  };

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrorFormulario('');

    if (nombre.trim().length < 2) {
      setErrorFormulario('Ingresa el nombre del medicamento.');
      return;
    }
    if (!dosis.trim()) {
      setErrorFormulario('Ingresa la dosis indicada por tu médico.');
      return;
    }
    if (!horario.trim()) {
      setErrorFormulario('Indica el horario o la frecuencia.');
      return;
    }
    const horasValidas = horas.filter(Boolean);
    if (!horasValidas.length) {
      setErrorFormulario('Agrega al menos una hora de recordatorio.');
      return;
    }

    setGuardando(true);
    try {
      const cuerpo = {
        nombre: nombre.trim(),
        dosis: dosis.trim(),
        horario: horario.trim(),
        recordatorios: horasValidas.map((hora) => ({ hora })),
      };
      if (enEdicion) {
        await api.put(`/medicamentos/${enEdicion.id_medicamento}`, cuerpo);
        toast({ titulo: 'Medicamento actualizado', descripcion: 'Los cambios se guardaron correctamente.' });
      } else {
        await api.post('/medicamentos', cuerpo);
        toast({ titulo: 'Medicamento registrado', descripcion: 'Los recordatorios quedaron activos.' });
      }
      setDialogo(false);
      await cargar();
    } catch (fallo) {
      setErrorFormulario(mensajeDeError(fallo));
    } finally {
      setGuardando(false);
    }
  };

  const alternarRecordatorio = async (recordatorio: Recordatorio) => {
    const nuevoEstado = recordatorio.estado === 'activo' ? 'inactivo' : 'activo';
    setCambiandoId(recordatorio.id_recordatorio);
    try {
      const respuesta = await api.put<{ mensaje: string; recordatorio: Recordatorio }>(
        `/recordatorios/${recordatorio.id_recordatorio}/toggle`,
        { estado: nuevoEstado },
      );
      setMedicamentos((actuales) =>
        actuales.map((medicamento) => ({
          ...medicamento,
          recordatorios: medicamento.recordatorios.map((item) =>
            item.id_recordatorio === recordatorio.id_recordatorio ? respuesta.recordatorio : item,
          ),
        })),
      );
      toast({ titulo: respuesta.mensaje, variante: 'info' });
    } catch (fallo) {
      toast({ titulo: 'No se pudo cambiar el recordatorio', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setCambiandoId(null);
    }
  };

  const eliminarMedicamento = async () => {
    if (!eliminar) return;
    setEliminando(true);
    try {
      const respuesta = await api.delete<{ mensaje: string }>(`/medicamentos/${eliminar.id_medicamento}`);
      toast({ titulo: 'Medicamento eliminado', descripcion: respuesta.mensaje });
      setEliminar(null);
      await cargar();
    } catch (fallo) {
      toast({ titulo: 'No se pudo eliminar', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setEliminando(false);
    }
  };

  const confirmarToma = async () => {
    if (!confirmar) return;
    setConfirmando(true);
    try {
      const respuesta = await api.post<{ mensaje: string; ya_confirmada: boolean }>('/tomas', {
        id_medicamento: confirmar.id_medicamento,
        confirmada: true,
      });
      toast({
        titulo: respuesta.ya_confirmada ? 'Toma ya registrada' : '¡Toma confirmada!',
        descripcion: respuesta.mensaje,
        variante: respuesta.ya_confirmada ? 'info' : 'success',
      });
      setConfirmar(null);
    } catch (fallo) {
      toast({ titulo: 'No se pudo confirmar', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setConfirmando(false);
    }
  };

  const abrirHistorial = () => {
    setHistorialAbierto(true);
    void cargarTomas();
  };

  return (
    <div>
      <PageHeader
        titulo="Medicamentos y recordatorios"
        descripcion="Gestiona tu tratamiento, activa o pausa alarmas y confirma tus tomas para mantener la adherencia."
        icono={Pill}
        acciones={
          <>
            <Button variant="outline" size="sm" onClick={abrirHistorial}>
              <History className="h-3.5 w-3.5" /> Historial de tomas
            </Button>
            <Button size="sm" onClick={abrirNuevo}>
              <Plus className="h-3.5 w-3.5" /> Registrar medicamento
            </Button>
          </>
        }
      />

      {cargando ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : medicamentos.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icono={Pill}
              titulo="Aún no tienes medicamentos registrados"
              descripcion="Agrega tus fármacos, su dosis y horario para recibir recordatorios y llevar tu adherencia."
              accion={
                <Button size="sm" onClick={abrirNuevo}>
                  <Plus className="h-4 w-4" /> Registrar medicamento
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {medicamentos.map((medicamento) => (
            <Card key={medicamento.id_medicamento} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary/60 text-primary-ink ring-1 ring-primary/20">
                    <Pill className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="text-lg">{medicamento.nombre}</CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {medicamento.dosis} · {medicamento.horario}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => abrirEdicion(medicamento)} aria-label={`Editar ${medicamento.nombre}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEliminar(medicamento)} aria-label={`Eliminar ${medicamento.nombre}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  <BellRing className="h-3.5 w-3.5 text-primary-ink" /> Recordatorios
                </div>

                {medicamento.recordatorios.length === 0 ? (
                  <p className="rounded-xl bg-secondary/20 p-3 text-xs text-muted-foreground">
                    Sin recordatorios configurados. Edita el medicamento para agregar horas.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {medicamento.recordatorios.map((recordatorio) => {
                      const activo = recordatorio.estado === 'activo';
                      return (
                        <li
                          key={recordatorio.id_recordatorio}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                            activo ? 'border-primary/20 bg-secondary/15' : 'border-border bg-muted/40'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`grid h-10 w-14 shrink-0 place-items-center rounded-lg font-heading text-sm font-bold ${
                                activo ? 'bg-white text-foreground ring-1 ring-primary/20' : 'bg-white text-muted-foreground ring-1 ring-border'
                              }`}
                            >
                              {horaCorta(recordatorio.hora)}
                            </span>
                            <div className="min-w-0">
                              <p className={`line-clamp-2 text-xs font-semibold leading-snug ${activo ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {recordatorio.mensaje}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {activo ? 'Recordatorio activo' : 'Recordatorio pausado'}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={activo}
                            disabled={cambiandoId === recordatorio.id_recordatorio}
                            onCheckedChange={() => void alternarRecordatorio(recordatorio)}
                            aria-label={`Activar o pausar recordatorio de las ${horaCorta(recordatorio.hora)}`}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button className="flex-1" size="sm" onClick={() => setConfirmar(medicamento)}>
                    <CheckCircle2 className="h-4 w-4" /> Confirmar toma
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={abrirHistorial}>
                    <History className="h-4 w-4" /> Ver historial
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Crear / editar */}
      <Dialog open={dialogo} onOpenChange={setDialogo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{enEdicion ? 'Editar medicamento' : 'Registrar medicamento'}</DialogTitle>
            <DialogDescription>
              {enEdicion
                ? 'Actualiza los datos y las horas de recordatorio. Las alarmas se reactivan al guardar.'
                : 'Completa los datos tal como aparecen en tu fórmula médica.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="med-nombre">Nombre del medicamento</Label>
              <Input
                id="med-nombre"
                placeholder="Ej.: Metformina"
                maxLength={100}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="med-dosis">Dosis</Label>
                <Input
                  id="med-dosis"
                  placeholder="Ej.: 850 mg"
                  maxLength={100}
                  value={dosis}
                  onChange={(e) => setDosis(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-horario">Horario o frecuencia</Label>
                <Input
                  id="med-horario"
                  placeholder="Ej.: 08:00 y 20:00"
                  maxLength={50}
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Horas de recordatorio</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setHoras((actuales) => [...actuales, '12:00'].slice(0, 6))}
                  disabled={horas.length >= 6}
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar hora
                </Button>
              </div>
              <div className="space-y-2">
                {horas.map((hora, indice) => (
                  <div key={`${indice}-${hora}`} className="flex items-center gap-2">
                    <Input
                      type="time"
                      aria-label={`Hora de recordatorio ${indice + 1}`}
                      value={hora}
                      onChange={(e) =>
                        setHoras((actuales) => actuales.map((item, i) => (i === indice ? e.target.value : item)))
                      }
                      required
                    />
                    {horas.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setHoras((actuales) => actuales.filter((_, i) => i !== indice))}
                        aria-label="Quitar hora"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Puedes configurar hasta 6 alarmas por medicamento. Se activarán automáticamente.
              </p>
            </div>

            {errorFormulario ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {errorFormulario}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogo(false)} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pill className="h-4 w-4" />}
                {enEdicion ? 'Guardar cambios' : 'Registrar medicamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Eliminar */}
      <Dialog open={Boolean(eliminar)} onOpenChange={(abierto) => !abierto && setEliminar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar medicamento</DialogTitle>
            <DialogDescription>
              Se eliminarán también sus recordatorios y todo el historial de tomas asociado. Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">
            {eliminar?.nombre} · {eliminar?.dosis}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEliminar(null)} disabled={eliminando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void eliminarMedicamento()} disabled={eliminando}>
              {eliminando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar toma */}
      <Dialog open={Boolean(confirmar)} onOpenChange={(abierto) => !abierto && setConfirmar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar toma</DialogTitle>
            <DialogDescription>Registra el cumplimiento con la fecha y hora actuales.</DialogDescription>
          </DialogHeader>
          {confirmar ? (
            <div className="rounded-xl border border-primary/20 bg-secondary/20 p-4">
              <p className="font-heading text-lg font-bold text-foreground">{confirmar.nombre}</p>
              <p className="text-sm text-muted-foreground">
                {confirmar.dosis} · {confirmar.horario}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Hora actual: {ahoraHHMM()}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmar(null)} disabled={confirmando}>
              Cancelar
            </Button>
            <Button onClick={() => void confirmarToma()} disabled={confirmando}>
              {confirmando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirmar toma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Historial de tomas */}
      <Dialog open={historialAbierto} onOpenChange={setHistorialAbierto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historial de tomas</DialogTitle>
            <DialogDescription>Registro cronológico de tu adherencia farmacológica.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => void cargarTomas()} disabled={cargandoTomas}>
              <RefreshCw className={cargandoTomas ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} /> Actualizar
            </Button>
          </div>
          {cargandoTomas ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : tomas.length === 0 ? (
            <EmptyState
              icono={CalendarClock}
              titulo="Sin tomas registradas"
              descripcion="Cuando confirmes una toma, aparecerá aquí con su fecha y hora."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tomas.map((toma) => (
                  <TableRow key={toma.id_toma}>
                    <TableCell className="whitespace-nowrap text-xs">{fechaHoraToma(toma.fecha_hora)}</TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold">{toma.medicamento}</p>
                      <p className="text-[10px] text-muted-foreground">{toma.dosis}</p>
                    </TableCell>
                    <TableCell>
                      {toma.confirmada ? (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3" /> Confirmada
                        </Badge>
                      ) : (
                        <Badge variant="warning">Omitida</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
