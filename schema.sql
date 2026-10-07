-- ==============================================================================
-- RC Sindhri - Database Schema for Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT 'Administrator',
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 2. Create Albums Table
CREATE TABLE IF NOT EXISTS albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Photos & Submissions Table
CREATE TABLE IF NOT EXISTS photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    delete_url TEXT,
    submitter_name TEXT,
    submitter_email TEXT,
    submitter_phone TEXT,
    consent_given BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_published BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT
);

-- 4. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_is_published ON photos(is_published);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_slug ON albums(slug);
CREATE INDEX IF NOT EXISTS idx_albums_display_order ON albums(display_order ASC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Public can read visible albums
CREATE POLICY "Public can view visible albums" ON albums
    FOR SELECT USING (is_visible = TRUE);

-- Public can read approved, published photos belonging to visible albums
CREATE POLICY "Public can view approved photos" ON photos
    FOR SELECT USING (is_published = TRUE AND status = 'approved');

-- Public can insert photo submissions with 'pending' status
CREATE POLICY "Public can submit photos" ON photos
    FOR INSERT WITH CHECK (status = 'pending' AND is_published = FALSE);

-- Service role has full access to all tables (used by backend API routes)
-- Admins table is never readable by public (only via backend serverless functions with service role)

-- 7. Seed Initial Albums
INSERT INTO albums (slug, title, description, display_order)
VALUES
    ('pty', 'PTY & Vocational Skills', 'Vocational skills training in solar repair, beautician trades, and digital literacy under Power to Youth.', 1),
    ('manzil', 'MANZIL & Leadership', 'Youth leadership, governance workshops, and community advocacy development.', 2),
    ('drama', 'Stage Drama Team', 'Social theatre performances on climate change, GBV awareness, education, and child rights.', 3),
    ('climate', 'Climate Action & Cleanliness', 'Community tree plantation drives, environmental clean-ups, and climate resilience awareness.', 4),
    ('gbv', 'GBV Awareness & Women Support', 'Community dialogues on women safety, early marriage prevention, and legal referral rights.', 5),
    ('nadra', 'NADRA MRV Facilitation', 'Mobile Registration Van facilitation enabling identity cards for women and rural citizens.', 6),
    ('health', 'Health & Vaccination Outreach', 'Community mobilization for COVID-19, Measles-Rubella (MR), and Polio immunization.', 7),
    ('community', 'Mach Kachehri & Community Events', 'Traditional open dialogues, social evenings, and village consultations.', 8),
    ('trainings', 'Workshops & Capacity Building', 'Specialized workshops and capacity building sessions for local community members.', 9)
ON CONFLICT (slug) DO NOTHING;
