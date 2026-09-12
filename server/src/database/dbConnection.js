import Database from 'better-sqlite3';
import WebSocket from 'ws';
if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket;
}
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUCURSALES, CONFIG } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.resolve(__dirname, '../../database');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 1. Instancia Base de Datos Local Sucursal Centro (IDs 1-100)
export const dbCentro = new Database(SUCURSALES.CENTRO.dbPath);
dbCentro.pragma('journal_mode = WAL');
dbCentro.pragma('wal_autocheckpoint = 10');

// 2. Instancia Base de Datos Local Sucursal Norte (IDs 101-200)
export const dbNorte = new Database(SUCURSALES.NORTE.dbPath);
dbNorte.pragma('journal_mode = WAL');
dbNorte.pragma('wal_autocheckpoint = 10');

// 3. Instancia Base de Datos Central (Espejo local / Fallback para Supabase)
const centralDbPath = path.resolve(dbDir, 'central.db');
export const dbCentral = new Database(centralDbPath);
dbCentral.pragma('journal_mode = WAL');
dbCentral.pragma('wal_autocheckpoint = 10');

// 4. Cliente Supabase (Opcional si se proporcionan llaves en .env)
export const supabase = (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY)
  ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY)
  : null;

// Inicialización de esquemas relacionales con integridad y fragmentación horizontal estricta
export function initDatabases() {
  // Esquema para Centro (CHECK: id BETWEEN 1 AND 100)
  dbCentro.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY CHECK(id BETWEEN 1 AND 100),
      nombre TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      membresia TEXT NOT NULL,
      vigencia TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      creado_en TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS accesos (
      id_acceso INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      fecha_hora TEXT DEFAULT (datetime('now', 'localtime')),
      monto REAL NOT NULL,
      tipo_cobro TEXT NOT NULL,
      sincronizado INTEGER DEFAULT 0,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

    CREATE INDEX IF NOT EXISTS idx_clientes_centro_id ON clientes(id);
    CREATE INDEX IF NOT EXISTS idx_accesos_centro_fecha ON accesos(fecha_hora);
    CREATE INDEX IF NOT EXISTS idx_accesos_centro_sync ON accesos(sincronizado);
  `);

  // Esquema para Norte (CHECK: id BETWEEN 101 AND 200)
  dbNorte.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY CHECK(id BETWEEN 101 AND 200),
      nombre TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      membresia TEXT NOT NULL,
      vigencia TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      creado_en TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS accesos (
      id_acceso INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      fecha_hora TEXT DEFAULT (datetime('now', 'localtime')),
      monto REAL NOT NULL,
      tipo_cobro TEXT NOT NULL,
      sincronizado INTEGER DEFAULT 0,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

    CREATE INDEX IF NOT EXISTS idx_clientes_norte_id ON clientes(id);
    CREATE INDEX IF NOT EXISTS idx_accesos_norte_fecha ON accesos(fecha_hora);
    CREATE INDEX IF NOT EXISTS idx_accesos_norte_sync ON accesos(sincronizado);
  `);

  // Esquema para la Base Central (Integración Global)
  dbCentral.exec(`
    CREATE TABLE IF NOT EXISTS sucursales (
      id INTEGER PRIMARY KEY,
      codigo TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL
    );

    INSERT OR IGNORE INTO sucursales (id, codigo, nombre) VALUES
      (1, 'CENTRO', 'Sucursal Centro'),
      (2, 'NORTE', 'Sucursal Norte');

    CREATE TABLE IF NOT EXISTS accesos_global (
      id_global INTEGER PRIMARY KEY AUTOINCREMENT,
      sucursal_id INTEGER NOT NULL,
      id_acceso_local INTEGER NOT NULL,
      cliente_id INTEGER NOT NULL,
      cliente_nombre TEXT NOT NULL,
      fecha_hora TEXT NOT NULL,
      monto REAL NOT NULL,
      tipo_cobro TEXT NOT NULL,
      sincronizado_en TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(sucursal_id, id_acceso_local)
    );

    CREATE INDEX IF NOT EXISTS idx_global_fecha ON accesos_global(fecha_hora);
    CREATE INDEX IF NOT EXISTS idx_global_sucursal ON accesos_global(sucursal_id);
  `);

  console.log('✅ Bases de datos SQLite inicializadas correctamente (Centro, Norte y Central)');
}
