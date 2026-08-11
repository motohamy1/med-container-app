  -- Enable the pgvector extension to work with embedding vectors
  create extension if not exists vector;

  -- Drop the old table and function because we need to change dimensions from 768 to 3072
  drop table if exists custom_knowledge;
  drop function if exists match_custom_knowledge;

  -- Create a table to store your custom medical knowledge (Textbooks, Guidelines, URLs)
  create table if not exists custom_knowledge (
    id bigint primary key generated always as identity,
    title text not null,               -- e.g., "Harrison's Internal Medicine Ch 50" or "AHA 2024 Guidelines"
    source_url text,                   -- Optional URL if it came from the web
    content text not null,             -- The actual paragraph/chunk of text
    embedding vector(3072),            -- Mathematical representation (Gemini Flash uses 3072 dimensions)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Create a function that the backend can call to perform the Similarity Search
  create or replace function match_custom_knowledge (
    query_embedding vector(3072),
    match_threshold float,
    match_count int
  )
  returns table ( 
    id bigint,
    title text,
    content text,
    similarity float
  )
  language sql stable
  as $$
    select
      custom_knowledge.id,
      custom_knowledge.title,
      custom_knowledge.content,
      1 - (custom_knowledge.embedding <=> query_embedding) as similarity
    from custom_knowledge
    where 1 - (custom_knowledge.embedding <=> query_embedding) > match_threshold
    order by custom_knowledge.embedding <=> query_embedding
    limit match_count;
  $$;
