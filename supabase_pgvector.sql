  -- Enable the pgvector extension to work with embedding vectors
  create extension if not exists vector;

  -- Create or upgrade table to store verified medical guidelines & textbooks
  create table if not exists custom_knowledge (
    id bigint primary key generated always as identity,
    title text not null,                      -- e.g. "GOLD 2024 Global Strategy for COPD"
    guideline_society text,                   -- e.g. "GOLD", "AHA/ACC", "ESC", "IDSA", "KDIGO", "SURVIVING SEPSIS", "NICE", "ADA"
    publication_year int default 2024,        -- e.g. 2024, 2025
    version_tag text,                         -- e.g. "2024 Report", "2023 Guideline Update"
    source_url text,                          -- Link to authoritative source (e.g. goldcopd.org, ahajournals.org)
    pmid text,                                -- PubMed ID or DOI (e.g. "PMID: 38237890")
    is_active boolean default true,           -- Active latest guideline indicator
    superseded_by_id bigint references custom_knowledge(id) on delete set null,
    content text not null,                    -- The clinical excerpt/chunk
    embedding vector(3072),                   -- Mathematical representation (Gemini Flash uses 3072 dimensions)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Index for fast vector similarity search
  create index if not exists custom_knowledge_embedding_idx 
    on custom_knowledge 
    using ivfflat (embedding vector_cosine_ops) 
    with (lists = 100);

  -- Index for filtering active latest guidelines
  create index if not exists custom_knowledge_active_idx
    on custom_knowledge (is_active, publication_year desc);

  -- Function to perform evidence-based similarity search filtering for active, latest guidelines
  create or replace function match_custom_knowledge (
    query_embedding vector(3072),
    match_threshold float default 0.45,
    match_count int default 5
  )
  returns table ( 
    id bigint,
    title text,
    guideline_society text,
    publication_year int,
    version_tag text,
    source_url text,
    pmid text,
    content text,
    similarity float
  )
  language sql stable
  as $$
    select
      custom_knowledge.id,
      custom_knowledge.title,
      custom_knowledge.guideline_society,
      custom_knowledge.publication_year,
      custom_knowledge.version_tag,
      custom_knowledge.source_url,
      custom_knowledge.pmid,
      custom_knowledge.content,
      (1 - (custom_knowledge.embedding <=> query_embedding))::float as similarity
    from custom_knowledge
    where custom_knowledge.is_active = true
      and (1 - (custom_knowledge.embedding <=> query_embedding)) > match_threshold
    order by custom_knowledge.publication_year desc, (custom_knowledge.embedding <=> query_embedding) asc
    limit match_count;
  $$;
