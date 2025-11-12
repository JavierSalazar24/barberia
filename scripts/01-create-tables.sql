-- Tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  duracion INTEGER NOT NULL DEFAULT 30,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de galería
CREATE TABLE IF NOT EXISTS galeria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  imagen_url TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservaciones/citas
CREATE TABLE IF NOT EXISTS reservaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  servicio TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  mensaje TEXT,
  atendida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios administradores (separada de auth.users para datos adicionales)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para servicios (público puede leer, solo admins pueden modificar)
CREATE POLICY "Todos pueden ver servicios activos"
  ON servicios FOR SELECT
  USING (activo = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden insertar servicios"
  ON servicios FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden actualizar servicios"
  ON servicios FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden eliminar servicios"
  ON servicios FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Políticas para galería (público puede leer, solo admins pueden modificar)
CREATE POLICY "Todos pueden ver galería activa"
  ON galeria FOR SELECT
  USING (activo = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden insertar en galería"
  ON galeria FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden actualizar galería"
  ON galeria FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden eliminar de galería"
  ON galeria FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Políticas para reservaciones
CREATE POLICY "Todos pueden crear reservaciones"
  ON reservaciones FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos pueden ver fechas/horas ocupadas"
  ON reservaciones FOR SELECT
  USING (true);

CREATE POLICY "Solo admins pueden actualizar reservaciones"
  ON reservaciones FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden eliminar reservaciones atendidas"
  ON reservaciones FOR DELETE
  USING (auth.uid() IS NOT NULL AND atendida = true);

-- Políticas para admin_profiles
CREATE POLICY "Admins pueden ver su propio perfil"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins pueden actualizar su propio perfil"
  ON admin_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Sistema puede crear perfiles"
  ON admin_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Índices para mejorar rendimiento
CREATE INDEX idx_servicios_activo ON servicios(activo);
CREATE INDEX idx_servicios_orden ON servicios(orden);
CREATE INDEX idx_galeria_activo ON galeria(activo);
CREATE INDEX idx_galeria_orden ON galeria(orden);
CREATE INDEX idx_reservaciones_fecha_hora ON reservaciones(fecha, hora);
CREATE INDEX idx_reservaciones_atendida ON reservaciones(atendida);
