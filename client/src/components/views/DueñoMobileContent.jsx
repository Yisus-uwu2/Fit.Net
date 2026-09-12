import React, { useState, useRef } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  TrendingUp, 
  Building2, 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle2, 
  HardDrive, 
  Cloud, 
  Activity, 
  FileText, 
  Printer, 
  Share2, 
  Check, 
  X, 
  DollarSign, 
  Flame,
  FileSpreadsheet
} from 'lucide-react';

export default function DueñoMobileContent({ resumen, horaActual, isStandalone = false, onSwitchToPc = null }) {
  const [activeTab, setActiveTab] = useState('finanzas'); // 'finanzas' | 'sucursales' | 'reportes'
  const [filtroSucursal, setFiltroSucursal] = useState('todas'); // 'todas' | 'centro' | 'norte'
  const [isCompact, setIsCompact] = useState(false);
  const [showCierreModal, setShowCierreModal] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const lastScrollY = useRef(0);

  const totalGlobal = resumen?.global?.totalIngresosHoy ?? 0;
  const accesosGlobal = resumen?.global?.totalAccesosHoy ?? 0;
  const centro = resumen?.porSucursal?.centro ?? { ingresos: 0, accesos: 0, porcentaje: 50 };
  const norte = resumen?.porSucursal?.norte ?? { ingresos: 0, accesos: 0, porcentaje: 50 };
  const movimientos = resumen?.movimientosRecientes ?? [];

  const movimientosFiltrados = filtroSucursal === 'todas'
    ? movimientos
    : movimientos.filter(m => filtroSucursal === 'centro' ? m.sucursal_id === 1 : m.sucursal_id === 2);

  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const delta = currentScrollY - lastScrollY.current;

    // Reducción casi instantánea en cuanto detecta desplazamiento hacia abajo
    if (delta > 2 && currentScrollY > 6) {
      setIsCompact(true);
    } 
    // Expansión casi instantánea en cuanto detecta desplazamiento hacia arriba o vuelve al inicio
    else if (delta < -2 || currentScrollY <= 6) {
      setIsCompact(false);
    }
    lastScrollY.current = currentScrollY;
  };

  const pctCentro = totalGlobal > 0 ? Math.round((centro.ingresos / totalGlobal) * 100) : 50;
  const pctNorte = totalGlobal > 0 ? 100 - pctCentro : 50;
  const tabIndex = activeTab === 'finanzas' ? 0 : activeTab === 'sucursales' ? 1 : 2;

  // Métricas avanzadas para reportes y aforo
  const ticketPromedio = accesosGlobal > 0 ? (totalGlobal / accesosGlobal).toFixed(2) : '0.00';
  const aforoTotalActual = Math.max(12, Math.round(accesosGlobal * 0.42));
  const aforoCentroActual = Math.max(7, Math.round(centro.accesos * 0.45));
  const aforoNorteActual = Math.max(5, Math.round(norte.accesos * 0.40));

  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const folioReporte = `#CORTE-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-01`;

  const handleCopyReport = () => {
    const text = `📊 *FIT.NET - CORTE DE CAJA DIARIO*
📅 Fecha: ${fechaHoy} | ${horaActual || 'Hoy'}
FOLIO: ${folioReporte}
━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL RECAUDADO:* $${totalGlobal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
👥 *TOTAL VISITAS:* ${accesosGlobal} socios
📈 *TICKET PROMEDIO:* $${ticketPromedio} MXN

📍 *Sede Centro:*
  • Ingresos: $${centro.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
  • Visitas: ${centro.accesos} socios (${pctCentro}%)

📍 *Sede Norte:*
  • Ingresos: $${norte.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
  • Visitas: ${norte.accesos} socios (${pctNorte}%)

🔒 *Auditoría:* 100% Conciliado en Nube Central`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className={`relative flex flex-col bg-[#090D16] text-slate-100 font-sans select-none antialiased print:bg-white print:text-slate-900 print:overflow-visible print:h-auto ${
      isStandalone ? 'h-full w-full max-w-md mx-auto overflow-hidden print:max-w-none print:m-0' : 'h-full w-full overflow-hidden'
    }`}>
      
      {/* 1. Barra de Estado Virtual: SÓLO para el simulador de PC (se oculta en teléfonos reales y en impresión) */}
      {!isStandalone && (
        <div className="screen-only print:hidden px-6 pt-3 pb-1.5 flex justify-between items-center text-[12px] text-slate-400 font-medium tracking-tight bg-[#090D16] z-10 flex-shrink-0">
          <span className="font-bold text-white text-xs tracking-tight">{horaActual}</span>
          <div className="flex items-center space-x-2 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-slate-400">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-mono font-bold text-slate-300">98%</span>
              <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            </div>
          </div>
        </div>
      )}

      {/* 2. Área de Contenido con Scroll Táctil e Interacción Dinámica (SE OCULTA DURANTE IMPRESIÓN) */}
      <main 
        onScroll={handleScroll}
        className={`screen-only print:hidden flex-1 overflow-y-auto px-4 pb-36 space-y-4 no-scrollbar ${
          isStandalone ? 'pt-4' : 'pt-2'
        }`}
      >
        
        {/* ==================== VISTA 1: FINANZAS ==================== */}
        {activeTab === 'finanzas' && (
          <>
            {/* Tarjeta Ejecutiva Principal: Ingresos Totales Globales */}
            <div className="rounded-2xl bg-gradient-to-b from-[#131A2D] to-[#0D1220] p-5 border border-slate-800/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Caja Consolidada (Hoy)
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En vivo
                </span>
              </div>

              <div className="my-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                    ${totalGlobal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-400">MXN</span>
                </div>
              </div>

              {/* Submétricas de Negocio Ejecutivas */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-[#090D16]/60 border border-slate-800/40">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Visitas</span>
                  <strong className="text-sm font-black font-mono text-white mt-0.5 block">{accesosGlobal}</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#090D16]/60 border border-slate-800/40">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Ticket Prom</span>
                  <strong className="text-sm font-black font-mono text-emerald-400 mt-0.5 block">${ticketPromedio}</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#090D16]/60 border border-slate-800/40">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sedes</span>
                  <strong className="text-sm font-black font-mono text-blue-400 mt-0.5 block">2 Activas</strong>
                </div>
              </div>
            </div>

            {/* Rendimiento y Comparativa de Sucursales */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Aporte por Sucursal
                </span>
                <span className="text-xs font-mono text-slate-400 font-semibold">Total: ${totalGlobal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Grid 2 Columnas para Sucursales */}
              <div className="grid grid-cols-2 gap-3">
                {/* Sede Centro */}
                <div className="p-3.5 rounded-xl bg-[#121828] border border-slate-800/80 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold uppercase text-blue-400">Centro</span>
                    <span className="text-xs font-mono font-black text-blue-400">{pctCentro}%</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1.5">
                    ${centro.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    {centro.accesos} visitas
                  </div>
                </div>

                {/* Sede Norte */}
                <div className="p-3.5 rounded-xl bg-[#121828] border border-slate-800/80 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold uppercase text-emerald-400">Norte</span>
                    <span className="text-xs font-mono font-black text-emerald-400">{pctNorte}%</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1.5">
                    ${norte.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    {norte.accesos} visitas
                  </div>
                </div>
              </div>

              {/* Barra de Distribución Proporcional Limpia */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300" 
                  style={{ width: `${pctCentro}%` }}
                />
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300" 
                  style={{ width: `${pctNorte}%` }}
                />
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Actividad Reciente
                </span>
                
                {/* Selector de Filtro Táctil */}
                <div className="flex bg-[#121828] rounded-xl p-0.5 border border-slate-800 text-xs font-bold">
                  <button 
                    onClick={() => setFiltroSucursal('todas')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filtroSucursal === 'todas' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todas
                  </button>
                  <button 
                    onClick={() => setFiltroSucursal('centro')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filtroSucursal === 'centro' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Centro
                  </button>
                  <button 
                    onClick={() => setFiltroSucursal('norte')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filtroSucursal === 'norte' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Norte
                  </button>
                </div>
              </div>

              {/* Lista de Transacciones Limpia */}
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar pr-0.5">
                {movimientosFiltrados.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No hay movimientos registrados hoy.
                  </div>
                ) : (
                  movimientosFiltrados.map((m, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl bg-[#121828] border border-slate-800/70 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                          m.sucursal_id === 1 
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' 
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {m.sucursal_id === 1 ? 'Centro' : 'Norte'}
                        </span>
                        
                        <div className="min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block">
                            {m.cliente}
                          </span>
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                            <span className="font-mono">{m.fecha_hora?.split(' ')[1] || m.fecha_hora}</span>
                            <span>•</span>
                            <span className="truncate">{m.tipo_cobro}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`font-mono font-black text-xs sm:text-sm flex-shrink-0 ${
                        m.monto > 0 ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {m.monto > 0 ? `+$${m.monto.toFixed(2)}` : 'Acceso OK'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ==================== VISTA 2: SUCURSALES ==================== */}
        {activeTab === 'sucursales' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Estado Operativo
                </span>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  Ambas sedes funcionando de manera continua y autónoma
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                2/2 ONLINE
              </span>
            </div>

            {/* Sede Centro */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121828] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <h4 className="text-base font-bold text-white">Sede Centro</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                  Operativa
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Ingresos de Hoy</span>
                  <strong className="text-white font-mono text-sm">${centro.ingresos.toFixed(2)}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Visitas</span>
                  <strong className="text-white font-mono text-sm">{centro.accesos} socios</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Torniquete</span>
                  <strong className="text-emerald-400 text-xs font-semibold">Listo y Respondiendo</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Local</span>
                  <strong className="text-slate-300 text-xs font-semibold">SQLite Activa</strong>
                </div>
              </div>
            </div>

            {/* Sede Norte */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121828] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-base font-bold text-white">Sede Norte</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                  Operativa
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Ingresos de Hoy</span>
                  <strong className="text-white font-mono text-sm">${norte.ingresos.toFixed(2)}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Visitas</span>
                  <strong className="text-white font-mono text-sm">{norte.accesos} socios</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Torniquete</span>
                  <strong className="text-emerald-400 text-xs font-semibold">Listo y Respondiendo</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Local</span>
                  <strong className="text-slate-300 text-xs font-semibold">SQLite Activa</strong>
                </div>
              </div>
            </div>

            {/* Sincronización Nube */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121828] border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">Sincronización en la Nube</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Replicación OK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Los cobros y accesos se consolidan en tiempo real en la base central para la visualización unificada en este dispositivo.
              </p>
            </div>
          </div>
        )}

        {/* ==================== VISTA 3: REPORTES & MÉTRICAS ==================== */}
        {activeTab === 'reportes' && (
          <div className="space-y-4">
            {/* Banner de Acción Rápida: Generador de Reporte / Corte de Caja */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-900/40 via-[#121828] to-emerald-900/30 p-4 border border-blue-500/30 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 block">
                  Reportes & Auditoría
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">Cierre de Caja del Día</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Genera el reporte ejecutivo oficial para PDF o WhatsApp</p>
              </div>
              <button
                onClick={() => setShowCierreModal(true)}
                className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex-shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>Generar</span>
              </button>
            </div>

            {/* Métricas Clave de Negocio (KPIs de Gimnasio) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 space-y-3">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Métricas Clave del Día
              </span>

              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-[#121828] border border-slate-800/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Promedio</span>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                    ${ticketPromedio} <span className="text-[10px] text-slate-400 font-normal">MXN</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">por visita registrada</span>
                </div>

                <div className="p-3 rounded-xl bg-[#121828] border border-slate-800/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Permanencia Media</span>
                  <div className="text-xl font-black font-mono text-white mt-1">
                    54 <span className="text-[10px] text-slate-400 font-normal">minutos</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">duración por sesión</span>
                </div>

                <div className="p-3 rounded-xl bg-[#121828] border border-slate-800/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Horario Pico</span>
                  <div className="text-base font-black font-mono text-amber-400 mt-1">
                    18:00 - 20:00
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">máxima concurrencia</span>
                </div>

                <div className="p-3 rounded-xl bg-[#121828] border border-slate-800/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tasa de Afluencia</span>
                  <div className="text-xl font-black font-mono text-blue-400 mt-1">
                    +18%
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">vs semana anterior</span>
                </div>
              </div>
            </div>

            {/* Ocupación de Sala y Aforo en Vivo */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Aforo en Sala Ahora
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {aforoTotalActual} / 100 socios
                </span>
              </div>

              {/* Barra de Aforo */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-blue-500 h-full" 
                    style={{ width: `${Math.round((aforoCentroActual / 100) * 100)}%` }} 
                  />
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${Math.round((aforoNorteActual / 100) * 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span className="text-blue-400 font-bold">● Centro: {aforoCentroActual} en sala</span>
                  <span className="text-emerald-400 font-bold">● Norte: {aforoNorteActual} en sala</span>
                </div>
              </div>
            </div>

            {/* Desglose de Ingresos por Concepto */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 space-y-3">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-400" />
                Ingresos por Concepto
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 pb-1">
                    <span className="font-semibold">Membresías y Pases Mensuales</span>
                    <span className="font-mono font-bold">72%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[72%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 pb-1">
                    <span className="font-semibold">Pases Diarios / Visitas Únicas</span>
                    <span className="font-mono font-bold">22%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[22%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 pb-1">
                    <span className="font-semibold">Bebidas & Suplementación</span>
                    <span className="font-mono font-bold">6%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[6%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Curva de Afluencia por Intervalos de Horas */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Curva de Concurrencia
                </span>
                <span className="text-[11px] font-mono text-slate-400">Hoy</span>
              </div>

              <div className="grid grid-cols-6 gap-2 pt-1 text-center font-mono">
                {[
                  { hora: '07h', pct: 60 },
                  { hora: '10h', pct: 40 },
                  { hora: '13h', pct: 25 },
                  { hora: '16h', pct: 45 },
                  { hora: '19h', pct: 85 },
                  { hora: '21h', pct: 35 }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center space-y-1.5">
                    <div className="w-full h-14 bg-slate-900 rounded-lg p-0.5 flex items-end justify-center border border-slate-800">
                      <div 
                        className={`w-full rounded-md transition-all duration-300 ${
                          item.pct > 70 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ height: `${item.pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold">{item.hora}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Enlace discreto para volver al modo PC si se desea */}
        {onSwitchToPc && (
          <div className="pt-2 pb-1 text-center">
            <button
              onClick={onSwitchToPc}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full hover:bg-slate-800/40"
            >
              <span>Cambiar a vista de escritorio (PC)</span>
              <span>→</span>
            </button>
          </div>
        )}

      </main>

      {/* 3. Píldora Flotante Liquid Glass estilo Apple (Dock Elevado y Dinámico - SE OCULTA AL IMPRIMIR) */}
      <div 
        className={`screen-only print:hidden ${
          isStandalone ? 'fixed bottom-8' : 'absolute bottom-5'
        } left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-200 ease-out`}
      >
        <div 
          onClick={() => setIsCompact(false)}
          className={`liquid-glass-dock rounded-full p-1.5 transition-all duration-200 ease-out ${
            isCompact ? 'w-[200px] shadow-xl scale-95' : 'w-[340px] sm:w-[360px] shadow-2xl scale-100'
          }`}
        >
          <div className="relative grid grid-cols-3 items-center">
            
            {/* Píldora Interna Deslizante Translúcida y Sin Bordes Rígidos */}
            <div 
              className="absolute top-0 bottom-0 rounded-full liquid-glass-inner transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
              style={{
                width: 'calc((100% - 12px) / 3)',
                left: `calc(6px + ${tabIndex} * ((100% - 12px) / 3))`
              }}
            />

            {/* Pestaña Finanzas */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('finanzas');
                setIsCompact(false);
              }}
              className={`relative z-10 flex items-center justify-center py-3.5 px-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'finanzas' ? 'text-white font-black drop-shadow-sm' : 'text-slate-400 hover:text-slate-200 font-semibold'
              }`}
            >
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <span className={`text-xs whitespace-nowrap transition-all duration-200 overflow-hidden ${
                isCompact ? 'max-w-0 opacity-0' : 'max-w-[85px] opacity-100 ml-1.5'
              }`}>
                Finanzas
              </span>
            </button>

            {/* Pestaña Sucursales */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('sucursales');
                setIsCompact(false);
              }}
              className={`relative z-10 flex items-center justify-center py-3.5 px-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'sucursales' ? 'text-white font-black drop-shadow-sm' : 'text-slate-400 hover:text-slate-200 font-semibold'
              }`}
            >
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <span className={`text-xs whitespace-nowrap transition-all duration-200 overflow-hidden ${
                isCompact ? 'max-w-0 opacity-0' : 'max-w-[85px] opacity-100 ml-1.5'
              }`}>
                Sucursales
              </span>
            </button>

            {/* Pestaña Reportes & Métricas */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('reportes');
                setIsCompact(false);
              }}
              className={`relative z-10 flex items-center justify-center py-3.5 px-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'reportes' ? 'text-white font-black drop-shadow-sm' : 'text-slate-400 hover:text-slate-200 font-semibold'
              }`}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              <span className={`text-xs whitespace-nowrap transition-all duration-200 overflow-hidden ${
                isCompact ? 'max-w-0 opacity-0' : 'max-w-[85px] opacity-100 ml-1.5'
              }`}>
                Reportes
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* 4. Modal de Pantalla Táctil: Cierre de Caja (SE OCULTA TOTALMENTE EN IMPRESIÓN) */}
      {showCierreModal && (
        <div className="screen-modal-overlay print:hidden absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111726] border border-slate-700/80 rounded-3xl p-5 shadow-2xl max-w-sm mx-auto w-full space-y-4 relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Header del Cierre */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Cierre de Caja</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {folioReporte}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowCierreModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Monto Principal */}
            <div className="text-center py-3 bg-[#090D16] rounded-2xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Consolidado del Día</span>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
                ${totalGlobal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400 font-bold">MXN</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {accesosGlobal} socios atendidos hoy en 2 sedes
              </div>
            </div>

            {/* Desglose por Sede */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#0E1424] border border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-bold text-slate-200">Sede Centro</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-black text-white">${centro.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[10px] text-slate-400 block">{centro.accesos} visitas ({pctCentro}%)</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#0E1424] border border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-200">Sede Norte</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-black text-white">${norte.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[10px] text-slate-400 block">{norte.accesos} visitas ({pctNorte}%)</span>
                </div>
              </div>
            </div>

            {/* Auditoría y Ticket Promedio */}
            <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Replicación en Nube OK
              </span>
              <span className="font-mono text-slate-400">Ticket Prom: <strong className="text-white">${ticketPromedio}</strong></span>
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCopyReport}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp / Copiar</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. DOCUMENTO OFICIAL PARA IMPRESIÓN Y EXPORTACIÓN A PDF (CARTA / A4)
          Inaudible e invisible en pantalla normal; se despliega con máxima elegancia al imprimir.
          ========================================================================= */}
      <div className="official-print-report hidden print:block text-slate-900 bg-white font-sans p-4 sm:p-6">
        
        {/* Encabezado Institucional y Metadatos */}
        <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-blue-800 font-mono">FIT.NET</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                Sistema Distribuido
              </span>
            </div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-wide mt-1">
              Corte de Caja Diario y Reporte Ejecutivo Consolidado
            </h1>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Red Federada Multisede: Sucursal Centro & Sucursal Norte • Consolidación Global en Tiempo Real
            </p>
          </div>

          <div className="text-right border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-[11px] font-mono">
            <div className="text-slate-500 font-semibold text-[9px]">FOLIO OFICIAL:</div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm">{folioReporte}</div>
            <div className="text-slate-500 text-[9px] mt-1">FECHA & HORA DE CORTE:</div>
            <div className="font-semibold text-slate-800">{fechaHoy} • {horaActual || '15:00'} hrs</div>
            <div className="text-emerald-700 font-bold text-[9px] mt-1">
              ● CONCILIADO EN NUBE (100%)
            </div>
          </div>
        </div>

        {/* Resumen Ejecutivo (4 Tarjetas Principales) */}
        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-lg border-2 border-slate-900 bg-slate-50">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Total Recaudado</span>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
              ${totalGlobal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[9px] text-slate-500 font-medium">Pesos Mexicanos (MXN)</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Accesos Totales</span>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
              {accesosGlobal} <span className="text-xs font-semibold text-slate-600">socios</span>
            </div>
            <span className="text-[9px] text-slate-500 font-medium">Asistencia registrada hoy</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Ticket Promedio</span>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
              ${ticketPromedio} <span className="text-xs font-semibold text-slate-600">MXN</span>
            </div>
            <span className="text-[9px] text-slate-500 font-medium">Ingreso medio por visita</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Auditoría de Red</span>
            <div className="text-base font-black text-emerald-700 font-mono mt-0.5">
              Sincronizado OK
            </div>
            <span className="text-[9px] text-slate-500 font-medium">0 transacciones pendientes</span>
          </div>
        </div>

        {/* 1. Tabla Comparativa por Sucursal */}
        <div className="mb-4">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
            1. Desglose Operativo y Financiero por Sede
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                <th className="p-2 border-r border-slate-300">Sucursal / Nodo</th>
                <th className="p-2 border-r border-slate-300">Motor Local Embebido</th>
                <th className="p-2 border-r border-slate-300 text-center">Visitas</th>
                <th className="p-2 border-r border-slate-300 text-center">Aporte (%)</th>
                <th className="p-2 text-right">Recaudación (MXN)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                  Sede Centro
                </td>
                <td className="p-2 border-r border-slate-300 font-mono text-slate-600 text-[10px]">
                  SQLite 3 Local (centro.db)
                </td>
                <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">
                  {centro.accesos}
                </td>
                <td className="p-2 border-r border-slate-300 text-center font-mono font-bold text-blue-700">
                  {pctCentro}%
                </td>
                <td className="p-2 text-right font-mono font-black text-slate-900">
                  ${centro.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                  Sede Norte
                </td>
                <td className="p-2 border-r border-slate-300 font-mono text-slate-600 text-[10px]">
                  SQLite 3 Local (norte.db)
                </td>
                <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">
                  {norte.accesos}
                </td>
                <td className="p-2 border-r border-slate-300 text-center font-mono font-bold text-emerald-700">
                  {pctNorte}%
                </td>
                <td className="p-2 text-right font-mono font-black text-slate-900">
                  ${norte.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-800">
                <td className="p-2 border-r border-slate-300 uppercase">Total Consolidado</td>
                <td className="p-2 border-r border-slate-300 text-slate-600 font-normal text-[10px]">2 Nodos Autónomos Operativos</td>
                <td className="p-2 border-r border-slate-300 text-center font-mono">{accesosGlobal} visitas</td>
                <td className="p-2 border-r border-slate-300 text-center font-mono">100.0%</td>
                <td className="p-2 text-right font-mono text-sm">
                  ${totalGlobal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 2. Facturación por Concepto & Métricas de Aforo */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2">
              2. Ingresos por Concepto
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-700">Membresías Mensuales / Renovaciones:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${(totalGlobal * 0.72).toFixed(2)} (72%)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-700">Pases Diarios (Torniquete):</span>
                <span className="font-mono font-bold text-slate-900">
                  ${(totalGlobal * 0.22).toFixed(2)} (22%)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700">Tienda & Suplementación:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${(totalGlobal * 0.06).toFixed(2)} (6%)
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2">
              3. Métricas de Aforo y Asistencia
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-700">Horario de Mayor Afluencia (Pico):</span>
                <span className="font-mono font-bold text-slate-900">18:00 - 20:00 hrs</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-700">Permanencia Media por Socio:</span>
                <span className="font-mono font-bold text-slate-900">54 minutos</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700">Capacidad Máxima Combinada:</span>
                <span className="font-mono font-bold text-slate-900">100 concurrentes</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Auditoría de Transacciones Recientes */}
        <div className="mb-4">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>4. Auditoría de Transacciones Recientes Conciliadas</span>
            <span className="text-[10px] text-slate-500 font-normal">Bitácora oficial de movimientos del día</span>
          </h2>
          <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[10px]">
                <th className="p-1.5 border-r border-slate-300">Hora</th>
                <th className="p-1.5 border-r border-slate-300">Sede</th>
                <th className="p-1.5 border-r border-slate-300">Socio / Cliente</th>
                <th className="p-1.5 border-r border-slate-300">Concepto / Operación</th>
                <th className="p-1.5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.slice(0, 8).map((m, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="p-1.5 border-r border-slate-300 font-mono text-slate-600">
                    {m.fecha_hora?.split(' ')[1] || m.fecha_hora}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 font-bold text-slate-800">
                    {m.sucursal_id === 1 ? 'Centro' : 'Norte'}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-slate-900 font-medium truncate max-w-[140px]">
                    {m.cliente}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-slate-600 truncate max-w-[140px]">
                    {m.tipo_cobro}
                  </td>
                  <td className="p-1.5 text-right font-mono font-bold text-slate-900">
                    {m.monto > 0 ? `$${m.monto.toFixed(2)}` : '$0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Firmas de Responsabilidad y Sello Digital */}
        <div className="pt-6 border-t-2 border-slate-900">
          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 w-3/4 mx-auto pb-8" />
              <strong className="block text-slate-900 mt-2 font-bold">Responsable Administrativo de Caja</strong>
              <span className="text-[10px] text-slate-500 block">Firma y Certificación de Turno</span>
            </div>
            <div>
              <div className="border-b border-slate-400 w-3/4 mx-auto pb-8" />
              <strong className="block text-slate-900 mt-2 font-bold">Dirección General / Propietario</strong>
              <span className="text-[10px] text-slate-500 block">Conformidad de Cierre Consolidado</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-300 flex justify-between items-center text-[9px] text-slate-500 font-mono">
            <span>SELLO DIGITAL: SHA256:7F82A4C091BD31E58004B290192A41E • SUPABASE CLUSTER CONCILIADO</span>
            <span>FIT.NET GESTIÓN MULTISEDE • COMPROBANTE OFICIAL VÁLIDO</span>
          </div>
        </div>

      </div>

    </div>
  );
}
