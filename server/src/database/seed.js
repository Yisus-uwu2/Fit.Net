import { dbCentro, dbNorte, initDatabases } from './dbConnection.js';

initDatabases();

// 20 Clientes para Sucursal Centro (IDs 1-20)
const clientesCentro = [
  { id: 1, nombre: 'Carlos', apellidos: 'Mendoza Ruiz', membresia: 'Mensual', vigencia: '2026-12-31', activo: 1 },
  { id: 2, nombre: 'Ana Sofía', apellidos: 'López Vega', membresia: 'Anual', vigencia: '2027-01-15', activo: 1 },
  { id: 3, nombre: 'Miguel Ángel', apellidos: 'Torres Soto', membresia: 'Mensual', vigencia: '2026-10-01', activo: 1 },
  { id: 4, nombre: 'Valeria', apellidos: 'Hernández Gil', membresia: 'Pase Diario', vigencia: '2026-09-07', activo: 1 },
  { id: 5, nombre: 'Fernando', apellidos: 'Castillo Lara', membresia: 'Mensual', vigencia: '2025-08-01', activo: 0 }, // Vencido
  { id: 6, nombre: 'Mariana', apellidos: 'Ramos Ortiz', membresia: 'Mensual', vigencia: '2026-11-20', activo: 1 },
  { id: 7, nombre: 'Roberto', apellidos: 'Morales Díaz', membresia: 'Anual', vigencia: '2027-03-10', activo: 1 },
  { id: 8, nombre: 'Daniela', apellidos: 'García Peña', membresia: 'Mensual', vigencia: '2026-10-15', activo: 1 },
  { id: 9, nombre: 'Eduardo', apellidos: 'Navarro Cruz', membresia: 'Pase Diario', vigencia: '2026-09-07', activo: 1 },
  { id: 10, nombre: 'Gabriela', apellidos: 'Vargas Silva', membresia: 'Mensual', vigencia: '2025-01-01', activo: 0 }, // Vencido
  { id: 11, nombre: 'Alejandro', apellidos: 'Reyes Flores', membresia: 'Mensual', vigencia: '2026-12-05', activo: 1 },
  { id: 12, nombre: 'Camila', apellidos: 'Márquez Solís', membresia: 'Anual', vigencia: '2026-12-31', activo: 1 },
  { id: 13, nombre: 'Héctor', apellidos: 'Ponce Medina', membresia: 'Mensual', vigencia: '2026-11-30', activo: 1 },
  { id: 14, nombre: 'Lucía', apellidos: 'Campos Luna', membresia: 'Pase Diario', vigencia: '2026-09-07', activo: 1 },
  { id: 15, nombre: 'Javier', apellidos: 'Ibarra Rojas', membresia: 'Mensual', vigencia: '2026-10-25', activo: 1 },
  { id: 16, nombre: 'Paola', apellidos: 'Salas Núñez', membresia: 'Mensual', vigencia: '2026-12-18', activo: 1 },
  { id: 17, nombre: 'Esteban', apellidos: 'Acosta Villa', membresia: 'Anual', vigencia: '2027-02-28', activo: 1 },
  { id: 18, nombre: 'Natalia', apellidos: 'Mejía Bravo', membresia: 'Mensual', vigencia: '2026-09-30', activo: 1 },
  { id: 19, nombre: 'Andrés', apellidos: 'Paz Cordero', membresia: 'Pase Diario', vigencia: '2026-09-07', activo: 1 },
  { id: 20, nombre: 'Jimena', apellidos: 'Flores Garza', membresia: 'Mensual', vigencia: '2025-06-01', activo: 0 } // Vencido
];

// 20 Clientes para Sucursal Norte (IDs 101-120)
const clientesNorte = [
  { id: 101, nombre: 'Diego', apellidos: 'Sandoval Mora', membresia: 'Mensual', vigencia: '2026-12-31', activo: 1 },
  { id: 102, nombre: 'Sofía', apellidos: 'Cabrera Ríos', membresia: 'Anual', vigencia: '2027-05-20', activo: 1 },
  { id: 103, nombre: 'Mateo', apellidos: 'Aguilar León', membresia: 'Mensual', vigencia: '2026-10-10', activo: 1 },
  { id: 104, nombre: 'Renata', apellidos: 'Delgado Fuentes', membresia: 'Pase Diario', vigencia: '2026-09-07', activo: 1 },
  { id: 105, nombre: 'Emiliano', apellidos: 'Santana Cruz', membresia: 'Mensual', vigencia: '2025-07-15', activo: 0 }, // Vencido
  { id: 106, nombre: 'Victoria', apellidos: 'Guerrero Parra', membresia: 'Mensual', vigencia: '2026-11-15', activo: 1 },
  { id: 107, nombre: 'Santiago', apellidos: 'Miranda Valdés', membresia: 'Anual', vigencia: '2027-04-01', activo: 1 },
  { id: 108, nombre: 'Ximena', apellidos: 'Estrada Galván', membresia: 'Mensual', vigencia: '2026-10-20', activo: 1 },
  { id: 109, nombre: 'Sebastián', apellidos: 'Benítez Lara', membresia: 'Pase Diario', vigencia: '2026-09-07', activo: 1 },
  { id: 110, nombre: 'Paulina', apellidos: 'Chávez Rivas', membresia: 'Mensual', vigencia: '2025-03-01', activo: 0 }, // Vencido
  { id: 111, nombre: 'Rodrigo', apellidos: 'Palacios Trejo', membresia: 'Mensual', vigencia: '2026-12-10', activo: 1 },
  { id: 112, nombre: 'Regina', apellidos: 'Cortés Beltrán', membresia: 'Anual', vigencia: '2027-01-31', activo: 1 },
  { id: 113, nombre: 'Leonardo', apellidos: 'Valenzuela Arce', membresia: 'Mensual', vigencia: '2026-11-28', activo: 1 },
  { id: 114, nombre: 'Isabella', apellidos: 'Orozco Leyva', membresia: 'Pase Diario', vigencia: '2026-09-07', activo: 1 },
  { id: 115, nombre: 'Bruno', apellidos: 'Villanueva Marín', membresia: 'Mensual', vigencia: '2026-10-30', activo: 1 },
  { id: 116, nombre: 'María José', apellidos: 'Bautista Cano', membresia: 'Mensual', vigencia: '2026-12-22', activo: 1 },
  { id: 117, nombre: 'Mauricio', apellidos: 'Serrano Cano', membresia: 'Anual', vigencia: '2027-06-15', activo: 1 },
  { id: 118, nombre: 'Abril', apellidos: 'Paredes Quintero', membresia: 'Mensual', vigencia: '2026-09-25', activo: 1 },
  { id: 119, nombre: 'Iván', apellidos: 'Zúñiga Téllez', membresia: 'Pase Diario', vigencia: '2026-09-07', activo: 1 },
  { id: 120, nombre: 'Elisa', apellidos: 'Peralta Tapia', membresia: 'Mensual', vigencia: '2025-05-10', activo: 0 } // Vencido
];

function seedDatabase() {
  console.log('🌱 Poblando bases de datos locales...');

  // Poblar Centro
  const insertCentro = dbCentro.prepare(`
    INSERT OR REPLACE INTO clientes (id, nombre, apellidos, membresia, vigencia, activo)
    VALUES (@id, @nombre, @apellidos, @membresia, @vigencia, @activo)
  `);

  const insertManyCentro = dbCentro.transaction((clientes) => {
    for (const c of clientes) insertCentro.run(c);
  });
  insertManyCentro(clientesCentro);
  console.log(`✅ ${clientesCentro.length} clientes insertados en Sucursal Centro (IDs 1-20)`);

  // Poblar Norte
  const insertNorte = dbNorte.prepare(`
    INSERT OR REPLACE INTO clientes (id, nombre, apellidos, membresia, vigencia, activo)
    VALUES (@id, @nombre, @apellidos, @membresia, @vigencia, @activo)
  `);

  const insertManyNorte = dbNorte.transaction((clientes) => {
    for (const c of clientes) insertNorte.run(c);
  });
  insertManyNorte(clientesNorte);
  console.log(`✅ ${clientesNorte.length} clientes insertados en Sucursal Norte (IDs 101-120)`);

  console.log('✨ Base de datos poblada exitosamente.');
}

seedDatabase();
