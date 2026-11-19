import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';
import { api, mensajeDeError } from '@/lib/api';
import { descargarJSON, hoyISO, iniciales } from '@/lib/format';
import type { TipoDiabetes, Usuario } from '@/lib/types';

const SIN_DEFINIR = 'sin-definir';
const TIPOS_DIABETES: TipoDiabetes[] = ['Tipo 1', 'Tipo 2', 'Gestacional', 'Otro'];
const PALABRA_CONFIRMACION = 'ELIMINAR';

export default function Perfil() {
  const { usuario, actualizarUsuario, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Perfil
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [tipoDiabetes, setTipoDiabetes] = useState<string>(
    usuario?.tipo_diabetes || SIN_DEFINIR,
  );
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState('');

  // Contraseña
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [contrasenaConfirmacion, setContrasenaConfirmacion] = useState('');
  const [guardandoContrasena, setGuardandoContrasena] = useState(false);
  const [errorContrasena, setErrorContrasena] = useState('');

  // Exportación
  const [exportando, setExportando] = useState(false);

  // Eliminación de cuenta
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [contrasenaEliminar, setContrasenaEliminar] = useState('');
  const [palabraEliminar, setPalabraEliminar] = useState('');
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  if (!usuario) {
    return null;
  }

  const guardarPerfil = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrorPerfil('');

    if (nombre.trim().length < 3) {
      setErrorPerfil('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (nombre.trim().length > 100) {
      setErrorPerfil('El nombre no puede superar los 100 caracteres.');
      return;
    }

    setGuardandoPerfil(true);
    try {
      const respuesta = await api.put<{ mensaje: string; usuario: Usuario }>('/usuarios/perfil', {
        nombre: nombre.trim(),
        tipo_diabetes: tipoDiabetes === SIN_DEFINIR ? '' : tipoDiabetes,
      });
      actualizarUsuario(respuesta.usuario);
      setNombre(respuesta.usuario.nombre);
      setTipoDiabetes(respuesta.usuario.tipo_diabetes || SIN_DEFINIR);
      toast({ titulo: 'Perfil actualizado', descripcion: respuesta.mensaje });
    } catch (fallo) {
      setErrorPerfil(mensajeDeError(fallo));
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const cambiarContrasena = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrorContrasena('');

    if (!contrasenaActual) {
      setErrorContrasena('Ingresa tu contraseña actual.');
      return;
    }
    if (contrasenaNueva.length < 8) {
      setErrorContrasena('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (contrasenaNueva.length > 72) {
      setErrorContrasena('La nueva contraseña no puede superar los 72 caracteres.');
      return;
    }
    if (contrasenaNueva !== contrasenaConfirmacion) {
      setErrorContrasena('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    if (contrasenaNueva === contrasenaActual) {
      setErrorContrasena('La nueva contraseña debe ser diferente de la actual.');
      return;
    }

    setGuardandoContrasena(true);
    try {
      await api.put('/usuarios/perfil', {
        contrasena_actual: contrasenaActual,
        contrasena_nueva: contrasenaNueva,
      });
      setContrasenaActual('');
      setContrasenaNueva('');
      setContrasenaConfirmacion('');
      toast({
        titulo: 'Contraseña actualizada',
        descripcion: 'La próxima vez inicia sesión con tu nueva contraseña.',
      });
    } catch (fallo) {
      setErrorContrasena(mensajeDeError(fallo));
    } finally {
      setGuardandoContrasena(false);
    }
  };

  const exportarDatos = async () => {
    setExportando(true);
    try {
      const datos = await api.get<Record<string, unknown>>('/usuarios/exportar');
      descargarJSON(`cuibot-mis-datos-${hoyISO()}.json`, datos);
      toast({
        titulo: 'Datos exportados',
        descripcion: 'Se descargó un archivo JSON con toda tu información (Ley 1581 de 2012).',
      });
    } catch (fallo) {
      toast({ titulo: 'No se pudo exportar', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setExportando(false);
    }
  };

  const eliminarCuenta = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrorEliminar('');

    if (!contrasenaEliminar) {
      setErrorEliminar('Ingresa tu contraseña para confirmar.');
      return;
    }
    if (palabraEliminar.trim().toUpperCase() !== PALABRA_CONFIRMACION) {
      setErrorEliminar(`Escribe la palabra ${PALABRA_CONFIRMACION} para confirmar.`);
      return;
    }

    setEliminando(true);
    try {
      await api.delete('/usuarios/cuenta', { contrasena: contrasenaEliminar });
      logout();
      navigate('/login', { replace: true });
    } catch (fallo) {
      setErrorEliminar(mensajeDeError(fallo));
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Mi perfil"
        descripcion="Actualiza tus datos de salud y ejerce tus derechos sobre la información que guarda CUIBOT."
        icono={UserRound}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Columna izquierda: tarjeta de identidad + privacidad */}
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="relative bg-[#121A18] p-6 text-white">
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-2xl"
                style={{ background: 'radial-gradient(circle, #A8FFE6 0%, transparent 70%)' }}
              />
              <div className="relative flex items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary font-heading text-xl font-extrabold text-primary-foreground ring-2 ring-[#A8FFE6]/40">
                  {iniciales(usuario.nombre)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-heading text-lg font-bold">{usuario.nombre}</p>
                  <p className="truncate text-xs text-white/60">{usuario.correo}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="bg-[#A8FFE6] text-[#121A18]">
                      {usuario.rol === 'administrador' ? 'Administrador' : 'Paciente'}
                    </Badge>
                    <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                      {usuario.tipo_diabetes || 'Sin tipo definido'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary-ink" /> {usuario.correo}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <UserRound className="h-3.5 w-3.5 text-primary-ink" /> Cuenta #{usuario.id_usuario}
              </div>
              <p className="rounded-xl bg-secondary/20 p-3 text-[11px] leading-relaxed text-muted-foreground">
                El correo electrónico es tu identificador de acceso y no se puede modificar desde la
                aplicación.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary-ink" /> Tus derechos (Ley 1581)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Como titular de datos personales puedes conocer, actualizar, rectificar y suprimir tu
                información, así como revocar la autorización otorgada.
              </p>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => void exportarDatos()}
                disabled={exportando}
              >
                {exportando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {exportando ? 'Preparando archivo…' : 'Exportar mis datos (JSON)'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:bg-red-50 hover:text-destructive"
                onClick={() => {
                  setErrorEliminar('');
                  setContrasenaEliminar('');
                  setPalabraEliminar('');
                  setDialogoEliminar(true);
                }}
              >
                <Trash2 className="h-4 w-4" /> Eliminar mi cuenta
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: formularios */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos personales</CardTitle>
              <CardDescription>
                Mantén tu información actualizada para recibir recomendaciones acordes a tu diagnóstico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={guardarPerfil} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="perfil-nombre">Nombre completo</Label>
                    <Input
                      id="perfil-nombre"
                      value={nombre}
                      maxLength={100}
                      onChange={(e) => setNombre(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perfil-correo">Correo electrónico</Label>
                    <Input id="perfil-correo" value={usuario.correo} readOnly disabled />
                    <p className="text-[11px] text-muted-foreground">No editable</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="perfil-tipo">Tipo de diabetes</Label>
                    <Select value={tipoDiabetes} onValueChange={setTipoDiabetes}>
                      <SelectTrigger id="perfil-tipo">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_DIABETES.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                        <SelectItem value={SIN_DEFINIR}>Aún no lo sé / prefiero no decirlo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perfil-rol">Rol en la plataforma</Label>
                    <Input
                      id="perfil-rol"
                      value={usuario.rol === 'administrador' ? 'Administrador' : 'Paciente'}
                      readOnly
                      disabled
                    />
                    <p className="text-[11px] text-muted-foreground">
                      El rol solo puede cambiarlo el administrador clínico.
                    </p>
                  </div>
                </div>

                {errorPerfil ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {errorPerfil}
                  </p>
                ) : null}

                <div className="flex justify-end">
                  <Button type="submit" disabled={guardandoPerfil}>
                    {guardandoPerfil ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {guardandoPerfil ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary-ink" /> Seguridad de la cuenta
              </CardTitle>
              <CardDescription>
                Cambia tu contraseña periódicamente y no la compartas con nadie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={cambiarContrasena} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="perfil-actual">Contraseña actual</Label>
                  <Input
                    id="perfil-actual"
                    type="password"
                    autoComplete="current-password"
                    value={contrasenaActual}
                    onChange={(e) => setContrasenaActual(e.target.value)}
                    placeholder="Tu contraseña actual"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="perfil-nueva">Nueva contraseña</Label>
                    <Input
                      id="perfil-nueva"
                      type="password"
                      autoComplete="new-password"
                      value={contrasenaNueva}
                      onChange={(e) => setContrasenaNueva(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perfil-confirmacion">Confirmar nueva contraseña</Label>
                    <Input
                      id="perfil-confirmacion"
                      type="password"
                      autoComplete="new-password"
                      value={contrasenaConfirmacion}
                      onChange={(e) => setContrasenaConfirmacion(e.target.value)}
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>

                {errorContrasena ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {errorContrasena}
                  </p>
                ) : null}

                <div className="flex justify-end">
                  <Button type="submit" variant="outline" disabled={guardandoContrasena}>
                    {guardandoContrasena ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {guardandoContrasena ? 'Actualizando…' : 'Actualizar contraseña'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Alert variant="default">
            <ShieldCheck />
            <AlertTitle>Tratamiento responsable de tus datos</AlertTitle>
            <AlertDescription>
              CUIBOT almacena únicamente información necesaria para tu seguimiento y no comparte tus
              datos con terceros. Las contraseñas se guardan cifradas con bcrypt y las sesiones usan
              tokens JWT. Si eliminas tu cuenta, todos tus registros de alimentación, actividad,
              medicamentos y tomas se borran en cascada.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Diálogo de eliminación de cuenta */}
      <Dialog open={dialogoEliminar} onOpenChange={(abierto) => !abierto && setDialogoEliminar(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Eliminar mi cuenta
            </DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. Se borrarán tu perfil y todos los registros de salud
              asociados (comidas, actividad, medicamentos, recordatorios y tomas).
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle />
            <AlertDescription>
              Si solo deseas una copia de tu información, usa primero la opción{' '}
              <strong>Exportar mis datos</strong>.
            </AlertDescription>
          </Alert>

          <form onSubmit={eliminarCuenta} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eliminar-contrasena">Contraseña</Label>
              <Input
                id="eliminar-contrasena"
                type="password"
                autoComplete="current-password"
                value={contrasenaEliminar}
                onChange={(e) => setContrasenaEliminar(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eliminar-palabra">
                Escribe <span className="font-heading text-destructive">{PALABRA_CONFIRMACION}</span> para
                confirmar
              </Label>
              <Input
                id="eliminar-palabra"
                value={palabraEliminar}
                onChange={(e) => setPalabraEliminar(e.target.value)}
                placeholder={PALABRA_CONFIRMACION}
                autoComplete="off"
              />
            </div>

            {errorEliminar ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {errorEliminar}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogoEliminar(false)}
                disabled={eliminando}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={eliminando}>
                {eliminando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {eliminando ? 'Eliminando…' : 'Eliminar definitivamente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
