-- 1. Unanswered Queries (Gaps)
CREATE TABLE IF NOT EXISTS knowledge_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSED
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Proposal Queue for Human Review
CREATE TABLE IF NOT EXISTS knowledge_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES specialty_topics(id), -- FIXED: Corrected table name from 'topics' to 'specialty_topics'
    topic_name TEXT,
    content JSONB, -- The AI-synthesized clinical content
    source TEXT, -- GAP_HUNTING, PERIODIC_AUDIT, CHAT_MINING
    reference TEXT,
    trigger_query TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. The Scientist's Log
CREATE TABLE IF NOT EXISTS scientific_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT,
    metadata JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at to specialty_topics if not exists (for auditing logic)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='specialty_topics' AND column_name='updated_at') THEN
        ALTER TABLE specialty_topics ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;
