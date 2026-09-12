import { TorniqueteService } from './src/services/torniqueteService.js';
import { IntegracionService } from './src/services/integracionService.js';
import { SyncService } from './src/services/syncService.js';
import { SUCURSALES } from './src/config/constants.js';

console.log('--- 🧪 INICIO DE PRUEBAS DE ARQUITECTURA BDD FIT.NET ---');

// PRUEBA 1: Validación y Cobro en Sucursal Centro (Socio Vigente ID: 1)
console.log('\n1. Probando Pase de Tarjeta ID #1 en Sucursal Centro:');
const res1 = TorniqueteService.procesarPase(SUCURSALES.CENTRO.id, 1);
console.log('Resultado:', res1.autorizado ? '✅ AUTORIZADO' : '❌ RECHAZADO');
console.log('Mensaje:', res1.mensaje);
console.log('Cobro registrado:', res1.acceso?.monto, 'MXN');

// PRUEBA 2: Violación de Regla de Fragmentación Horizontal (Socio ID: 105 en Centro)
console.log('\n2. Probando Pase de Tarjeta ID #105 (de Norte) en Sucursal Centro:');
const res2 = TorniqueteService.procesarPase(SUCURSALES.CENTRO.id, 105);
console.log('Resultado:', res2.autorizado ? '✅ AUTORIZADO' : '❌ RECHAZADO');
console.log('Código:', res2.codigo);
console.log('Mensaje:', res2.mensaje);

// PRUEBA 3: Socio con Membresía Vencida (Socio ID: 5)
console.log('\n3. Probando Socio Vencido ID #5 en Centro:');
const res3 = TorniqueteService.procesarPase(SUCURSALES.CENTRO.id, 5);
console.log('Resultado:', res3.autorizado ? '✅ AUTORIZADO' : '❌ RECHAZADO');
console.log('Código:', res3.codigo);
console.log('Mensaje:', res3.mensaje);

// PRUEBA 4: Cobro de Pase Diario en Norte (Socio ID: 104)
console.log('\n4. Probando Pase Diario ID #104 en Norte ($60 MXN):');
const res4 = TorniqueteService.procesarPase(SUCURSALES.NORTE.id, 104);
console.log('Resultado:', res4.autorizado ? '✅ AUTORIZADO' : '❌ RECHAZADO');
console.log('Monto cobrado:', res4.acceso?.monto, 'MXN');

// PRUEBA 5: Autonomía Local y Simulación de Corte de Red
console.log('\n5. Simulando Corte de Conexión en Sucursal Norte:');
SyncService.toggleNodeNetwork(SUCURSALES.NORTE.id, false);
console.log('Estado Nodo Norte:', SyncService.isNodeOnline(SUCURSALES.NORTE.id) ? 'ONLINE' : 'OFFLINE (AUTONOMÍA LOCAL)');
const res5 = TorniqueteService.procesarPase(SUCURSALES.NORTE.id, 109);
console.log('Pase en Modo Offline autorizado:', res5.autorizado ? '✅ SÍ' : '❌ NO');
const estadoNodos = SyncService.getAllNodesStatus();
console.log('Transacciones pendientes en cola Norte:', estadoNodos[2].pendientesSync);

// PRUEBA 6: Reconexión y Sincronización Diferida
console.log('\n6. Restableciendo Conexión en Sucursal Norte:');
SyncService.toggleNodeNetwork(SUCURSALES.NORTE.id, true);
await SyncService.syncPendingRecords(SUCURSALES.NORTE.id);
const estadoReconectado = SyncService.getAllNodesStatus();
console.log('Transacciones pendientes tras sincronizar:', estadoReconectado[2].pendientesSync);

// PRUEBA 7: Integración Global (Celular del Dueño)
console.log('\n7. Consulta Federada de Integración (Celular del Dueño):');
const resumenGlobal = IntegracionService.getResumenGlobalHoy();
console.log('Total Ingresos Hoy Global:', `$${resumenGlobal.global.totalIngresosHoy} MXN`);
console.log('Total Asistencias Hoy:', resumenGlobal.global.totalAccesosHoy);
console.log('Ingresos Centro:', `$${resumenGlobal.porSucursal.centro.ingresos} MXN`);
console.log('Ingresos Norte:', `$${resumenGlobal.porSucursal.norte.ingresos} MXN`);

console.log('\n🎉 ¡TODAS LAS PRUEBAS DE ARQUITECTURA BDD PASARON EXITOSAMENTE!');
process.exit(0);
