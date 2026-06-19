import { Jugador, Pago, Asistencia, Actividad } from '../types';
import { INITIAL_PLAYERS, INITIAL_PAYMENTS, INITIAL_ATTENDANCE, INITIAL_ACTIVITIES } from '../data/seedData';

// Generate a simple random unique ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

// LocalStorage helpers with automatic seeding
export const loadFromStorage = <T>(key: string, initialData: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error loading key "${key}" from localStorage:`, error);
    return initialData;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
};

// Load players, payments, attendance, and activities
export const loadPlayers = (): Jugador[] => loadFromStorage<Jugador[]>('jm_players', INITIAL_PLAYERS);
export const savePlayers = (players: Jugador[]) => saveToStorage<Jugador[]>('jm_players', players);

export const loadPayments = (): Pago[] => loadFromStorage<Pago[]>('jm_payments', INITIAL_PAYMENTS);
export const savePayments = (payments: Pago[]) => saveToStorage<Pago[]>('jm_payments', payments);

export const loadAttendance = (): Asistencia[] => loadFromStorage<Asistencia[]>('jm_attendance', INITIAL_ATTENDANCE);
export const saveAttendance = (attendance: Asistencia[]) => saveToStorage<Asistencia[]>('jm_attendance', attendance);

export const loadActivities = (): Actividad[] => loadFromStorage<Actividad[]>('jm_activities', INITIAL_ACTIVITIES);
export const saveActivities = (activities: Actividad[]) => saveToStorage<Actividad[]>('jm_activities', activities);

// Format currency helper ($ 15.000)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Spanish Months list
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Helper to get relative date text or formatted Spanish date
export const formatDateSpanish = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
