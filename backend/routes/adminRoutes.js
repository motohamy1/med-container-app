const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const { ingestKnowledge } = require('../services/knowledgeService');
const { autoReviewAndUpdateTopics } = require('../services/knowledgeUpdateService');

// Configure multer for PDF uploads (store in memory for immediate processing)
const upload = multer({ storage: multer.memoryStorage() });

// Global map to hold active SSE connections for progress tracking
const clients = new Map();

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
        const { title, url, rawText, jobId } = req.body;
        
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
            // Extremely basic extraction (just body text)
            // Advanced would strip out nav, footer, scripts, styles
            $('script, style, nav, footer, header').remove();
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
        console.log(`[Admin] Background ingestion started for job: ${jobId}`);
        await ingestKnowledge(
            title || "Untitled Resource", 
            textToIngest, 
            sourceUrl,
            // Progress Callback
            (processed, total) => sendProgress(jobId, processed, total)
        );

        // Notify client that job is complete
        sendProgress(jobId, 1, 1, 'complete');

        // 4. Trigger Auto-Update Pipeline (Background task to review and critique existing specialty topics)
        console.log(`[Admin] Kicking off Auto-Update Pipeline for resource: ${title || sourceUrl}`);
        autoReviewAndUpdateTopics(textToIngest, title || sourceUrl).catch(err => {
            console.error("[Admin] Auto-Update Pipeline failed:", err);
        });

    } catch (error) {
        console.error("[Admin Ingest Error]", error);
        res.status(500).json({ error: "Ingestion failed: " + error.message });
    }
});

module.exports = router;
