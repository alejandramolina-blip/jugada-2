import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, CreditCard, Calendar, User, DollarSign, Filter, X, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { Pago, Jugador, EstadoPago } from '../types';
import { formatCurrency, generateId, MESES } from '../utils/helpers';

interface PaymentsViewProps {
  payments: Pago[];
  players: Jugador[];
  onUpdatePayments: (payments: Pago[]) => void;
}

export default function PaymentsView({ payments, players, onUpdatePayments }: PaymentsViewProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | EstadoPago>('All');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Field States
  const [jugadorId, setJugadorId] = useState('');
  const [mes, setMes] = useState('Junio');
  const [anio, setAnio] = useState(2026);
  const [monto, setMonto] = useState<number>(15000);
  const [fecha, setFecha] = useState('');
  const [estado, setEstado] = useState<EstadoPago>('Pendiente');

  // Error validation text
  const [errorMsg, setErrorMsg] = useState('');

  // Player map for easy fast lookup
  const playerMap = useMemo(() => {
    const map = new Map<string, Jugador>();
    players.forEach(p => map.set(p.id, p));
    return map;
  }, [players]);

  // Handle Create action
  const handleOpenCreate = () => {
    setEditingId(null);
    setJugadorId(players[0]?.id || '');
    setMes('Junio');
    setAnio(new Date().getFullYear());
    setMonto(15000);
    setFecha('');
    setEstado('Pendiente');
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Handle Edit Action
  const handleOpenEdit = (pago: Pago) => {
    setEditingId(pago.id);
    setJugadorId(pago.jugadorId);
    setMes(pago.mes);
    setAnio(pago.anio);
    setMonto(pago.monto);
    setFecha(pago.fecha || '');
    setEstado(pago.estado);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Switch status from listing directly as a shortcut helper (extremely useful for payments!)
  const handleTogglePaidDirect = (pago: Pago) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = payments.map(p => {
      if (p.id === pago.id) {
        return {
          ...p,
          estado: (p.estado === 'Pagado' ? 'Pendiente' : 'Pagado') as EstadoPago,
          fecha: p.estado === 'Pagado' ? '' : todayStr
        };
      }
      return p;
    });
    onUpdatePayments(updated);
  };

  // Handle save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jugadorId) {
      setErrorMsg('Debes seleccionar un jugador.');
      return;
    }
    if (monto <= 0) {
      setErrorMsg('El monto debe ser mayor que cero.');
      return;
    }
    if (estado === 'Pagado' && !fecha) {
      // Auto-set today's date if empty and marked as paid
      setFecha(new Date().toISOString().split('T')[0]);
    }

    if (editingId) {
      // Edit
      const updated = payments.map(p =>
        p.id === editingId
          ? { ...p, jugadorId, mes, anio, monto, fecha: estado === 'Pagado' ? (fecha || new Date().toISOString().split('T')[0]) : '', estado }
          : p
      );
      onUpdatePayments(updated);
    } else {
      // Create
      const newPayment: Pago = {
        id: generateId('pay'),
        jugadorId,
        mes,
        anio,
        monto,
        fecha: estado === 'Pagado' ? (fecha || new Date().toISOString().split('T')[0]) : '',
        estado,
      };
      onUpdatePayments([newPayment, ...payments]);
    }

    setIsFormOpen(false);
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de pago?')) {
      onUpdatePayments(payments.filter(p => p.id !== id));
    }
  };

  // Filter Payments list
  const filteredPayments = useMemo(() => {
    return payments.filter(pay => {
      const player = playerMap.get(pay.jugadorId);
      const fullName = player ? `${player.nombre} ${player.apellido}`.toLowerCase() : '';
      
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        pay.mes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMonth = monthFilter === 'All' || pay.mes === monthFilter;
      const matchesStatus = statusFilter === 'All' || pay.estado === statusFilter;

      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [payments, searchTerm, monthFilter, statusFilter, playerMap]);

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Módulo de Cuotas y Pagos</h2>
          <p className="text-sm text-slate-500">Registra y controla las mensualidades pagadas y adeudadas del club</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Registrar Pago / Cuota
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por jugador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700"
          />
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-700 cursor-pointer"
          >
            <option value="All">Todos los meses</option>
            {MESES.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-700 cursor-pointer"
          >
            <option value="All">Todos los estados</option>
            <option value="Pagado">Pagado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Atrasado">Atrasado</option>
          </select>
        </div>

        {/* Total details */}
        <div className="text-right text-sm text-slate-500 font-medium md:col-span-1 pr-2">
          Mostrando <span className="font-bold text-slate-800">{filteredPayments.length}</span> registros de pago
        </div>
      </div>

      {/* Payments Log */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto stroke-1 mb-3 text-slate-300" />
            <p className="text-base font-semibold text-slate-600">No se encontraron pagos</p>
            <p className="text-sm">No existen registros que coincidan con los criterios de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Jugador</th>
                  <th className="px-6 py-4">Mes de Cuota</th>
                  <th className="px-6 py-4">Monto Pactado</th>
                  <th className="px-6 py-4">Fecha Pago</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredPayments.map((pago) => {
                  const player = playerMap.get(pago.jugadorId);
                  
                  return (
                    <tr key={pago.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Player Info */}
                      <td className="px-6 py-4">
                        {player ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                              {player.nombre[0]}{player.apellido[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{player.nombre} {player.apellido}</p>
                              <p className="text-xs text-slate-400">{player.categoria}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-rose-500 font-semibold flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4" />
                            Jugador Eliminado
                          </div>
                        )}
                      </td>

                      {/* Month & Year */}
                      <td className="px-6 py-4 font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{pago.mes} / {pago.anio}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {formatCurrency(pago.monto)}
                      </td>

                      {/* Payment Date */}
                      <td className="px-6 py-4 text-slate-500">
                        {pago.fecha ? (
                          <span className="text-xs bg-slate-100 text-slate-650 px-2 py-1 rounded font-mono">
                            {pago.fecha}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-350 italic">Falta pagar</span>
                        )}
                      </td>

                      {/* State Badge */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleTogglePaidDirect(pago)}
                          title="Haga click para alternar entre Pagado y Pendiente"
                          className="focus:outline-none transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          {pago.estado === 'Pagado' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 shadow-xs">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Pagado
                            </span>
                          ) : pago.estado === 'Atrasado' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-150 shadow-xs animate-pulse">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Atrasado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-150 shadow-xs">
                              <Clock className="w-3.5 h-3.5" />
                              Pendiente
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Direct actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(pago)}
                            title="Editar Pago"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pago.id)}
                            title="Eliminar Pago"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog for creation and updates */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                {editingId ? 'Editar Detalle del Registro' : 'Registrar Pago / Cuota'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Player selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Jugador *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                  <select
                    value={jugadorId}
                    onChange={(e) => setJugadorId(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
                  >
                    <option value="" disabled>Seleccione un jugador...</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido} ({p.categoria})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Month */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Mes</label>
                  <select
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
                  >
                    {MESES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Año</label>
                  <select
                    value={anio}
                    onChange={(e) => setAnio(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Monto pactado ($ CLP) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                    placeholder="E.g. 15000"
                    required
                    min={0}
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Estado del Pago</label>
                <select
                  value={estado}
                  onChange={(e) => {
                    const st = e.target.value as EstadoPago;
                    setEstado(st);
                    if (st === 'Pagado' && !fecha) {
                      setFecha(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
                >
                  <option value="Pagado">Pagado (Aprobado)</option>
                  <option value="Pendiente">Pendiente (A la espera)</option>
                  <option value="Atrasado">Atrasado (Vencido)</option>
                </select>
              </div>

              {/* Fecha de Pago (only enabled if status is Pagado) */}
              {estado === 'Pagado' && (
                <div className="space-y-1 transition-all duration-150">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Fecha en que pagó *</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
