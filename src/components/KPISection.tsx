import React from 'react';
import { Users, UserCheck, ShieldAlert, DollarSign, Calendar, CheckSquare } from 'lucide-react';
import { Jugador, Pago, Asistencia } from '../types';
import { formatCurrency } from '../utils/helpers';

interface KPISectionProps {
  players: Jugador[];
  payments: Pago[];
  attendance: Asistencia[];
}

export default function KPISection({ players, payments, attendance }: KPISectionProps) {
  // KPI Calculations
  const totalPlayers = players.length;
  const activePlayers = players.filter(p => p.activo).length;
  
  // Pagos recibidos (count of paid records)
  const paidPaymentsCount = payments.filter(pay => pay.estado === 'Pagado').length;
  
  // Monto recaudado (sum of paid amounts)
  const totalCollected = payments
    .filter(pay => pay.estado === 'Pagado')
    .reduce((sum, pay) => sum + pay.monto, 0);

  // Jugadores morosos (Count of unique active players with one or more 'Atrasado' payments)
  const delinquentPlayerIds = new Set<string>();
  payments.forEach(pay => {
    if (pay.estado === 'Atrasado') {
      delinquentPlayerIds.add(pay.jugadorId);
    }
  });
  // Also check if they are in players list (or just count unique ids from the payments table)
  const totalMorosos = delinquentPlayerIds.size;

  // Asistencia promedio (% of "Sí" out of total recorded attendances)
  const totalAttendanceRecords = attendance.length;
  const positiveAttendanceCount = attendance.filter(att => att.asistio === 'Sí').length;
  const averageAttendance = totalAttendanceRecords > 0 
    ? Math.round((positiveAttendanceCount / totalAttendanceRecords) * 100) 
    : 0;

  const kpis = [
    {
      id: 'kpi-total-players',
      title: 'Total Jugadores',
      value: totalPlayers,
      subtitle: `${activePlayers} activos / ${totalPlayers - activePlayers} inactivos`,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      id: 'kpi-active-players',
      title: 'Jugadores Activos',
      value: activePlayers,
      subtitle: `${totalPlayers > 0 ? Math.round((activePlayers / totalPlayers) * 100) : 0}% del plantel`,
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: 'kpi-payments-received',
      title: 'Pagos Recibidos',
      value: paidPaymentsCount,
      subtitle: 'Transacciones aprobadas',
      icon: CheckSquare,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      id: 'kpi-total-collected',
      title: 'Monto Recaudado',
      value: formatCurrency(totalCollected),
      subtitle: 'Fondos totales del club',
      icon: DollarSign,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    },
    {
      id: 'kpi-delinquent-players',
      title: 'Jugadores Morosos',
      value: totalMorosos,
      subtitle: 'Con cuotas vencidas',
      icon: ShieldAlert,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      id: 'kpi-average-attendance',
      title: 'Asistencia Promedio',
      value: `${averageAttendance}%`,
      subtitle: 'De presencias registradas',
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={kpi.id}
            id={kpi.id}
            className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.title}
                </p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">
                  {kpi.value}
                </h3>
              </div>
              <div className={`p-2 rounded-lg border ${kpi.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {kpi.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
