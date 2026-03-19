-- Tabla para guardar el estado completo de la app del viaje
-- Un solo registro compartido por todo el grupo (id = 'europe-2026')

CREATE TABLE IF NOT EXISTS public.trip_data (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sin RLS ya que es data compartida del grupo (no por usuario)
ALTER TABLE public.trip_data DISABLE ROW LEVEL SECURITY;

-- Insertar registro inicial vacío si no existe
INSERT INTO public.trip_data (id, data, updated_at)
VALUES ('europe-2026', '{}'::jsonb, now())
ON CONFLICT (id) DO NOTHING;
