const express = require('express');
const router = express.Router();

const { getSpecialtyScope, getTopicAiScope } = require('../services/supabaseService');
const { callAI, extractEnglishKeywords, analyzeIntent } = require('../services/aiService');
const { fetchMedicalKnowledge, fetchClinicalLiterature } = require('../services/medicalSearchService');
const { searchCustomKnowledge } = require('../services/knowledgeService');

router.post('/', async (req, res) => {
    const { message, mode = 'general', category = 'physicians', topicId, categoryContext } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    // FAST-PATH INTENT CLASSIFICATION: Use AI to detect if it's just small talk
    const intent = await analyzeIntent(message);
    
    if (intent === 'CONVERSATIONAL') {
        console.log(`[Chat] Intercepted conversational intent: "${message}"`);
        const conversationalPrompt = `You are the Med Arena Clinical Consultant, a professional medical AI. 
The user just said: "${message}". 
Reply warmly, professionally, and briefly. Do NOT use any markdown bold (**) or asterisks. Keep it conversational.`;
        
        try {
            const reply = await callAI(conversationalPrompt);
            return res.json({ 
                reply: `##GREETING##\n${reply}\n##END##`, 
                citations: [] 
            });
        } catch (err) {
            console.error('[Chat Intent]', err);
        }
    }

    try {
        let searchKeywords = message;
        if (/[\u0600-\u06FF]/.test(message)) {
            searchKeywords = await extractEnglishKeywords(message);
            console.log(`[PMC Search] Translated Arabic query to keywords: "${searchKeywords}"`);
        }

        // Parallelize knowledge base retrieval with a 2.5s maximum timeout
        const withTimeout = (promise, ms = 2500, fallback = null) =>
            Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(fallback), ms))]);

        const [rawKnowledgeRes, literatureRefsRes, customDocsRes] = await Promise.allSettled([
            withTimeout(fetchMedicalKnowledge(message), 2500, ''),
            withTimeout(fetchClinicalLiterature(searchKeywords, category), 2500, []),
            withTimeout(searchCustomKnowledge(message), 2500, [])
        ]);

        const rawKnowledge = (rawKnowledgeRes.status === 'fulfilled' && rawKnowledgeRes.value) ? rawKnowledgeRes.value : '';
        const literatureRefs = (literatureRefsRes.status === 'fulfilled' && Array.isArray(literatureRefsRes.value)) ? literatureRefsRes.value : [];
        const customKnowledgeDocs = (customDocsRes.status === 'fulfilled' && Array.isArray(customDocsRes.value)) ? customDocsRes.value : [];
        
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

        let customContext = '';
        if (customKnowledgeDocs.length > 0) {
            customContext += `\n### 📚 PRIVATE TEXTBOOKS & LOCAL GUIDELINES:\n`;
            customKnowledgeDocs.forEach((doc, index) => {
                customContext += `--- EXCERPT ${index + 1} from "${doc.title}" ---\n`;
                customContext += `${doc.content}\n`;
                customContext += `------------------\n\n`;
            });
        }

        // Combine all knowledge sources
        const medicalKnowledgeContext = (rawKnowledge || literatureContext || customContext)
            ? `\n### SPECIALIZED CLINICAL KNOWLEDGE BASE:\n` +
            `The following is expert medical reasoning retrieved directly from curated clinical literature, textbooks, and datasets:\n\n` +
            customContext + rawKnowledge + `\n\n` + literatureContext
            : '';

        // DYNAMIC PERSONA RESOLUTION
        // Fetch base scope from Supabase specialties table
        let personaInstruction = '';
        const specialtyScope = await getSpecialtyScope(category); 
        // Note: frontend currently passes specialty.id in the `category` field (e.g. 'heart', 'skin')
        
        if (specialtyScope) {
            personaInstruction = `You are Med Arena AI Clinical Consultant. ${specialtyScope}`;
        } else {
            // Fallback
            personaInstruction = `You are Med Arena AI Clinical Consultant, a Senior Physician & Medical/Surgical Specialist. Focus on human medicine, internal medicine, surgery, pediatrics, cardiology, neurology, gastroenterology, gynecology, pathophysiology, differential diagnosis, laboratory/imaging workup, and evidence-based clinical management guidelines.`;
        }
        
        // Fetch topic-specific strict scope from Supabase topics table
        if (topicId && topicId !== 'general') {
            const topicScope = await getTopicAiScope(topicId);
            if (topicScope) {
                personaInstruction += `\nSPECIFIC FOCUS: ${topicScope}`;
            }
        } else if (categoryContext) {
            // Fallback for general chat within a category context
            personaInstruction += `\nSPECIFIC FOCUS: You are currently advising within the ${categoryContext} context. Tailor your response strictly to this sub-domain.`;
        }

        const currentYear = new Date().getFullYear();
        personaInstruction += `\n\nCRITICAL KNOWLEDGE AWARENESS: You are operating in the year ${currentYear}. You are provided with both 'Highly Cited Foundation' literature (most reliable established knowledge) and 'Latest Update' literature (newest cutting-edge research). You MUST explicitly synthesize these in your response: briefly state what the established reliable foundational knowledge says, and then highlight what the absolute latest cutting-edge updates say, ensuring the user is aware of both the reliable foundation and the newest developments.`;

        let systemPrompt = '';

        if (mode === 'fast_recap') {
            systemPrompt = `
${personaInstruction}

YOUR TASK: Provide a FAST but COMPREHENSIVE CLINICAL RECAP.

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
            systemPrompt = `
${personaInstruction}

KNOWLEDGE RESOURCES:
${medicalKnowledgeContext}

### INSTRUCTIONS:
Deliver a high-yield, accurate, and structured clinical response for doctors. 

${topicId && topicId !== 'general' ? `
CRITICAL TOPIC SCOPE: You are operating strictly within the topic context of ID: "${topicId}". 
Evaluate the user's query against this specific topic. 
If the user's query is OUTSIDE the medical scope of this topic, you MUST abort and output EXACTLY:
##OUT_OF_SCOPE##
This question is not related to the ${topicId} topic.
` : ''}

STRICT OUTPUT RULE:
- Your response MUST START immediately with the first ##SECTION HEADING## (unless you are triggering the ##OUT_OF_SCOPE## block).
- LANGUAGE RULE: Match the user's language perfectly. If the query is in English, respond ONLY in English. If the query is in Arabic, respond intelligently in Arabic but DO NOT force translations of complex medical terms, procedures, or drugs (e.g., write "Obeticholic acid" directly in English, do not translate it to Arabic). Keep medical terms in English unless they have a very common Egyptian Arabic medical equivalent.
- NEVER use asterisks (*) or markdown bold (**).
- NEVER use the '#' character anywhere in your text except for the main section headings. Do NOT use it for bullet points.
- ZERO markdown formatting allowed inside sections.
- ALL HEADINGS must be in ALL CAPS.
- CRITICAL CITATION RULE: You MUST cite the provided PEER-REVIEWED MEDICAL LITERATURE using bracketed numbers, e.g., [1] or [2], inline where relevant in the text.

HEADING CATEGORIES (Pick the most relevant sections):
- CLINICAL: ##DEFINITION##, ##CLINICAL ASSESSMENT##, ##DIFFERENTIAL DIAGNOSIS##, ##INVESTIGATIONS / WORKUP##, ##MANAGEMENT PROTOCOL##, ##SURGICAL / PROCEDURAL CONSIDERATIONS##
- CRITERIA/SCORES: ##OVERVIEW##, ##SCORING CRITERIA##, ##INTERPRETATION##, ##CLINICAL SIGNIFICANCE##
- GENERAL DOCTOR ADVICE: ##KEY POINTS##, ##PROFESSIONAL CLINICAL ADVICE##
- CONVERSATIONAL: ##GREETING## (Use this ONLY if the user is saying hello, thanks, or engaging in small talk without a medical question. Do NOT use other sections).

NOW RESPOND TO THE CLINICAL QUERY:
      `;
        }

        const rawReply = await callAI(systemPrompt, message);

        let normalized = rawReply;
        
        normalized = normalized.replace(/^(#{1,4})\s*([^#\n]+?)\s*#*$/gm, (match, hashes, headingText) => {
            return `##${headingText.trim().toUpperCase()}##`;
        });
        
        normalized = normalized.replace(/^\*\*\s*([^*\n]+)\s*\*\*$/gm, (match, headingText) => {
            return `##${headingText.trim().toUpperCase()}##`;
        });
        
        normalized = normalized.replace(/##END##/gi, '');

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

module.exports = router;
