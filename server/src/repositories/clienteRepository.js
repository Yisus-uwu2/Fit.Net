import { dbCentro, dbNorte } from '../database/dbConnection.js';
import { SUCURSALES } from '../config/constants.js';

export class ClienteRepository {
  static getDbBySucursal(sucursalId) {
    if (Number(sucursalId) === SUCURSALES.CENTRO.id) return dbCentro;
    if (Number(sucursalId) === SUCURSALES.NORTE.id) return dbNorte;
    throw new Error(`Sucursal no válida: ${sucursalId}`);
  }

  // Consulta parametrizada segura contra SQL Injection
  static getById(sucursalId, clienteId) {
    const db = this.getDbBySucursal(sucursalId);
    const stmt = db.prepare(`
      SELECT id, nombre, apellidos, membresia, vigencia, activo, creado_en
      FROM clientes
      WHERE id = ?
    `);
    return stmt.get(Number(clienteId));
  }

  // Lista clientes de la sucursal
  static getAll(sucursalId) {
    const db = this.getDbBySucursal(sucursalId);
    const stmt = db.prepare(`
      SELECT id, nombre, apellidos, membresia, vigencia, activo
      FROM clientes
      ORDER BY id ASC
    `);
    return stmt.all();
  }
}
