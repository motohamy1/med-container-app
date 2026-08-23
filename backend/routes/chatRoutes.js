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
        const conversationalPrompt = `You are the Med Arena Clinical Consultant, a professional medical AI assistant for physicians and medical students.
The user just said: "${message}".
Reply warmly, professionally, and concisely in 1-2 short sentences.
Also suggest 3 high-yield clinical sample questions they might explore next.

Format:
##GREETING##
Hello Doctor! How can I assist you with clinical guidelines, treatment protocols, or diagnostic workups today?
##END##

##SUGGESTIONS##
• COPD GOLD 2024 management protocol
• Acute Coronary Syndrome initial workup
• Sepsis 1-hour resuscitation bundle
##END##`;
        
        try {
            const rawReply = await callAI(conversationalPrompt);
            let replyText = rawReply;
            let suggestions = [];
            const sugMatch = rawReply.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
            if (sugMatch && sugMatch[1]) {
                suggestions = sugMatch[1]
                    .split('\n')
                    .map(line => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
                    .filter(line => line.length > 4 && !line.toUpperCase().includes('END'));
                replyText = rawReply.replace(/##SUGGESTIONS##[\s\S]*?(?:##END##|$)/gi, '').trim();
            }

            return res.json({ 
                reply: replyText.includes('##GREETING##') ? replyText : `##GREETING##\n${replyText}\n##END##`, 
                citations: [],
                suggestions: suggestions.length > 0 ? suggestions : [
                    "COPD GOLD 2024 management protocol",
                    "Acute Coronary Syndrome initial workup",
                    "Sepsis 1-hour resuscitation bundle"
                ]
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
        let personaInstruction = '';
        const specialtyScope = await getSpecialtyScope(category); 
        
        if (specialtyScope) {
            personaInstruction = `You are Med Arena AI Clinical Consultant. ${specialtyScope}`;
        } else {
            personaInstruction = `You are Med Arena AI Clinical Consultant, a Senior Physician & Medical/Surgical Specialist. Focus on human medicine, internal medicine, surgery, pediatrics, cardiology, neurology, gastroenterology, gynecology, pathophysiology, differential diagnosis, laboratory/imaging workup, and evidence-based clinical management guidelines.`;
        }
        
        // Fetch topic-specific strict scope from Supabase topics table
        if (topicId && topicId !== 'general') {
            const topicScope = await getTopicAiScope(topicId);
            if (topicScope) {
                personaInstruction += `\nSPECIFIC TOPIC CONTEXT: ${topicScope}`;
            }
        } else if (categoryContext) {
            personaInstruction += `\nSPECIFIC CONTEXT: You are advising within ${categoryContext}.`;
        }

        let systemPrompt = '';

        if (mode === 'fast_recap') {
            systemPrompt = `
${personaInstruction}

YOUR TASK: Provide a FAST, CONCISE, HIGH-YIELD CLINICAL RECAP.

KNOWLEDGE RESOURCES:
${medicalKnowledgeContext}

### FORMATTING RULES:
- Use structured section delimiters:
##DEFINITION & OVERVIEW##
• Concise definition and diagnostic thresholds.
##END##

##CLINICAL PICTURE##
• Key signs, symptoms, and presentation.
##END##

##INVESTIGATIONS / WORKUP##
• Essential diagnostic tests and scoring.
##END##

##MANAGEMENT PROTOCOL##
• First-line pharmacotherapy and key clinical steps.
##END##

##SUGGESTIONS##
• Follow-up clinical question 1?
• Follow-up clinical question 2?
• Follow-up clinical question 3?
##END##

- Highlight key medications, dosages, and guidelines using **bold**.
- Cite references inline using [1], [2] where applicable.
- Match user's language (English or Arabic). Keep drug names/scores in English.
`;
        } else {
            systemPrompt = `
${personaInstruction}

KNOWLEDGE RESOURCES:
${medicalKnowledgeContext}

### CRITICAL CLINICAL INSTRUCTIONS:
1. **QUESTION-FOCUSED SPECIFICITY (DO NOT OVER-DUMP)**:
   - Answer PRECISELY what the user asks. Do NOT output a comprehensive textbook overview if only a specific aspect was asked.
   - Specific Examples:
     * If asked about "treatment / management of COPD": Provide ONLY the management protocol (first-line inhalers, step-up/step-down, acute vs stable). Do NOT include definitions, etiology, or complete diagnostic workup.
     * If asked about "definition of COPD": Provide ONLY the clinical definition and spirometric diagnostic threshold (FEV1/FVC < 0.70). Do NOT dump treatment regimens.
     * If asked about "investigations / diagnostic criteria": Provide ONLY the diagnostic algorithm, scoring criteria, and lab/imaging workup.
     * If asked about "dosing / pharmacology of X": Provide ONLY the dosage, mechanism, contraindications, and monitoring.

2. **CLEAN SECTION STRUCTURE**:
   - Organize your response using 1 to 3 targeted, highly relevant section titles in ALL CAPS enclosed in '##SECTION TITLE##'.
   - Examples of matching titles:
     * Treatment: ##MANAGEMENT PROTOCOL##, ##PHARMACOTHERAPY & DOSING##, ##CLINICAL PEARLS##
     * Diagnosis: ##DIAGNOSTIC CRITERIA##, ##LABS & IMAGING WORKUP##
     * Definition: ##DEFINITION & CLASSIFICATION##
     * Emergency: ##EMERGENCY PROTOCOL & RED FLAGS##
   - Use clear bullet points ('•') for lists.
   - Use **bold text** to highlight key drug names, doses, thresholds, and clinical criteria.
   - Do NOT use markdown '#' inside sections (only '##HEADING##').

3. **EVIDENCE & CITATIONS**:
   - Cite provided peer-reviewed literature using bracketed numbers [1], [2] inline.

4. **FOLLOW-UP QUESTIONS (SUGGESTIONS)**:
   - At the end of your response, ALWAYS provide a ##SUGGESTIONS## section containing 2 to 4 concise, high-yield follow-up questions directly related to what the user asked.
   - Each suggestion must start with '•'.
   - Suggestions should be realistic next clinical questions a doctor or student would ask (e.g. next-line therapy, emergency signs, complication management, dosing).

6. **NO INTERNAL THINKING**: Do NOT output your internal reasoning process, thoughts, or planning steps. Start immediately with the themed sections. Output ONLY the clinical content.

${topicId && topicId !== 'general' ? `
CRITICAL TOPIC SCOPE: You are operating within topic ID: "${topicId}".
If the query is completely OUT OF SCOPE for this medical topic, output EXACTLY:
##OUT_OF_SCOPE##
This question is not related to the ${topicId} topic.
` : ''}

REQUIRED OUTPUT TEMPLATE:
##[RELEVANT SECTION TITLE]##
• Direct, high-yield clinical answer with **bold highlights** for drugs, criteria, and numbers.
##END##

##SUGGESTIONS##
• First relevant follow-up question?
• Second relevant follow-up question?
• Third relevant follow-up question?
##END##
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

        // Extract ##SUGGESTIONS## section
        let suggestions = [];
        const suggestionsMatch = normalized.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
        if (suggestionsMatch && suggestionsMatch[1]) {
            const rawSuggestionsText = suggestionsMatch[1].trim();
            suggestions = rawSuggestionsText
                .split('\n')
                .map(line => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
                .filter(line => line.length > 5 && !line.toUpperCase().includes('END') && !line.startsWith('##'));
            
            // Remove the suggestions block from normalized text
            normalized = normalized.replace(/##SUGGESTIONS##[\s\S]*?(?:##END##|$)/gi, '');
        }

        normalized = normalized.replace(/##END##/gi, '');

        const sections = normalized.split(/##(.*?)##/);
        let finalReply = '';
        for (let i = 1; i < sections.length; i += 2) {
            const h = sections[i].trim().toUpperCase();
            const content = sections[i + 1] || '';
            if (h && h !== 'END' && h !== 'SUGGESTIONS') {
                finalReply += `##${h}##\n${content.trim()}\n##END##\n\n`;
            }
        }

        const reply = finalReply.trim() || normalized.trim();

        console.log(`[AI Response Category: ${category}] Citations: ${citations.length} | Suggestions: ${suggestions.length} | Start: "${reply.substring(0, 50).replace(/\n/g, ' ')}..."`);

        res.json({ reply, citations, suggestions });
    } catch (err) {
        console.error('[/api/chat]', err.message);
        res.status(500).json({
            error: 'AI service error',
            reply: "I'm sorry, I'm having trouble with the clinical AI model right now. Please try again.",
            suggestions: []
        });
    }
});

module.exports = router;
