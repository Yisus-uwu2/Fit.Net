import { SUCURSALES, TARIFAS, CONFIG } from '../config/constants.js';
import { ClienteRepository } from '../repositories/clienteRepository.js';
import { AccesoRepository } from '../repositories/accesoRepository.js';
import { SyncService } from './syncService.js';

// Cache para Anti-repass (cooldown por tarjeta)
const recentScans = new Map();

export class TorniqueteService {
  static procesarPase(sucursalId, rawClienteId) {
    const sId = Number(sucursalId);
    const clienteId = parseInt(rawClienteId, 10);

    // 1. Validación de Entrada (Seguridad y Sanitización)
    if (isNaN(clienteId) || clienteId <= 0) {
      return {
        autorizado: false,
        codigo: 'ERROR_FORMATO',
        mensaje: 'Identificador de tarjeta no válido.',
        cliente: null
      };
    }

    const configSucursal = sId === SUCURSALES.CENTRO.id ? SUCURSALES.CENTRO : SUCURSALES.NORTE;

    // 2. Validación de Regla de Fragmentación Horizontal
    if (clienteId < configSucursal.rangoMin || clienteId > configSucursal.rangoMax) {
      const otraSucursal = sId === SUCURSALES.CENTRO.id ? SUCURSALES.NORTE : SUCURSALES.CENTRO;
      return {
        autorizado: false,
        codigo: 'ERROR_FRAGMENTACION',
        mensaje: `El ID #${clienteId} no pertenece al fragmento de ${configSucursal.nombre} [${configSucursal.rangoMin}-${configSucursal.rangoMax}]. Reside en ${otraSucursal.nombre} [${otraSucursal.rangoMin}-${otraSucursal.rangoMax}].`,
        cliente: null,
        rangoEsperado: `[${configSucursal.rangoMin} - ${configSucursal.rangoMax}]`,
        sucursalEsperada: otraSucursal.nombre,
        idConsultado: clienteId
      };
    }

    // 3. Protección Anti-Repass (Rate Limiting de escaneo)
    const scanKey = `${sId}_${clienteId}`;
    const now = Date.now();
    const lastScan = recentScans.get(scanKey);
    if (lastScan && (now - lastScan) < CONFIG.ANTI_REPASS_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((CONFIG.ANTI_REPASS_COOLDOWN_MS - (now - lastScan)) / 1000);
      return {
        autorizado: false,
        codigo: 'ANTI_REPASS',
        mensaje: `Lectura reciente detectada. Espere ${remainingSeconds} segundos antes de volver a pasar.`,
        cliente: null
      };
    }
    recentScans.set(scanKey, now);

    // 4. Consulta a la Base Local (Autonomía Local)
    const cliente = ClienteRepository.getById(sId, clienteId);
    if (!cliente) {
      return {
        autorizado: false,
        codigo: 'CLIENTE_NO_ENCONTRADO',
        mensaje: `El socio #${clienteId} no se encuentra registrado en la base local.`,
        cliente: null
      };
    }

    // 5. Validación de Vigencia y Estatus (Comparación segura de fecha sin desfase UTC)
    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const isVencido = cliente.vigencia < hoyStr || cliente.activo === 0;
    if (isVencido) {
      return {
        autorizado: false,
        codigo: 'MEMBRESIA_VENCIDA',
        mensaje: `Membresía vencida desde el ${cliente.vigencia}. Acuda a recepción para renovar.`,
        cliente: {
          id: cliente.id,
          nombreCompleto: `${cliente.nombre} ${cliente.apellidos}`,
          membresia: cliente.membresia,
          vigencia: cliente.vigencia,
          activo: false
        }
      };
    }

    // 6. Cálculo de Cobro Instantáneo según Plan
    let montoCobrado = 0.0;
    let tipoCobro = 'Pase Regular';

    if (cliente.membresia === 'Pase Diario') {
      montoCobrado = TARIFAS.PASE_DIARIO;
      tipoCobro = 'Cobro Pase Diario';
    } else {
      montoCobrado = 0.0;
      tipoCobro = `Pase ${cliente.membresia}`;
    }

    // 7. Registro Atómico en la Base de Datos Local
    const isOnline = SyncService.isNodeOnline(sId);
    const nuevoAcceso = AccesoRepository.registrarAccesoLocal(
      sId,
      cliente.id,
      montoCobrado,
      tipoCobro,
      0
    );

    // 8. Si el nodo está ONLINE, sincronizar en segundo plano
    if (isOnline) {
      SyncService.syncPendingRecords(sId).catch(err => {
        console.error('Error en sync asíncrono:', err.message);
      });
    }

    return {
      autorizado: true,
      codigo: 'ACCESO_PERMITIDO',
      mensaje: `Acceso autorizado. Bienvenido a ${configSucursal.nombre}, ${cliente.nombre}.`,
      acceso: {
        idAcceso: nuevoAcceso.id_acceso,
        fechaHora: nuevoAcceso.fecha_hora,
        monto: montoCobrado,
        tipoCobro: tipoCobro,
        sincronizado: isOnline
      },
      cliente: {
        id: cliente.id,
        nombreCompleto: `${cliente.nombre} ${cliente.apellidos}`,
        membresia: cliente.membresia,
        vigencia: cliente.vigencia,
        activo: true
      },
      sucursal: {
        id: configSucursal.id,
        nombre: configSucursal.nombre,
        modoOperacion: isOnline ? 'ONLINE' : 'AUTONOMÍA LOCAL'
      }
    };
  }
}
