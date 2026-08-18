-- ==============================================================================
-- MEDICAL ARENA: HIGH-YIELD DAILY CLINICAL PEARLS & TIPS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.clinical_pearls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    takeaway TEXT NOT NULL,
    pearl TEXT NOT NULL,
    specialty_id TEXT NOT NULL,
    specialty_name TEXT NOT NULL,
    specialty_color TEXT NOT NULL,
    specialty_icon TEXT NOT NULL,
    citation TEXT NOT NULL,
    key_numbers TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast specialty retrieval
CREATE INDEX IF NOT EXISTS idx_clinical_pearls_specialty ON public.clinical_pearls (specialty_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clinical_pearls ENABLE ROW LEVEL SECURITY;

-- Allow public read-only access
CREATE POLICY "Allow public read access on clinical_pearls"
    ON public.clinical_pearls FOR SELECT
    USING (true);
