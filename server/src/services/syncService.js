import { supabase } from '../database/dbConnection.js';
import { AccesoRepository } from '../repositories/accesoRepository.js';
import { SUCURSALES } from '../config/constants.js';

// Estado simulado de conectividad de red de cada nodo sucursal
const nodeNetworkStatus = {
  [SUCURSALES.CENTRO.id]: true, // true = ONLINE, false = OFFLINE (Corte de red)
  [SUCURSALES.NORTE.id]: true
};

export class SyncService {
  static isNodeOnline(sucursalId) {
    return nodeNetworkStatus[Number(sucursalId)] ?? true;
  }

  static toggleNodeNetwork(sucursalId, status) {
    const sId = Number(sucursalId);
    nodeNetworkStatus[sId] = typeof status === 'boolean' ? status : !nodeNetworkStatus[sId];
    
    // Si vuelve a estar online, disparar sincronización de pendientes de inmediato
    if (nodeNetworkStatus[sId]) {
      this.syncPendingRecords(sId);
    }
    
    return {
      sucursalId: sId,
      isOnline: nodeNetworkStatus[sId]
    };
  }

  static getAllNodesStatus() {
    const pendientesCentro = AccesoRepository.getPendientesSincronizacion(SUCURSALES.CENTRO.id).length;
    const pendientesNorte = AccesoRepository.getPendientesSincronizacion(SUCURSALES.NORTE.id).length;

    return {
      [SUCURSALES.CENTRO.id]: {
        codigo: SUCURSALES.CENTRO.codigo,
        nombre: SUCURSALES.CENTRO.nombre,
        isOnline: nodeNetworkStatus[SUCURSALES.CENTRO.id],
        pendientesSync: pendientesCentro
      },
      [SUCURSALES.NORTE.id]: {
        codigo: SUCURSALES.NORTE.codigo,
        nombre: SUCURSALES.NORTE.nombre,
        isOnline: nodeNetworkStatus[SUCURSALES.NORTE.id],
        pendientesSync: pendientesNorte
      },
      central: {
        nombre: 'Base Central (Supabase Cloud)',
        status: 'ONLINE',
        supabaseConectado: !!supabase,
        supabaseUrl: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/^https?:\/\//, '') : null
      }
    };
  }

  // Sincroniza registros pendientes a la base central y a Supabase
  static async syncPendingRecords(sucursalId) {
    const sId = Number(sucursalId);
    if (!this.isNodeOnline(sId)) {
      return { syncedCount: 0, reason: 'Nodo offline' };
    }

    const pendientes = AccesoRepository.getPendientesSincronizacion(sId);
    if (pendientes.length === 0) return { syncedCount: 0 };

    let syncedCount = 0;

    for (const item of pendientes) {
      try {
        // 1. Guardar en Base Central espejo local
        AccesoRepository.registrarEnCentralGlobal(
          sId,
          item.id_acceso,
          item.cliente_id,
          item.cliente_nombre,
          item.fecha_hora,
          item.monto,
          item.tipo_cobro
        );

        // 2. Si Supabase está configurado, replicar también a Supabase
        if (supabase) {
          await supabase.from('accesos_global').upsert({
            sucursal_id: sId,
            id_acceso_local: item.id_acceso,
            cliente_id: item.cliente_id,
            cliente_nombre: item.cliente_nombre,
            fecha_hora: item.fecha_hora,
            monto: item.monto,
            tipo_cobro: item.tipo_cobro
          }, { onConflict: 'sucursal_id,id_acceso_local' });
        }

        // 3. Marcar como sincronizado en la base local del nodo
        AccesoRepository.marcarComoSincronizado(sId, item.id_acceso);
        syncedCount++;
      } catch (err) {
        console.error(`Error sincronizando acceso #${item.id_acceso} de sucursal ${sId}:`, err.message);
        break; // Detener en caso de fallo de red
      }
    }

    console.log(`🔄 Sincronizados ${syncedCount} registros de la Sucursal ${sId}`);
    return { syncedCount };
  }
}
