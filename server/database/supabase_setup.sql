-- ==============================================================================
-- FIT.NET: ESQUEMA DE INTEGRACIÓN PARA SUPABASE (BASE DE DATOS CENTRAL EN LA NUBE)
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase (supabase.com)
-- ==============================================================================

-- 1. Tabla de Catálogo de Sucursales
CREATE TABLE IF NOT EXISTS public.sucursales (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar sucursales de la cadena
INSERT INTO public.sucursales (id, codigo, nombre) VALUES
    (1, 'CENTRO', 'Sucursal Centro'),
    (2, 'NORTE', 'Sucursal Norte')
ON CONFLICT (id) DO NOTHING;

-- 2. Tabla Consolidada Global de Accesos y Cobros (Integración Disjunta)
CREATE TABLE IF NOT EXISTS public.accesos_global (
    id_global BIGSERIAL PRIMARY KEY,
    sucursal_id INT NOT NULL REFERENCES public.sucursales(id),
    id_acceso_local INT NOT NULL,
    cliente_id INT NOT NULL,
    cliente_nombre VARCHAR(150) NOT NULL,
    fecha_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    monto NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tipo_cobro VARCHAR(50) NOT NULL,
    sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción de unicidad para evitar duplicados en la replicación asíncrona
    CONSTRAINT uq_sucursal_acceso UNIQUE (sucursal_id, id_acceso_local)
);

-- Índices para optimizar las consultas analíticas del tablero del dueño
CREATE INDEX IF NOT EXISTS idx_accesos_global_fecha ON public.accesos_global (fecha_hora);
CREATE INDEX IF NOT EXISTS idx_accesos_global_sucursal ON public.accesos_global (sucursal_id);

-- 3. Habilitar Row Level Security (RLS) y permitir lectura y escritura pública con anon key
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accesos_global ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de sucursales" ON public.sucursales
    FOR SELECT USING (true);

CREATE POLICY "Permitir lectura y escritura de accesos_global" ON public.accesos_global
    FOR ALL USING (true) WITH CHECK (true);
