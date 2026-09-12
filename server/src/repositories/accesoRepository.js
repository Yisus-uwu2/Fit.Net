import { dbCentro, dbNorte, dbCentral } from '../database/dbConnection.js';
import { SUCURSALES } from '../config/constants.js';

export class AccesoRepository {
  static getDbBySucursal(sucursalId) {
    if (Number(sucursalId) === SUCURSALES.CENTRO.id) return dbCentro;
    if (Number(sucursalId) === SUCURSALES.NORTE.id) return dbNorte;
    throw new Error(`Sucursal no válida: ${sucursalId}`);
  }

  // Registro atómico con transacción en base local
  static registrarAccesoLocal(sucursalId, clienteId, monto, tipoCobro, sincronizado = 0) {
    const db = this.getDbBySucursal(sucursalId);
    
    const insertStmt = db.prepare(`
      INSERT INTO accesos (cliente_id, fecha_hora, monto, tipo_cobro, sincronizado)
      VALUES (?, datetime('now', 'localtime'), ?, ?, ?)
    `);

    const result = insertStmt.run(clienteId, monto, tipoCobro, sincronizado);
    
    const getStmt = db.prepare(`
      SELECT id_acceso, cliente_id, fecha_hora, monto, tipo_cobro, sincronizado
      FROM accesos
      WHERE id_acceso = ?
    `);
    
    return getStmt.get(result.lastInsertRowid);
  }

  // Consultar accesos locales del día
  static getAccesosHoyLocal(sucursalId) {
    const db = this.getDbBySucursal(sucursalId);
    const stmt = db.prepare(`
      SELECT 
        a.id_acceso,
        a.cliente_id,
        c.nombre,
        c.apellidos,
        a.fecha_hora,
        a.monto,
        a.tipo_cobro,
        a.sincronizado
      FROM accesos a
      JOIN clientes c ON a.cliente_id = c.id
      WHERE date(a.fecha_hora) = date('now', 'localtime')
      ORDER BY a.id_acceso DESC
    `);
    return stmt.all();
  }

  // Obtener accesos pendientes de sincronizar
  static getPendientesSincronizacion(sucursalId) {
    const db = this.getDbBySucursal(sucursalId);
    const stmt = db.prepare(`
      SELECT 
        a.id_acceso,
        a.cliente_id,
        c.nombre || ' ' || c.apellidos as cliente_nombre,
        a.fecha_hora,
        a.monto,
        a.tipo_cobro
      FROM accesos a
      JOIN clientes c ON a.cliente_id = c.id
      WHERE a.sincronizado = 0
      ORDER BY a.id_acceso ASC
    `);
    return stmt.all();
  }

  // Marcar acceso como sincronizado
  static marcarComoSincronizado(sucursalId, idAccesoLocal) {
    const db = this.getDbBySucursal(sucursalId);
    const stmt = db.prepare(`
      UPDATE accesos
      SET sincronizado = 1
      WHERE id_acceso = ?
    `);
    return stmt.run(idAccesoLocal);
  }

  // Registrar en la base central espejo / integración
  static registrarEnCentralGlobal(sucursalId, idAccesoLocal, clienteId, clienteNombre, fechaHora, monto, tipoCobro) {
    const stmt = dbCentral.prepare(`
      INSERT OR REPLACE INTO accesos_global 
        (sucursal_id, id_acceso_local, cliente_id, cliente_nombre, fecha_hora, monto, tipo_cobro)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(sucursalId, idAccesoLocal, clienteId, clienteNombre, fechaHora, monto, tipoCobro);
  }
}
