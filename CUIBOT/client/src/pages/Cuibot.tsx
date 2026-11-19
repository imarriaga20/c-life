import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Loader2,
  MessageCircleHeart,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';
import { api, mensajeDeError } from '@/lib/api';
import { ahoraHHMM } from '@/lib/format';
import type { RespuestaCuibot } from '@/lib/types';

interface Mensaje {
  id: string;
  rol: 'bot' | 'usuario';
  texto: string;
  urgente?: boolean;
  hora: string;
}

const MENSAJE_INICIAL: Mensaje = {
  id: 'inicio',
  rol: 'bot',
  texto:
    '¡Hola! Soy Cuibot, tu asistente de hábitos saludables. Puedo orientarte sobre alimentación, actividad física, medicamentos y cómo actuar ante una hipoglucemia o hiperglucemia.\n\n¿En qué puedo acompañarte hoy?',
  hora: ahoraHHMM(),
};

const PREGUNTAS_RAPIDAS = [
  '¿Qué hago ante un bajón de azúcar (hipoglucemia)?',
  '¿Qué hago si tengo un pico alto (hiperglucemia)?',
  'Dame ideas de menú saludable para hoy',
  '¿Cuánta actividad física necesito a la semana?',
];

function TextoEnriquecido({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {partes.map((parte, indice) =>
        parte.startsWith('**') && parte.endsWith('**') ? (
          <strong key={indice} className="font-bold">
            {parte.slice(2, -2)}
          </strong>
        ) : (
          <span key={indice}>{parte}</span>
        ),
      )}
    </>
  );
}

export default function Cuibot() {
  const { usuario } = useAuth();
  const { toast } = useToast();
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_INICIAL]);
  const [consulta, setConsulta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sugerencias, setSugerencias] = useState<string[]>(PREGUNTAS_RAPIDAS);
  const finRef = useRef<HTMLDivElement>(null);
  const contadorRef = useRef(0);

  const agregarMensaje = useCallback((mensaje: Omit<Mensaje, 'id' | 'hora'>) => {
    contadorRef.current += 1;
    setMensajes((actuales) => [
      ...actuales,
      { ...mensaje, id: `m-${Date.now()}-${contadorRef.current}`, hora: ahoraHHMM() },
    ]);
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensajes, enviando]);

  useEffect(() => {
    api
      .get<string[]>('/cuibot/sugerencias')
      .then((lista) => {
        if (Array.isArray(lista) && lista.length) setSugerencias(lista);
      })
      .catch(() => {
        /* Se mantienen las preguntas locales. */
      });
  }, []);

  const enviar = async (texto: string) => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;

    agregarMensaje({ rol: 'usuario', texto: limpio });
    setConsulta('');
    setEnviando(true);

    try {
      const respuesta = await api.post<RespuestaCuibot>('/cuibot/consulta', {
        consulta: limpio,
        tipo_diabetes: usuario?.tipo_diabetes || undefined,
      });
      agregarMensaje({ rol: 'bot', texto: respuesta.respuesta, urgente: respuesta.urgente });
      if (respuesta.sugerencias?.length) setSugerencias(respuesta.sugerencias);
    } catch (fallo) {
      agregarMensaje({
        rol: 'bot',
        texto: `No pude procesar tu consulta en este momento. ${mensajeDeError(fallo)}\n\nSi es una emergencia, llama al 123.`,
        urgente: true,
      });
      toast({ titulo: 'Error de conexión', descripcion: mensajeDeError(fallo), variante: 'error' });
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setMensajes([{ ...MENSAJE_INICIAL, hora: ahoraHHMM() }]);
    setConsulta('');
    toast({ titulo: 'Conversación reiniciada', variante: 'info' });
  };

  return (
    <div>
      <PageHeader
        titulo="Asistente Cuibot"
        descripcion="Orientación inmediata sobre hábitos saludables y manejo de episodios glucémicos."
        icono={MessageCircleHeart}
        acciones={
          <Button variant="outline" size="sm" onClick={reiniciar}>
            <RefreshCw className="h-3.5 w-3.5" /> Nueva conversación
          </Button>
        }
      />

      <Alert variant="warning" className="mb-5">
        <AlertTriangle />
        <AlertTitle>Aviso ético-médico obligatorio</AlertTitle>
        <AlertDescription>
          Cuibot es una guía orientativa de hábitos saludables y <strong>NO sustituye la valoración médica
          profesional</strong>. Ante síntomas severos, desmayo, convulsiones o dificultad para respirar, acude
          de inmediato a urgencias o llama al <strong>123</strong>.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Accesos rápidos a emergencias */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="pill-halo h-auto justify-start gap-3 border-red-200 bg-red-50/60 p-4 text-left hover:bg-red-50"
              onClick={() => void enviar('¿Qué hago ante un bajón de azúcar (hipoglucemia)?')}
              disabled={enviando}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-red-600 ring-1 ring-red-200">
                🚨
              </span>
              <span>
                <span className="block font-heading text-xs font-bold text-foreground">Hipoglucemia</span>
                <span className="block text-[11px] font-normal text-muted-foreground">Bajón de azúcar: regla 15-15</span>
              </span>
            </Button>
            <Button
              variant="outline"
              className="pill-halo h-auto justify-start gap-3 border-amber-200 bg-amber-50/60 p-4 text-left hover:bg-amber-50"
              onClick={() => void enviar('¿Qué hago si tengo un pico alto (hiperglucemia)?')}
              disabled={enviando}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-amber-600 ring-1 ring-amber-200">
                📈
              </span>
              <span>
                <span className="block font-heading text-xs font-bold text-foreground">Hiperglucemia</span>
                <span className="block text-[11px] font-normal text-muted-foreground">Pico alto de glucosa</span>
              </span>
            </Button>
          </div>

          {/* Chat */}
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-primary/15 bg-secondary/20 py-3">
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#A8FFE6] ring-2 ring-white" />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">Cuibot</p>
                  <p className="text-[11px] text-muted-foreground">
                    En línea · perfil {usuario?.tipo_diabetes || 'general'}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="hidden bg-white sm:inline-flex">
                <ShieldCheck className="h-3 w-3" /> Orientación no médica
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              <div
                className="scrollbar-suave h-[420px] space-y-4 overflow-y-auto bg-white p-4 sm:h-[460px] sm:p-5"
                role="log"
                aria-live="polite"
                aria-label="Conversación con Cuibot"
              >
                {mensajes.map((mensaje) =>
                  mensaje.rol === 'bot' ? (
                    <div key={mensaje.id} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary/70 text-primary-ink ring-1 ring-primary/20">
                        <Bot className="h-4 w-4" />
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl rounded-tl-sm border px-3.5 py-2.5 text-sm leading-relaxed ${
                          mensaje.urgente
                            ? 'border-red-200 bg-red-50 text-red-950'
                            : 'border-primary/20 bg-secondary/25 text-foreground'
                        }`}
                      >
                        <div className="whitespace-pre-line">
                          <TextoEnriquecido texto={mensaje.texto} />
                        </div>
                        <p className="mt-1.5 text-[10px] text-muted-foreground">{mensaje.hora}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={mensaje.id} className="flex items-start justify-end gap-2.5">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
                        <p className="whitespace-pre-line">{mensaje.texto}</p>
                        <p className="mt-1.5 text-right text-[10px] text-primary-foreground/80">{mensaje.hora}</p>
                      </div>
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground font-heading text-[10px] font-bold text-white">
                        <UserRound className="h-4 w-4" />
                      </span>
                    </div>
                  ),
                )}

                {enviando ? (
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary/70 text-primary-ink ring-1 ring-primary/20">
                      <Bot className="h-4 w-4" />
                    </span>
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-primary/20 bg-secondary/25 px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-primary"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                      <span className="sr-only">Cuibot está escribiendo</span>
                    </div>
                  </div>
                ) : null}
                <div ref={finRef} />
              </div>

              {sugerencias.length ? (
                <div className="scrollbar-suave flex gap-2 overflow-x-auto border-t border-primary/10 bg-white px-4 py-2.5">
                  {sugerencias.slice(0, 4).map((sugerencia) => (
                    <button
                      key={sugerencia}
                      type="button"
                      onClick={() => void enviar(sugerencia)}
                      disabled={enviando}
                      className="shrink-0 rounded-full border border-primary/25 bg-secondary/20 px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary/50 disabled:opacity-50"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              ) : null}

              <form
                className="flex items-center gap-2 border-t border-primary/15 bg-secondary/10 p-3"
                onSubmit={(evento) => {
                  evento.preventDefault();
                  void enviar(consulta);
                }}
              >
                <Input
                  value={consulta}
                  onChange={(e) => setConsulta(e.target.value)}
                  placeholder="Escribe tu consulta aquí…"
                  maxLength={500}
                  aria-label="Mensaje para Cuibot"
                  className="bg-white"
                  disabled={enviando}
                />
                <Button type="submit" size="icon" disabled={enviando || !consulta.trim()} aria-label="Enviar consulta">
                  {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>

              <p className="border-t border-primary/10 bg-white px-4 py-2.5 text-center text-[10px] leading-relaxed text-muted-foreground">
                ⚠️ Cuibot no sustituye la valoración médica profesional. Ante síntomas severos, acude a urgencias.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary-ink" /> Temas que puedo tratar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                {[
                  'Hipoglucemia: regla 15-15 y señales de alarma.',
                  'Hiperglucemia: hidratación, cetonas y cuándo acudir a urgencias.',
                  'Alimentación: método del plato y menús ADA.',
                  'Actividad física: meta de 150 minutos semanales.',
                  'Medicamentos: adherencia y manejo de olvidos.',
                  'Control de glucosa: rangos de referencia.',
                ].map((tema) => (
                  <li key={tema} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {tema}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>Busca urgencias si…</AlertTitle>
            <AlertDescription>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
                <li>Hay desmayo, convulsión o pérdida de conciencia.</li>
                <li>Dificultad para respirar o dolor en el pecho.</li>
                <li>Vómito persistente, dolor abdominal o aliento afrutado.</li>
                <li>No mejora tras aplicar la regla 15-15.</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card className="bg-secondary/25">
            <CardContent className="p-4 text-[11px] leading-relaxed text-muted-foreground">
              <p className="mb-1 flex items-center gap-1.5 font-heading text-xs font-bold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary-ink" /> Privacidad
              </p>
              Tus consultas se procesan dentro de CUIBOT y no se comparten con terceros. No escribas datos
              identificables de otras personas.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
