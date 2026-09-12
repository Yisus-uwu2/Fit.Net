import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.resolve(__dirname, 'database');

const dbCentro = new Database(path.join(dbDir, 'centro.db'));
const dbNorte = new Database(path.join(dbDir, 'norte.db'));
const dbCentral = new Database(path.join(dbDir, 'central.db'));

console.log('='.repeat(70));
console.log('📦 EXPLORADOR DE BASES DE DATOS SQLITE - FIT.NET');
console.log('='.repeat(70));

console.log('\n📍 1. BASE DE DATOS LOCAL: CENTRO (server/database/centro.db)');
console.log('Fragmento Horizontal: IDs del 1 al 100');
const clientesCentro = dbCentro.prepare('SELECT id, nombre, apellidos, membresia, vigencia, activo FROM clientes LIMIT 5').all();
console.log('\n--- Tabla: clientes (primeros 5) ---');
console.table(clientesCentro);

const accesosCentro = dbCentro.prepare('SELECT id_acceso, cliente_id, fecha_hora, monto, tipo_cobro, sincronizado FROM accesos ORDER BY id_acceso DESC LIMIT 5').all();
console.log('--- Tabla: accesos (últimos 5) ---');
console.table(accesosCentro);

console.log('\n' + '='.repeat(70));
console.log('📍 2. BASE DE DATOS LOCAL: NORTE (server/database/norte.db)');
console.log('Fragmento Horizontal: IDs del 101 al 200');
const clientesNorte = dbNorte.prepare('SELECT id, nombre, apellidos, membresia, vigencia, activo FROM clientes LIMIT 5').all();
console.log('\n--- Tabla: clientes (primeros 5) ---');
console.table(clientesNorte);

const accesosNorte = dbNorte.prepare('SELECT id_acceso, cliente_id, fecha_hora, monto, tipo_cobro, sincronizado FROM accesos ORDER BY id_acceso DESC LIMIT 5').all();
console.log('--- Tabla: accesos (últimos 5) ---');
console.table(accesosNorte);

console.log('\n' + '='.repeat(70));
console.log('☁️ 3. BASE DE DATOS CENTRAL CONSOLIDADA (server/database/central.db)');
console.log('Integración de ingresos y accesos de ambas sucursales');
const accesosCentral = dbCentral.prepare(`
  SELECT a.id_global, s.nombre as sucursal, a.cliente_id, a.cliente_nombre, a.fecha_hora, a.monto, a.tipo_cobro 
  FROM accesos_global a
  JOIN sucursales s ON s.id = a.sucursal_id
  ORDER BY a.id_global DESC 
  LIMIT 10
`).all();
console.log('\n--- Tabla: accesos_global (últimos 10 consolidados) ---');
console.table(accesosCentral);
