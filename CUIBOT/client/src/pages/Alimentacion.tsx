import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Apple,
  CalendarDays,
  Clock,
  Coffee,
  Loader2,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  Salad,
  Settings2,
  ShieldCheck,
  Sun,
  Trash2,
  UtensilsCrossed,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';
import { api, mensajeDeError } from '@/lib/api';
import { ahoraHHMM, fechaCorta, hoyISO, horaCorta } from '@/lib/format';
import type { Comida, MenuRecomendado, Momento } from '@/lib/types';

const MOMENTOS: Momento[] = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'];
const TIPOS_MENU = ['Tipo 1', 'Tipo 2', 'Gestacional', 'General'];

const ICONOS_MOMENTO = {
  Desayuno: Coffee,
  Almuerzo: Sun,
  Cena: Moon,
  Merienda: Apple,
} as const;

export default function Alimentacion() {
  const { usuario } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const esAdmin = usuario?.rol === 'administrador';

  const [tab, setTab] = useState(searchParams.get('nuevo') ? 'registrar' : 'historial');

  const [descripcion, setDescripcion] = useState('');
  const [tipoComida, setTipoComida] = useState<string>('Desayuno');
  const [fecha, setFecha] = useState(hoyISO());
  const [hora, setHora] = useState(ahoraHHMM());
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  const [comidas, setComidas] = useState<Comida[]>([]);
  const [cargandoComidas, setCargandoComidas] = useState(true);
  const [menuEliminar, setMenuEliminar] = useState<Comida | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [menus, setMenus] = useState<MenuRecomendado[]>([]);
  const [cargandoMenus, setCargandoMenus] = useState(false);
  const [todosMenus, setTodosMenus] = useState<MenuRecomendado[]>([]);
  const [cargandoAdmin, setCargandoAdmin] = useState(false);

  const [menuDialogo, setMenuDialogo] = useState(false);
  const [menuEnEdicion, setMenuEnEdicion] = useState<MenuRecomendado | null>(null);
  const [menuTipo, setMenuTipo] = useState('Tipo 2');
  const [menuMomento, setMenuMomento] = useState<string>('Desayuno');
  const [menuDescripcion, setMenuDescripcion] = useState('');
  const [guardandoMenu, setGuardandoMenu] = useState(false);
  const [menuAEliminar, setMenuAEliminar] = useState<MenuRecomendado | null>(null);

  const cargarComidas = useCallback(async () => {
    setCargandoComidas(true);
    try {
      setComidas(await api.get<Comida[]>('/alimentacion'));
    } catch (fallo) {
      toast({ titulo: 'No se pudo cargar el historial', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setCargandoComidas(false);
    }
  }, [toast]);

  const cargarMenus = useCallback(async (excluir: number[] = []) => {
    setCargandoMenus(true);
    try {
      const consulta = excluir.length ? `/menus?excluir=${excluir.join(',')}` : '/menus';
      setMenus(await api.get<MenuRecomendado[]>(consulta));
    } catch (fallo) {
      toast({ titulo: 'No se pudieron cargar los menús', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setCargandoMenus(false);
    }
  }, [toast]);

  const cargarTodosMenus = useCallback(async () => {
    if (!esAdmin) return;
    setCargandoAdmin(true);
    try {
      setTodosMenus(await api.get<MenuRecomendado[]>('/menus?todos=1'));
    } catch (fallo) {
      toast({ titulo: 'No se pudo cargar el catálogo', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setCargandoAdmin(false);
    }
  }, [esAdmin, toast]);

  useEffect(() => {
    void cargarComidas();
    void cargarMenus();
  }, [cargarComidas, cargarMenus]);

  useEffect(() => {
    if (tab === 'admin') void cargarTodosMenus();
  }, [tab, cargarTodosMenus]);

  const registrarComida = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrorFormulario('');

    if (descripcion.trim().length < 3) {
      setErrorFormulario('Describe tu comida con al menos 3 caracteres.');
      return;
    }
    if (descripcion.trim().length > 255) {
      setErrorFormulario('La descripción no puede superar los 255 caracteres.');
      return;
    }
    if (!tipoComida) {
      setErrorFormulario('Selecciona el tipo de comida.');
      return;
    }
    if (!fecha || !hora) {
      setErrorFormulario('La fecha y la hora son obligatorias.');
      return;
    }

    setGuardando(true);
    try {
      await api.post('/alimentacion', {
        descripcion: descripcion.trim(),
        tipo_comida: tipoComida,
        fecha,
        hora,
      });
      toast({ titulo: 'Comida registrada', descripcion: 'Tu registro se guardó correctamente.' });
      setDescripcion('');
      setFecha(hoyISO());
      setHora(ahoraHHMM());
      setTab('historial');
      await cargarComidas();
    } catch (fallo) {
      setErrorFormulario(mensajeDeError(fallo));
    } finally {
      setGuardando(false);
    }
  };

  const eliminarComida = async () => {
    if (!menuEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/alimentacion/${menuEliminar.id_alimento}`);
      toast({ titulo: 'Registro eliminado', descripcion: 'La comida se eliminó del historial.' });
      setMenuEliminar(null);
      await cargarComidas();
    } catch (fallo) {
      toast({ titulo: 'No se pudo eliminar', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setEliminando(false);
    }
  };

  const abrirMenuDialogo = (menu: MenuRecomendado | null) => {
    setMenuEnEdicion(menu);
    setMenuTipo(menu?.tipo_diabetes || 'Tipo 2');
    setMenuMomento(menu?.momento || 'Desayuno');
    setMenuDescripcion(menu?.descripcion || '');
    setMenuDialogo(true);
  };

  const guardarMenu = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (menuDescripcion.trim().length < 5) {
      toast({ titulo: 'Descripción muy corta', descripcion: 'Escribe al menos 5 caracteres.', variante: 'error' });
      return;
    }

    setGuardandoMenu(true);
    try {
      const cuerpo = {
        tipo_diabetes: menuTipo,
        momento: menuMomento,
        descripcion: menuDescripcion.trim(),
      };
      if (menuEnEdicion) {
        await api.put(`/menus/${menuEnEdicion.id_menu}`, cuerpo);
        toast({ titulo: 'Menú actualizado', descripcion: 'El catálogo se actualizó correctamente.' });
      } else {
        await api.post('/menus', cuerpo);
        toast({ titulo: 'Menú creado', descripcion: 'El nuevo menú ya está disponible.' });
      }
      setMenuDialogo(false);
      await Promise.all([cargarTodosMenus(), cargarMenus()]);
    } catch (fallo) {
      toast({ titulo: 'No se pudo guardar el menú', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setGuardandoMenu(false);
    }
  };

  const eliminarMenu = async () => {
    if (!menuAEliminar) return;
    try {
      await api.delete(`/menus/${menuAEliminar.id_menu}`);
      toast({ titulo: 'Menú eliminado', descripcion: 'El menú se retiró del catálogo.' });
      setMenuAEliminar(null);
      await Promise.all([cargarTodosMenus(), cargarMenus()]);
    } catch (fallo) {
      toast({ titulo: 'No se pudo eliminar', descripcion: mensajeDeError(fallo), variante: 'error' });
    }
  };

  const menusPorMomento = MOMENTOS.map((momento) => ({
    momento,
    items: menus.filter((menu) => menu.momento === momento),
  }));

  return (
    <div>
      <PageHeader
        titulo="Alimentación"
        descripcion="Registra tus comidas, revisa tu historial y consulta menús recomendados según tu tipo de diabetes."
        icono={UtensilsCrossed}
        acciones={
          <Badge variant="outline" className="bg-white">
            {usuario?.tipo_diabetes || 'Menús generales'}
          </Badge>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="registrar">
            <Plus className="h-4 w-4" /> Registrar comida
          </TabsTrigger>
          <TabsTrigger value="historial">
            <CalendarDays className="h-4 w-4" /> Historial
          </TabsTrigger>
          <TabsTrigger value="menus">
            <Salad className="h-4 w-4" /> Menús recomendados
          </TabsTrigger>
          {esAdmin ? (
            <TabsTrigger value="admin">
              <Settings2 className="h-4 w-4" /> Administrar menús
            </TabsTrigger>
          ) : null}
        </TabsList>

        {/* Registrar */}
        <TabsContent value="registrar">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Nueva comida</CardTitle>
                <CardDescription>
                  La fecha y la hora vienen precargadas con el momento actual. Solo describe lo que consumiste.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={registrarComida} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="comida-fecha">Fecha</Label>
                      <Input
                        id="comida-fecha"
                        type="date"
                        max={hoyISO()}
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comida-hora">Hora</Label>
                      <Input
                        id="comida-hora"
                        type="time"
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comida-tipo">Tipo de comida</Label>
                      <Select value={tipoComida || undefined} onValueChange={setTipoComida}>
                        <SelectTrigger id="comida-tipo">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOMENTOS.map((momento) => (
                            <SelectItem key={momento} value={momento}>
                              {momento}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comida-descripcion">Descripción</Label>
                      <span className="text-[11px] text-muted-foreground">{descripcion.length}/255</span>
                    </div>
                    <Textarea
                      id="comida-descripcion"
                      placeholder="Ej.: Omelette de 2 huevos con espinacas, una rebanada de pan integral y té sin azúcar."
                      maxLength={255}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                      autoFocus={searchParams.get('nuevo') === '1'}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Incluye porciones e ingredientes para llevar un mejor control.
                    </p>
                  </div>

                  {errorFormulario ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                      {errorFormulario}
                    </p>
                  ) : null}

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => setTab('historial')}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={guardando}>
                      {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UtensilsCrossed className="h-4 w-4" />}
                      {guardando ? 'Guardando…' : 'Guardar comida'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="h-fit bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-base">Consejo Cuibot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Usa el <strong className="text-foreground">método del plato</strong>: 50 % verduras, 25 %
                  proteína magra y 25 % carbohidratos complejos.
                </p>
                <p className="rounded-xl bg-white/70 p-3 text-xs">
                  Registrar tus comidas te ayuda a identificar patrones y a conversar con tu médico con datos
                  concretos.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => void cargarMenus(menus.map((menu) => menu.id_menu))}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Actualizar menús
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Historial */}
        <TabsContent value="historial">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Historial de comidas</CardTitle>
                <CardDescription>Del registro más reciente al más antiguo.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => void cargarComidas()} disabled={cargandoComidas}>
                <RefreshCw className={cargandoComidas ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} /> Actualizar
              </Button>
            </CardHeader>
            <CardContent>
              {cargandoComidas ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : comidas.length === 0 ? (
                <EmptyState
                  icono={UtensilsCrossed}
                  titulo="Aún no has registrado comidas"
                  descripcion="¡Lleva el control de tus hábitos saludables agregando tu primera comida!"
                  accion={
                    <Button size="sm" onClick={() => setTab('registrar')}>
                      <Plus className="h-4 w-4" /> Registrar comida
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Momento</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comidas.map((comida) => (
                          <TableRow key={comida.id_alimento}>
                            <TableCell className="whitespace-nowrap font-medium">{fechaCorta(comida.fecha)}</TableCell>
                            <TableCell className="whitespace-nowrap">{horaCorta(comida.hora)}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{comida.tipo_comida || '—'}</Badge>
                            </TableCell>
                            <TableCell className="max-w-md text-sm">{comida.descripcion}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMenuEliminar(comida)}
                                aria-label={`Eliminar comida del ${comida.fecha}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <ul className="space-y-3 md:hidden">
                    {comidas.map((comida) => (
                      <li key={comida.id_alimento} className="rounded-xl border border-primary/15 bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="secondary">{comida.tipo_comida || 'Comida'}</Badge>
                              <span className="text-[11px] text-muted-foreground">
                                {fechaCorta(comida.fecha)} · {horaCorta(comida.hora)}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm leading-snug text-foreground">{comida.descripcion}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setMenuEliminar(comida)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menús */}
        <TabsContent value="menus">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold">Menús clínicos recomendados</h2>
              <p className="text-xs text-muted-foreground">
                Basados en lineamientos de la ADA y filtrados para {usuario?.tipo_diabetes || 'menús generales'}.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void cargarMenus(menus.map((menu) => menu.id_menu))}
              disabled={cargandoMenus}
            >
              <RefreshCw className={cargandoMenus ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} /> Actualizar
            </Button>
          </div>

          {cargandoMenus ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-36 w-full" />
              ))}
            </div>
          ) : menus.length === 0 ? (
            <EmptyState
              icono={Salad}
              titulo="No hay menús disponibles"
              descripcion="El administrador aún no ha cargado menús para tu tipo de diabetes."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {menusPorMomento.map(({ momento, items }) => {
                if (!items.length) return null;
                const Icono = ICONOS_MOMENTO[momento];
                return (
                  <Card key={momento} className="overflow-hidden">
                    <CardHeader className="flex-row items-center gap-3 space-y-0 bg-secondary/25 pb-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-primary-ink ring-1 ring-primary/20">
                        <Icono className="h-4 w-4" />
                      </span>
                      <div>
                        <CardTitle className="text-base">{momento}</CardTitle>
                        <p className="text-[11px] text-muted-foreground">{items[0].tipo_diabetes}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-3">
                        {items.map((menu) => (
                          <li key={menu.id_menu} className="text-sm leading-relaxed text-foreground">
                            {menu.descripcion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Administración (RF17) */}
        {esAdmin ? (
          <TabsContent value="admin">
            <Card>
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary-ink" /> Catálogo de menús
                  </CardTitle>
                  <CardDescription>Crear, editar y eliminar recomendaciones nutricionales.</CardDescription>
                </div>
                <Button size="sm" onClick={() => abrirMenuDialogo(null)}>
                  <Plus className="h-4 w-4" /> Nuevo menú
                </Button>
              </CardHeader>
              <CardContent>
                {cargandoAdmin ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : todosMenus.length === 0 ? (
                  <EmptyState
                    icono={Salad}
                    titulo="Catálogo vacío"
                    descripcion="Crea el primer menú recomendado."
                    accion={
                      <Button size="sm" onClick={() => abrirMenuDialogo(null)}>
                        <Plus className="h-4 w-4" /> Nuevo menú
                      </Button>
                    }
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Momento</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todosMenus.map((menu) => (
                        <TableRow key={menu.id_menu}>
                          <TableCell>
                            <Badge variant="outline">{menu.tipo_diabetes}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs">{menu.momento}</TableCell>
                          <TableCell className="max-w-md text-xs">{menu.descripcion}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => abrirMenuDialogo(menu)} aria-label="Editar menú">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setMenuAEliminar(menu)} aria-label="Eliminar menú">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}
      </Tabs>

      {/* Confirmar eliminación de comida */}
      <Dialog open={Boolean(menuEliminar)} onOpenChange={(abierto) => !abierto && setMenuEliminar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar registro de comida</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <p className="rounded-xl bg-secondary/25 p-3 text-sm text-foreground">{menuEliminar?.descripcion}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuEliminar(null)} disabled={eliminando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void eliminarComida()} disabled={eliminando}>
              {eliminando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crear / editar menú (admin) */}
      <Dialog open={menuDialogo} onOpenChange={setMenuDialogo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{menuEnEdicion ? 'Editar menú' : 'Nuevo menú recomendado'}</DialogTitle>
            <DialogDescription>Define el tipo de diabetes, el momento del día y la descripción.</DialogDescription>
          </DialogHeader>
          <form onSubmit={guardarMenu} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de diabetes</Label>
                <Select value={menuTipo} onValueChange={setMenuTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_MENU.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Momento</Label>
                <Select value={menuMomento} onValueChange={setMenuMomento}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOMENTOS.map((momento) => (
                      <SelectItem key={momento} value={momento}>
                        {momento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-descripcion">Descripción</Label>
              <Textarea
                id="menu-descripcion"
                maxLength={255}
                value={menuDescripcion}
                onChange={(e) => setMenuDescripcion(e.target.value)}
                placeholder="Describe el plato y sus porciones…"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMenuDialogo(false)} disabled={guardandoMenu}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardandoMenu}>
                {guardandoMenu ? <Loader2 className="h-4 w-4 animate-spin" /> : <Salad className="h-4 w-4" />}
                {menuEnEdicion ? 'Guardar cambios' : 'Crear menú'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Eliminar menú */}
      <Dialog open={Boolean(menuAEliminar)} onOpenChange={(abierto) => !abierto && setMenuAEliminar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar menú del catálogo</DialogTitle>
            <DialogDescription>Los pacientes dejarán de ver esta recomendación.</DialogDescription>
          </DialogHeader>
          <p className="rounded-xl bg-secondary/25 p-3 text-sm text-foreground">{menuAEliminar?.descripcion}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuAEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void eliminarMenu()}>
              <Trash2 className="h-4 w-4" /> Eliminar menú
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
