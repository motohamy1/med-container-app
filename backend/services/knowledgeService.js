const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// For text embeddings, use gemini-embedding model (text-embedding-004 is recommended)
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Generate an embedding vector for a piece of text.
 */
async function generateEmbedding(text) {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("[Embed Error] Failed to generate embedding:", error.message);
        return null;
    }
}

/**
 * Perform a similarity search in the Custom Knowledge base.
 */
async function searchCustomKnowledge(queryText, match_count = 3, match_threshold = 0.5) {
    // 1. Convert user's question to a vector
    const query_embedding = await generateEmbedding(queryText);
    if (!query_embedding) return [];

    // 2. Call the Supabase Postgres function
    const { data, error } = await supabase.rpc('match_custom_knowledge', {
        query_embedding,
        match_threshold,
        match_count
    });

    if (error) {
        console.error("[Search Error] Custom Knowledge Match Failed:", error.message);
        return [];
    }

    return data || [];
}

/**
 * Chunk long text into smaller pieces (approx 500-1000 characters) 
 * with overlapping to preserve context.
 */
function chunkText(text, maxChunkSize = 1000) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = "";
    let overlapChunk = "";

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        if ((currentChunk.length + sentence.length) > maxChunkSize) {
            chunks.push(currentChunk.trim());
            // Overlap: start the next chunk with the last sentence of this chunk
            currentChunk = overlapChunk + " " + sentence;
        } else {
            currentChunk += " " + sentence;
        }
        overlapChunk = sentence; // Keep track of last sentence for overlap
    }
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
}

/**
 * Admin utility: Ingest a large text (e.g. textbook chapter) into the database
 * with batching and progress reporting.
 */
async function ingestKnowledge(title, text, sourceUrl = '', onProgress = null) {
    console.log(`[Ingest] Starting ingestion for: "${title}"`);
    const chunks = chunkText(text);
    console.log(`[Ingest] Sliced into ${chunks.length} chunks.`);

    let successCount = 0;
    const batchSize = 10; // Process 10 chunks at a time for speed

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        
        // Map each chunk to a promise that embeds and inserts
        const promises = batch.map(async (chunk) => {
            const embedding = await generateEmbedding(chunk);
            if (embedding) {
                const { error } = await supabase
                    .from('custom_knowledge')
                    .insert({
                        title,
                        source_url: sourceUrl,
                        content: chunk,
                        embedding
                    });
                if (error) {
                    console.error(`[Ingest] Error inserting chunk:`, error.message);
                } else {
                    return true;
                }
            }
            return false;
        });

        // Await the whole batch concurrently
        const results = await Promise.all(promises);
        successCount += results.filter(r => r).length;

        if (onProgress) {
            onProgress(Math.min(i + batchSize, chunks.length), chunks.length);
        }
        
        // Small delay between batches to respect rate limits
        await new Promise(res => setTimeout(res, 300));
    }
    
    console.log(`[Ingest] Successfully ingested ${successCount}/${chunks.length} chunks.`);
    return successCount;
}

module.exports = {
    searchCustomKnowledge,
    ingestKnowledge
};
