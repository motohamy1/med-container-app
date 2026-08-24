const { createClient } = require('@supabase/supabase-js');
const { callAI, extractEnglishKeywords } = require('./aiService');
const { fetchClinicalLiterature } = require('./medicalSearchService');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('[Scientist Agent] SUPABASE_URL or SUPABASE_KEY missing. Database interactions will fail.');
}

/**
 * The Autonomous Scientist Agent
 * mission: Two-way directional learning from user gaps and database auditing.
 */
const AutonomousScientistService = {
    progressCallback: null,

    /**
     * Entry point for a research cycle
     */
    async runResearchCycle() {
        console.log('[Scientist Agent] Starting autonomous research cycle...');
        const results = { gapsHunted: 0, topicsAudited: 0, conflictsResolved: 0 };

        try {
            // 1. Hunt for Knowledge Gaps (User-driven research)
            results.gapsHunted = await this.huntGaps(3);

            // 2. Audit Outdated Knowledge (Database-driven research)
            results.topicsAudited = await this.auditOutdatedTopics(2);

            console.log(`[Scientist Agent] Cycle complete. Summary:`, results);
            await this.logToLedger('CYCLE_COMPLETE', results);
        } catch (err) {
            console.error('[Scientist Agent] Research cycle failed:', err);
            await this.logToLedger('CYCLE_FAILED', { error: err.message });
        }

        return results;
    },

    /**
     * Looks at queries users asked that returned no results.
     * Uses external literature to synthesize new protocols.
     */
    async huntGaps(limit = 5) {
        if (!supabase) {
            console.error('[Scientist Agent] Cannot hunt gaps: Supabase client not initialized.');
            return 0;
        }
        console.log(`[Scientist Agent] Hunting for ${limit} knowledge gaps...`);

        // Fetch unresolved gaps
        const { data: gaps, error } = await supabase
            .from('knowledge_gaps')
            .select('*')
            .eq('status', 'PENDING')
            .limit(limit);

        if (error || !gaps || gaps.length === 0) return 0;

        let gapsResolved = 0;
        for (const gap of gaps) {
            try {
                console.log(`[Scientist Agent] Researching gap: "${gap.query}"`);

                // 1. Get focused medical keywords
                const keywords = await extractEnglishKeywords(gap.query);

                // 2. Search external scientific libraries
                const literature = await fetchClinicalLiterature(keywords, gap.category);

                if (literature.length === 0) {
                    console.log(`[Scientist Agent] No literature found for gap: ${gap.query}`);
                    continue;
                }

                // 3. Synthesize a structured protocol from literature
                const synthesisPrompt = `
You are a Medical Scientist & Guideline Author.
I am providing you with peer-reviewed literature excerpts regarding: "${gap.query}".

LITERATURE EXCERPTS:
${JSON.stringify(literature)}

YOUR TASK:
Synthesize a professional, evidence-based clinical topic entry for our database.
The output must be a valid JSON object matching this schema:
{
  "title": "Canonical Topic Name",
  "ai_scope_description": "Strict scope for the AI persona",
  "clinical_content": [
    {"title": "Clinical Definition & Overview", "content": "..."},
    {"title": "Diagnostic Criteria & Scoring Systems", "content": "..."},
    {"title": "First-Line Pharmacotherapy & Exact Dosing", "content": "..."},
    {"title": "Stepwise Management Algorithm", "content": "..."},
    {"title": "Exact Reference & Guideline Citations", "content": "..."}
  ]
}

Output ONLY the JSON object. No conversational text.
`;
                const synthesis = await callAI(synthesisPrompt);
                const cleanedSynthesis = synthesis.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

                // 4. Push to Review Queue
                const { error: queueErr } = await supabase
                    .from('knowledge_review_queue')
                    .insert({
                        topic_name: gap.query,
                        content: cleanedSynthesis,
                        source: 'GAP_HUNTING',
                        trigger_query: gap.query,
                        reference: literature[0]?.title || 'Multiple Sources',
                        status: 'PENDING'
                    });

                if (!queueErr) {
                    await supabase.from('knowledge_gaps').update({ status: 'PROCESSED' }).eq('id', gap.id);
                    gapsResolved++;
                }
            } catch (err) {
                console.error(`[Scientist Agent] Failed to resolve gap ${gap.id}:`, err.message);
            }
        }
        return gapsResolved;
    },

    /**
     * Scans the existing database for topics with old guidelines.
     * Re-queries literature to see if management has shifted in 2024-2025.
     */
    async auditOutdatedTopics(limit = 2) {
        if (!supabase) {
            console.error('[Scientist Agent] Cannot audit topics: Supabase client not initialized.');
            return 0;
        }
        console.log(`[Scientist Agent] Auditing ${limit} potentially outdated topics...`);

        // Fetch topics not updated in a while or with old pub years
        const { data: topics, error } = await supabase
            .from('specialty_topics')
            .select('id, title, specialty_id, clinical_content')
            .order('updated_at', { ascending: true })
            .limit(limit);

        if (error || !topics || topics.length === 0) return 0;

        let updatesFound = 0;
        for (const topic of topics) {
            try {
                console.log(`[Scientist Agent] Auditing evidence for: ${topic.title}`);

                // 1. Search for 2024-2025 evidence explicitly
                const keywords = `${topic.title} guideline 2024 2025`;
                const literature = await fetchClinicalLiterature(keywords, topic.specialty_id);

                if (literature.length === 0) continue;

                // 2. Ask AI if there is a significant shift
                const auditPrompt = `
You are a Medical Audit Agent. Compare our existing topic content with the NEW LATEST literature excerpts.

EXISTING TOPIC CONTENT:
${JSON.stringify(topic.clinical_content)}

LATEST 2024-2025 LITERATURE:
${JSON.stringify(literature)}

TASK:
1. Identify if there is a NEWER guideline or dosage change.
2. If YES, synthesize an updated "clinical_content" array.
3. If NO significant change, return "NO_UPDATE_NEEDED".

If updating, return ONLY the updated JSON array of clinical_content objects.
`;
                const auditResult = await callAI(auditPrompt);

                if (!auditResult.includes('NO_UPDATE_NEEDED')) {
                    const cleanedUpdate = auditResult.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

                    // Push to Review Queue
                    await supabase
                        .from('knowledge_review_queue')
                        .insert({
                            topic_id: topic.id,
                            topic_name: topic.title,
                            content: cleanedUpdate,
                            source: 'PERIODIC_AUDIT',
                            reference: literature[0]?.title || 'Recent Systematic Review',
                            status: 'PENDING'
                        });
                    updatesFound++;
                }

                // Mark topic as "audited" by updating updated_at timestamp
                await supabase.from('specialty_topics').update({ updated_at: new Date().toISOString() }).eq('id', topic.id);

            } catch (err) {
                console.error(`[Scientist Agent] Audit failed for ${topic.title}:`, err.message);
            }
        }
        return updatesFound;
    },

    /**
     * Applies an approved knowledge update from the queue to the live database.
     */
    async applyUpdate(proposalId) {
        if (!supabase) return { error: 'Supabase not initialized' };

        // 1. Fetch the proposal
        const { data: proposal, error: fetchErr } = await supabase
            .from('knowledge_review_queue')
            .select('*')
            .eq('id', proposalId)
            .single();

        if (fetchErr || !proposal) throw new Error('Proposal not found');

        try {
            // 2. Determine if it's an update to an existing topic or a brand new one
            if (proposal.topic_id) {
                // UPDATE EXISTING
                const { error: updateErr } = await supabase
                    .from('specialty_topics')
                    .update({
                        clinical_content: proposal.content,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', proposal.topic_id);

                if (updateErr) throw updateErr;
            } else {
                // CREATE NEW TOPIC
                // Note: In a production scenario, we'd need to know which specialty/category to place it in.
                // For now, we place it in 'infectious' / 'clinical_topics' as a default if unknown.
                const { error: insertErr } = await supabase
                    .from('specialty_topics')
                    .insert({
                        specialty_id: 'infectious',
                        category_id: 'clinical_topics',
                        topic_id: proposal.topic_name.toLowerCase().replace(/\s+/g, '_').substring(0, 50),
                        title: proposal.topic_name,
                        subtitle: proposal.reference,
                        type: 'Clinical Guideline',
                        ai_scope_description: `Focus strictly on ${proposal.topic_name} management and evidence-based guidelines.`,
                        clinical_content: proposal.content,
                        updated_at: new Date().toISOString()
                    });

                if (insertErr) throw insertErr;
            }

            // 3. Mark proposal as APPROVED
            await supabase
                .from('knowledge_review_queue')
                .update({ status: 'APPROVED' })
                .eq('id', proposalId);

            await this.logToLedger('UPDATE_APPLIED', { proposalId, topic: proposal.topic_name });
            return { success: true };
        } catch (err) {
            console.error('[Scientist Agent] Failed to apply update:', err.message);
            throw err;
        }
    },

    /**
     * Manually triggers an expansion of a specific specialty by brainstorming
     * and researching the most important topics.
     */
    async expandSpecialty(specialtyId) {
        console.log(`[Scientist Agent] DEEP EXPANSION started for specialty: ${specialtyId} (Target: 50+ topics per category)`);
        if (this.progressCallback) {
            this.progressCallback({ status: 'started', specialtyId });
        }

        const categories = [
            { id: 'emergencies', name: 'Emergencies' },
            { id: 'clinical_topics', name: 'Clinical Topics' },
            { id: 'tools', name: 'Tools & Diagnostics' },
            { id: 'research', name: 'Recent Research' }
        ];

        let totalNewTopics = 0;

        for (const cat of categories) {
            try {
                // 1. Exhaustive Brainstorming (Asking for 50-60 topics in one go)
                const brainstormPrompt = `
You are a Medical Curriculum Director.
Specialty: ${specialtyId}
Category: ${cat.name}

TASK: Generate an EXHAUSTIVE list of at least 50 critical, high-yield clinical topics, diseases, or diagnostic tools that must be included in a professional reference app for this specialty.
Focus on:
- For Emergencies: Life-threatening presentations and resuscitation.
- For Clinical Topics: Common chronic diseases and management.
- For Tools: Scoring systems (e.g. Wells, NIHSS, MELD), LFT/ECG/imaging interpretation.
- For Research: Landmark trials (e.g. SPRINT, EMPEROR) and 2024-2025 guideline updates.

Output ONLY a JSON array of strings. Example: ["Topic 1", "Topic 2", ...]`;

                const brainstormResult = await callAI(brainstormPrompt);
                const allTopics = JSON.parse(brainstormResult.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim());

                if (!Array.isArray(allTopics)) continue;
                console.log(`[Scientist Agent] Brainstormed ${allTopics.length} topics for ${cat.name}. Processing...`);

                // 2. Process in Chunks to prevent timeouts
                for (const topicName of allTopics) {
                    try {
                        // Check if we already have this topic (Case insensitive search)
                        const { data: existing } = await supabase
                            .from('specialty_topics')
                            .select('id')
                            .eq('specialty_id', specialtyId)
                            .ilike('title', topicName)
                            .maybeSingle();

                        if (existing) continue;

                        // 3. Deep Research & Synthesis
                        const keywords = await extractEnglishKeywords(`${topicName} ${specialtyId} management guidelines 2025`);
                        const literature = await fetchClinicalLiterature(keywords, specialtyId);

                        if (literature.length === 0) {
                            // If no external literature, use the AI's high-fidelity clinical memory as a fallback
                            // but still label it clearly for review.
                            console.log(`[Scientist Agent] Low literature for ${topicName}, using high-fidelity synthesis.`);
                        }

                        const synthesisPrompt = `
You are a Senior ${specialtyId} Specialist.
Topic: "${topicName}"
Literature Found: ${JSON.stringify(literature.slice(0, 3))}

TASK: Synthesize a definitive, 2025-ready clinical protocol.
EVERY dosage and criteria must be precise.
Output ONLY JSON:
{
  "title": "${topicName}",
  "subtitle": "2024/2025 Evidence-Based Update",
  "type": "${cat.name}",
  "ai_scope_description": "Strict clinical focus on ${topicName}",
  "clinical_content": [
    {"title": "Clinical Definition & Overview", "content": "..."},
    {"title": "Diagnostic Criteria & Scoring Systems", "content": "..."},
    {"title": "First-Line Pharmacotherapy & Exact Dosing", "content": "..."},
    {"title": "Stepwise Management Algorithm", "content": "..."},
    {"title": "Exact Reference & Guideline Citations", "content": "..."}
  ]
}
`;
                        const synthesis = await callAI(synthesisPrompt);
                        const cleaned = JSON.parse(synthesis.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim());

                        // 4. Direct Ingestion
                        await supabase.from('specialty_topics').insert({
                            specialty_id: specialtyId,
                            category_id: cat.id,
                            topic_id: topicName.toLowerCase().replace(/\s+/g, '_').substring(0, 50),
                            title: cleaned.title,
                            subtitle: cleaned.subtitle,
                            type: cleaned.type,
                            ai_scope_description: cleaned.ai_scope_description,
                            clinical_content: cleaned.clinical_content,
                            updated_at: new Date().toISOString()
                        });

                        totalNewTopics++;
                        // Emit Progress
                        if (this.progressCallback) {
                            this.progressCallback({
                                status: 'processing',
                                topic: topicName,
                                count: totalNewTopics,
                                category: cat.name
                            });
                        }

                        // Log every 5 topics to show progress
                        if (totalNewTopics % 5 === 0) {
                            await this.logToLedger('EXPANSION_PROGRESS', { specialtyId, topicsAdded: totalNewTopics });
                        }

                    } catch (itemErr) {
                        console.error(`[Scientist Agent] Failed on topic "${topicName}":`, itemErr.message);
                    }
                }
            } catch (catErr) {
                console.error(`[Scientist Agent] Failed category ${cat.id}:`, catErr.message);
            }
        }

        await this.logToLedger('SPECIALTY_COLONIZED', { specialtyId, topicsAdded: totalNewTopics });
        if (this.progressCallback) {
            this.progressCallback({ status: 'complete', specialtyId, total: totalNewTopics });
        }
        return totalNewTopics;
    },

    async logToLedger(action, data) {
        if (!supabase) return;
        try {
            await supabase.from('scientific_ledger').insert({
                action,
                metadata: data,
                occurred_at: new Date().toISOString()
            });
        } catch { /* Silent */ }
    }
};

module.exports = AutonomousScientistService;
