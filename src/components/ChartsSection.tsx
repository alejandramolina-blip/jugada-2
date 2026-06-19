import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { DollarSign, Percent, TrendingUp, CreditCard } from 'lucide-react';
import { Pago, Asistencia, CategoriaJugador } from '../types';

interface ChartsSectionProps {
  payments: Pago[];
  attendance: Asistencia[];
}

export default function ChartsSection({ payments, attendance }: ChartsSectionProps) {
  // 1. Payment Status Data (Pie Chart)
  const paymentStatusData = useMemo(() => {
    const counts = { Pagado: 0, Pendiente: 0, Atrasado: 0 };
    payments.forEach(pay => {
      if (counts[pay.estado] !== undefined) {
        counts[pay.estado]++;
      }
    });
    
    return [
      { name: 'Pagado', value: counts.Pagado, color: '#10B981' }, // emerald-500
      { name: 'Pendiente', value: counts.Pendiente, color: '#3B82F6' }, // blue-500
      { name: 'Atrasado', value: counts.Atrasado, color: '#F43F5E' }, // rose-500
    ].filter(item => item.value > 0);
  }, [payments]);

  // 2. Income by Month (Bar Chart - Pagado only)
  const monthlyIncomeData = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    const monthsOrder = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    payments.forEach(pay => {
      if (pay.estado === 'Pagado') {
        monthlyTotals[pay.mes] = (monthlyTotals[pay.mes] || 0) + pay.monto;
      }
    });

    // Filter months that have history and sort them chronologically based on monthsOrder index
    return monthsOrder
      .filter(m => m in monthlyTotals || ['Abril', 'Mayo', 'Junio'].includes(m)) // Ensure at least seed months show
      .map(month => ({
        mes: month,
        Recaudado: monthlyTotals[month] || 0,
      }));
  }, [payments]);

  // 3. Attendance by Category (Bar Chart)
  const categoryAttendanceData = useMemo(() => {
    const categories: CategoriaJugador[] = ['Infantil', 'Juvenil', 'Adulto'];
    
    return categories.map(cat => {
      const catRecords = attendance.filter(att => att.categoria === cat);
      const total = catRecords.length;
      const present = catRecords.filter(att => att.asistio === 'Sí').length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      
      return {
        categoria: cat,
        Asistencia: rate,
      };
    });
  }, [attendance]);

  // 4. Attendance Evolution over Time (Line Chart)
  const attendanceEvolutionData = useMemo(() => {
    const recordsByDate: Record<string, { present: number; total: number }> = {};
    
    attendance.forEach(att => {
      if (!recordsByDate[att.fecha]) {
        recordsByDate[att.fecha] = { present: 0, total: 0 };
      }
      recordsByDate[att.fecha].total++;
      if (att.asistio === 'Sí') {
        recordsByDate[att.fecha].present++;
      }
    });

    // Convert to sorted array
    const sortedDates = Object.keys(recordsByDate).sort();
    
    return sortedDates.map(date => {
      const { present, total } = recordsByDate[date];
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      // Beautiful short date string for display (e.g. 10/06)
      const parts = date.split('-');
      const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
      
      return {
        fecha: formattedDate,
        fullFecha: date,
        Asistencia: rate,
      };
    });
  }, [attendance]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Chart 1: Monthly Income */}
      <div id="chart-monthly-income" className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Monto Recaudado Mensual</h4>
            <p className="text-xs text-slate-500">Ingresos por concepto de cuotas pagadas ($)</p>
          </div>
        </div>
        <div className="h-64 w-full">
          {monthlyIncomeData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Sin datos de recaudación
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyIncomeData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip 
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Recaudado']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}
                />
                <Bar dataKey="Recaudado" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Evolution of Attendance */}
      <div id="chart-attendance-evolution" className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Evolución de Asistencia</h4>
            <p className="text-xs text-slate-500">Porcentaje de asistencia por sesión de entrenamiento</p>
          </div>
        </div>
        <div className="h-64 w-full">
          {attendanceEvolutionData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Registra asistencia para ver la evolución
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceEvolutionData} margin={{ top: 10, right: 15, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  formatter={(val: number) => [`${val}%`, 'Asistencia']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Asistencia" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 3: Payments Status (Pie Chart) */}
      <div id="chart-payment-status" className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Estado de Pagos</h4>
            <p className="text-xs text-slate-500">Proporción de estados en transacciones registradas</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-56 w-full flex justify-center">
            {paymentStatusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Sin registros de pago
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [val, 'Pagos']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-col gap-3 justify-center">
            {paymentStatusData.map((item, index) => {
              const total = payments.length;
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">{item.value} </span>
                    <span className="text-xs text-slate-400">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
            {paymentStatusData.length === 0 && (
              <p className="text-xs text-slate-400 text-center">Sin datos de distribución de cuotas</p>
            )}
          </div>
        </div>
      </div>

      {/* Chart 4: Attendance by Category */}
      <div id="chart-attendance-by-category" className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Asistencia por Categorías</h4>
            <p className="text-xs text-slate-500">Porcentaje de asistencia promedio por rango etario</p>
          </div>
        </div>
        <div className="h-64 w-full">
          {attendance.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Registra asistencia para ver la comparación
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAttendanceData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="categoria" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  formatter={(val: number) => [`${val}%`, 'Asistencia Promedio']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}
                />
                <Bar dataKey="Asistencia" fill="#d97706" radius={[4, 4, 0, 0]} barSize={50}>
                  {categoryAttendanceData.map((entry, index) => {
                    const colors = ['#f59e0b', '#3b82f6', '#10b981']; // infant, juv, adult custom shades
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
