import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, X, Star, Trash2, Edit2, Info } from 'lucide-react';
import { Actividad, TipoActividad, CategoriaJugador } from '../types';
import { generateId, formatDateSpanish } from '../utils/helpers';

interface CalendarViewProps {
  activities: Actividad[];
  onUpdateActivities: (activities: Actividad[]) => void;
}

export default function CalendarView({ activities, onUpdateActivities }: CalendarViewProps) {
  // Calendar Month Navigation (defaulting to June 2026 since seed values are in June 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // 0-indexed (5 = June)

  // Selected Day for Action Modal
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  
  // Registration Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoActividad>('Entrenamiento');
  const [fecha, setFecha] = useState('');
  const [categoria, setCategoria] = useState<CategoriaJugador | 'Todas'>('Todas');
  const [descripcion, setDescripcion] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // Month names list
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Helper to change month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar grid for current month/year
  const calendarGrid = useMemo(() => {
    // Week begins on Monday (standard in Latin America)
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Let's find first day of month
    const firstDayIndexOriginal = new Date(currentYear, currentMonth, 1).getDay();
    // Shift index to match Monday-first (0-6 where 0 is Monday, 6 is Sunday)
    const firstDayIndex = firstDayIndexOriginal === 0 ? 6 : firstDayIndexOriginal - 1;

    // Days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Days in previous month (to pad calendar)
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: { dateStr: string; dayNum: number; isPadding: boolean }[] = [];

    // Pre-padding from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const padDateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDayNum).padStart(2, '0')}`;
      cells.push({ dateStr: padDateStr, dayNum: prevDayNum, isPadding: true });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ dateStr: dayDateStr, dayNum: day, isPadding: false });
    }

    // Post-padding to complete full weeks
    const remaining = 42 - cells.length; // Standard 6-row grid
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const padDateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({ dateStr: padDateStr, dayNum: i, isPadding: true });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Index activities by date for rapid rendering inside the cells
  const activitiesByDateMap = useMemo(() => {
    const map = new Map<string, Actividad[]>();
    activities.forEach(act => {
      const list = map.get(act.fecha) || [];
      list.push(act);
      map.set(act.fecha, list);
    });
    return map;
  }, [activities]);

  // Handle cell click
  const handleCellClick = (dateStr: string) => {
    setSelectedDayStr(dateStr);
  };

  // Open creation form directly
  const handleOpenCreateForm = (prefilledDate?: string) => {
    setEditingId(null);
    setTitulo('');
    setTipo('Entrenamiento');
    setFecha(prefilledDate || selectedDayStr || new Date().toISOString().split('T')[0]);
    setCategoria('Todas');
    setDescripcion('');
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Open edit form
  const handleOpenEditForm = (act: Actividad) => {
    setEditingId(act.id);
    setTitulo(act.titulo);
    setTipo(act.tipo);
    setFecha(act.fecha);
    setCategoria(act.categoria);
    setDescripcion(act.descripcion);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorMsg('El título del evento es obligatorio.');
      return;
    }
    if (!fecha) {
      setErrorMsg('La fecha es obligatoria.');
      return;
    }

    if (editingId) {
      const updated = activities.map(act =>
        act.id === editingId
          ? { ...act, titulo, tipo, fecha, categoria, descripcion }
          : act
      );
      onUpdateActivities(updated);
    } else {
      const newAct: Actividad = {
        id: generateId('act'),
        titulo,
        tipo,
        fecha,
        categoria,
        descripcion,
      };
      onUpdateActivities([...activities, newAct]);
    }
    
    // Auto-update calendar view month to the month of the added element
    const parts = fecha.split('-');
    if (parts.length === 3) {
      setCurrentYear(Number(parts[0]));
      setCurrentMonth(Number(parts[1]) - 1);
    }

    setIsFormOpen(false);
  };

  // Delete event
  const handleDeleteEvent = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta actividad del calendario?')) {
      onUpdateActivities(activities.filter(act => act.id !== id));
    }
  };

  // Activities on the selected active cell (if any)
  const selectedDayActivities = useMemo(() => {
    if (!selectedDayStr) return [];
    return activitiesByDateMap.get(selectedDayStr) || [];
  }, [selectedDayStr, activitiesByDateMap]);

  return (
    <div className="space-y-6">
      {/* Calendar header control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans">Módulo de Calendario y Eventos</h2>
          <p className="text-sm text-slate-500">Planifica los entrenamientos, partidos oficiales o amistosos y eventos del club</p>
        </div>
        <button
          onClick={() => handleOpenCreateForm()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Nueva Actividad
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Grid Calendar component */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 xl:col-span-3">
          {/* Calendar top controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-650 rounded-lg">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-800">
                {monthNames[currentMonth]} {currentYear}
              </h3>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-205 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Mes Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentYear(today.getFullYear());
                  setCurrentMonth(today.getMonth());
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-205 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                Hoy
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-205 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Mes Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Days name row */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 bg-slate-100/30 p-1.5 rounded-xl border border-slate-100">
            {calendarGrid.map((cell) => {
              const cellActivities = activitiesByDateMap.get(cell.dateStr) || [];
              const isSelected = selectedDayStr === cell.dateStr;
              
              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleCellClick(cell.dateStr)}
                  className={`min-h-24 p-2 bg-white rounded-lg border flex flex-col justify-between transition-all hover:bg-slate-50/70 hover:shadow-xs cursor-pointer ${
                    isSelected ? 'ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/10' : 'border-slate-100'
                  } ${cell.isPadding ? 'opacity-40 bg-slate-50/30' : ''}`}
                >
                  {/* Top cell line */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold w-5.5 h-5.5 flex items-center justify-center rounded-full ${
                      isToday 
                        ? 'bg-rose-500 text-white shadow-xs' 
                        : isSelected
                        ? 'text-indigo-650 font-extrabold'
                        : 'text-slate-500'
                    }`}>
                      {cell.dayNum}
                    </span>
                    {cellActivities.length > 0 && (
                      <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full border border-slate-200">
                        {cellActivities.length}
                      </span>
                    )}
                  </div>

                  {/* Badges preview row */}
                  <div className="space-y-1 mt-2 flex-grow overflow-y-auto max-h-16 scrollbar-none">
                    {cellActivities.map((act) => (
                      <div
                        key={act.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium font-sans leading-tight border ${
                          act.tipo === 'Partido'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            : act.tipo === 'Entrenamiento'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-100'
                            : 'bg-amber-50 text-amber-800 border-amber-100'
                        }`}
                        title={`${act.titulo} (${act.categoria})`}
                      >
                        {act.tipo === 'Partido' ? '⚽ ' : act.tipo === 'Entrenamiento' ? '🏃 ' : '🍖 '} 
                        {act.titulo}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Actions Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col h-full justify-between min-h-96">
          <div>
            <h4 className="text-sm font-extrabold text-slate-505 uppercase tracking-wider mb-3">
              Actividades en el Día
            </h4>
            
            {selectedDayStr ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-slate-700 font-bold text-xs font-mono">
                  📅 {formatDateSpanish(selectedDayStr)}
                </div>

                {selectedDayActivities.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <Info className="w-8 h-8 mx-auto stroke-1 text-slate-300 mb-1.5" />
                    <p className="text-xs font-semibold text-slate-500">No hay eventos este día</p>
                    <p className="text-[11px]">¿Quieres agregar una actividad hoy?</p>
                    <button
                      onClick={() => handleOpenCreateForm(selectedDayStr)}
                      className="mt-3 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded transition-all cursor-pointer"
                    >
                      Crear evento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {selectedDayActivities.map((act) => (
                      <div
                        key={act.id}
                        className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                          act.tipo === 'Partido'
                            ? 'bg-emerald-55/10 border-emerald-100 text-emerald-900'
                            : act.tipo === 'Entrenamiento'
                            ? 'bg-indigo-55/10 border-indigo-100 text-indigo-900'
                            : 'bg-amber-55/10 border-amber-100 text-amber-900'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            act.tipo === 'Partido'
                              ? 'bg-emerald-100 text-emerald-800'
                              : act.tipo === 'Entrenamiento'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {act.tipo}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleOpenEditForm(act)}
                              title="Editar"
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(act.id)}
                              title="Eliminar"
                              className="p-1 hover:bg-rose-50 rounded text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="font-semibold text-xs leading-snug">{act.titulo}</p>
                        
                        <p className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                          <Star className="w-3 h-3 text-slate-400" />
                          Categoría: <span className="font-bold underline">{act.categoria}</span>
                        </p>

                        {act.descripcion && (
                          <p className="text-[11px] text-slate-600 mt-1 italic border-t border-slate-100/50 pt-1.5 leading-normal">
                            "{act.descripcion}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium">
                <Info className="w-10 h-10 mx-auto stroke-1 text-slate-300 mb-2" />
                <p className="text-xs">Selecciona un día del calendario para ver, editar o agendar partidos y entrenamientos.</p>
              </div>
            )}
          </div>

          {selectedDayStr && selectedDayActivities.length > 0 && (
            <button
              onClick={() => handleOpenCreateForm(selectedDayStr)}
              className="mt-4 flex w-full justify-center items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Agregar otra hoy
            </button>
          )}
        </div>
      </div>

      {/* Creation and Edit dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-650" />
                {editingId ? 'Editar Actividad' : 'Agendar Actividad'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Título de la Actividad *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="E.g. Entrenamiento fuerte o Partido vs Rayo"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Tipo de Actividad</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoActividad)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Entrenamiento">Entrenamiento 🏃</option>
                    <option value="Partido">Partido ⚽</option>
                    <option value="Evento">Evento Social 🍖</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Colectivo Dirigido</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
                >
                  <option value="Todas">Todas las Categorías (Club General)</option>
                  <option value="Infantil">Solo Infantil</option>
                  <option value="Juvenil">Solo Juvenil</option>
                  <option value="Adulto">Solo Adulto</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Descripción / Detalles adicionales</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Instrucciones para vestuarios, rival, comida, etc."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 resize-none"
                />
              </div>

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
                  {editingId ? 'Guardar Cambios' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
