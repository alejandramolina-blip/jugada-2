import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Check, X, ShieldAlert, CheckSquare, Square, Save, RefreshCw, Star } from 'lucide-react';
import { Asistencia, Jugador, CategoriaJugador } from '../types';
import { generateId } from '../utils/helpers';

interface AttendanceViewProps {
  attendance: Asistencia[];
  players: Jugador[];
  onUpdateAttendance: (attendance: Asistencia[]) => void;
}

export default function AttendanceView({ attendance, players, onUpdateAttendance }: AttendanceViewProps) {
  // Current selection states
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<CategoriaJugador>('Adulto');

  // Local state for the attendance sheet before saving
  // Map of player ID -> 'Sí' | 'No'
  const [sheet, setSheet] = useState<Record<string, 'Sí' | 'No'>>({});
  const [hasSavedSuccessfully, setHasSavedSuccessfully] = useState(false);

  // Get active players under the selected Category
  const categoryActivePlayers = useMemo(() => {
    return players.filter(p => p.categoria === selectedCategory && p.activo);
  }, [players, selectedCategory]);

  // Load sheet value from existing attendance records when selection changes
  useEffect(() => {
    // Look up existing records for matching (Date, Category)
    const existing = attendance.filter(
      att => att.fecha === selectedDate && att.categoria === selectedCategory
    );

    const initialSheet: Record<string, 'Sí' | 'No'> = {};
    
    // Seed with existing values, otherwise default to "Sí" for everybody (makes logging much faster!)
    categoryActivePlayers.forEach(p => {
      const recorded = existing.find(att => att.jugadorId === p.id);
      initialSheet[p.id] = recorded ? recorded.asistio : 'Sí';
    });

    setSheet(initialSheet);
    setHasSavedSuccessfully(false);
  }, [selectedDate, selectedCategory, attendance, categoryActivePlayers]);

  // Handle Mark All Present
  const handleMarkAllPresent = () => {
    const updated = { ...sheet };
    categoryActivePlayers.forEach(p => {
      updated[p.id] = 'Sí';
    });
    setSheet(updated);
    setHasSavedSuccessfully(false);
  };

  // Handle Mark All Absent
  const handleMarkAllAbsent = () => {
    const updated = { ...sheet };
    categoryActivePlayers.forEach(p => {
      updated[p.id] = 'No';
    });
    setSheet(updated);
    setHasSavedSuccessfully(false);
  };

  // Toggle single attendance value
  const handleToggleAttendance = (playerId: string) => {
    setSheet(prev => ({
      ...prev,
      [playerId]: prev[playerId] === 'Sí' ? 'No' : 'Sí'
    }));
    setHasSavedSuccessfully(false);
  };

  // Save full list to Storage
  const handleSaveList = () => {
    // 1. Filter out all old matches of { selectedDate, selectedCategory }
    const filteredGlobal = attendance.filter(
      att => !(att.fecha === selectedDate && att.categoria === selectedCategory)
    );

    // 2. Build new attendance entries representing the current state of active players
    const newEntries: Asistencia[] = categoryActivePlayers.map(p => ({
      id: generateId('att'),
      fecha: selectedDate,
      categoria: selectedCategory,
      jugadorId: p.id,
      asistio: sheet[p.id] || 'No',
    }));

    onUpdateAttendance([...filteredGlobal, ...newEntries]);
    setHasSavedSuccessfully(true);
    
    // Reset notification in 3 seconds
    setTimeout(() => {
      setHasSavedSuccessfully(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Módulo de Asistencia Colectiva</h2>
          <p className="text-sm text-slate-500">Pasa la lista por categoría y fecha. Los datos alimentan estadísticas de rendimiento.</p>
        </div>
      </div>

      {/* Attendance Selector config */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
        {/* Date choice */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-450" />
            Fecha de la Sesión
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-700 cursor-pointer"
          />
        </div>

        {/* Category Choice */}
        <div className="space-y-1.5 animation-all">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-slate-450" />
            Seleccionar Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CategoriaJugador)}
            className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-700 cursor-pointer"
          >
            <option value="Infantil">Infantil</option>
            <option value="Juvenil">Juvenil</option>
            <option value="Adulto">Adulto</option>
          </select>
        </div>

        {/* Shortcuts / Global selectors */}
        <div className="flex gap-2 justify-start sm:justify-end">
          <button
            onClick={handleMarkAllPresent}
            disabled={categoryActivePlayers.length === 0}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            Todos Presentes
          </button>
          <button
            onClick={handleMarkAllAbsent}
            disabled={categoryActivePlayers.length === 0}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-150 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            Todos Ausentes
          </button>
        </div>
      </div>

      {/* Main Checklist panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Listado de Plantilla Activa: {selectedCategory} ({categoryActivePlayers.length})
            </h3>
            <p className="text-xs text-slate-455">Haga click en cada casilla para alternar individualmente</p>
          </div>
          
          {categoryActivePlayers.length > 0 && (
            <button
              onClick={handleSaveList}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-transform hover:scale-101 active:scale-99 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Lista Completa
            </button>
          )}
        </div>

        {hasSavedSuccessfully && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-bold rounded-lg flex items-center gap-2 animate-bounce">
            <Check className="w-5 h-5 stroke-[3]" />
            ¡Lista de asistencia guardada exitosamente en LocalStorage para el día {selectedDate}!
          </div>
        )}

        {categoryActivePlayers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldAlert className="w-12 h-12 mx-auto stroke-1 mb-3 text-slate-300" />
            <p className="text-base font-semibold text-slate-650">No hay jugadores activos en esta categoría</p>
            <p className="text-sm">Ve al Módulo de Jugadores para dar de alta o activar miembros en {selectedCategory}.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categoryActivePlayers.map((player, index) => {
              const value = sheet[player.id] || 'No';
              
              return (
                <div 
                  key={player.id} 
                  onClick={() => handleToggleAttendance(player.id)}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-semibold text-slate-400 font-mono w-4">
                      {index + 1}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 font-bold text-sm flex items-center justify-center border border-amber-100">
                      {player.nombre[0]}{player.apellido[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{player.nombre} {player.apellido}</p>
                      <p className="text-xs text-slate-400">{player.correo || 'Sin correo'}</p>
                    </div>
                  </div>

                  {/* Yes/No visual controller */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`w-28 px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        value === 'Sí'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-250 shadow-xs'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 stroke-[3] ${value === 'Sí' ? 'opacity-100' : 'opacity-20'}`} />
                      Asistió (Sí)
                    </button>
                    <button
                      type="button"
                      className={`w-28 px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        value === 'No'
                          ? 'bg-rose-50 text-rose-800 border-rose-250 shadow-xs'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <X className={`w-3.5 h-3.5 stroke-[3] ${value === 'No' ? 'opacity-100' : 'opacity-20'}`} />
                      Faltó (No)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {categoryActivePlayers.length > 0 && (
          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveList}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-transform hover:scale-101 active:scale-99 shadow-sm cursor-pointer"
            >
              <Save className="w-4.5 h-4.5" />
              Guardar Lista de Asistencia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
