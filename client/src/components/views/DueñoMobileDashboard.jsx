import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Smartphone, 
  TrendingUp, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Radio, 
  ArrowUpRight, 
  Users, 
  DollarSign, 
  Zap,
  Layers,
  Search,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import QrCodeImage from '../common/QrCodeImage';
import XpWindow from '../xp/XpWindow';
import DueñoMobileContent from './DueñoMobileContent';
import { api, socket } from '../../services/api';
import { sounds } from '../../utils/soundManager';

export default function DueñoMobileDashboard({ theme }) {
  const [resumen, setResumen] = useState(null);
  const [activeMode, setActiveMode] = useState('phone'); // 'phone' (móvil + QR) | 'dashboard' (escritorio amplio)
  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [copied, setCopied] = useState(false);
  const [filtroTabla, setFiltroTabla] = useState('todas');
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const [filtroConcepto, setFiltroConcepto] = useState('todos'); // 'todos' | 'membresia' | 'cobro'
  const [isExpandedTabla, setIsExpandedTabla] = useState(false);

  useEffect(() => {
    cargarResumen();

    const timer = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);

    const handleActualizacion = (nuevoResumen) => {
      setResumen(prev => ({
        ...nuevoResumen,
        networkIp: nuevoResumen.networkIp || prev?.networkIp
      }));
      sounds.playClick();
    };

    socket.on('ingresos_actualizados', handleActualizacion);
    return () => {
      clearInterval(timer);
      socket.off('ingresos_actualizados', handleActualizacion);
    };
  }, []);

  // Listener para cerrar modal elevado con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsExpandedTabla(false);
      }
    };
    if (isExpandedTabla) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpandedTabla]);

  const cargarResumen = async () => {
    try {
      const data = await api.getResumenDueno();
      setResumen(data);
    } catch (err) {
      console.error('Error cargando resumen global:', err);
    }
  };

  const totalGlobal = resumen?.global?.totalIngresosHoy ?? 0;
  const accesosGlobal = resumen?.global?.totalAccesosHoy ?? 0;
  const centro = resumen?.porSucursal?.centro ?? { ingresos: 0, accesos: 0, porcentaje: 50 };
  const norte = resumen?.porSucursal?.norte ?? { ingresos: 0, accesos: 0, porcentaje: 50 };
  const movimientos = resumen?.movimientosRecientes ?? [];

  // Determinar IP de red local para el QR
  const hostIp = resumen?.networkIp || (window.location.hostname !== 'localhost' ? window.location.hostname : '192.168.1.20');
  const port = window.location.port ? `:${window.location.port}` : '';
  const mobileUrl = `${window.location.protocol}//${hostIp}${port}/?view=mobile`;

  const copiarEnlace = () => {
    sounds.playClick();
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const movimientosFiltrados = movimientos.filter(m => {
    // Filtro por sucursal
    if (filtroTabla !== 'todas') {
      if (filtroTabla === 'centro' && m.sucursal_id !== 1) return false;
      if (filtroTabla === 'norte' && m.sucursal_id !== 2) return false;
    }

    // Filtro por tipo de cobro
    if (filtroConcepto === 'membresia' && m.monto > 0) return false;
    if (filtroConcepto === 'cobro' && m.monto === 0) return false;

    // Filtro por búsqueda de texto
    if (busquedaTabla.trim()) {
      const q = busquedaTabla.toLowerCase().trim();
      const clienteMatch = (m.cliente || '').toLowerCase().includes(q);
      const conceptoMatch = (m.tipo_cobro || '').toLowerCase().includes(q);
      const sucursalMatch = (m.sucursal_nombre || '').toLowerCase().includes(q);
      if (!clienteMatch && !conceptoMatch && !sucursalMatch) return false;
    }

    return true;
  });

  // 1. VISTA DUAL: SIMULADOR MÓVIL + ESTACIÓN QR
  const simulatorAndQrView = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-2">
      
      {/* Columna Izquierda: Smartphone Mockup de Gama Alta */}
      <div className="lg:col-span-6 flex justify-center">
        <div className="relative w-[340px] sm:w-[360px] h-[670px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/10 flex flex-col">
          
          {/* Dynamic Island / Bocina Superior */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3 border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-blue-950 border border-blue-900" />
          </div>

          {/* Pantalla del Teléfono (Interior) */}
          <div className="flex-1 rounded-[38px] overflow-hidden border border-slate-800 flex flex-col relative">
            <DueñoMobileContent resumen={resumen} horaActual={horaActual} isStandalone={false} />
          </div>

          {/* Home Indicator Bar */}
          <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2 opacity-60" />
        </div>
      </div>

      {/* Columna Derecha: Estación de Escaneo QR para Demostración */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Tarjeta Principal del QR */}
        <div className="app-card rounded-2xl p-7 space-y-6 border border-[var(--border-color)]">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                Abre el Portal en tu Teléfono Físico
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Apunta la cámara de tu smartphone conectado al mismo WiFi para ver los ingresos actualizarse en vivo en tu mano mientras pasas tarjetas en la computadora.
            </p>
          </div>

          {/* Contenedor del Código QR */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl app-inner border border-[var(--border-color)]">
            <div className="p-3 bg-white rounded-2xl shadow-md flex-shrink-0 flex items-center justify-center">
              <QrCodeImage 
                value={mobileUrl} 
                size={148} 
              />
            </div>

            <div className="space-y-3 text-left flex-1 min-w-0">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  Enlace Directo LAN:
                </span>
                <div className="font-mono text-xs font-bold text-[var(--text-primary)] truncate bg-[var(--bg-main)] px-3 py-2 rounded-lg border border-[var(--border-color)] select-all">
                  {mobileUrl}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={copiarEnlace}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar Enlace'}</span>
                </button>

                <a
                  href={mobileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl app-inner border border-[var(--border-color)] hover:border-blue-500/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Probar en Pestaña</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Telemetría y Racional Académico */}
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Canal WebSocket Activo
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Latencia en vivo: &lt; 5ms
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-600/5 border border-blue-600/20 text-[11px] text-[var(--text-secondary)] leading-relaxed">
              <strong>Problema de Integración (Paso 3 del caso práctico):</strong> El dueño no consulta cada base de datos local por separado. La vista móvil consume una consulta federada de unión (Centro ∪ Norte) sincronizada en tiempo real.
            </div>
          </div>
        </div>

      </div>

    </div>
  );

  // 2. VISTA AMPLIA: TABLERO EJECUTIVO DE ESCRITORIO
  const dashboardView = (
    <div className="space-y-6">
      
      {/* Tarjetas Superiores de Finanzas Consolidadas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Total Consolidado */}
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-md flex flex-col justify-between border border-blue-400/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-200">
                Ingresos Totales Globales Hoy
              </span>
              <h3 className="text-4xl sm:text-5xl font-black font-mono tracking-tight mt-2">
                ${totalGlobal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-black/25 text-white px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              En Tiempo Real
            </span>
          </div>

          <div className="pt-4 mt-4 border-t border-white/20 flex justify-between items-center text-xs text-blue-100 font-medium">
            <span>Consolidación Centro + Norte:</span>
            <span className="font-bold text-white font-mono text-sm">{accesosGlobal} Visitas Registradas</span>
          </div>
        </div>

        {/* Tarjeta Sucursal Centro */}
        <div className="app-card rounded-2xl p-5 flex flex-col justify-between border border-[var(--border-color)]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Sucursal Centro</h4>
              <span className="text-[11px] text-blue-600 font-mono">IDs 1 al 100</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full border border-blue-600/20">
              Nodo 1
            </span>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-mono">
              ${centro.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
              {centro.accesos} visitas procesadas
            </span>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]">
            <div className="flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
              <span>Aporte:</span>
              <span className="text-blue-600 font-bold">{totalGlobal > 0 ? Math.round((centro.ingresos / totalGlobal) * 100) : 50}%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-color)]">
              <div 
                className="bg-blue-600 h-full transition-all duration-300" 
                style={{ width: `${totalGlobal > 0 ? (centro.ingresos / totalGlobal) * 100 : 50}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta Sucursal Norte */}
        <div className="app-card rounded-2xl p-5 flex flex-col justify-between border border-[var(--border-color)]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Sucursal Norte</h4>
              <span className="text-[11px] text-emerald-600 font-mono">IDs 101 al 200</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-600/10 px-2 py-0.5 rounded-full border border-emerald-600/20">
              Nodo 2
            </span>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-mono">
              ${norte.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
              {norte.accesos} visitas procesadas
            </span>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]">
            <div className="flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
              <span>Aporte:</span>
              <span className="text-emerald-600 font-bold">{totalGlobal > 0 ? Math.round((norte.ingresos / totalGlobal) * 100) : 50}%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-color)]">
              <div 
                className="bg-emerald-600 h-full transition-all duration-300" 
                style={{ width: `${totalGlobal > 0 ? (norte.ingresos / totalGlobal) * 100 : 50}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Flujo Unificado de Cobros en Tiempo Real con Búsqueda, Filtros y Elevación */}
      <div className="app-card rounded-2xl p-6 space-y-4 border border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[var(--border-color)]">
          <div className="space-y-0.5">
            <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Flujo Consolidado de Cobros y Entradas (Base Central)
            </h4>
            <div className="flex items-center space-x-2 text-xs text-[var(--text-muted)] font-mono">
              <span className="font-bold text-blue-600">{movimientosFiltrados.length}</span>
              <span>de {movimientos.length} transacciones registradas</span>
            </div>
          </div>

          {/* Botón para Elevar el Historial al Centro */}
          <button
            onClick={() => setIsExpandedTabla(true)}
            className="self-end md:self-auto py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            title="Elevar flujo consolidado al centro de la pantalla con blur de fondo"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Expandir Historial</span>
          </button>
        </div>

        {/* Barra de Búsqueda y Filtros Combinados */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Búsqueda por Socio / Concepto */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={busquedaTabla}
              onChange={(e) => setBusquedaTabla(e.target.value)}
              placeholder="Buscar por socio, concepto o sede..."
              className="w-full pl-10 pr-8 py-2.5 bg-[var(--bg-surface-inner)] border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
            {busquedaTabla && (
              <button
                onClick={() => setBusquedaTabla('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro por Sucursal */}
          <div className="sm:col-span-3 flex bg-[var(--bg-surface-inner)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
            <button
              onClick={() => setFiltroTabla('todas')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                filtroTabla === 'todas' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroTabla('centro')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                filtroTabla === 'centro' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Centro
            </button>
            <button
              onClick={() => setFiltroTabla('norte')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                filtroTabla === 'norte' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Norte
            </button>
          </div>

          {/* Filtro por Tipo de Cobro */}
          <div className="sm:col-span-3 flex bg-[var(--bg-surface-inner)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
            <button
              onClick={() => setFiltroConcepto('todos')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                filtroConcepto === 'todos' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setFiltroConcepto('membresia')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                filtroConcepto === 'membresia' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Solo accesos por membresía ($0)"
            >
              Membresía
            </button>
            <button
              onClick={() => setFiltroConcepto('cobro')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                filtroConcepto === 'cobro' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Solo accesos con cobro ($60)"
            >
              Cobrados
            </button>
          </div>
        </div>

        {/* Tabla de Movimientos (Inline) */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-inner)] max-h-[300px]">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 font-bold w-36">Sucursal</th>
                <th className="py-3 px-4 font-bold w-1/3">Nombre del Socio</th>
                <th className="py-3 px-4 font-bold w-28">Hora</th>
                <th className="py-3 px-4 font-bold w-36">Concepto</th>
                <th className="py-3 px-4 font-bold text-right w-28">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-mono">
              {movimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center text-[var(--text-muted)] font-sans text-sm">
                    {movimientos.length === 0 ? (
                      'No hay transacciones registradas hoy.'
                    ) : (
                      <div className="space-y-1.5">
                        <p>No se encontraron movimientos con los filtros actuales.</p>
                        <button
                          onClick={() => {
                            setBusquedaTabla('');
                            setFiltroTabla('todas');
                            setFiltroConcepto('todos');
                          }}
                          className="text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          Restablecer filtros
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                movimientosFiltrados.map((m, idx) => (
                  <tr key={idx} className="hover:bg-blue-600/5 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${
                        m.sucursal_id === 1 ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20' : 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20'
                      }`}>
                        {m.sucursal_nombre}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold text-[var(--text-primary)] text-sm truncate">
                      {m.cliente}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-muted)] text-xs">
                      {m.fecha_hora?.split(' ')[1] || m.fecha_hora}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] font-sans truncate text-xs font-medium">
                      {m.tipo_cobro}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {m.monto > 0 ? `+$${m.monto.toFixed(2)}` : '$0.00'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen inferior */}
        {(busquedaTabla || filtroTabla !== 'todas' || filtroConcepto !== 'todos') && (
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)] pt-0.5 px-1">
            <span>
              Filtro activo: mostrando <strong>{movimientosFiltrados.length}</strong> de <strong>{movimientos.length}</strong>
            </span>
            <button
              onClick={() => {
                setBusquedaTabla('');
                setFiltroTabla('todas');
                setFiltroConcepto('todos');
              }}
              className="text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* MODAL ELEVADO EN EL CENTRO CON BLUR DE FONDO PARA EL FLUJO CONSOLIDADO */}
      {isExpandedTabla && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/75 backdrop-blur-md animate-backdrop-in screen-modal-overlay"
          onClick={() => setIsExpandedTabla(false)}
        >
          <div 
            className="w-full max-w-5xl h-[88vh] flex flex-col bg-[var(--bg-surface)] border-2 border-emerald-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.75)] rounded-3xl overflow-hidden animate-elevate"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal Elevado */}
            <div className="p-5 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-surface-elevated)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] uppercase tracking-wide">
                      Flujo Consolidado de Cobros y Entradas
                    </h3>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 border border-emerald-600/20">
                      Red Fit.Net
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                    Base central unificada con sincronización en tiempo real desde Centro y Norte.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="hidden md:inline font-mono text-xs px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 font-bold border border-blue-600/20">
                  {movimientosFiltrados.length} transacciones
                </span>

                <button
                  onClick={() => setIsExpandedTabla(false)}
                  className="p-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  title="Contraer vista y volver al dashboard (Esc)"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Contraer</span>
                </button>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda Elevada */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-surface)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Input de Búsqueda Grande */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="text"
                  value={busquedaTabla}
                  onChange={(e) => setBusquedaTabla(e.target.value)}
                  placeholder="Buscar por socio, concepto de cobro o sede..."
                  className="w-full pl-10 pr-9 py-2.5 bg-[var(--bg-surface-inner)] border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
                {busquedaTabla && (
                  <button
                    onClick={() => setBusquedaTabla('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filtro por Sucursal */}
              <div className="sm:col-span-3 flex bg-[var(--bg-surface-inner)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
                <button
                  onClick={() => setFiltroTabla('todas')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                    filtroTabla === 'todas' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltroTabla('centro')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                    filtroTabla === 'centro' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Centro
                </button>
                <button
                  onClick={() => setFiltroTabla('norte')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                    filtroTabla === 'norte' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Norte
                </button>
              </div>

              {/* Filtro por Tipo de Cobro */}
              <div className="sm:col-span-3 flex bg-[var(--bg-surface-inner)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
                <button
                  onClick={() => setFiltroConcepto('todos')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                    filtroConcepto === 'todos' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Todo
                </button>
                <button
                  onClick={() => setFiltroConcepto('membresia')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                    filtroConcepto === 'membresia' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Membresía
                </button>
                <button
                  onClick={() => setFiltroConcepto('cobro')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                    filtroConcepto === 'cobro' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Cobrados
                </button>
              </div>
            </div>

            {/* Tabla Gigante con Filas Espaciosas */}
            <div className="flex-1 overflow-y-auto bg-[var(--bg-surface-inner)]">
              <table className="w-full text-left text-sm table-fixed">
                <thead className="bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)] sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="py-3.5 px-5 font-bold w-36">Sede</th>
                    <th className="py-3.5 px-5 font-bold w-2/5">Nombre del Socio</th>
                    <th className="py-3.5 px-5 font-bold w-32">Hora</th>
                    <th className="py-3.5 px-5 font-bold w-44">Concepto de Entrada</th>
                    <th className="py-3.5 px-5 font-bold text-right w-36">Monto Cobrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] font-mono">
                  {movimientosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center text-[var(--text-muted)] font-sans text-sm">
                        {movimientos.length === 0 ? (
                          'No hay transacciones registradas hoy.'
                        ) : (
                          <div className="space-y-2">
                            <p className="text-base font-semibold text-[var(--text-primary)]">
                              No se encontraron transacciones para los filtros seleccionados.
                            </p>
                            <button
                              onClick={() => {
                                setBusquedaTabla('');
                                setFiltroTabla('todas');
                                setFiltroConcepto('todos');
                              }}
                              className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 cursor-pointer"
                            >
                              Limpiar filtros
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    movimientosFiltrados.map((m, idx) => (
                      <tr key={idx} className="hover:bg-blue-600/5 transition-colors">
                        <td className="py-4 px-5 font-sans font-bold">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                            m.sucursal_id === 1 ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20' : 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20'
                          }`}>
                            {m.sucursal_nombre}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-sans font-bold text-base text-[var(--text-primary)] truncate">
                          {m.cliente}
                        </td>
                        <td className="py-4 px-5 text-[var(--text-muted)] text-sm">
                          {m.fecha_hora?.split(' ')[1] || m.fecha_hora}
                        </td>
                        <td className="py-4 px-5 text-[var(--text-secondary)] font-sans truncate text-sm font-medium">
                          {m.tipo_cobro}
                        </td>
                        <td className="py-4 px-5 text-right font-black text-base text-emerald-600 dark:text-emerald-400">
                          {m.monto > 0 ? `+$${m.monto.toFixed(2)}` : '$0.00'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie del Modal Elevado */}
            <div className="p-4 sm:p-5 border-t border-[var(--border-color)] bg-[var(--bg-surface-elevated)] flex flex-wrap items-center justify-between text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-3">
                <span>
                  Mostrando <strong>{movimientosFiltrados.length}</strong> de <strong>{movimientos.length}</strong> transacciones en base central
                </span>
                <span className="text-[var(--text-muted)] opacity-50">•</span>
                <span className="font-mono text-[var(--text-secondary)]">Presiona Esc para contraer</span>
              </div>
              {(busquedaTabla || filtroTabla !== 'todas' || filtroConcepto !== 'todos') && (
                <button
                  onClick={() => {
                    setBusquedaTabla('');
                    setFiltroTabla('todas');
                    setFiltroConcepto('todos');
                  }}
                  className="text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <XpWindow
      title="Portal del Dueño • Integración de Ingresos en Vivo"
      icon={<Smartphone className="w-4 h-4" />}
      headerAction={
        <div className="flex items-center bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-color)] space-x-1">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveMode('phone');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'phone'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulador Móvil + QR</span>
          </button>
          
          <button
            onClick={() => {
              sounds.playClick();
              setActiveMode('dashboard');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tablero Escritorio</span>
          </button>
        </div>
      }
      className="w-full"
    >
      {activeMode === 'phone' ? simulatorAndQrView : dashboardView}
    </XpWindow>
  );
}
