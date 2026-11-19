const DESCARGO =
  '⚠️ Cuibot es una guía orientativa de hábitos saludables y NO sustituye la valoración médica profesional. Ante síntomas severos, acude a urgencias.';

const SUGERENCIAS = [
  '¿Qué hago ante un bajón de azúcar?',
  '¿Qué hago si tengo el azúcar muy alta?',
  'Dame ideas de menú saludable para hoy',
  '¿Cuánta actividad física necesito a la semana?',
  '¿Cómo mejoro mi adherencia a los medicamentos?',
];

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function contiene(texto, palabras) {
  return palabras.some((palabra) => texto.includes(palabra));
}

function conDescargo(respuesta) {
  return `${respuesta}\n\n${DESCARGO}`;
}

const REGLAS = [
  {
    id: 'emergencia',
    categoria: 'emergencia',
    urgente: true,
    palabras: [
      'desmayo', 'desmayado', 'convulsion', 'inconsciente', 'no responde',
      'dificultad para respirar', 'dolor en el pecho', 'labios morados',
      'no puede tragar', 'perdida de conocimiento',
    ],
    responder: () =>
      '🚨 **Esto puede ser una emergencia médica.**\n\n' +
      '1. Si la persona está inconsciente, convulsionando o no responde, **NO le des comida ni bebida por la boca**.\n' +
      '2. Llama de inmediato a emergencias (**123 en Colombia**) o pide a alguien que lo haga.\n' +
      '3. Si está consciente pero muy débil, no la dejes sola y vigila su respiración.\n' +
      '4. No administres insulina ni medicamentos sin indicación médica en este momento.\n\n' +
      'No esperes a que los síntomas mejoren para buscar ayuda profesional.',
  },
  {
    id: 'hipoglucemia',
    categoria: 'hipoglucemia',
    urgente: false,
    palabras: [
      'hipoglucemia', 'bajon de azucar', 'azucar baja', 'glucosa baja',
      'temblor', 'sudoracion fria', 'sudor frio', 'mareo', 'palidez',
      'hambre repentina', '15-15', 'me tiemblan las manos',
    ],
    responder: (tipo) =>
      `Si tus síntomas son temblor, sudoración fría, mareo o hambre repentina, podrías estar cursando una **hipoglucemia leve**${tipo ? ` (perfil ${tipo})` : ''}.\n\n` +
      'Aplica la **regla 15-15**:\n' +
      '1. Consume **15 g de carbohidratos de acción rápida**: medio vaso de jugo, 3 pastillas de glucosa, una cucharada de azúcar o miel, o medio vaso de gaseosa regular.\n' +
      '2. Espera **15 minutos** sin hacer ejercicio y vuelve a medir tu glucosa.\n' +
      '3. Si sigue por debajo de 70 mg/dL, repite la regla.\n' +
      '4. Cuando estés en rango, come algo con carbohidratos complejos y proteína para mantener el nivel.\n\n' +
      '**No te inyectes insulina ni omitas comidas para corregir un bajón.** Si pierdes el conocimiento, no ingieras nada por la boca y busca ayuda de emergencia inmediata.',
  },
  {
    id: 'hiperglucemia',
    categoria: 'hiperglucemia',
    urgente: false,
    palabras: [
      'hiperglucemia', 'azucar alta', 'glucosa alta', 'mucha sed',
      'sed excesiva', 'orinar mucho', 'orina frecuente', 'aliento frutado',
      'cansancio extremo', 'vision borrosa',
    ],
    responder: (tipo) =>
      `Los síntomas de **hiperglucemia** incluyen sed intensa, orinar con frecuencia, cansancio, visión borrosa y aliento afrutado${tipo ? `; ten presente tu diagnóstico ${tipo}` : ''}.\n\n` +
      'Recomendaciones generales:\n' +
      '1. Mide tu glucosa y anota el resultado y la hora.\n' +
      '2. Hidrátate con agua, sin bebidas azucaradas.\n' +
      '3. Revisa si omitiste tu medicamento o si hubo un exceso de carbohidratos; **no dupliques dosis por cuenta propia**.\n' +
      '4. Evita ejercicio intenso si tu glucosa está muy alta (por encima de 250 mg/dL) o si hay cetonas.\n' +
      '5. Si presentas vómito, dolor abdominal, respiración rápida o somnolencia, acude a urgencias de inmediato.',
  },
  {
    id: 'alimentacion',
    categoria: 'alimentacion',
    urgente: false,
    palabras: [
      'comida', 'comer', 'alimentacion', 'dieta', 'menu', 'desayuno',
      'almuerzo', 'cena', 'merienda', 'carbohidrato', 'postre', 'receta',
    ],
    responder: (tipo) =>
      `Un patrón útil es el **método del plato**: 50 % verduras sin almidón, 25 % proteína magra y 25 % carbohidratos complejos. Para ${tipo ? `tu perfil **${tipo}**` : 'tu perfil'}, prioriza:\n\n` +
      '• Verduras frescas y de hoja verde, legumbres y granos integrales.\n' +
      '• Proteínas magras: pollo, pescado, huevo, tofu o legumbres.\n' +
      '• Grasas saludables: aguacate, aceite de oliva, frutos secos sin sal.\n' +
      '• Agua o infusiones sin azúcar en lugar de bebidas azucaradas.\n\n' +
      'Evita ultraprocesados, fritos y porciones grandes de arroz, pan o papa. En la sección **Alimentación → Menús recomendados** tienes ejemplos concretos según tu tipo de diabetes.',
  },
  {
    id: 'actividad',
    categoria: 'actividad',
    urgente: false,
    palabras: [
      'ejercicio', 'actividad fisica', 'caminar', 'correr', 'gimnasio',
      'deporte', '150 minutos', 'entrenar', 'rutina',
    ],
    responder: () =>
      'La **ADA recomienda 150 minutos semanales** de actividad aeróbica moderada, repartidos en al menos 3 días, y evitar estar sentado por periodos largos.\n\n' +
      '• Empieza con caminatas de 10 a 15 minutos y aumenta poco a poco.\n' +
      '• Combina aeróbico con 2 sesiones semanales de fuerza ligera.\n' +
      '• Mide tu glucosa antes y después si usas insulina o sulfonilureas.\n' +
      '• Lleva agua, identificación médica y una fuente de carbohidratos rápida.\n' +
      '• Revisa tus pies al terminar y usa calzado cómodo.\n\n' +
      'Puedes registrar cada sesión en la sección **Actividad física**; la barra te mostrará tu avance hacia los 150 minutos.',
  },
  {
    id: 'medicamentos',
    categoria: 'medicamentos',
    urgente: false,
    palabras: [
      'medicamento', 'medicina', 'pastilla', 'metformina', 'insulina',
      'dosis', 'olvide tomar', 'olvido', 'recordatorio', 'toma',
    ],
    responder: () =>
      'Para mantener una buena adherencia:\n\n' +
      '1. Usa la sección **Medicamentos** para programar recordatorios y activarlos o pausarlos con el interruptor.\n' +
      '2. Confirma cada toma en la app; así queda registrada tu adherencia.\n' +
      '3. Si olvidaste una dosis, **no dupliques la siguiente**; consulta con tu médico o farmacéutico.\n' +
      '4. Mantén los medicamentos en un lugar visible y lejos de la humedad.\n' +
      '5. Nunca suspendas un fármaco por iniciativa propia, aunque te sientas bien.',
  },
  {
    id: 'glucosa',
    categoria: 'glucosa',
    urgente: false,
    palabras: [
      'glucosa', 'glucometria', 'hemoglobina', 'a1c', 'medir', 'rangos',
      'cuanto debe estar', 'niveles',
    ],
    responder: () =>
      'Los rangos de referencia generales (pueden variar según tu edad, embarazo y criterio médico) son:\n\n' +
      '• **En ayunas:** 80–130 mg/dL.\n' +
      '• **Después de comer (1–2 h):** menos de 180 mg/dL.\n' +
      '• **HbA1c:** generalmente menos de 7 %, con metas individualizadas.\n\n' +
      'Registra la hora, el valor y lo que comiste para que tu médico pueda interpretar los patrones. Si tienes valores repetidos fuera de rango, consulta a tu equipo de salud; no ajustes medicamentos por tu cuenta.',
  },
  {
    id: 'saludo',
    categoria: 'saludo',
    urgente: false,
    palabras: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'que puedes hacer', 'ayuda'],
    responder: (tipo) =>
      `¡Hola! Soy **Cuibot**, tu asistente de hábitos saludables${tipo ? ` para ${tipo}` : ''}. Puedo orientarte sobre alimentación, actividad física, medicamentos, hipoglucemia e hiperglucemia.\n\n` +
      'Prueba con una de las preguntas rápidas o escríbeme tu duda. Recuerda que no reemplazo a tu médico.',
  },
];

const RESPUESTA_GENERAL = (tipo) =>
  `Puedo ayudarte con temas de **alimentación, actividad física, medicamentos, control de glucosa** y cómo actuar ante una hipoglucemia o hiperglucemia${tipo ? `, considerando tu perfil ${tipo}` : ''}.\n\n` +
  'Cuéntame con más detalle qué necesitas: por ejemplo, "¿qué puedo desayunar?", "me siento mareado y con sudor frío" o "¿cómo organizo mis recordatorios?".\n\n' +
  'Si presentas síntomas severos, dificultad para respirar, desmayo o convulsiones, busca atención de emergencia de inmediato.';

export function responderConsulta(consulta, tipoDiabetes = null) {
  const texto = normalizar(consulta);
  const regla = REGLAS.find((r) => contiene(texto, r.palabras));

  if (regla) {
    return {
      categoria: regla.categoria,
      urgente: Boolean(regla.urgente),
      respuesta: conDescargo(regla.responder(tipoDiabetes)),
      sugerencias: SUGERENCIAS,
    };
  }

  return {
    categoria: 'general',
    urgente: false,
    respuesta: conDescargo(RESPUESTA_GENERAL(tipoDiabetes)),
    sugerencias: SUGERENCIAS,
  };
}

export { SUGERENCIAS, DESCARGO };
