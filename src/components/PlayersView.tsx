import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X, User, Phone, Mail, Calendar, Filter } from 'lucide-react';
import { Jugador, CategoriaJugador } from '../types';
import { generateId } from '../utils/helpers';

interface PlayersViewProps {
  players: Jugador[];
  onUpdatePlayers: (players: Jugador[]) => void;
}

export default function PlayersView({ players, onUpdatePlayers }: PlayersViewProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | CategoriaJugador>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Activo' | 'Inactivo'>('All');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [categoria, setCategoria] = useState<CategoriaJugador>('Adulto');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [activo, setActivo] = useState(true);

  // Error validation
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Form Opening for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setNombre('');
    setApellido('');
    setCategoria('Adulto');
    setFechaNacimiento('1998-01-01');
    setTelefono('');
    setCorreo('');
    setActivo(true);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Handle Form Opening for Edit
  const handleOpenEdit = (player: Jugador) => {
    setEditingId(player.id);
    setNombre(player.nombre);
    setApellido(player.apellido);
    setCategoria(player.categoria);
    setFechaNacimiento(player.fechaNacimiento);
    setTelefono(player.telefono);
    setCorreo(player.correo);
    setActivo(player.activo);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Handle Save (Create / Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      setErrorMsg('Nombre y Apellido son obligatorios.');
      return;
    }

    if (editingId) {
      // Edit mode
      const updated = players.map(p =>
        p.id === editingId
          ? { ...p, nombre, apellido, categoria, fechaNacimiento, telefono, correo, activo }
          : p
      );
      onUpdatePlayers(updated);
    } else {
      // Create mode
      const newPlayer: Jugador = {
        id: generateId('player'),
        nombre,
        apellido,
        categoria,
        fechaNacimiento,
        telefono,
        correo,
        activo,
      };
      onUpdatePlayers([...players, newPlayer]);
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al jugador ${name}?`)) {
      onUpdatePlayers(players.filter(p => p.id !== id));
    }
  };

  // Filtered Players list
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchesSearch = 
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telefono.includes(searchTerm);
      
      const matchesCategory = categoryFilter === 'All' || p.categoria === categoryFilter;
      
      const matchesStatus = 
        statusFilter === 'All' || 
        (statusFilter === 'Activo' && p.activo) || 
        (statusFilter === 'Inactivo' && !p.activo);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [players, searchTerm, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Módulo de Jugadores</h2>
          <p className="text-sm text-slate-500">Crea, edita y administra la plantilla de "Los Halcones del Barrio"</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Nuevo Jugador
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-700"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-700 cursor-pointer"
          >
            <option value="All">Todas las Categorías</option>
            <option value="Infantil">Infantil</option>
            <option value="Juvenil">Juvenil</option>
            <option value="Adulto">Adulto</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
          <User className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-700 cursor-pointer"
          >
            <option value="All">Todos los Estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>

        {/* Total stats */}
        <div className="text-right text-sm text-slate-500 font-medium md:col-span-1 pr-2">
          Mostrando <span className="font-bold text-slate-800">{filteredPlayers.length}</span> de {players.length} jugadores
        </div>
      </div>

      {/* Players List Layout (Responsive Table & Cards combination) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredPlayers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <User className="w-12 h-12 mx-auto stroke-1 mb-3 text-slate-300" />
            <p className="text-base font-semibold text-slate-600">No se encontraron jugadores</p>
            <p className="text-sm">Prueba ajustando los filtros de búsqueda o agrega un nuevo jugador.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Jugador</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">F. Nacimiento</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name/Surname */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">
                          {player.nombre[0].toUpperCase()}{player.apellido[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{player.nombre} {player.apellido}</p>
                          <p className="text-xs text-slate-400 font-mono">ID: {player.id}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Category (Badge) */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        player.categoria === 'Adulto' 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          : player.categoria === 'Juvenil'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {player.categoria}
                      </span>
                    </td>

                    {/* Contact details */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {player.telefono || 'Sin teléfono'}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {player.correo || 'Sin correo'}
                        </p>
                      </div>
                    </td>

                    {/* Date of Birth */}
                    <td className="px-6 py-4 text-slate-600">
                      <p className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {player.fechaNacimiento}
                      </p>
                    </td>

                    {/* Active Check */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold leading-5 ${
                        player.activo 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {player.activo ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" /> Activo
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 stroke-[3]" /> Inactivo
                          </>
                        )}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(player)}
                          title="Editar Jugador"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(player.id, `${player.nombre} ${player.apellido}`)}
                          title="Eliminar Jugador"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation / Editing Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                {editingId ? 'Editar Información del Jugador' : 'Agregar Nuevo Jugador'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="E.g. Diego"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="E.g. Maradona"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaJugador)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Infantil">Infantil (Rango menor)</option>
                    <option value="Juvenil">Juvenil (Rango medio)</option>
                    <option value="Adulto">Adulto (Plantel de honor)</option>
                  </select>
                </div>

                {/* Birthday */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Telephone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Teléfono de contacto</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="E.g. +56 9 1234 5678"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Correo electrónico</label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  />
                </div>
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="form-is-active"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="form-is-active" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  El jugador se encuentra habilitado y activo en el club
                </label>
              </div>

              {/* Form buttons */}
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
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Jugador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
