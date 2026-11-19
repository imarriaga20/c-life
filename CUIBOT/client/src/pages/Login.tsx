import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';
import { mensajeDeError } from '@/lib/api';

const DEMOS = [
  {
    nombre: 'Ian Marriaga',
    detalle: 'Paciente · Tipo 2',
    correo: 'ian.marriaga@cuibot.health',
    contrasena: 'Cuibot2026*',
  },
  {
    nombre: 'Juan Pablo Contreras',
    detalle: 'Paciente · Tipo 1',
    correo: 'juanpablo@cuibot.health',
    contrasena: 'Cuibot2026*',
  },
  {
    nombre: 'Administrador C-LIFE',
    detalle: 'Administrador',
    correo: 'admin@cuibot.health',
    contrasena: 'AdminClife2026*',
  },
];

const VALIDAR_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Login() {
  const { usuario, login, registro } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const [modo, setModo] = useState('login');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipoDiabetes, setTipoDiabetes] = useState('sin-definir');
  const [autorizacion, setAutorizacion] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [politicaAbierta, setPoliticaAbierta] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const destino = (ubicacion.state as { desde?: string } | null)?.desde || '/';

  const iniciarSesion = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError('');

    if (!VALIDAR_CORREO.test(correo.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!contrasena) {
      setError('Ingresa tu contraseña.');
      return;
    }

    setEnviando(true);
    try {
      await login(correo.trim().toLowerCase(), contrasena);
      navigate(destino, { replace: true });
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setEnviando(false);
    }
  };

  const crearCuenta = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError('');

    if (nombre.trim().length < 3) {
      setError('Ingresa tu nombre completo (mínimo 3 caracteres).');
      return;
    }
    if (!VALIDAR_CORREO.test(correo.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!autorizacion) {
      setError('Debes autorizar el tratamiento de tus datos de salud para crear la cuenta.');
      return;
    }

    setEnviando(true);
    try {
      const mensaje = await registro({
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        contrasena,
        tipo_diabetes: tipoDiabetes === 'sin-definir' ? null : tipoDiabetes,
        autorizacion_datos: autorizacion,
      });
      toast({ titulo: 'Cuenta creada', descripcion: mensaje });
      setModo('login');
      setContrasena('');
      setAceptoLimpiar();
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setEnviando(false);
    }
  };

  const setAceptoLimpiar = () => {
    setAutorizacion(false);
    setNombre('');
    setTipoDiabetes('sin-definir');
  };

  const usarDemo = (demo: (typeof DEMOS)[number]) => {
    setModo('login');
    setCorreo(demo.correo);
    setContrasena(demo.contrasena);
    setError('');
    toast({
      titulo: 'Credenciales cargadas',
      descripcion: `Presiona "Iniciar sesión" para entrar como ${demo.nombre}.`,
      variante: 'info',
    });
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Panel de marca (escritorio) */}
      <section className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#121A18] p-10 text-white lg:flex xl:p-14">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #A8FFE6 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6CA69C 0%, transparent 70%)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <HeartPulse className="h-7 w-7" />
            </span>
            <div>
              <p className="font-heading text-2xl font-extrabold tracking-tight">CUIBOT</p>
              <p className="text-xs text-white/60">Asistente web para el control de la diabetes</p>
            </div>
          </div>

          <h1 className="mt-14 max-w-md font-heading text-4xl font-extrabold leading-tight">
            Tu salud, <span className="text-[#A8FFE6]">en un solo lugar</span>.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Registra tu alimentación, actividad física y medicamentos. Recibe orientación inmediata y
            mantén tu tratamiento al día con recordatorios inteligentes.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              { icono: UtensilsCrossed, titulo: 'Alimentación guiada', texto: 'Menús adaptados a tu tipo de diabetes.' },
              { icono: Activity, titulo: 'Meta de 150 minutos', texto: 'Sigue tu progreso semanal de actividad física.' },
              { icono: Bot, titulo: 'Asistente Cuibot', texto: 'Orientación ante hipoglucemias e hiperglucemias.' },
            ].map(({ icono: Icono, titulo, texto }) => (
              <li key={titulo} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#A8FFE6] ring-1 ring-white/10">
                  <Icono className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold">{titulo}</p>
                  <p className="text-xs text-white/60">{texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] text-white/50">
          <ShieldCheck className="h-4 w-4 text-[#A8FFE6]" />
          Datos de salud protegidos · Ley 1581 de 2012
        </div>
      </section>

      {/* Formulario */}
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-7 flex justify-center lg:hidden">
            <Logo />
          </div>

          <Card className="border-primary/25 shadow-xl">
            <CardHeader className="space-y-2 pb-4 text-center">
              <CardTitle className="text-2xl">Bienvenido a CUIBOT</CardTitle>
              <CardDescription>Inicia sesión o crea tu cuenta para empezar tu control diario.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={modo} onValueChange={(valor) => { setModo(valor); setError(''); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                  <TabsTrigger value="registro">Crear cuenta</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form className="space-y-4" onSubmit={iniciarSesion} noValidate>
                    {error ? (
                      <Alert variant="destructive">
                        <ShieldCheck />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="space-y-2">
                      <Label htmlFor="login-correo">Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="login-correo"
                          type="email"
                          autoComplete="email"
                          placeholder="correo@ejemplo.com"
                          className="pl-9"
                          value={correo}
                          onChange={(e) => setCorreo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-contrasena">Contraseña</Label>
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-primary-ink underline-offset-2 hover:underline"
                          onClick={() =>
                            toast({
                              titulo: 'Recuperación de contraseña',
                              descripcion: 'Por seguridad, solicita el restablecimiento al administrador clínico.',
                              variante: 'info',
                            })
                          }
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="login-contrasena"
                          type={verContrasena ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Tu contraseña"
                          className="pl-9 pr-10"
                          value={contrasena}
                          onChange={(e) => setContrasena(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setVerContrasena((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                          aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {verContrasena ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={enviando}>
                      {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {enviando ? 'Verificando…' : 'Iniciar sesión'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="registro">
                  <form className="space-y-4" onSubmit={crearCuenta} noValidate>
                    {error ? (
                      <Alert variant="destructive">
                        <ShieldCheck />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="space-y-2">
                      <Label htmlFor="registro-nombre">Nombre completo</Label>
                      <Input
                        id="registro-nombre"
                        autoComplete="name"
                        placeholder="Nombre y apellidos"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registro-correo">Correo electrónico</Label>
                      <Input
                        id="registro-correo"
                        type="email"
                        autoComplete="email"
                        placeholder="correo@ejemplo.com"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registro-contrasena">Contraseña</Label>
                      <Input
                        id="registro-contrasena"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registro-tipo">Tipo de diabetes</Label>
                      <Select value={tipoDiabetes} onValueChange={setTipoDiabetes}>
                        <SelectTrigger id="registro-tipo">
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tipo 1">Tipo 1</SelectItem>
                          <SelectItem value="Tipo 2">Tipo 2</SelectItem>
                          <SelectItem value="Gestacional">Gestacional</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                          <SelectItem value="sin-definir">Aún no lo sé / prefiero no decirlo</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        Lo usamos para recomendarte menús adecuados. Puedes cambiarlo en tu perfil.
                      </p>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary/20 bg-secondary/20 p-3">
                      <Checkbox
                        checked={autorizacion}
                        onCheckedChange={(valor) => setAutorizacion(valor === true)}
                        className="mt-0.5"
                        aria-label="Autorizo el tratamiento de mis datos de salud"
                      />
                      <span className="text-xs leading-relaxed text-foreground">
                        Autorizo el tratamiento de mis datos de salud conforme a la{' '}
                        <button
                          type="button"
                          className="font-semibold text-primary-ink underline underline-offset-2"
                          onClick={(evento) => {
                            evento.preventDefault();
                            setPoliticaAbierta(true);
                          }}
                        >
                          Ley 1581 de 2012
                        </button>{' '}
                        y la política de privacidad de CUIBOT.
                      </span>
                    </label>

                    <Button type="submit" className="w-full" disabled={enviando}>
                      {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {enviando ? 'Creando cuenta…' : 'Registrarme'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-secondary/15 p-3">
                <p className="mb-2 text-center font-heading text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Cuentas de demostración
                </p>
                <div className="space-y-1.5">
                  {DEMOS.map((demo) => (
                    <button
                      key={demo.correo}
                      type="button"
                      onClick={() => usarDemo(demo)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/70 px-2.5 py-1.5 text-left text-[11px] transition-colors hover:bg-white"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-foreground">{demo.nombre}</span>
                        <span className="block truncate text-muted-foreground">{demo.correo}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary-ink">
                        {demo.detalle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
            Al continuar aceptas nuestra{' '}
            <button
              type="button"
              className="font-semibold text-primary-ink underline underline-offset-2"
              onClick={() => setPoliticaAbierta(true)}
            >
              política de privacidad
            </button>
            . CUIBOT no sustituye la valoración médica profesional.
          </p>
        </div>
      </section>

      <Dialog open={politicaAbierta} onOpenChange={setPoliticaAbierta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Política de privacidad y tratamiento de datos</DialogTitle>
            <DialogDescription>Ley 1581 de 2012 (Colombia)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              CUIBOT recopila únicamente los datos necesarios para el seguimiento de hábitos saludables:
              nombre, correo, tipo de diabetes, comidas, actividad física, medicamentos y confirmación de
              tomas.
            </p>
            <p>
              Tus datos se almacenan con contraseña cifrada (bcrypt) y se transmiten mediante sesiones
              autenticadas con JWT. No se comparten con terceros.
            </p>
            <p>
              Como titular puedes <strong>consultar, actualizar, exportar o eliminar</strong> tu información
              en cualquier momento desde la sección <strong>Perfil</strong>. La eliminación de la cuenta
              borra en cascada todos tus registros de salud.
            </p>
            <Alert variant="default">
              <ShieldCheck />
              <AlertDescription>
                Para ejercer tus derechos puedes usar las opciones de exportación y eliminación de cuenta
                disponibles en la aplicación.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
