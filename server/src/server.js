import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import { CONFIG } from './config/constants.js';
import { initDatabases } from './database/dbConnection.js';
import { TorniqueteService } from './services/torniqueteService.js';
import { IntegracionService } from './services/integracionService.js';
import { SyncService } from './services/syncService.js';
import { ClienteRepository } from './repositories/clienteRepository.js';
import { AccesoRepository } from './repositories/accesoRepository.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// WebSocket Server para sincronización y vista del dueño en tiempo real
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Inicializar esquemas de bases de datos locales y central
initDatabases();

// --- RUTAS DE LA API ---

// 1. Validar tarjeta y registrar cobro en torniquete (Autonomía Local)
app.post('/api/torniquete/validar', (req, res) => {
  const { sucursalId, clienteId } = req.body;
  if (!sucursalId || !clienteId) {
    return res.status(400).json({ error: 'sucursalId y clienteId son obligatorios.' });
  }

  const resultado = TorniqueteService.procesarPase(sucursalId, clienteId);

  // Emitir evento WebSocket en tiempo real si el acceso fue autorizado
  if (resultado.autorizado) {
    io.emit('acceso_registrado', {
      sucursalId: Number(sucursalId),
      acceso: resultado.acceso,
      cliente: resultado.cliente
    });

    // Actualizar métricas globales para el celular del dueño
    const resumenActualizado = IntegracionService.getResumenGlobalHoy();
    io.emit('ingresos_actualizados', resumenActualizado);
  }

  // Notificar cambio de estado de cola o red
  io.emit('estado_red_actualizado', SyncService.getAllNodesStatus());

  return res.json(resultado);
});

// 2. Obtener lista de clientes de una sucursal (para selectores de prueba rápida)
app.get('/api/torniquete/clientes/:sucursalId', (req, res) => {
  try {
    const clientes = ClienteRepository.getAll(req.params.sucursalId);
    res.json(clientes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Obtener accesos de hoy en base local de la sucursal
app.get('/api/torniquete/accesos-hoy/:sucursalId', (req, res) => {
  try {
    const accesos = AccesoRepository.getAccesosHoyLocal(req.params.sucursalId);
    res.json(accesos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function getLocalIp() {
  const ifaces = os.networkInterfaces();
  let candidate = null;
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wlan') || iface.address.startsWith('192.168.1.')) {
          return iface.address;
        }
        if (!candidate && !name.toLowerCase().includes('veth') && !name.toLowerCase().includes('wsl')) {
          candidate = iface.address;
        }
      }
    }
  }
  return candidate || 'localhost';
}

// 4. Vista de Integración Global (Celular del Dueño)
app.get('/api/dueno/resumen-ingresos', (req, res) => {
  try {
    const resumen = IntegracionService.getResumenGlobalHoy();
    res.json({
      ...resumen,
      networkIp: getLocalIp()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Estado de Nodos y Red BDD
app.get('/api/red/estado-nodos', (req, res) => {
  res.json(SyncService.getAllNodesStatus());
});

// 6. Conmutar Estado de Red (Simulador de Corte de Internet / Autonomía Local)
app.post('/api/red/toggle-conexion', async (req, res) => {
  const { sucursalId, status } = req.body;
  const nuevoEstado = SyncService.toggleNodeNetwork(sucursalId, status);

  // Si se reconectó, sincronizar y emitir actualización de ingresos consolidados
  if (nuevoEstado.isOnline) {
    await SyncService.syncPendingRecords(sucursalId);
  }

  const nodesStatus = SyncService.getAllNodesStatus();
  io.emit('estado_red_actualizado', nodesStatus);
  
  const resumen = IntegracionService.getResumenGlobalHoy();
  io.emit('ingresos_actualizados', resumen);

  res.json({ success: true, estado: nuevoEstado, nodesStatus });
});

// 7. Forzar Sincronización Manual de Cola
app.post('/api/red/sincronizar-cola', async (req, res) => {
  const { sucursalId } = req.body;
  const resultado = await SyncService.syncPendingRecords(sucursalId);
  
  io.emit('estado_red_actualizado', SyncService.getAllNodesStatus());
  io.emit('ingresos_actualizados', IntegracionService.getResumenGlobalHoy());

  res.json(resultado);
});

// WebSockets Connection
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado al WebSocket: ${socket.id}`);
  
  // Enviar estado inicial inmediato al cliente
  socket.emit('estado_red_actualizado', SyncService.getAllNodesStatus());
  socket.emit('ingresos_actualizados', IntegracionService.getResumenGlobalHoy());

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// Iniciar Servidor
const PORT = CONFIG.PORT;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: El puerto ${PORT} ya está ocupado por otro proceso.`);
    console.error(`💡 Sugerencia: Cierra el proceso que ocupa el puerto o ejecuta en PowerShell:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    console.error('Error en el servidor:', err);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor Fit.Net BDD escuchando en http://localhost:${PORT}`);
  console.log(`📡 WebSocket listo para transmitir a dispositivos móviles`);
});
