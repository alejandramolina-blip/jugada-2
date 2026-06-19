import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Clock, 
  Calendar, 
  Menu, 
  X, 
  Trophy, 
  ArrowLeft,
  CalendarDays,
  Activity,
  Heart,
  Database
} from 'lucide-react';

// Subcomponents & types
import Dashboard from '../components/Dashboard';
import PlayersView from '../components/PlayersView';
import PaymentsView from '../components/PaymentsView';
import AttendanceView from '../components/AttendanceView';
import CalendarView from '../components/CalendarView';

import { Jugador, Pago, Asistencia, Actividad } from '../types';
import { 
  loadPlayers, savePlayers, 
  loadPayments, savePayments, 
  loadAttendance, saveAttendance, 
  loadActivities, saveActivities 
} from '../utils/helpers';

export default function HomePage() {
  // Navigation active tab State
  // 'dashboard' | 'players' | 'payments' | 'attendance' | 'calendar'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'players' | 'payments' | 'attendance' | 'calendar'>('dashboard');

  // Core synchronized LocalStorage States
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [payments, setPayments] = useState<Pago[]>([]);
  const [attendance, setAttendance] = useState<Asistencia[]>([]);
  const [activities, setActivities] = useState<Actividad[]>([]);

  // Mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    setPlayers(loadPlayers());
    setPayments(loadPayments());
    setAttendance(loadAttendance());
    setActivities(loadActivities());
  }, []);

  // Setters wrap helper saving automatically
  const handleUpdatePlayers = (updated: Jugador[]) => {
    setPlayers(updated);
    savePlayers(updated);
  };

  const handleUpdatePayments = (updated: Pago[]) => {
    setPayments(updated);
    savePayments(updated);
  };

  const handleUpdateAttendance = (updated: Asistencia[]) => {
    setAttendance(updated);
    saveAttendance(updated);
  };

  const handleUpdateActivities = (updated: Actividad[]) => {
    setActivities(updated);
    saveActivities(updated);
  };

  // Reset core database to seeds helper (highly beneficial during demo / stackblitz inspection!)
  const handleResetDatabase = () => {
    if (confirm('¿Estás seguro de que deseas restablecer los datos por defecto? Esto eliminará tus ediciones actuales de LocalStorage.')) {
      localStorage.clear();
      // Reload on-the-fly
      setPlayers(loadPlayers());
      setPayments(loadPayments());
      setAttendance(loadAttendance());
      setActivities(loadActivities());
      setActiveTab('dashboard');
    }
  };

  // Sidebar navigation options
  const sidebarItems = [
    { id: 'dashboard', label: 'Resumen General', icon: LayoutDashboard },
    { id: 'players', label: 'Jugadores / Plantilla', icon: Users },
    { id: 'payments', label: 'Control de Pagos', icon: CreditCard },
    { id: 'attendance', label: 'Pasar Asistencia', icon: Clock },
    { id: 'calendar', label: 'Agenda & Calendario', icon: Calendar },
  ];

  const handleTabClick = (tabId: any) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Close on mobile
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Upper header navigation for smaller device hamburger toggle */}
      <header className="bg-slate-900 text-white py-3.5 px-5 flex items-center justify-between shadow-md lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-900 text-sm shadow-inner">
            JM
          </div>
          <span className="font-extrabold text-sm tracking-tight text-emerald-400">Jugada Maestra</span>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 focus:outline-none hover:bg-slate-800 rounded transition"
          title="Menú"
        >
          {isSidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-emerald-400" />}
        </button>
      </header>

      {/* Main Container structure (Sidebar + Content panel) */}
      <div className="flex-grow flex relative">
        
        {/* Responsive Drawer Sidebar Panel */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform transform duration-300 border-r border-slate-800
          lg:translate-x-0 lg:static lg:h-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          
          <div>
            {/* Top Logo Brand for desktop */}
            <div className="hidden lg:flex items-center gap-3.5 px-6 py-6.5 border-b border-slate-850">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-900 text-lg shadow-md">
                JM
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight leading-tight bg-gradient-to-r from-white to-slate-205 bg-clip-text">
                  Jugada Maestra
                </h1>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                  Halcones del Barrio
                </p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="p-4 space-y-1">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`
                      w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer select-none
                      ${isActive 
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md hover:bg-emerald-400' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }
                    `}
                  >
                    <IconComponent className="w-4.5 h-4.5 stroke-[2]" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar bottom widget - metadata of administrator Don Rafa */}
          <div className="p-4 border-t border-slate-850 space-y-3.5 bg-slate-950/45">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-[11px] font-bold text-slate-300">
                DR
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-white">Don Rafa</p>
                <p className="text-[10px] text-slate-400">Administrador General</p>
              </div>
            </div>

            {/* Quick utility actions */}
            <div className="pt-2 space-y-1 text-[11px]">
              <button
                onClick={handleResetDatabase}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 rounded-md text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                title="Haga click para restablecer a los datos iniciales de los Halcones"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Restaurar BD Inicial</span>
              </button>
              
              <p className="text-[10px] text-center text-slate-500 font-mono mt-1 pt-1">
                Versión Local Storage
              </p>
            </div>
          </div>
        </aside>

        {/* Backpanel shadow overlay on mobile when sidebar active */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Main Content scrollable Stage panel */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-60px)] lg:max-h-screen">
          <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-300">
            
            {/* Conditional Views routing */}
            {activeTab === 'dashboard' && (
              <Dashboard 
                players={players} 
                payments={payments} 
                attendance={attendance} 
                activities={activities}
                onNavigateToView={handleTabClick}
              />
            )}

            {activeTab === 'players' && (
              <PlayersView 
                players={players} 
                onUpdatePlayers={handleUpdatePlayers} 
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsView 
                payments={payments} 
                players={players}
                onUpdatePayments={handleUpdatePayments} 
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView 
                attendance={attendance} 
                players={players}
                onUpdateAttendance={handleUpdateAttendance} 
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView 
                activities={activities} 
                onUpdateActivities={handleUpdateActivities} 
              />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
