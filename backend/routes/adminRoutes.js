const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const { ingestKnowledge } = require('../services/knowledgeService');
const { autoReviewAndUpdateTopics } = require('../services/knowledgeUpdateService');
const { extractAndCompileTopicsFromResource } = require('../services/referenceTopicMiner');
const AutonomousScientist = require('../services/autonomousScientistService');
const { expansionManager, SPECIALTY_META } = require('../services/expansionManager');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configure multer for PDF uploads (store in memory for immediate processing)
const upload = multer({ storage: multer.memoryStorage() });

// Global maps to hold active SSE connections
const clients = new Map();
const scientistClients = new Map();
const expansionClients = new Map();

/**
 * SSE Endpoint for Scientist Mission Progress (Legacy & Generic)
 */
router.get('/scientist/mission-progress', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('data: {"status": "connected"}\n\n');

    const clientId = Date.now();
    scientistClients.set(clientId, res);

    req.on('close', () => {
        scientistClients.delete(clientId);
    });
});

/**
 * SSE Endpoint for Real-time Expansion Mission Control Stream
 */
router.get('/scientist/expansion/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial current state immediately
    const initialState = expansionManager.getStatus();
    res.write(`data: ${JSON.stringify(initialState)}\n\n`);

    const clientId = Date.now() + Math.random();
    expansionClients.set(clientId, res);

    req.on('close', () => {
        expansionClients.delete(clientId);
    });
});

// Broadcast listener from expansionManager
expansionManager.on('update', (state) => {
    // Send to expansionClients
    expansionClients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify(state)}\n\n`);
        } catch (_) {}
    });

    // Also forward to scientistClients
    scientistClients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify(state)}\n\n`);
        } catch (_) {}
    });
});

/**
 * Helper to broadcast scientist progress
 */
function broadcastScientistProgress(update) {
    scientistClients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify(update)}\n\n`);
        } catch (_) {}
    });
}

/**
 * SSE Endpoint to stream real-time progress to the Admin Dashboard (File / URL Ingestion)
 */
router.get('/progress/:jobId', (req, res) => {
    const { jobId } = req.params;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ status: 'connected', processed: 0, total: 0 })}\n\n`);

    // Store the response object to push updates later
    clients.set(jobId, res);

    req.on('close', () => {
        clients.delete(jobId);
    });
});

/**
 * Helper function to push progress updates
 */
function sendProgress(jobId, processed, total, status = 'processing') {
    const client = clients.get(jobId);
    if (client) {
        client.write(`data: ${JSON.stringify({ processed, total, status })}\n\n`);
    }
}

/**
 * Master Ingestion Endpoint
 * Supports: PDF File Uploads, Raw Text, and URLs
 */
router.post('/ingest', upload.single('file'), async (req, res) => {
    try {
        const { 
            title, 
            url, 
            rawText, 
            jobId,
            guidelineSociety = 'OTHER',
            publicationYear = new Date().getFullYear(),
            versionTag = '',
            pmid = ''
        } = req.body;
        
        if (!jobId) {
            return res.status(400).json({ error: "Missing jobId for progress tracking." });
        }

        let textToIngest = '';
        let sourceUrl = url || '';

        // 1. Handle PDF Upload
        if (req.file && req.file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(req.file.buffer);
            textToIngest = pdfData.text;
        } 
        // 2. Handle URL Scraping
        else if (url && !rawText) {
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);
            $('script, style, nav, footer, header, noscript, iframe').remove();
            textToIngest = $('body').text().replace(/\s+/g, ' ').trim();
        } 
        // 3. Handle Raw Text / Textbox
        else if (rawText) {
            textToIngest = rawText;
        }

        if (!textToIngest || textToIngest.length < 50) {
            return res.status(400).json({ error: "Failed to extract sufficient text from the provided resource." });
        }

        // Return immediately to the client so they can connect to SSE
        res.json({ message: "Ingestion started", jobId });

        // Process in the background (Non-blocking)
        console.log(`[Admin] Background ingestion started for job: ${jobId} | Society: ${guidelineSociety} | Year: ${publicationYear}`);
        await ingestKnowledge(
            title || "Untitled Guideline", 
            textToIngest, 
            sourceUrl,
            (processed, total) => sendProgress(jobId, processed, total),
            {
                guidelineSociety,
                publicationYear: parseInt(publicationYear) || 2024,
                versionTag: versionTag || `${guidelineSociety} ${publicationYear}`,
                pmid
            }
        );

        // Notify client that job is complete
        sendProgress(jobId, 1, 1, 'complete');

        // Trigger Auto-Update Pipeline
        console.log(`[Admin] Kicking off Auto-Update Pipeline for resource: ${title || sourceUrl}`);
        autoReviewAndUpdateTopics(textToIngest, title || sourceUrl).catch(err => {
            console.error("[Admin] Auto-Update Pipeline failed:", err);
        });

        // Trigger Reference Topic Extraction Pipeline
        console.log(`[Admin] Kicking off Reference Topic Extraction for resource: ${title || sourceUrl}`);
        extractAndCompileTopicsFromResource(title || sourceUrl, textToIngest).catch(err => {
            console.error("[Admin] Topic Extraction Pipeline failed:", err);
        });

    } catch (error) {
        console.error("[Admin Ingest Error]", error);
        res.status(500).json({ error: "Ingestion failed: " + error.message });
    }
});

// =========================================================================
// INTERACTIVE SPECIALTY EXPANSION MISSION CONTROL ENDPOINTS
// =========================================================================

/**
 * Get the current expansion mission state
 */
router.get('/scientist/expansion/status', (req, res) => {
    res.json(expansionManager.getStatus());
});

/**
 * Start an expansion mission
 */
router.post('/scientist/expansion/start', async (req, res) => {
    const { specialtyId, customTopics } = req.body;
    if (!specialtyId) {
        return res.status(400).json({ error: "Missing specialtyId." });
    }

    try {
        const state = await expansionManager.start({ specialtyId, customTopics });
        res.json({ success: true, state });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * Pause the active expansion
 */
router.post('/scientist/expansion/pause', (req, res) => {
    const state = expansionManager.pause();
    res.json({ success: true, state });
});

/**
 * Resume the paused expansion
 */
router.post('/scientist/expansion/resume', (req, res) => {
    const state = expansionManager.resume();
    res.json({ success: true, state });
});

/**
 * Stop the expansion mission
 */
router.post('/scientist/expansion/stop', (req, res) => {
    const state = expansionManager.stop();
    res.json({ success: true, state });
});

/**
 * Skip the active topic or a specific pending topic
 */
router.post('/scientist/expansion/skip', (req, res) => {
    const { topicId } = req.body;
    const state = expansionManager.skipTopic(topicId);
    res.json({ success: true, state });
});

/**
 * Retry a failed or skipped topic
 */
router.post('/scientist/expansion/retry', (req, res) => {
    const { topicId } = req.body;
    if (!topicId) {
        return res.status(400).json({ error: "Missing topicId." });
    }
    const state = expansionManager.retryTopic(topicId);
    res.json({ success: true, state });
});

/**
 * Add a custom topic into the active queue
 */
router.post('/scientist/expansion/add-topic', (req, res) => {
    const { title, categoryId, categoryTitle } = req.body;
    if (!title) {
        return res.status(400).json({ error: "Missing topic title." });
    }
    const state = expansionManager.addTopic({ title, categoryId, categoryTitle });
    res.json({ success: true, state });
});

/**
 * Remove a topic from the queue
 */
router.post('/scientist/expansion/remove', (req, res) => {
    const { topicId } = req.body;
    if (!topicId) {
        return res.status(400).json({ error: "Missing topicId." });
    }
    const state = expansionManager.removeTopic(topicId);
    res.json({ success: true, state });
});

// Legacy trigger
router.post('/scientist/expand/:specialtyId', async (req, res) => {
    const { specialtyId } = req.params;
    try {
        const state = await expansionManager.start({ specialtyId });
        res.json({ message: `Expansion mission started for ${specialtyId}.`, state });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// =========================================================================
// SCIENTIST QUEUE & LEDGER ENDPOINTS
// =========================================================================

/**
 * Trigger Autonomous Scientist Research Cycle
 */
router.post('/scientist/trigger', async (req, res) => {
    try {
        console.log('[Admin] Manually triggering Autonomous Scientist cycle...');
        AutonomousScientist.runResearchCycle().catch(err => {
            console.error('[Admin Scientist] Background cycle failed:', err);
        });

        res.json({ message: "Research cycle started in background." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Fetch the Scientist's Research Ledger (Mission Log)
 */
router.get('/scientist/ledger', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('scientific_ledger')
            .select('*')
            .order('occurred_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Fetch pending knowledge updates from the queue
 */
router.get('/scientist/queue', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('knowledge_review_queue')
            .select('*')
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Approve and Apply a knowledge update from the queue
 */
router.post('/scientist/approve/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[Admin] Manually approving update ID: ${id}`);
        const result = await AutonomousScientist.applyUpdate(id);
        res.json(result);
    } catch (error) {
        console.error('[Admin Scientist] Approval failed:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Reject a knowledge update
 */
router.post('/scientist/reject/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await supabase
            .from('knowledge_review_queue')
            .update({ status: 'REJECTED' })
            .eq('id', id);

        res.json({ success: true, message: "Proposal rejected." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    router,
    broadcastScientistProgress
};
