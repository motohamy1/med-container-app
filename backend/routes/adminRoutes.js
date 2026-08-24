const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const { ingestKnowledge } = require('../services/knowledgeService');
const { autoReviewAndUpdateTopics } = require('../services/knowledgeUpdateService');
const { extractAndCompileTopicsFromResource } = require('../services/referenceTopicMiner');
const AutonomousScientist = require('../services/autonomousScientistService');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configure multer for PDF uploads (store in memory for immediate processing)
const upload = multer({ storage: multer.memoryStorage() });

// Global map to hold active SSE connections for progress tracking
const clients = new Map();
// Scientist SSE connections
const scientistClients = new Map();

/**
 * SSE Endpoint for Scientist Mission Progress
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
 * Helper to broadcast scientist progress
 */
function broadcastScientistProgress(update) {
    scientistClients.forEach(client => {
        client.write(`data: ${JSON.stringify(update)}\n\n`);
    });
}

/**
 * SSE Endpoint to stream real-time progress to the Admin Dashboard
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
            // Using dynamic import for node-fetch or native fetch in Node 18+
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);
            // Advanced scraping: strip out nav, footer, scripts, styles
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
            // Progress Callback
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

        // 4. Trigger Auto-Update Pipeline (Background task to review and critique existing specialty topics)
        console.log(`[Admin] Kicking off Auto-Update Pipeline for resource: ${title || sourceUrl}`);
        autoReviewAndUpdateTopics(textToIngest, title || sourceUrl).catch(err => {
            console.error("[Admin] Auto-Update Pipeline failed:", err);
        });

        // 5. Trigger Reference Topic Extraction & Compilation Pipeline (Discovers new conditions from this resource)
        console.log(`[Admin] Kicking off Reference Topic Extraction for resource: ${title || sourceUrl}`);
        extractAndCompileTopicsFromResource(title || sourceUrl, textToIngest).catch(err => {
            console.error("[Admin] Topic Extraction Pipeline failed:", err);
        });

    } catch (error) {
        console.error("[Admin Ingest Error]", error);
        res.status(500).json({ error: "Ingestion failed: " + error.message });
    }
});

/**
 * Trigger Autonomous Scientist Research Cycle
 */
router.post('/scientist/trigger', async (req, res) => {
    try {
        console.log('[Admin] Manually triggering Autonomous Scientist cycle...');
        // Run in background
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

/**
 * Manually trigger knowledge expansion for a specific specialty
 */
router.post('/scientist/expand/:specialtyId', async (req, res) => {
    const { specialtyId } = req.params;
    try {
        console.log(`[Admin] Triggering expansion for: ${specialtyId}`);
        // Run in background
        AutonomousScientist.expandSpecialty(specialtyId).catch(err => {
            console.error('[Admin Scientist] Expansion failed:', err);
        });

        res.json({ message: `Expansion mission started for ${specialtyId}. Check ledger for progress.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    router,
    broadcastScientistProgress
};
