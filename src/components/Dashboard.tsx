import React, { useMemo } from 'react';
import { ShieldAlert, Calendar, ArrowUpRight, Trophy, Users, HeartHandshake, CheckSquare, Sparkles } from 'lucide-react';
import { Jugador, Pago, Asistencia, Actividad, Moroso } from '../types';
import { formatCurrency, formatDateSpanish, MESES } from '../utils/helpers';
import KPISection from './KPISection';
import ChartsSection from './ChartsSection';

interface DashboardProps {
  players: Jugador[];
  payments: Pago[];
  attendance: Asistencia[];
  activities: Actividad[];
  onNavigateToView: (view: 'players' | 'payments' | 'attendance' | 'calendar') => void;
}

export default function Dashboard({ players, payments, attendance, activities, onNavigateToView }: DashboardProps) {
  // Player map for rapid O(1) names retrieval
  const playerMap = useMemo(() => {
    const map = new Map<string, Jugador>();
    players.forEach(p => map.set(p.id, p));
    return map;
  }, [players]);

  // Extract Morosos (Overdue payments list)
  const morososList = useMemo(() => {
    const result: Moroso[] = [];
    payments.forEach(pay => {
      if (pay.estado === 'Atrasado') {
        const player = playerMap.get(pay.jugadorId);
        if (player) {
          result.push({
            jugadorId: pay.jugadorId,
            nombreCompleto: `${player.nombre} ${player.apellido}`,
            categoria: player.categoria,
            mes: `${pay.mes} ${pay.anio}`,
            anio: pay.anio,
            monto: pay.monto,
          });
        }
      }
    });
    return result;
  }, [payments, playerMap]);

  // Get next 3 upcoming activities
  const upcomingActivities = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Sort chronologically and stream only items from today or later
    return [...activities]
      .filter(act => act.fecha >= todayStr)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 3);
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl border border-slate-850 p-6 sm:p-8 text-white shadow-lg">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
        
        {/* Subtle radial ambient highlight */}
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Socio Director: Don Rafa
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">¡Bienvenido a Jugada Maestra!</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Aquí tienes el resumen administrativo listo para **Los Halcones del Barrio**. Registra asistencias, cuotas y agenda entrenamientos con unos pocos clics.
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateToView('attendance')}
              className="flex-1 md:flex-initial text-center bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-extrabold px-4.5 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-emerald-950/20 active:scale-98 cursor-pointer text-slate-100"
            >
              Pasa Lista Hoy
            </button>
            <button
              onClick={() => onNavigateToView('payments')}
              className="flex-1 md:flex-initial text-center bg-slate-800 hover:bg-slate-755 text-white font-semibold px-4.5 py-3 rounded-xl text-sm transition-all shadow-md active:scale-98 cursor-pointer border border-slate-700"
            >
              Cobrar Mensualidad
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overviews cards */}
      <KPISection players={players} payments={payments} attendance={attendance} />

      {/* Charts module */}
      <ChartsSection payments={payments} attendance={attendance} />

      {/* Secondary split grids: Delinquents table + Calendar activities preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Delinquents list (Tabla de Morosos) - takes 2 cols on wide view */}
        <div id="morosos-section" className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Tabla de Jugadores Morosos</h3>
                  <p className="text-xs text-slate-500">Deudas activas registradas con estado "Atrasado"</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToView('payments')}
                className="flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Ver módulo pagos <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {morososList.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Trophy className="w-10 h-10 mx-auto stroke-1 text-slate-350 mb-2" />
                <p className="text-sm font-bold text-slate-700">¡Club libre de deudas!</p>
                <p className="text-xs">Todos los jugadores activos se encuentran al día con sus cuotas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Nombre Jugador</th>
                      <th className="px-4 py-3">Categoría</th>
                      <th className="px-4 py-3">Mes Adeudado</th>
                      <th className="px-4 py-3">Monto Pendiente</th>
                      <th className="px-4 py-3 text-right">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-705">
                    {morososList.map((moroso, i) => (
                      <tr key={`${moroso.jugadorId}-${moroso.mes}-${i}`} className="hover:bg-slate-55/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{moroso.nombreCompleto}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            moroso.categoria === 'Adulto'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                              : moroso.categoria === 'Juvenil'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {moroso.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">{moroso.mes}</td>
                        <td className="px-4 py-3 font-extrabold text-rose-700">{formatCurrency(moroso.monto)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-100 text-[10px]">
                            Retraso
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-rose-650 font-medium">
            <span>
              Adeudado total acumulado:{' '}
              <span className="font-extrabold text-sm ml-1">
                {formatCurrency(morososList.reduce((sum, item) => sum + item.monto, 0))}
              </span>
            </span>
            <span>
              Total moras:{' '}
              <span className="font-extrabold text-slate-800 ml-1">{morososList.length} registros</span>
            </span>
          </div>
        </div>

        {/* Upcoming events preview column */}
        <div id="upcoming-activities-section" className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 text-indigo-650 rounded-lg">
                  <Calendar className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Próximas Actividades</h3>
                  <p className="text-xs text-slate-500">Eventos agendados de hoy en adelante</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToView('calendar')}
                className="flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Ver calendario <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingActivities.length === 0 ? (
              <div className="p-10 text-center text-slate-400 border border-dashed border-slate-100 rounded-xl">
                <Calendar className="w-8 h-8 mx-auto stroke-1 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">Sin eventos próximos</p>
                <p className="text-[11px]">No hay actividades registradas en la agenda Futura.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingActivities.map((act) => (
                  <div
                    key={act.id}
                    className={`p-3 rounded-xl border flex flex-col gap-1 transition-all hover:-translate-y-0.5 hover:shadow-xs cursor-pointer ${
                      act.tipo === 'Partido'
                        ? 'bg-emerald-50/20 border-emerald-100 text-emerald-900'
                        : act.tipo === 'Entrenamiento'
                        ? 'bg-indigo-50/20 border-indigo-100 text-indigo-900'
                        : 'bg-amber-50/25 border-amber-100 text-amber-900'
                    }`}
                    onClick={() => onNavigateToView('calendar')}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className={`px-1.5 py-0.5 rounded uppercase leading-none ${
                        act.tipo === 'Partido'
                          ? 'bg-emerald-100 text-emerald-850'
                          : act.tipo === 'Entrenamiento'
                          ? 'bg-indigo-100 text-indigo-850'
                          : 'bg-amber-100 text-amber-850'
                      }`}>
                        {act.tipo}
                      </span>
                      <span className="font-mono text-slate-500">{act.fecha}</span>
                    </div>
                    
                    <p className="font-bold text-xs mt-1 text-slate-800 hover:underline">{act.titulo}</p>
                    <p className="text-[10px] text-slate-450">
                      Dirigido a:{' '}
                      <span className="font-extrabold text-slate-650">{act.categoria}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-55 flex justify-center">
            <button
              onClick={() => onNavigateToView('calendar')}
              className="text-xs font-bold text-slate-600 hover:text-indigo-650 transition-colors cursor-pointer"
            >
              Administrar Agenda Completa
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
