import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Database, 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  Server,
  Layers
} from 'lucide-react';
import XpWindow from '../xp/XpWindow';
import StatusBadge from '../xp/StatusBadge';
import { api, socket } from '../../services/api';
import { sounds } from '../../utils/soundManager';

export default function BddTopologyMonitor({ theme }) {
  const [nodesStatus, setNodesStatus] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    cargarEstado();

    const handleEstado = (nuevoEstado) => {
      setNodesStatus(nuevoEstado);
    };

    socket.on('estado_red_actualizado', handleEstado);
    return () => {
      socket.off('estado_red_actualizado', handleEstado);
    };
  }, []);

  const cargarEstado = async () => {
    try {
      const data = await api.getEstadoNodos();
      setNodesStatus(data);
    } catch (err) {
      console.error('Error cargando estado de nodos:', err);
    }
  };

  const toggleRed = async (sucursalId, estadoActual) => {
    sounds.playClick();
    try {
      await api.toggleConexion(sucursalId, !estadoActual);
      cargarEstado();
    } catch (err) {
      console.error('Error conmutando red:', err);
    }
  };

  const forzarSync = async (sucursalId) => {
    setSincronizando(true);
    sounds.playHardwareScan();
    try {
      await api.sincronizarCola(sucursalId);
      sounds.playDing();
      cargarEstado();
    } catch (err) {
      sounds.playChord();
    } finally {
      setSincronizando(false);
    }
  };

  const centro = nodesStatus?.[1] || { isOnline: true, pendientesSync: 0 };
  const norte = nodesStatus?.[2] || { isOnline: true, pendientesSync: 0 };

  return (
    <XpWindow
      title="Topología de Red • Nodos Distribuidos & Sincronización"
      icon={<Network className="w-4 h-4" />}
      className="w-full"
    >
      <div className="space-y-6">
        
        {/* Descripción de Arquitectura */}
        <div className="app-card rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Simulador de Autonomía Local y Enlace Central
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              Permite simular la pérdida de conexión en cualquiera de las sucursales para verificar que las terminales continúan validando accesos de forma autónoma. Al reconectar, las transacciones pendientes se sincronizan a la base central.
            </p>
          </div>
        </div>

        {/* Los 3 Nodos en Tarjetas Profesionales (Sin iconos genéricos de IA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Nodo 1: Centro */}
          <div className="app-card rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3 border-[var(--border-color)]">
                <div>
                  <h5 className="font-bold text-sm text-[var(--text-primary)]">Nodo Sucursal Centro</h5>
                  <span className="text-[11px] text-[var(--text-muted)]">Servidor Local Autónomo</span>
                </div>
                <StatusBadge status={centro.isOnline ? 'online' : 'offline'} label={centro.isOnline ? 'En línea' : 'Desconectado'} />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Base de datos:</span>
                  <span className="font-bold text-[var(--text-primary)]">centro.db</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Partición:</span>
                  <span className="font-bold text-blue-600">IDs [1 - 100]</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Almacenamiento:</span>
                  <span className="text-[var(--text-primary)]">SQLite Local</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Transacciones en cola:</span>
                  <span className={`font-bold ${centro.pendientesSync > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {centro.pendientesSync}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => toggleRed(1, centro.isOnline)}
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-colors cursor-pointer text-white ${
                  centro.isOnline 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {centro.isOnline ? 'Desconectar Red (Modo Offline)' : 'Restablecer Conexión'}
              </button>

              {centro.pendientesSync > 0 && centro.isOnline && (
                <button
                  disabled={sincronizando}
                  onClick={() => forzarSync(1)}
                  className="w-full py-2 px-4 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sincronizar {centro.pendientesSync} registros pendientes</span>
                </button>
              )}
            </div>
          </div>

          {/* Nodo Central: Integración / Supabase */}
          <div className="app-card rounded-xl p-6 flex flex-col justify-between space-y-5 bg-blue-600/5 border-blue-600/20">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3 border-[var(--border-color)]">
                <div>
                  <h5 className="font-bold text-sm text-[var(--text-primary)]">Nodo Central (Nube)</h5>
                  <span className="text-[11px] text-[var(--text-muted)]">Integración & Vista Global</span>
                </div>
                <StatusBadge 
                  status={nodesStatus?.central?.supabaseConectado ? 'online' : 'syncing'} 
                  label={nodesStatus?.central?.supabaseConectado ? 'Supabase Conectado' : 'Espejo Local'} 
                />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Destino Central:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[170px]" title={nodesStatus?.central?.supabaseUrl || 'Supabase Cloud'}>
                    {nodesStatus?.central?.supabaseConectado ? (nodesStatus?.central?.supabaseUrl || 'Supabase Cloud') : 'Espejo Local'}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Tabla consolidada:</span>
                  <span className="font-bold text-blue-600">accesos_global</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Transmisión en vivo:</span>
                  <span className="text-[var(--text-primary)]">WebSockets (4000)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Esquema Integración:</span>
                  <span className="font-bold text-emerald-500">Unión Disjunta</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-2">
              Recibe las sincronizaciones de ambas sucursales y replica en vivo a PostgreSQL en Supabase.
            </p>
          </div>

          {/* Nodo 2: Norte */}
          <div className="app-card rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3 border-[var(--border-color)]">
                <div>
                  <h5 className="font-bold text-sm text-[var(--text-primary)]">Nodo Sucursal Norte</h5>
                  <span className="text-[11px] text-[var(--text-muted)]">Servidor Local Autónomo</span>
                </div>
                <StatusBadge status={norte.isOnline ? 'online' : 'offline'} label={norte.isOnline ? 'En línea' : 'Desconectado'} />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Base de datos:</span>
                  <span className="font-bold text-[var(--text-primary)]">norte.db</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Partición:</span>
                  <span className="font-bold text-emerald-600">IDs [101 - 200]</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Almacenamiento:</span>
                  <span className="text-[var(--text-primary)]">SQLite Local</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Transacciones en cola:</span>
                  <span className={`font-bold ${norte.pendientesSync > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {norte.pendientesSync}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => toggleRed(2, norte.isOnline)}
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-colors cursor-pointer text-white ${
                  norte.isOnline 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {norte.isOnline ? 'Desconectar Red (Modo Offline)' : 'Restablecer Conexión'}
              </button>

              {norte.pendientesSync > 0 && norte.isOnline && (
                <button
                  disabled={sincronizando}
                  onClick={() => forzarSync(2)}
                  className="w-full py-2 px-4 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sincronizar {norte.pendientesSync} registros pendientes</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Álgebra Relacional Formal */}
        <div className="app-card rounded-xl p-6 space-y-4 text-xs">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
            Formalización de Álgebra Relacional (Reglas de Fragmentación)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="app-inner p-4 rounded-lg space-y-2">
              <span className="font-bold text-blue-600 block text-sm">1. Fragmentación Horizontal Primaria:</span>
              <p className="text-[var(--text-secondary)]">
                F_Centro = σ_(1 ≤ id ≤ 100) (Clientes)<br />
                F_Norte = σ_(101 ≤ id ≤ 200) (Clientes)
              </p>
              <p className="text-[var(--text-muted)] font-sans text-xs">
                <strong>Disyunción:</strong> F_Centro ∩ F_Norte = ∅ (Particiones mutuamente excluyentes).
              </p>
            </div>

            <div className="app-inner p-4 rounded-lg space-y-2">
              <span className="font-bold text-emerald-600 block text-sm">2. Reconstrucción e Integración:</span>
              <p className="text-[var(--text-secondary)]">
                Clientes_Global = F_Centro ∪ F_Norte<br />
                Ingresos_Hoy = SUM(Accesos_Centro.monto) + SUM(Accesos_Norte.monto)
              </p>
              <p className="text-[var(--text-muted)] font-sans text-xs">
                <strong>Transparencia:</strong> La consulta ejecutiva consolida la suma sin conocer los límites físicos de los nodos.
              </p>
            </div>
          </div>
        </div>

      </div>
    </XpWindow>
  );
}
