import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  WifiOff, 
  RefreshCw, 
  Scan, 
  ShieldCheck, 
  Radio,
  Zap,
  Cpu,
  Search,
  X,
  Maximize2,
  Minimize2,
  Filter
} from 'lucide-react';
import XpWindow from '../xp/XpWindow';
import StatusBadge from '../xp/StatusBadge';
import { api, socket } from '../../services/api';
import { sounds } from '../../utils/soundManager';

export default function TorniqueteTerminal({
  sucursalId,
  nombre,
  rango,
  color,
  nodeStatus,
  theme
}) {
  const [tarjetaId, setTarjetaId] = useState('');
  const [clientes, setClientes] = useState([]);
  const [accesos, setAccesos] = useState([]);
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'membresia' | 'cobro'
  const [filtroSync, setFiltroSync] = useState('todos'); // 'todos' | 'sincronizado' | 'cola'
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    cargarDatos();

    const handleAcceso = (data) => {
      if (data.sucursalId === sucursalId) {
        cargarAccesos();
      }
    };

    socket.on('acceso_registrado', handleAcceso);
    return () => {
      socket.off('acceso_registrado', handleAcceso);
    };
  }, [sucursalId]);

  // Listener para cerrar modal elevado con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  const cargarDatos = async () => {
    try {
      const [listaClientes, listaAccesos] = await Promise.all([
        api.getClientes(sucursalId),
        api.getAccesosHoy(sucursalId)
      ]);
      setClientes(listaClientes || []);
      setAccesos(listaAccesos || []);
    } catch (err) {
      console.error('Error cargando datos de sucursal:', err);
    }
  };

  const cargarAccesos = async () => {
    try {
      const listaAccesos = await api.getAccesosHoy(sucursalId);
      setAccesos(listaAccesos || []);
    } catch (err) {
      console.error('Error actualizando accesos:', err);
    }
  };

  const procesarPase = async (idAProcesar) => {
    const id = idAProcesar || tarjetaId;
    if (!id) return;

    setCargando(true);
    sounds.playHardwareScan();

    try {
      const res = await api.validarAcceso(sucursalId, id);
      setUltimoResultado(res);

      if (res.autorizado) {
        sounds.playDing();
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.6 }
        });
      } else {
        sounds.playChord();
      }

      setTarjetaId('');
      cargarAccesos();
    } catch (err) {
      sounds.playChord();
      setUltimoResultado({
        autorizado: false,
        codigo: 'ERROR_CONEXION',
        mensaje: 'Error de enlace con la base de datos local.'
      });
    } finally {
      setCargando(false);
    }
  };

  const isOnline = nodeStatus?.isOnline ?? true;
  const pendientes = nodeStatus?.pendientesSync ?? 0;

  const accesosFiltrados = accesos.filter(acc => {
    if (busquedaHistorial.trim()) {
      const q = busquedaHistorial.toLowerCase().trim();
      const idMatch = String(acc.cliente_id).includes(q);
      const nombreMatch = `${acc.nombre || ''} ${acc.apellidos || ''}`.toLowerCase().includes(q);
      const conceptoMatch = (acc.tipo_cobro || '').toLowerCase().includes(q);
      if (!idMatch && !nombreMatch && !conceptoMatch) return false;
    }

    if (filtroTipo === 'membresia' && acc.monto > 0) return false;
    if (filtroTipo === 'cobro' && acc.monto === 0) return false;

    if (filtroSync === 'sincronizado' && acc.sincronizado !== 1) return false;
    if (filtroSync === 'cola' && acc.sincronizado !== 0) return false;

    return true;
  });

  const totalRecaudadoFiltrado = accesosFiltrados.reduce((sum, a) => sum + (a.monto || 0), 0);
  const totalPendientesCola = accesos.filter(a => a.sincronizado === 0).length;

  return (
    <XpWindow
      title={`${nombre} • Punto de Entrada (IDs ${rango[0]} - ${rango[1]})`}
      icon={<CreditCard className="w-4 h-4" />}
      headerAction={
        <StatusBadge 
          status={isOnline ? 'online' : 'offline'} 
          label={isOnline ? 'En línea' : 'Autonomía Local'} 
        />
      }
      className="w-full"
    >
      <div className="space-y-6">
        
        {/* Banner de Autonomía Local */}
        {!isOnline && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs">
            <div className="flex items-center space-x-2.5">
              <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                <strong>Modo Autónomo Local:</strong> Sin internet. Validando directamente en <code className="font-mono bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">{sucursalId === 1 ? 'centro.db' : 'norte.db'}</code>.
              </span>
            </div>
            {pendientes > 0 && (
              <span className="font-bold px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-800 dark:text-amber-200">
                {pendientes} en cola
              </span>
            )}
          </div>
        )}

        {/* ZONA SUPERIOR: ALTURA FIJA EXACTA (410px) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Lado Izquierdo: Terminal & Botones de Entrada */}
          <div className="lg:col-span-7 app-card rounded-2xl p-6 flex flex-col justify-between h-[410px]">
            
            {/* Cabecera de la Terminal */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center space-x-2">
                <Scan className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                  Terminal de Credencial & Socio
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-600/10 px-2.5 py-0.5 rounded-full border border-blue-600/20">
                Fragmento Local: {rango[0]} – {rango[1]}
              </span>
            </div>

            {/* Formulario de Entrada Manual / Lector */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                procesarPase();
              }}
              className="flex items-center gap-3 my-1"
            >
              <div className="relative flex-1">
                <input
                  type="number"
                  value={tarjetaId}
                  onChange={(e) => setTarjetaId(e.target.value)}
                  placeholder={`Digitar ID de socio (${rango[0]}-${rango[1]})...`}
                  className="w-full pl-12 pr-10 py-3 bg-[var(--bg-surface-inner)] border border-[var(--border-color)] rounded-xl font-mono text-base font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
                <CreditCard className="w-5 h-5 text-[var(--text-muted)] absolute left-4 top-3.5 pointer-events-none" />
                {tarjetaId && (
                  <button
                    type="button"
                    onClick={() => setTarjetaId('')}
                    className="absolute right-3.5 top-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={cargando || !tarjetaId}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed select-none shadow-sm flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>{cargando ? 'Validando' : 'Pasar'}</span>
              </button>
            </form>

            {/* Cuadrícula de Simulación Rápida (4 Escenarios Clave) */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                  Simulaciones de Prueba (Reglas BDD)
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  Clic para disparar evento
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Socio Activo */}
                <button
                  type="button"
                  onClick={() => procesarPase(sucursalId === 1 ? 1 : 101)}
                  className="p-3.5 rounded-xl app-inner hover:border-emerald-500/60 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Socio Activo
                    </span>
                    <span className="text-sm font-mono font-black text-[var(--text-primary)]">
                      #{sucursalId === 1 ? 1 : 101}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-600 transition-colors truncate">
                      {sucursalId === 1 ? 'Carlos Mendoza' : 'Diego Salinas'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                      Plan Mensual • Cobro $0.00
                    </div>
                  </div>
                </button>

                {/* 2. Pase Diario */}
                <button
                  type="button"
                  onClick={() => procesarPase(sucursalId === 1 ? 4 : 104)}
                  className="p-3.5 rounded-xl app-inner hover:border-blue-500/60 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Pase Diario
                    </span>
                    <span className="text-sm font-mono font-black text-[var(--text-primary)]">
                      #{sucursalId === 1 ? 4 : 104}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-600 transition-colors truncate">
                      {sucursalId === 1 ? 'Valeria Herrera' : 'Renata Delgado'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                      Tarifa en Puerta • Cobro $60.00
                    </div>
                  </div>
                </button>

                {/* 3. Vencido */}
                <button
                  type="button"
                  onClick={() => procesarPase(sucursalId === 1 ? 5 : 105)}
                  className="p-3.5 rounded-xl app-inner hover:border-rose-500/60 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      Membresía Vencida
                    </span>
                    <span className="text-sm font-mono font-black text-[var(--text-primary)]">
                      #{sucursalId === 1 ? 5 : 105}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-rose-600 transition-colors truncate">
                      {sucursalId === 1 ? 'Fernando Castro' : 'Emiliano Soto'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                      Expirado • Denegar Acceso
                    </div>
                  </div>
                </button>

                {/* 4. Test de Fragmentación */}
                <button
                  type="button"
                  onClick={() => procesarPase(sucursalId === 1 ? 105 : 12)}
                  className="p-3.5 rounded-xl app-inner hover:border-amber-500/60 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Test Fragmentación
                    </span>
                    <span className="text-sm font-mono font-black text-[var(--text-primary)]">
                      #{sucursalId === 1 ? 105 : 12}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-600 transition-colors truncate">
                      Socio de {sucursalId === 1 ? 'Sucursal Norte' : 'Sucursal Centro'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                      Regla Disjunta • Nodo Ajeno
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Pantalla de Torniquete (REDISEÑADA PARA ESTADO DE ESPERA Y RESULTADO) */}
          <div className="lg:col-span-5 h-[410px] app-card rounded-2xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden transition-colors border">
            
            {ultimoResultado ? (
              <div className="w-full h-full flex flex-col justify-between items-center">
                
                {/* Cabecera Superior del Torniquete */}
                <div className="w-full flex items-center justify-between border-b pb-2.5 border-[var(--border-color)]">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-muted)]">
                      Control de Acceso
                    </span>
                    <button
                      type="button"
                      onClick={() => setUltimoResultado(null)}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      • Nueva Lectura
                    </button>
                  </div>
                  <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full text-white ${
                    ultimoResultado.autorizado ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    {ultimoResultado.autorizado ? 'Puerta Abierta' : 'Puerta Bloqueada'}
                  </span>
                </div>

                {/* Icono de Estado */}
                <div className="my-1">
                  {ultimoResultado.autorizado ? (
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
                      <XCircle className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Título y Mensaje de Diagnóstico Completo */}
                <div className="space-y-1.5 px-2">
                  <h3 className={`text-xl font-black tracking-tight ${
                    ultimoResultado.autorizado 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {ultimoResultado.autorizado ? 'ACCESO AUTORIZADO' : 'ACCESO DENEGADO'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium max-w-sm leading-relaxed">
                    {ultimoResultado.mensaje}
                  </p>
                </div>

                {/* Tarjeta de Detalles Inteligente (Contextual según el motivo) */}
                <div className="w-full app-inner rounded-xl p-3.5 text-left text-xs border border-[var(--border-color)]">
                  {ultimoResultado.codigo === 'ERROR_FRAGMENTACION' ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b pb-1 border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">Motivo:</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-bold">Fragmentación Horizontal</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1 border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">ID Consultado:</span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">#{ultimoResultado.idConsultado || 105}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1 border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">Rango de este Nodo:</span>
                        <span className="font-mono text-[var(--text-secondary)]">{ultimoResultado.rangoEsperado}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Nodo Asignado:</span>
                        <span className="font-bold text-blue-600">{ultimoResultado.sucursalEsperada}</span>
                      </div>
                    </div>
                  ) : ultimoResultado.codigo === 'MEMBRESIA_VENCIDA' ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b pb-1 border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">Socio:</span>
                        <strong className="text-[var(--text-primary)] font-bold">{ultimoResultado.cliente?.nombreCompleto}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1 border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">Estatus Plan:</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">Expirado</span>
                      </div>
                      <div className="flex justify-between border-b pb-1 border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">Fecha Vencimiento:</span>
                        <span className="font-mono text-[var(--text-secondary)]">{ultimoResultado.cliente?.vigencia}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Cobro:</span>
                        <span className="font-bold text-[var(--text-muted)]">No aplicado</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b pb-1 border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">Socio:</span>
                        <strong className="text-[var(--text-primary)] font-bold">{ultimoResultado.cliente?.nombreCompleto}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1 border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">Membresía:</span>
                        <span className="font-semibold text-blue-600">{ultimoResultado.cliente?.membresia}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1 border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)]">Vigencia:</span>
                        <span className="font-mono text-[var(--text-secondary)]">{ultimoResultado.cliente?.vigencia}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Importe Cobrado:</span>
                        <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {ultimoResultado.acceso?.monto > 0 ? `$${ultimoResultado.acceso.monto.toFixed(2)} MXN` : '$0.00 (Incluido)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* ESTADO DE ESPERA REDISEÑADO: ESTILO QUIOSCO DE ACCESO DE GIMNASIO */
              <div className="w-full h-full flex flex-col justify-between items-center py-1">
                
                {/* Cabecera del Quiosco */}
                <div className="w-full flex items-center justify-between border-b pb-2.5 border-[var(--border-color)]">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-muted)]">
                    Sensor de Entrada
                  </span>
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Listo para Lectura</span>
                  </div>
                </div>

                {/* Zona de Diana / Contactless RFID */}
                <div className="my-auto flex flex-col items-center space-y-3">
                  <div className="relative flex items-center justify-center">
                    {/* Anillo de detección exterior */}
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-500/30 flex items-center justify-center animate-[spin_20s_linear_infinite]" />
                    {/* Silueta de tarjeta contactless central */}
                    <div className="absolute w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-600/30 flex flex-col items-center justify-center text-blue-600">
                      <Scan className="w-7 h-7" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-black tracking-tight text-[var(--text-primary)]">
                      Acerque su Tarjeta
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
                      Presente su tarjeta física frente al sensor o seleccione un socio de prueba en el panel izquierdo.
                    </p>
                  </div>
                </div>

                {/* Barra de Telemetría Inferior */}
                <div className="w-full app-inner rounded-xl px-4 py-2.5 flex items-center justify-between text-[11px] font-mono border border-[var(--border-color)] text-[var(--text-muted)]">
                  <div className="flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lector RFID 13.56 MHz</span>
                  </div>
                  <div className="text-[var(--text-secondary)] font-semibold">
                    Latencia local: &lt; 2ms
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* ZONA INFERIOR: HISTORIAL DE ACCESOS CON BÚSQUEDA, FILTROS Y ELEVACIÓN */}
        <div className="app-card rounded-2xl p-6 space-y-4 border border-[var(--border-color)]">
          {/* Cabecera del Historial */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[var(--border-color)]">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Historial de Entradas Locales
              </span>
              
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600/10 text-blue-600 font-bold border border-blue-600/20">
                  {accesosFiltrados.length} {accesosFiltrados.length === 1 ? 'registro' : 'registros'}
                </span>
                {totalRecaudadoFiltrado > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-600 font-bold border border-emerald-600/20">
                    +${totalRecaudadoFiltrado.toFixed(2)} MXN
                  </span>
                )}
                {totalPendientesCola > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-600/10 text-amber-600 font-bold border border-amber-600/20 animate-pulse">
                    {totalPendientesCola} en cola
                  </span>
                )}
              </div>
            </div>

            {/* Botones de acción derecha (Refrescar y Elevar Historial) */}
            <div className="flex items-center space-x-2.5 self-end md:self-auto">
              <button
                onClick={cargarAccesos}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-2 px-3 rounded-xl hover:bg-[var(--bg-main)] border border-transparent hover:border-[var(--border-color)] cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Actualizar registros locales"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline font-sans">Actualizar</span>
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                title="Elevar historial al centro de la pantalla con blur de fondo"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Expandir Historial</span>
              </button>
            </div>
          </div>

          {/* Barra de Herramientas: Búsqueda y Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Input de Búsqueda */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={busquedaHistorial}
                onChange={(e) => setBusquedaHistorial(e.target.value)}
                placeholder="Buscar por socio, ID (#1), concepto..."
                className="w-full pl-10 pr-8 py-2.5 bg-[var(--bg-surface-inner)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors font-medium"
              />
              {busquedaHistorial && (
                <button
                  onClick={() => setBusquedaHistorial('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtro por Tipo de Cobro */}
            <div className="sm:col-span-3 flex bg-[var(--bg-surface-inner)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
              <button
                onClick={() => setFiltroTipo('todos')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  filtroTipo === 'todos' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroTipo('membresia')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  filtroTipo === 'membresia' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Solo pases de membresía ($0)"
              >
                Membresía
              </button>
              <button
                onClick={() => setFiltroTipo('cobro')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  filtroTipo === 'cobro' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Solo pases con cobro ($60)"
              >
                Cobrados
              </button>
            </div>

            {/* Filtro por Estado de Sincronización */}
            <div className="sm:col-span-3 flex bg-[var(--bg-surface-inner)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
              <button
                onClick={() => setFiltroSync('todos')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  filtroSync === 'todos' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Sync: Todo
              </button>
              <button
                onClick={() => setFiltroSync('sincronizado')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  filtroSync === 'sincronizado' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Nube OK
              </button>
              <button
                onClick={() => setFiltroSync('cola')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  filtroSync === 'cola' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Cola Local
              </button>
            </div>
          </div>

          {/* Tabla de Resultados (Inline) */}
          <div className="overflow-y-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-inner)] h-[250px]">
            <table className="w-full text-left text-sm table-fixed">
              <thead className="bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)] sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 font-bold w-20">ID</th>
                  <th className="py-3 px-4 font-bold w-1/3">Nombre del Socio</th>
                  <th className="py-3 px-4 font-bold w-28">Hora</th>
                  <th className="py-3 px-4 font-bold w-36">Concepto</th>
                  <th className="py-3 px-4 font-bold w-28">Cobro</th>
                  <th className="py-3 px-4 font-bold text-right w-36">Estatus Nube</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] font-mono">
                {accesosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-14 text-center text-[var(--text-muted)] font-sans text-sm">
                      {accesos.length === 0 ? (
                        'No hay accesos registrados hoy en esta base local.'
                      ) : (
                        <div className="space-y-1.5">
                          <p>No se encontraron accesos con los filtros actuales.</p>
                          <button
                            onClick={() => {
                              setBusquedaHistorial('');
                              setFiltroTipo('todos');
                              setFiltroSync('todos');
                            }}
                            className="text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            Limpiar filtros
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  accesosFiltrados.map((acc) => (
                    <tr key={acc.id_acceso} className="hover:bg-blue-600/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-blue-600 text-sm">#{acc.cliente_id}</td>
                      <td className="py-3 px-4 font-sans text-[var(--text-primary)] font-bold text-sm truncate">
                        {acc.nombre} {acc.apellidos}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-muted)] text-xs">
                        {acc.fecha_hora.split(' ')[1] || acc.fecha_hora}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-sans truncate text-xs font-medium">
                        {acc.tipo_cobro || 'Pase Regular'}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {acc.monto > 0 ? `+$${acc.monto.toFixed(2)}` : '$0.00'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {acc.sincronizado === 1 ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-sans font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Sincronizado
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-sans font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Cola Local
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pie de tabla con resumen */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[var(--text-muted)] pt-0.5 px-1">
            <span>
              Mostrando <strong>{accesosFiltrados.length}</strong> de <strong>{accesos.length}</strong> entradas en base local ({sucursalId === 1 ? 'centro.db' : 'norte.db'})
            </span>
            {(busquedaHistorial || filtroTipo !== 'todos' || filtroSync !== 'todos') && (
              <button
                onClick={() => {
                  setBusquedaHistorial('');
                  setFiltroTipo('todos');
                  setFiltroSync('todos');
                }}
                className="text-blue-600 hover:underline font-bold cursor-pointer"
              >
                Restablecer filtros
              </button>
            )}
          </div>
        </div>

        {/* MODAL ELEVADO EN MEDIO DE LA PANTALLA CON BLUR DE FONDO Y ANIMACIÓN */}
        {isExpanded && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/75 backdrop-blur-md animate-backdrop-in screen-modal-overlay"
            onClick={() => setIsExpanded(false)}
          >
            <div 
              className="w-full max-w-5xl h-[88vh] flex flex-col bg-[var(--bg-surface)] border-2 border-blue-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.75)] rounded-3xl overflow-hidden animate-elevate"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabecera del Modal Elevado */}
              <div className="p-5 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-surface-elevated)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] uppercase tracking-wide">
                        Historial de Entradas Locales
                      </h3>
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/20">
                        {nombre}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                      Base local autónoma <code className="font-mono font-bold bg-blue-600/10 text-blue-600 px-1.5 py-0.5 rounded">{sucursalId === 1 ? 'centro.db' : 'norte.db'}</code> • Fragmento de IDs {rango[0]} a {rango[1]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="hidden md:flex items-center gap-2 font-mono text-xs">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 font-bold border border-blue-600/20">
                      {accesosFiltrados.length} registros
                    </span>
                    {totalRecaudadoFiltrado > 0 && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600/10 text-emerald-600 font-bold border border-emerald-600/20">
                        +${totalRecaudadoFiltrado.toFixed(2)} MXN
                      </span>
                    )}
                  </div>

                  <button
                    onClick={cargarAccesos}
                    className="p-2.5 px-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-inner)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Actualizar registros locales"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Actualizar</span>
                  </button>

                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    title="Contraer vista y volver a la pantalla principal (Esc)"
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
                    value={busquedaHistorial}
                    onChange={(e) => setBusquedaHistorial(e.target.value)}
                    placeholder="Buscar por socio, ID (#1), concepto de cobro..."
                    className="w-full pl-10 pr-9 py-2.5 bg-[var(--bg-surface-inner)] border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                    autoFocus
                  />
                  {busquedaHistorial && (
                    <button
                      onClick={() => setBusquedaHistorial('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filtro por Tipo de Cobro */}
                <div className="sm:col-span-3 flex bg-[var(--bg-surface-inner)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
                  <button
                    onClick={() => setFiltroTipo('todos')}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                      filtroTipo === 'todos' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroTipo('membresia')}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                      filtroTipo === 'membresia' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Membresía
                  </button>
                  <button
                    onClick={() => setFiltroTipo('cobro')}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                      filtroTipo === 'cobro' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Cobrados
                  </button>
                </div>

                {/* Filtro por Sincronización */}
                <div className="sm:col-span-3 flex bg-[var(--bg-surface-inner)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
                  <button
                    onClick={() => setFiltroSync('todos')}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                      filtroSync === 'todos' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Sync: Todo
                  </button>
                  <button
                    onClick={() => setFiltroSync('sincronizado')}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                      filtroSync === 'sincronizado' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Nube OK
                  </button>
                  <button
                    onClick={() => setFiltroSync('cola')}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer ${
                      filtroSync === 'cola' ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Cola Local
                  </button>
                </div>
              </div>

              {/* Tabla de Registros en Modal (Spacious y Alta) */}
              <div className="flex-1 overflow-y-auto bg-[var(--bg-surface-inner)]">
                <table className="w-full text-left text-sm table-fixed">
                  <thead className="bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)] sticky top-0 z-10 shadow-xs">
                    <tr>
                      <th className="py-3.5 px-5 font-bold w-24">ID Socio</th>
                      <th className="py-3.5 px-5 font-bold w-2/5">Nombre del Socio</th>
                      <th className="py-3.5 px-5 font-bold w-32">Hora Entrada</th>
                      <th className="py-3.5 px-5 font-bold w-44">Concepto / Pase</th>
                      <th className="py-3.5 px-5 font-bold w-32">Tarifa Cobrada</th>
                      <th className="py-3.5 px-5 font-bold text-right w-40">Estado Nube</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] font-mono">
                    {accesosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-20 text-center text-[var(--text-muted)] font-sans text-sm">
                          {accesos.length === 0 ? (
                            'No hay accesos registrados hoy en esta base local.'
                          ) : (
                            <div className="space-y-2">
                              <p className="text-base font-semibold text-[var(--text-primary)]">
                                No se encontraron registros para los filtros seleccionados.
                              </p>
                              <button
                                onClick={() => {
                                  setBusquedaHistorial('');
                                  setFiltroTipo('todos');
                                  setFiltroSync('todos');
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
                      accesosFiltrados.map((acc) => (
                        <tr key={acc.id_acceso} className="hover:bg-blue-600/5 transition-colors">
                          <td className="py-4 px-5 font-bold text-blue-600 text-base">#{acc.cliente_id}</td>
                          <td className="py-4 px-5 font-sans font-bold text-base text-[var(--text-primary)] truncate">
                            {acc.nombre} {acc.apellidos}
                          </td>
                          <td className="py-4 px-5 text-[var(--text-muted)] text-sm">
                            {acc.fecha_hora.split(' ')[1] || acc.fecha_hora}
                          </td>
                          <td className="py-4 px-5 text-[var(--text-secondary)] font-sans truncate text-sm font-medium">
                            {acc.tipo_cobro || 'Pase Regular'}
                          </td>
                          <td className="py-4 px-5 font-black text-base text-emerald-600 dark:text-emerald-400">
                            {acc.monto > 0 ? `+$${acc.monto.toFixed(2)}` : '$0.00'}
                          </td>
                          <td className="py-4 px-5 text-right">
                            {acc.sincronizado === 1 ? (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-sans font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Sincronizado
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-sans font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                                Cola Local
                              </span>
                            )}
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
                    Mostrando <strong>{accesosFiltrados.length}</strong> de <strong>{accesos.length}</strong> entradas en base local ({sucursalId === 1 ? 'centro.db' : 'norte.db'})
                  </span>
                  <span className="text-[var(--text-muted)] opacity-50">•</span>
                  <span className="font-mono text-[var(--text-secondary)]">Presiona Esc para contraer</span>
                </div>
                {(busquedaHistorial || filtroTipo !== 'todos' || filtroSync !== 'todos') && (
                  <button
                    onClick={() => {
                      setBusquedaHistorial('');
                      setFiltroTipo('todos');
                      setFiltroSync('todos');
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
    </XpWindow>
  );
}
