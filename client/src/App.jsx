import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon
} from 'lucide-react';
import TorniqueteTerminal from './components/views/TorniqueteTerminal';
import DueñoMobileDashboard from './components/views/DueñoMobileDashboard';
import DueñoMobileContent from './components/views/DueñoMobileContent';
import BddTopologyMonitor from './components/views/BddTopologyMonitor';
import { sounds } from './utils/soundManager';
import { api, socket } from './services/api';

export default function App() {
  const isMobileQuery = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('view') === 'mobile' ||
    window.location.hash === '#mobile'
  );

  const [mobileOnly, setMobileOnly] = useState(isMobileQuery);
  const [resumenDueno, setResumenDueno] = useState(null);
  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const urlTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
  const [activeTab, setActiveTab] = useState(urlTab || 'centro');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [nodesStatus, setNodesStatus] = useState(null);

  useEffect(() => {
    api.getEstadoNodos().then(setNodesStatus).catch(console.error);
    api.getResumenDueno().then(setResumenDueno).catch(console.error);

    const timer = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);

    const handleEstado = (status) => setNodesStatus(status);
    const handleIngresos = (data) => setResumenDueno(data);

    socket.on('estado_red_actualizado', handleEstado);
    socket.on('ingresos_actualizados', handleIngresos);

    return () => {
      clearInterval(timer);
      socket.off('estado_red_actualizado', handleEstado);
      socket.off('ingresos_actualizados', handleIngresos);
    };
  }, []);

  const toggleSonido = () => {
    const nuevo = sounds.toggleSound();
    setSoundEnabled(nuevo);
    if (nuevo) sounds.playClick();
  };

  const toggleTheme = () => {
    sounds.playClick();
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'centro', label: 'Sucursal Centro' },
    { id: 'norte', label: 'Sucursal Norte' },
    { id: 'dueno', label: 'Portal del Dueño' },
    { id: 'monitor', label: 'Topología BDD' }
  ];

  if (mobileOnly) {
    return (
      <div className="h-[100dvh] w-full bg-[#090D16] text-slate-100 flex flex-col overflow-hidden select-none print:h-auto print:overflow-visible print:bg-white print:text-slate-900 print:static">
        <DueñoMobileContent 
          resumen={resumenDueno} 
          horaActual={horaActual} 
          isStandalone={true} 
          onSwitchToPc={() => {
            setMobileOnly(false);
            window.history.pushState({}, '', window.location.pathname);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      
      {/* CABECERA LIMPIA (SIN SUBTÍTULOS GENÉRICOS NI ICONOS DE RELLENO) */}
      <header className="sticky top-0 z-40 px-6 sm:px-10 py-3.5 border-b transition-colors bg-[var(--bg-header)] border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          
          {/* LOGOTIPO TIPOGRÁFICO DEPORTIVO */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer select-none" 
            onClick={() => setActiveTab('centro')}
          >
            <span className="text-xl font-black tracking-tight text-[var(--text-primary)]">
              FIT<span className="text-blue-600">.</span>NET
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20">
              BDD
            </span>
          </div>

          {/* MENÚ SEGMENTADO LIMPIO (SIN SUBTEXTOS TIPO IA) */}
          <nav className="flex items-center p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* CONTROLES: MODO OSCURO/CLARO Y AUDIO */}
          <div className="flex items-center space-x-2">
            {/* Toggle Tema Claro / Oscuro */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border transition-colors cursor-pointer bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Toggle Audio */}
            <button
              onClick={toggleSonido}
              className="p-2 rounded-lg border transition-colors cursor-pointer bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 flex flex-col justify-center">
        {activeTab === 'centro' && (
          <TorniqueteTerminal
            sucursalId={1}
            nombre="Sucursal Centro"
            rango={[1, 100]}
            color="#2563EB"
            nodeStatus={nodesStatus?.[1]}
            theme={theme}
          />
        )}

        {activeTab === 'norte' && (
          <TorniqueteTerminal
            sucursalId={2}
            nombre="Sucursal Norte"
            rango={[101, 200]}
            color="#059669"
            nodeStatus={nodesStatus?.[2]}
            theme={theme}
          />
        )}

        {activeTab === 'dueno' && (
          <DueñoMobileDashboard theme={theme} />
        )}

        {activeTab === 'monitor' && (
          <BddTopologyMonitor theme={theme} />
        )}
      </main>

      {/* PIE DE PÁGINA DISCRETO */}
      <footer className="px-8 py-3.5 border-t text-xs flex flex-wrap justify-between items-center max-w-7xl mx-auto w-full border-[var(--border-color)] text-[var(--text-muted)]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-[var(--text-secondary)]">Fit.Net • Arquitectura de Distribución e Integración</span>
        </div>
        <div className="font-mono text-[11px]">
          Bases de Datos Distribuidas
        </div>
      </footer>

    </div>
  );
}
