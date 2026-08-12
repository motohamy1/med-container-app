-- Execute this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.specialty_topics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    specialty_id text NOT NULL, -- e.g., 'heart', 'git', 'neuro'
    category_id text NOT NULL,  -- e.g., 'emergencies', 'clinical_topics', 'tools', 'research'
    topic_id text NOT NULL,     -- e.g., 'acs', 'heart_failure'
    title text NOT NULL,
    subtitle text NOT NULL,
    type text NOT NULL,
    ai_scope_description text NOT NULL,
    clinical_content jsonb NOT NULL, -- Array of { title: string, content: string }
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (specialty_id, category_id, topic_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.specialty_topics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to topics (so the mobile app can fetch them)
CREATE POLICY "Allow public read access on specialty_topics"
    ON public.specialty_topics
    FOR SELECT
    USING (true);

-- Allow authenticated or service role write access
CREATE POLICY "Allow service role insert/update on specialty_topics"
    ON public.specialty_topics
    FOR ALL
    USING (true); -- Note: Since we are using Supabase service key in the backend, it overrides RLS anyway.

-- Create an index to quickly fetch by specialty_id
CREATE INDEX IF NOT EXISTS specialty_topics_specialty_id_idx ON public.specialty_topics (specialty_id);
