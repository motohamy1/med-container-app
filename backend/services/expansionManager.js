const EventEmitter = require('events');
require('dotenv').config();
const { callAI } = require('./aiService');
const { searchClinicalLiterature } = require('./medicalSearchService');
const { searchCustomKnowledge } = require('./knowledgeService');
const { parseTopicSynthesis } = require('./jsonUtils');
const { harvestTopicsFromAllReferences, getCanonicalTopicsForSpecialty } = require('./referenceRegistry');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('[ExpansionEngine] SUPABASE_URL or SUPABASE_KEY missing.');
}

const SPECIALTY_META = {
    pulmonology: {
        name: 'Pulmonology & Respiratory Medicine',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    heart: {
        name: 'Cardiology',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    git: {
        name: 'Gastroenterology & Hepatology',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    neuro: {
        name: 'Neurology & Neurocritical Care',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    nephrology: {
        name: 'Nephrology & Renal Medicine',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    endocrinology: {
        name: 'Endocrinology & Metabolism',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    critical_care: {
        name: 'Emergency & Critical Care Medicine',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    pediatrics: {
        name: 'Pediatrics & Neonatal Medicine',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    hematology_oncology: {
        name: 'Hematology & Medical Oncology',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    rheumatology: {
        name: 'Rheumatology & Autoimmune Diseases',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    psychiatry: {
        name: 'Psychiatry & Behavioral Health',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    ophthalmology: {
        name: 'Ophthalmology & Visual Sciences',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    dermatology: {
        name: 'Dermatology & Skin Disorders',
        categories: [
            { id: 'emergencies', title: 'Emergencies' },
            { id: 'clinical_topics', title: 'Clinical Topics' },
            { id: 'tools', title: 'Tools & Diagnostics' },
            { id: 'research', title: 'Recent Research' }
        ]
    },
    surgical_suite: {
        name: 'Surgical Suite & Perioperative Care',
        categories: [
            { id: 'surgical_cases', title: 'Operative Cases & Scenarios' },
            { id: 'operative_steps', title: 'Operative Steps & Techniques' },
            { id: 'instruments_energy', title: 'Instruments & Devices' },
            { id: 'postop_eras', title: 'Post-Op Critical Care & ERAS' },
            { id: 'preop_risk', title: 'Pre-Op Risk Clearance' },
            { id: 'damage_control', title: 'Emergency & Damage Control Surgery' }
        ]
    }
};

class ExpansionManager extends EventEmitter {
    constructor() {
        super();
        this.reset();
    }

    reset() {
        this.jobId = null;
        this.specialtyId = null;
        this.specialtyName = '';
        this.status = 'idle'; // 'idle' | 'harvesting' | 'running' | 'paused' | 'stopped' | 'completed' | 'failed'
        this.currentTopic = null; // { id, title, category, categoryId, step, startedAt }
        this.queue = []; // Array of topic items
        this.logs = []; // Array of live logs
        this.pauseResolver = null;
        this.pausePromise = null;
        this.skipCurrentSignal = false;
        this.isStopping = false;
        this.activeCategory = '';
    }

    log(type, message, topicTitle = null) {
        const entry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toLocaleTimeString(),
            type, // 'info' | 'success' | 'warn' | 'error' | 'step'
            message,
            topicTitle
        };
        this.logs.unshift(entry);
        if (this.logs.length > 200) this.logs.pop();
        
        console.log(`[ExpansionEngine] [${type.toUpperCase()}] ${message}`);
        this.emit('update', this.getStatus());
    }

    getStatus() {
        const stats = {
            total: this.queue.length,
            completed: this.queue.filter(q => q.status === 'completed').length,
            in_progress: this.queue.filter(q => q.status === 'in_progress').length,
            pending: this.queue.filter(q => q.status === 'pending').length,
            failed: this.queue.filter(q => q.status === 'failed').length,
            skipped: this.queue.filter(q => q.status === 'skipped').length,
        };

        const progressPercent = stats.total > 0 
            ? Math.round(((stats.completed + stats.skipped) / stats.total) * 100) 
            : 0;

        return {
            jobId: this.jobId,
            specialtyId: this.specialtyId,
            specialtyName: this.specialtyName,
            status: this.status,
            activeCategory: this.activeCategory,
            currentTopic: this.currentTopic,
            progressPercent,
            stats,
            queue: this.queue,
            logs: this.logs.slice(0, 50)
        };
    }

    async start({ specialtyId, customTopics = null }) {
        if (this.status === 'running' || this.status === 'harvesting') {
            throw new Error(`An expansion mission is already actively running for ${this.specialtyId}.`);
        }

        const meta = SPECIALTY_META[specialtyId] || {
            name: specialtyId.charAt(0).toUpperCase() + specialtyId.slice(1),
            categories: [
                { id: 'emergencies', title: 'Emergencies' },
                { id: 'clinical_topics', title: 'Clinical Topics' },
                { id: 'tools', title: 'Tools & Diagnostics' },
                { id: 'research', title: 'Recent Research' }
            ]
        };

        this.reset();
        this.jobId = `job_${specialtyId}_${Date.now()}`;
        this.specialtyId = specialtyId;
        this.specialtyName = meta.name;
        this.status = 'harvesting';

        this.log('info', `🚀 Mission Control initialized for: ${meta.name}`);

        // If custom topics provided directly by admin
        if (Array.isArray(customTopics) && customTopics.length > 0) {
            this.queue = customTopics.map((t, idx) => ({
                id: `top_${Date.now()}_${idx}`,
                title: typeof t === 'string' ? t : t.title,
                category: t.category || meta.categories[0].title,
                categoryId: t.categoryId || meta.categories[0].id,
                type: t.type || 'Clinical Protocol',
                status: 'pending',
                error: null,
                processedAt: null
            }));
            this.status = 'running';
            this.log('success', `Loaded ${this.queue.length} custom topics into queue.`);
            this._runLoop().catch(err => {
                this.log('error', `Run loop encountered an error: ${err.message}`);
                this.status = 'failed';
                this.emit('update', this.getStatus());
            });
            return this.getStatus();
        }

        // Grounded Topic Collection Phase: Collect topics directly from App References and Resources
        (async () => {
            try {
                this.log('info', `📚 Collecting verified topics directly from app references, guideline databases, and resources...`);

                const harvested = await harvestTopicsFromAllReferences(specialtyId, meta.name, supabase);

                if (this.isStopping) {
                    this.status = 'stopped';
                    this.log('warn', 'Mission stopped by user during topic collection.');
                    this.emit('update', this.getStatus());
                    return;
                }

                if (harvested && harvested.length > 0) {
                    this.queue = harvested;
                    this.log('success', `🎉 Harvested ${this.queue.length} grounded topics from app references! Beginning clinical content organization...`);
                    this.status = 'running';
                    this.emit('update', this.getStatus());

                    await this._runLoop();
                } else {
                    this.log('warn', `No pre-cataloged topics found. Adding core reference protocols for ${meta.name}.`);
                    for (const cat of meta.categories) {
                        this.queue.push({
                            id: `${specialtyId}_${cat.id}_${Date.now()}`,
                            title: `${meta.name} - ${cat.title} Core Protocol`,
                            category: cat.title,
                            categoryId: cat.id,
                            type: 'Clinical Guideline',
                            status: 'pending',
                            error: null,
                            processedAt: null
                        });
                    }
                    this.status = 'running';
                    this.emit('update', this.getStatus());
                    await this._runLoop();
                }
            } catch (err) {
                this.status = 'failed';
                this.log('error', `Topic harvesting failed: ${err.message}`);
                this.emit('update', this.getStatus());
            }
        })();

        return this.getStatus();
    }

    pause() {
        if (this.status !== 'running') return this.getStatus();
        this.status = 'paused';
        this.pausePromise = new Promise((resolve) => {
            this.pauseResolver = resolve;
        });
        this.log('warn', '⏸ Expansion paused by user.');
        this.emit('update', this.getStatus());
        return this.getStatus();
    }

    resume() {
        if (this.status !== 'paused') return this.getStatus();
        this.status = 'running';
        if (this.pauseResolver) {
            this.pauseResolver();
            this.pauseResolver = null;
            this.pausePromise = null;
        }
        this.log('info', '▶ Expansion resumed.');
        this.emit('update', this.getStatus());
        return this.getStatus();
    }

    stop() {
        this.isStopping = true;
        this.status = 'stopped';
        this.skipCurrentSignal = true;
        if (this.pauseResolver) {
            this.pauseResolver();
            this.pauseResolver = null;
            this.pausePromise = null;
        }
        this.log('error', '⏹ Mission stopped by user.');
        this.emit('update', this.getStatus());
        return this.getStatus();
    }

    skipTopic(topicId = null) {
        if (!topicId || (this.currentTopic && this.currentTopic.id === topicId)) {
            if (this.currentTopic) {
                this.skipCurrentSignal = true;
                const item = this.queue.find(q => q.id === this.currentTopic.id);
                if (item) {
                    item.status = 'skipped';
                    item.error = 'Skipped by user';
                }
                this.log('warn', `⏭ Skipping active topic: "${this.currentTopic.title}"`, this.currentTopic.title);
            }
            return this.getStatus();
        }

        const item = this.queue.find(q => q.id === topicId);
        if (item) {
            item.status = 'skipped';
            item.error = 'Skipped by user';
            this.log('warn', `⏭ Topic marked as skipped: "${item.title}"`, item.title);
            this.emit('update', this.getStatus());
        }
        return this.getStatus();
    }

    retryTopic(topicId) {
        const item = this.queue.find(q => q.id === topicId);
        if (!item) return this.getStatus();

        item.status = 'pending';
        item.error = null;
        item.processedAt = null;
        this.log('info', `🔄 Topic requeued for ingestion: "${item.title}"`, item.title);

        if (this.status === 'idle' || this.status === 'stopped' || this.status === 'completed') {
            this.status = 'running';
            this.isStopping = false;
            this._runLoop().catch(err => {
                this.log('error', `Run loop error on retry: ${err.message}`);
            });
        }

        this.emit('update', this.getStatus());
        return this.getStatus();
    }

    addTopic({ title, categoryId, categoryTitle }) {
        if (!title || !title.trim()) return this.getStatus();

        const newItem = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            title: title.trim(),
            category: categoryTitle || 'Clinical Topics',
            categoryId: categoryId || 'clinical_topics',
            type: 'Clinical Guideline',
            status: 'pending',
            error: null,
            processedAt: null
        };

        this.queue.push(newItem);
        this.log('info', `➕ Added topic to queue: "${newItem.title}"`, newItem.title);

        if (this.status === 'completed' || this.status === 'idle') {
            this.status = 'running';
            this.isStopping = false;
            this._runLoop().catch(err => {
                this.log('error', `Run loop error after adding topic: ${err.message}`);
            });
        }

        this.emit('update', this.getStatus());
        return this.getStatus();
    }

    removeTopic(topicId) {
        const idx = this.queue.findIndex(q => q.id === topicId);
        if (idx !== -1) {
            const removed = this.queue.splice(idx, 1)[0];
            this.log('info', `🗑 Removed topic from queue: "${removed.title}"`);
            this.emit('update', this.getStatus());
        }
        return this.getStatus();
    }

    async _runLoop() {
        while (this.queue.some(q => q.status === 'pending')) {
            if (this.isStopping || this.status === 'stopped') {
                this.status = 'stopped';
                break;
            }

            if (this.status === 'paused' && this.pausePromise) {
                await this.pausePromise;
            }

            const item = this.queue.find(q => q.status === 'pending');
            if (!item) break;

            item.status = 'in_progress';
            this.activeCategory = item.category;
            this.currentTopic = {
                id: item.id,
                title: item.title,
                category: item.category,
                categoryId: item.categoryId,
                step: 'Retrieving reference documents & literature...',
                startedAt: Date.now()
            };
            this.skipCurrentSignal = false;
            this.emit('update', this.getStatus());

            try {
                await this._processSingleTopic(item);
            } catch (topicErr) {
                if (this.skipCurrentSignal) {
                    item.status = 'skipped';
                    item.error = 'Skipped by user';
                } else {
                    item.status = 'failed';
                    item.error = topicErr.message;
                    this.log('error', `Failed on topic "${item.title}": ${topicErr.message}`, item.title);
                }
            } finally {
                item.processedAt = new Date().toISOString();
                this.currentTopic = null;
                this.emit('update', this.getStatus());
            }
        }

        if (!this.isStopping && this.status !== 'stopped') {
            this.status = 'completed';
            const comp = this.queue.filter(q => q.status === 'completed').length;
            this.log('success', `🏁 Ingestion Mission Complete! Successfully organized ${comp} topics from references.`);
        }

        this.emit('update', this.getStatus());
    }

    async _processSingleTopic(item) {
        const start = Date.now();
        
        // Step 1: Gather Reference Evidence & Clinical Literature
        this.log('step', `[1/3] Gathering reference evidence for "${item.title}"...`, item.title);
        this.currentTopic.step = 'Gathering reference excerpts and guidelines...';
        this.emit('update', this.getStatus());

        if (this.skipCurrentSignal) throw new Error('Skipped by user');

        // 1a. Query local vector database / custom knowledge
        let referenceChunks = [];
        try {
            referenceChunks = await searchCustomKnowledge(item.title, 4, 0.45);
        } catch (_) {}

        // 1b. Query verified clinical literature (PubMed / Europe PMC / FDA)
        let litResults = [];
        try {
            litResults = await searchClinicalLiterature(item.title, this.specialtyName);
        } catch (_) {}

        if (this.skipCurrentSignal) throw new Error('Skipped by user');

        // Step 2: AI Model organizes, collects, and structures topic items based on references
        this.log('step', `[2/3] AI model organizing and structuring protocol items for "${item.title}"...`, item.title);
        this.currentTopic.step = 'Structuring clinical items from reference evidence...';
        this.emit('update', this.getStatus());

        // Format gathered references into concrete excerpts for the model
        const referenceEvidenceTexts = [];
        if (referenceChunks && referenceChunks.length > 0) {
            referenceChunks.forEach((c, idx) => {
                referenceEvidenceTexts.push(`[App Knowledge Excerpt ${idx + 1} - ${c.title || 'Guideline'}]\n${c.content || c.text || ''}`);
            });
        }
        if (litResults && litResults.length > 0) {
            litResults.forEach((l, idx) => {
                referenceEvidenceTexts.push(`[Medical Literature ${idx + 1} - ${l.source || 'PubMed'} (${l.year || 'Latest'})]\nTitle: ${l.title}\nJournal: ${l.journal || 'Peer Reviewed'}\nEvidence: ${l.snippet || l.abstract || ''}`);
            });
        }

        const formattedEvidence = referenceEvidenceTexts.length > 0
            ? referenceEvidenceTexts.join('\n\n')
            : 'Standard International Clinical Practice Guidelines & Consensus Protocols.';

        const systemPrompt = `You are an Evidence-Based Medical Knowledge Compiler and Clinical Content Organizer for Med Arena.
YOUR ROLE:
You do NOT invent topics or guess facts. Your role is strictly to collect, extract, organize, synthesize, and structure the clinical items for the given topic based on the provided reference evidence and international clinical guidelines.

MANDATORY STRUCTURAL RULES:
1. Organize the topic into exactly 7 standardized clinical sections in "clinical_content".
2. Every item must be precise: include exact medication names, exact dosages (mg/kg or fixed dose), routes (IV/PO/SC), frequencies, diagnostic criteria cutoffs, and stepwise algorithms.
3. Incorporate critical safety warnings, pitfalls, and malpractice traps.
4. Conclude with verifiable guideline and trial citations in the citations section.

Output MUST be a pure JSON object conforming to this exact schema:
{
  "title": "${item.title}",
  "subtitle": "Informative clinical subtitle (e.g., Workup, Scoring & Dosing)",
  "type": "${item.category}",
  "ai_scope_description": "Precise clinical scope summary for retrieval",
  "clinical_content": [
    { "title": "Clinical Definition & Overview", "content": "Pathophysiology, epidemiology, and core clinical manifestations..." },
    { "title": "Immediate Triage & Red Flags", "content": "Vital sign thresholds, ominous symptoms, and emergency red flags..." },
    { "title": "Diagnostic Criteria & Scoring Systems", "content": "Validated scoring criteria, laboratory cutoffs, and imaging findings..." },
    { "title": "First-Line Pharmacotherapy & Exact Dosing", "content": "Exact medications, loading/maintenance doses, routes, and duration..." },
    { "title": "Stepwise Management Algorithm", "content": "Numbered 1-2-3 step-by-step clinical workflow..." },
    { "title": "Clinical Pitfalls & Malpractice Warnings", "content": "Critical contraindications, diagnostic traps, and dangerous mistakes..." },
    { "title": "Exact Reference & Guideline Citations", "content": "Official society guidelines (AHA/ACC, GINA, GOLD, ACG, etc.) and landmark trials..." }
  ]
}
No conversational wrapper, no markdown blocks, output pure JSON only.`;

        const userPrompt = `Topic to organize: "${item.title}"
Specialty: ${this.specialtyName}
Category: ${item.category}

VERIFIED REFERENCE EVIDENCE & GUIDELINES:
${formattedEvidence}`;

        const rawAI = await callAI(systemPrompt, userPrompt);

        if (this.skipCurrentSignal) throw new Error('Skipped by user');

        // Step 3: Save Organized Protocol to Supabase
        this.log('step', `[3/3] Saving verified protocol for "${item.title}" to database...`, item.title);
        this.currentTopic.step = 'Saving structured protocol to database...';
        this.emit('update', this.getStatus());

        const cleaned = parseTopicSynthesis(rawAI, item.title, item.category);

        const topicIdSlug = item.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .substring(0, 60);

        if (supabase) {
            // Save to specialty_topics
            const { error: specError } = await supabase.from('specialty_topics').upsert({
                specialty_id: this.specialtyId,
                category_id: item.categoryId,
                topic_id: topicIdSlug,
                title: cleaned.title,
                subtitle: cleaned.subtitle,
                type: cleaned.type,
                ai_scope_description: cleaned.ai_scope_description,
                clinical_content: cleaned.clinical_content,
                updated_at: new Date().toISOString()
            }, { onConflict: 'specialty_id,topic_id' });

            if (specError) {
                console.warn(`[ExpansionEngine] Supabase specialty_topics save note: ${specError.message}`);
            }

            // Save to topics table for backwards-compatibility
            try {
                await supabase.from('topics').upsert({
                    id: `${this.specialtyId}_${item.categoryId}_${topicIdSlug}`,
                    specialty_id: this.specialtyId,
                    category_id: item.categoryId,
                    title: cleaned.title,
                    subtitle: cleaned.subtitle,
                    type: cleaned.type,
                    ai_scope_description: cleaned.ai_scope_description,
                    clinical_content: cleaned.clinical_content
                });
            } catch (_) {}
        }

        item.status = 'completed';
        item.durationMs = Date.now() - start;
        this.log('success', `✅ Organised & Stored: "${cleaned.title}" (${Math.round(item.durationMs / 1000)}s)`, cleaned.title);
    }
}

// Singleton instance
const expansionManager = new ExpansionManager();

module.exports = {
    expansionManager,
    SPECIALTY_META
};
