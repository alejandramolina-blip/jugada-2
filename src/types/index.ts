export type CategoriaJugador = 'Infantil' | 'Juvenil' | 'Adulto';

export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  categoria: CategoriaJugador;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  activo: boolean;
}

export type EstadoPago = 'Pagado' | 'Pendiente' | 'Atrasado';

export interface Pago {
  id: string;
  jugadorId: string;
  mes: string; // E.g., 'Enero', 'Febrero', etc.
  anio: number;
  monto: number;
  fecha: string; // YYYY-MM-DD
  estado: EstadoPago;
}

export interface Asistencia {
  id: string;
  fecha: string; // YYYY-MM-DD
  categoria: CategoriaJugador;
  jugadorId: string;
  asistio: 'Sí' | 'No';
}

export type TipoActividad = 'Entrenamiento' | 'Partido' | 'Evento';

export interface Actividad {
  id: string;
  titulo: string;
  tipo: TipoActividad;
  fecha: string; // YYYY-MM-DD
  categoria: CategoriaJugador | 'Todas';
  descripcion: string;
}

export interface Moroso {
  jugadorId: string;
  nombreCompleto: string;
  categoria: CategoriaJugador;
  mes: string;
  anio: number;
  monto: number;
}
