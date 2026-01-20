-- Crear tabla de fotos
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  couple_name VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name VARCHAR(255),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de fotos compartidas (relacion muchos a muchos)
CREATE TABLE IF NOT EXISTS photo_shares (
  id SERIAL PRIMARY KEY,
  photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  shared_by_user_id INTEGER NOT NULL,
  shared_with_user_id INTEGER NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(photo_id, shared_with_user_id)
);

-- Indices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_shares_photo_id ON photo_shares(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_shares_shared_with ON photo_shares(shared_with_user_id);

-- Habilitar RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_shares ENABLE ROW LEVEL SECURITY;

-- Politicas de seguridad para photos (todos pueden ver todas las fotos del viaje)
CREATE POLICY "Allow all operations on photos" ON photos FOR ALL USING (true) WITH CHECK (true);

-- Politicas de seguridad para photo_shares
CREATE POLICY "Allow all operations on photo_shares" ON photo_shares FOR ALL USING (true) WITH CHECK (true);
