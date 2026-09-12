import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SUCURSALES = {
  CENTRO: {
    id: 1,
    codigo: 'CENTRO',
    nombre: 'Sucursal Centro',
    rangoMin: 1,
    rangoMax: 100,
    dbPath: path.resolve(__dirname, '../../database/centro.db'),
    color: '#0055EA'
  },
  NORTE: {
    id: 2,
    codigo: 'NORTE',
    nombre: 'Sucursal Norte',
    rangoMin: 101,
    rangoMax: 200,
    dbPath: path.resolve(__dirname, '../../database/norte.db'),
    color: '#388E3C'
  }
};

export const TARIFAS = {
  PASE_DIARIO: 60.00,
  MENSUAL: 450.00,
  ANUAL: 4200.00
};

export const CONFIG = {
  PORT: process.env.PORT || 4000,
  ANTI_REPASS_COOLDOWN_MS: 3000, // Cooldown de 3s por tarjeta para evitar doble cobro accidental
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || ''
};
