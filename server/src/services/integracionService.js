import { dbCentro, dbNorte, dbCentral, supabase } from '../database/dbConnection.js';
import { SUCURSALES } from '../config/constants.js';

export class IntegracionService {
  // Consulta Federada Distribuida: Une en tiempo real los ingresos de ambas bases locales
  static getResumenGlobalHoy() {
    // 1. Ingresos y Accesos en Sucursal Centro
    const stmtCentro = dbCentro.prepare(`
      SELECT 
        COUNT(id_acceso) as total_accesos,
        COALESCE(SUM(monto), 0) as total_ingresos
      FROM accesos
      WHERE date(fecha_hora) = date('now', 'localtime')
    `);
    const statsCentro = stmtCentro.get();

    // 2. Ingresos y Accesos en Sucursal Norte
    const stmtNorte = dbNorte.prepare(`
      SELECT 
        COUNT(id_acceso) as total_accesos,
        COALESCE(SUM(monto), 0) as total_ingresos
      FROM accesos
      WHERE date(fecha_hora) = date('now', 'localtime')
    `);
    const statsNorte = stmtNorte.get();

    // 3. Consolidación Global (Álgebra Relacional: Unión y Agregación)
    const ingresosGlobales = Number((statsCentro.total_ingresos + statsNorte.total_ingresos).toFixed(2));
    const accesosTotales = statsCentro.total_accesos + statsNorte.total_accesos;

    // 4. Últimos movimientos unificados (Federación de datos)
    const ultimosCentro = dbCentro.prepare(`
      SELECT 
        a.id_acceso,
        'Centro' as sucursal_nombre,
        1 as sucursal_id,
        c.nombre || ' ' || c.apellidos as cliente,
        a.fecha_hora,
        a.monto,
        a.tipo_cobro
      FROM accesos a
      JOIN clientes c ON a.cliente_id = c.id
      ORDER BY a.id_acceso DESC
      LIMIT 10
    `).all();

    const ultimosNorte = dbNorte.prepare(`
      SELECT 
        a.id_acceso,
        'Norte' as sucursal_nombre,
        2 as sucursal_id,
        c.nombre || ' ' || c.apellidos as cliente,
        a.fecha_hora,
        a.monto,
        a.tipo_cobro
      FROM accesos a
      JOIN clientes c ON a.cliente_id = c.id
      ORDER BY a.id_acceso DESC
      LIMIT 10
    `).all();

    // Ordenar movimientos combinados cronológicamente
    const movimientosUnificados = [...ultimosCentro, ...ultimosNorte]
      .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
      .slice(0, 15);

    return {
      timestamp: new Date().toISOString(),
      global: {
        totalIngresosHoy: ingresosGlobales,
        totalAccesosHoy: accesosTotales
      },
      porSucursal: {
        centro: {
          id: SUCURSALES.CENTRO.id,
          nombre: SUCURSALES.CENTRO.nombre,
          ingresos: statsCentro.total_ingresos,
          accesos: statsCentro.total_accesos,
          porcentaje: ingresosGlobales > 0 ? Math.round((statsCentro.total_ingresos / ingresosGlobales) * 100) : 50
        },
        norte: {
          id: SUCURSALES.NORTE.id,
          nombre: SUCURSALES.NORTE.nombre,
          ingresos: statsNorte.total_ingresos,
          accesos: statsNorte.total_accesos,
          porcentaje: ingresosGlobales > 0 ? Math.round((statsNorte.total_ingresos / ingresosGlobales) * 100) : 50
        }
      },
      movimientosRecientes: movimientosUnificados
    };
  }
}
