export type Rol = 'paciente' | 'administrador';
export type TipoDiabetes = 'Tipo 1' | 'Tipo 2' | 'Gestacional' | 'Otro';
export type Momento = 'Desayuno' | 'Almuerzo' | 'Cena' | 'Merienda';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  tipo_diabetes: TipoDiabetes | null;
  rol: Rol;
}

export interface Comida {
  id_alimento: number;
  descripcion: string;
  tipo_comida: Momento | null;
  fecha: string;
  hora: string;
}

export interface Actividad {
  id_actividad: number;
  tipo: string;
  duracion: number;
  fecha: string;
}

export interface Semana {
  total: number;
  meta: number;
  porcentaje: number;
  cumplida: boolean;
  desde: string;
  hasta: string;
}

export interface Recordatorio {
  id_recordatorio: number;
  mensaje: string;
  hora: string;
  estado: 'activo' | 'inactivo';
  id_medicamento: number;
}

export interface Medicamento {
  id_medicamento: number;
  nombre: string;
  dosis: string;
  horario: string;
  recordatorios: Recordatorio[];
}

export interface Toma {
  id_toma: number;
  fecha_hora: string;
  confirmada: boolean;
  id_medicamento: number;
  medicamento?: string;
  dosis?: string;
}

export interface RecordatorioDashboard extends Recordatorio {
  medicamento: string;
  dosis: string;
  confirmada_hoy: boolean;
}

export interface ResumenDashboard {
  usuario: Usuario;
  recordatorios: RecordatorioDashboard[];
  ultimasComidas: Comida[];
  ultimasActividades: Actividad[];
  actividadSemanal: Semana;
  hoy: {
    comidas: number;
    minutos_actividad: number;
    tomas_confirmadas: number;
  };
}

export interface MenuRecomendado {
  id_menu: number;
  tipo_diabetes: string;
  momento: Momento;
  descripcion: string;
}

export interface RespuestaCuibot {
  respuesta: string;
  categoria: string;
  urgente: boolean;
  sugerencias: string[];
  tipo_diabetes?: string | null;
}
