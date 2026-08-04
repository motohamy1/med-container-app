require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
    console.error('CRITICAL: GEMINI_API_KEY is missing in backend/.env');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ 
    model: 'gemini-flash-latest',
    generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
    }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchMedicalKnowledge(query) {
    try {
        const url = new URL('https://datasets-server.huggingface.co/search');
        url.searchParams.append('dataset', 'OpenMed/Medical-Reasoning-SFT-Mega');
        url.searchParams.append('config', 'default');
        url.searchParams.append('split', 'train');
        url.searchParams.append('query', query);

        const response = await fetch(url.toString());
        if (!response.ok) return '';

        const data = await response.json();
        if (data.error || !data.rows?.length) return '';

        let context = '';
        data.rows.slice(0, 2).forEach((rowItem, index) => {
            const messages = rowItem.row.messages || [];
            const userMsg = messages.find((m) => m.role === 'user');
            const assistantMsg = messages.find((m) => m.role === 'assistant');
            if (userMsg && assistantMsg) {
                const expertText = assistantMsg.content.length > 2000
                    ? assistantMsg.content.substring(0, 2000) + '... [TRUNCATED]'
                    : assistantMsg.content;

                context += `--- CLINICAL RESOURCE REFERENCE ${index + 1} ---\n`;
                context += `Clinical Query: ${userMsg.content}\n`;
                context += `Expert Medical Synthesis: ${expertText}\n`;
                context += `------------------\n\n`;
            }
        });
        return context;
    } catch {
        return '';
    }
}

async function fetchEuropePMC(query, category) {
    try {
        let categoryFilter = '';
        if (category === 'dentists') {
            categoryFilter = ' AND (dental OR dentistry OR oral OR maxillofacial)';
        } else if (category === 'physiotherapy') {
            categoryFilter = ' AND (physiotherapy OR "physical therapy" OR rehabilitation OR biomechanics)';
        } else if (category === 'physicians') {
            categoryFilter = ' AND (medicine OR clinical OR surgery OR physician)';
        }
        
        const fetchRefs = async (sortMode) => {
            const enhancedQuery = `${query}${categoryFilter} ${sortMode}`;
            const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
            url.searchParams.append('query', enhancedQuery);
            url.searchParams.append('format', 'json');
            url.searchParams.append('resultType', 'core');
            url.searchParams.append('pageSize', '2'); // Fetch 2 of each
            
            const response = await fetch(url.toString());
            if (!response.ok) return [];
            const data = await response.json();
            const results = data.resultList?.result || [];
            
            return results.map(r => ({
                id: r.pmid || r.id,
                title: r.title,
                author: r.authorString || 'Unknown Authors',
                journal: r.journalTitle || r.pubType || 'Medical Journal',
                year: r.pubYear,
                abstract: r.abstractText ? r.abstractText.replace(/<\/?(?:b|i|p|sup|sub)>/g, '') : '',
                url: `https://europepmc.org/article/MED/${r.pmid || r.id}`,
                type: sortMode.includes('sort_date') ? 'Latest Update' : 'Highly Cited Foundation'
            })).filter(r => r.abstract);
        };

        const [latestRefs, citedRefs] = await Promise.all([
            fetchRefs('sort_date:y'),
            fetchRefs('sort_cited:y')
        ]);

        // Deduplicate and combine
        const allRefs = [...citedRefs, ...latestRefs];
        const uniqueRefs = [];
        const seenIds = new Set();
        for (const ref of allRefs) {
            if (!seenIds.has(ref.id)) {
                seenIds.add(ref.id);
                uniqueRefs.push(ref);
            }
        }
        return uniqueRefs.slice(0, 4);
    } catch {
        return [];
    }
}

async function extractEnglishKeywords(query) {
    if (!/[\u0600-\u06FF]/.test(query)) return query;
    
    const prompt = `Extract 1-4 core English medical search keywords from this user query for a scientific database search. Translate the core medical concepts to English. Do NOT return sentences, only the keywords separated by spaces. Query: "${query}"`;
    try {
        const result = await aiModel.generateContent(prompt);
        return result.response.text().trim() || query;
    } catch {
        return query;
    }
}

async function callAI(prompt, retries = 3) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const result = await aiModel.generateContent(prompt);
            return result.response.text().trim() || '';
        } catch (err) {
            console.error(`Attempt ${attempt + 1} failed:`, err.message);
            if (attempt < retries - 1) {
                await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
                continue;
            }
            throw err;
        }
    }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// POST /api/chat — main AI clinical chat endpoint
app.post('/api/chat', async (req, res) => {
    const { message, mode = 'general', category = 'physicians' } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    try {
        // Fetch medical knowledge context
        const rawKnowledge = await fetchMedicalKnowledge(message);
        
        let searchKeywords = message;
        if (/[\u0600-\u06FF]/.test(message)) {
            searchKeywords = await extractEnglishKeywords(message);
            console.log(`[PMC Search] Translated Arabic query to keywords: "${searchKeywords}"`);
        }
        
        const literatureRefs = await fetchEuropePMC(searchKeywords, category);
        
        let citations = [];
        let literatureContext = '';
        
        if (literatureRefs.length > 0) {
            literatureContext += `\n### PEER-REVIEWED MEDICAL LITERATURE (EUROPE PMC):\n`;
            literatureRefs.forEach((ref, index) => {
                const refNum = index + 1;
                citations.push({
                    id: refNum.toString(),
                    title: ref.title,
                    author: ref.author,
                    journal: ref.journal,
                    year: ref.year,
                    url: ref.url
                });
                literatureContext += `--- REFERENCE [${refNum}] (${ref.type}) ---\n`;
                literatureContext += `Title: ${ref.title}\n`;
                literatureContext += `Journal: ${ref.journal} (${ref.year})\n`;
                literatureContext += `Abstract: ${ref.abstract.substring(0, 1000)}...\n`;
                literatureContext += `------------------\n\n`;
            });
        }

        const medicalKnowledgeContext = (rawKnowledge || literatureContext)
            ? `\n### SPECIALIZED CLINICAL KNOWLEDGE BASE:\n` +
            `The following is expert medical reasoning retrieved directly from curated clinical literature and datasets:\n\n` +
            rawKnowledge + `\n\n` + literatureContext
            : '';

        let personaInstruction = '';
        if (category === 'dentists') {
            personaInstruction = `You are Med Arena AI Dental Specialist, a Senior Oral & Maxillofacial Consultant. Focus exclusively on dentistry, oral surgery, endodontics, periodontics, oral pathology, dental trauma, and maxillofacial resources.`;
        } else if (category === 'physiotherapy') {
            personaInstruction = `You are Med Arena Rehab AI, a Senior Consultant in Physical Therapy & Rehabilitation. Focus exclusively on musculoskeletal rehab, neurological physical therapy, biomechanics, sports medicine, manual therapy, and movement analysis resources.`;
        } else {
            // Default: physicians
            personaInstruction = `You are Med Arena AI Clinical Consultant, a Senior Physician & Medical/Surgical Specialist. Focus on human medicine, internal medicine, surgery, pediatrics, cardiology, neurology, gastroenterology, gynecology, pathophysiology, differential diagnosis, laboratory/imaging workup, and evidence-based clinical management guidelines.`;
        }

        const currentYear = new Date().getFullYear();
        personaInstruction += `\n\nCRITICAL KNOWLEDGE AWARENESS: You are operating in the year ${currentYear}. You are provided with both 'Highly Cited Foundation' literature (most reliable established knowledge) and 'Latest Update' literature (newest cutting-edge research). You MUST explicitly synthesize these in your response: briefly state what the established reliable foundational knowledge says, and then highlight what the absolute latest cutting-edge updates say, ensuring the user is aware of both the reliable foundation and the newest developments.`;

        let prompt = '';

        if (mode === 'fast_recap') {
            prompt = `
${personaInstruction}

YOUR TASK: Provide a FAST but COMPREHENSIVE CLINICAL RECAP for the topic: "${message}".

KNOWLEDGE RESOURCES:
${medicalKnowledgeContext}

STRICT FORMATTING RULE — NO EXCEPTIONS:
Every word of your response MUST be inside a structured section. 
Do NOT use ANY asterisks (*) or markdown bold (**). 
Do NOT mention drug trade names or brand names unless discussing active therapeutic principles.
CRITICAL CITATION RULE: You MUST cite the provided PEER-REVIEWED MEDICAL LITERATURE using bracketed numbers, e.g., [1] or [2], inline where relevant in the text.

You MUST use EXACTLY these section delimiters:

##DEFINITION##
content
##END##

##CLINICAL PICTURE##
content
##END##

##INVESTIGATIONS##
content
##END##

##DIFFERENTIAL DIAGNOSIS##
content
##END##

##UPDATED INFO / SCORES##
content
##END##

##MANAGEMENT PROTOCOL##
content
##END##

STRICT RULES:
- ZERO asterisks (*) allowed anywhere.
- ZERO markdown bold (**) allowed anywhere.
- No conversational text outside of ##SECTION## blocks.
- LANGUAGE RULE: Match the user's language perfectly. If the query is in English, respond ONLY in English. If the query is in Arabic, respond intelligently in Arabic but DO NOT force translations of complex medical terms, procedures, or drugs (e.g., write "Obeticholic acid" directly in English, do not translate it to Arabic). Keep medical terms in English unless they have a very common Egyptian Arabic medical equivalent.
      `;
        } else {
            prompt = `
${personaInstruction}

KNOWLEDGE RESOURCES:
${medicalKnowledgeContext}

### USER CLINICAL QUERY: "${message}"

### INSTRUCTIONS:
Deliver a high-yield, accurate, and structured clinical response for doctors. 

STRICT OUTPUT RULE:
- Your response MUST START immediately with the first ##SECTION HEADING##.
- LANGUAGE RULE: Match the user's language perfectly. If the query is in English, respond ONLY in English. If the query is in Arabic, respond intelligently in Arabic but DO NOT force translations of complex medical terms, procedures, or drugs (e.g., write "Obeticholic acid" directly in English, do not translate it to Arabic). Keep medical terms in English unless they have a very common Egyptian Arabic medical equivalent.
- NEVER use asterisks (*) or markdown bold (**).
- NEVER use the '#' character anywhere in your text except for the main section headings. Do NOT use it for bullet points.
- ZERO markdown formatting allowed inside sections.
- ALL HEADINGS must be in ALL CAPS.
- CRITICAL CITATION RULE: You MUST cite the provided PEER-REVIEWED MEDICAL LITERATURE using bracketed numbers, e.g., [1] or [2], inline where relevant in the text.

HEADING CATEGORIES (Pick the most relevant 3-5 sections):
- CLINICAL: ##DEFINITION##, ##CLINICAL ASSESSMENT##, ##DIFFERENTIAL DIAGNOSIS##, ##INVESTIGATIONS / WORKUP##, ##MANAGEMENT PROTOCOL##, ##SURGICAL / PROCEDURAL CONSIDERATIONS##
- CRITERIA/SCORES: ##OVERVIEW##, ##SCORING CRITERIA##, ##INTERPRETATION##, ##CLINICAL SIGNIFICANCE##
- GENERAL DOCTOR ADVICE: ##KEY POINTS##, ##PROFESSIONAL CLINICAL ADVICE##

NOW RESPOND TO THE CLINICAL QUERY (START WITH ##):
      `;
        }

        const rawReply = await callAI(prompt);

        // --- FOOLPROOF MARKDOWN TO SECTIONS NORMALIZER ---
        let normalized = rawReply;
        
        // 1. Convert standard Markdown headings to strict ##HEADING## format
        // Matches lines like: # HEADING, ## HEADING, ### HEADING
        normalized = normalized.replace(/^(#{1,4})\s*([^#\n]+?)\s*#*$/gm, (match, hashes, headingText) => {
            return `##${headingText.trim().toUpperCase()}##`;
        });
        
        // 2. Convert bolded headings to strict ##HEADING## format
        // Matches lines like: **HEADING**
        normalized = normalized.replace(/^\*\*\s*([^*\n]+)\s*\*\*$/gm, (match, headingText) => {
            return `##${headingText.trim().toUpperCase()}##`;
        });
        
        // Remove any existing ##END## to prevent double ends
        normalized = normalized.replace(/##END##/gi, '');

        // Extract sections
        const sections = normalized.split(/##(.*?)##/);
        let finalReply = '';
        for (let i = 1; i < sections.length; i += 2) {
            const h = sections[i].trim().toUpperCase();
            const content = sections[i + 1] || '';
            if (h && h !== 'END') {
                finalReply += `##${h}##\n${content.trim()}\n##END##\n\n`;
            }
        }

        const reply = finalReply.trim() || rawReply.trim();

        console.log(`[AI Response Category: ${category}] Citations: ${citations.length} | Scrubbed Start: "${reply.substring(0, 50).replace(/\n/g, ' ')}..."`);

        res.json({ reply, citations });
    } catch (err) {
        console.error('[/api/chat]', err.message);
        res.status(500).json({
            error: 'AI service error',
            reply: "I'm sorry, I'm having trouble with the clinical AI model right now. Please try again.",
        });
    }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Med Arena Clinical Backend running on http://0.0.0.0:${PORT}`);
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'PASTE_YOUR_GEMINI_KEY_HERE') {
        console.log(`   Gemini API key active`);
    } else {
        console.log(`   ⚠️ GEMINI_API_KEY is missing in backend/.env`);
    }
});
