const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: 'gemini-flash-latest',
    generationConfig: { responseMimeType: "application/json" }
});
const textModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Triggered after a new textbook or resource is ingested.
 * It summarizes the resource, cross-references with existing specialty_topics, 
 * and silently updates the topics if the new textbook has updated guidelines/data.
 */
async function autoReviewAndUpdateTopics(newTextContent, resourceTitle) {
    try {
        console.log(`[Auto-Update] Starting AI review of newly uploaded resource: "${resourceTitle}"`);
        
        // 1. Summarize the core medical concepts in the new resource
        const summarizePrompt = `
        You are an expert physician. A new medical resource titled "${resourceTitle}" has just been uploaded.
        Read this extracted text and summarize the high-yield medical concepts, updated guidelines, 
        and any critical changes in differential diagnosis, management, or pharmacology.
        
        Extracted Text:
        ${newTextContent.substring(0, 50000)} // Ensure we don't exceed token limits
        
        Output a detailed clinical summary.
        `;
        
        const summaryResult = await textModel.generateContent(summarizePrompt);
        const coreConcepts = summaryResult.response.text();
        console.log(`[Auto-Update] Extracted core concepts from "${resourceTitle}". Checking against existing knowledge base...`);

        // 2. Fetch all existing topics from Supabase
        const { data: existingTopics, error } = await supabase
            .from('topics')
            .select('*');
            
        if (error || !existingTopics || existingTopics.length === 0) {
            console.log("[Auto-Update] No existing specialty topics to update, or database error.");
            return;
        }

        // We batch process topics to not overwhelm the model. 
        // For simplicity, we send them all but tell it to ONLY return the ones that need updates.
        const batchSize = 10;
        let totalUpdated = 0;

        for (let i = 0; i < existingTopics.length; i += batchSize) {
            const batch = existingTopics.slice(i, i + batchSize);
            
            const reviewPrompt = `
            You are a rigorous Medical Review Board AI.
            
            A new medical resource was just ingested. Its core concepts are:
            ${coreConcepts}
            
            Here are ${batch.length} existing topics from our database:
            ${JSON.stringify(batch, null, 2)}
            
            Your job is to cross-reference our existing topics against the new resource's concepts.
            Critique the existing data. If the new resource provides a significant update, newer guideline, or better differential diagnosis, you must update the "clinical_content" of that topic.
            
            Return ONLY a JSON array of the topics that you have updated. The schema for each updated object must be identical to the original object (with the same id, specialty_id, category_id, topic_id), but with the updated "clinical_content".
            If no updates are needed for ANY topic in this batch, return an empty array [].
            `;

            const reviewResult = await model.generateContent(reviewPrompt);
            const responseText = reviewResult.response.text();
            
            try {
                const updatedTopics = JSON.parse(responseText);
                if (updatedTopics && updatedTopics.length > 0) {
                    console.log(`[Auto-Update] Found ${updatedTopics.length} topics that require updating. Processing...`);
                    
                    // Upsert the updated topics back to Supabase
                    for (const topic of updatedTopics) {
                        if(topic.id) {
                            const { error: updateError } = await supabase
                                .from('topics')
                                .update({ clinical_content: topic.clinical_content })
                                .eq('id', topic.id);
                                
                            if(updateError) {
                                console.error(`[Auto-Update] Error updating topic ${topic.topic_id}:`, updateError);
                            } else {
                                totalUpdated++;
                                console.log(`[Auto-Update] Successfully updated topic: ${topic.title} (${topic.topic_id})`);
                            }
                        }
                    }
                }
            } catch (parseErr) {
                console.error("[Auto-Update] Failed to parse JSON from AI review:", parseErr);
            }
        }
        
        console.log(`[Auto-Update] Complete. Total topics automatically revised: ${totalUpdated}`);

    } catch (error) {
        console.error("[Auto-Update Error]", error);
    }
}

module.exports = {
    autoReviewAndUpdateTopics
};
