import { io } from 'socket.io-client';

const API_BASE = '/api';

export const socket = io(window.location.origin, {
  reconnectionDelay: 1000,
  reconnection: true
});

export const api = {
  // Validar tarjeta en torniquete
  async validarAcceso(sucursalId, clienteId) {
    const res = await fetch(`${API_BASE}/torniquete/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sucursalId, clienteId })
    });
    return res.json();
  },

  // Obtener clientes de prueba de una sucursal
  async getClientes(sucursalId) {
    const res = await fetch(`${API_BASE}/torniquete/clientes/${sucursalId}`);
    return res.json();
  },

  // Obtener accesos de hoy en base local
  async getAccesosHoy(sucursalId) {
    const res = await fetch(`${API_BASE}/torniquete/accesos-hoy/${sucursalId}`);
    return res.json();
  },

  // Resumen ejecutivo global para el dueño
  async getResumenDueno() {
    const res = await fetch(`${API_BASE}/dueno/resumen-ingresos`);
    return res.json();
  },

  // Estado de los nodos y red
  async getEstadoNodos() {
    const res = await fetch(`${API_BASE}/red/estado-nodos`);
    return res.json();
  },

  // Conmutar conexión de red (Simular caída)
  async toggleConexion(sucursalId, status) {
    const res = await fetch(`${API_BASE}/red/toggle-conexion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sucursalId, status })
    });
    return res.json();
  },

  // Forzar sincronización de cola
  async sincronizarCola(sucursalId) {
    const res = await fetch(`${API_BASE}/red/sincronizar-cola`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sucursalId })
    });
    return res.json();
  }
};
