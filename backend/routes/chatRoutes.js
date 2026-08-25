const express = require('express');
const router = express.Router();

const { getSpecialtyScope, getTopicAiScope } = require('../services/supabaseService');
const { callAI, extractEnglishKeywords, analyzeIntent } = require('../services/aiService');
const { fetchMedicalKnowledge, fetchClinicalLiterature } = require('../services/medicalSearchService');
const { searchCustomKnowledge } = require('../services/knowledgeService');
const { logKnowledgeUpdateFromChat, logKnowledgeGap } = require('../services/knowledgeUpdateService');

router.post('/', async (req, res) => {
    const { message, mode = 'general', category = 'physicians', topicId, categoryContext, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    // FAST-PATH INTENT CLASSIFICATION: Use AI to detect if it's just small talk (only if no conversation history)
    const isFirstTurn = !Array.isArray(history) || history.length === 0;
    if (isFirstTurn) {
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
• Pediatric H. pylori ESPGHAN/NASPGHAN protocol
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
                        "Pediatric H. pylori ESPGHAN/NASPGHAN protocol",
                        "Acute Coronary Syndrome initial workup",
                        "Sepsis 1-hour resuscitation bundle"
                    ]
                });
            } catch (err) {
                console.error('[Chat Intent]', err);
            }
        }
    }

    try {
        // Extract context-aware medical search keywords from user query + recent history
        let searchKeywords = await extractEnglishKeywords(message, history);
        console.log(`[Literature Search] Extracted keywords: "${searchKeywords}" from message: "${message}"`);

        // Parallelize knowledge base retrieval with a 2.5s maximum timeout
        const withTimeout = (promise, ms = 2500, fallback = null) =>
            Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(fallback), ms))]);

        const [rawKnowledgeRes, literatureRefsRes, customDocsRes] = await Promise.allSettled([
            withTimeout(fetchMedicalKnowledge(searchKeywords || message), 2500, ''),
            withTimeout(fetchClinicalLiterature(searchKeywords || message, category), 2500, []),
            withTimeout(searchCustomKnowledge(searchKeywords || message), 2500, [])
        ]);

        const rawKnowledge = (rawKnowledgeRes.status === 'fulfilled' && rawKnowledgeRes.value) ? rawKnowledgeRes.value : '';
        const literatureRefs = (literatureRefsRes.status === 'fulfilled' && Array.isArray(literatureRefsRes.value)) ? literatureRefsRes.value : [];
        const customKnowledgeDocs = (customDocsRes.status === 'fulfilled' && Array.isArray(customDocsRes.value)) ? customDocsRes.value : [];
        
        let citations = [];
        let literatureContext = '';
        let customContext = '';
        let refIndex = 1;
        
        // 1. Authoritative Guidelines & Textbooks from Ingested Database
        if (customKnowledgeDocs.length > 0) {
            customContext += `\n### 📚 VERIFIED MEDICAL GUIDELINES & CLINICAL TEXTBOOKS (DATABASE):\n`;
            customKnowledgeDocs.forEach((doc) => {
                const currentRefId = refIndex++;
                const societyTag = doc.guideline_society ? ` [${doc.guideline_society}]` : '';
                const yearTag = doc.publication_year ? ` (${doc.publication_year})` : '';
                
                citations.push({
                    id: currentRefId.toString(),
                    title: `${doc.title}${societyTag}`,
                    author: doc.guideline_society || 'Clinical Practice Guidelines',
                    journal: doc.version_tag || 'Authoritative Clinical Consensus',
                    year: doc.publication_year ? doc.publication_year.toString() : '2024',
                    url: doc.source_url || (doc.pmid ? `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(doc.pmid)}` : 'https://goldcopd.org')
                });

                customContext += `--- GUIDELINE REFERENCE [${currentRefId}] ("${doc.title}"${societyTag}${yearTag}) ---\n`;
                if (doc.pmid) customContext += `PMID/DOI: ${doc.pmid}\n`;
                if (doc.source_url) customContext += `Official Portal: ${doc.source_url}\n`;
                customContext += `Clinical Excerpt:\n${doc.content}\n`;
                customContext += `---------------------------------------------------------\n\n`;
            });
        }

        // 2. Peer-Reviewed Medical Literature from Europe PMC
        if (literatureRefs.length > 0) {
            literatureContext += `\n### 🔬 PEER-REVIEWED MEDICAL LITERATURE (EUROPE PMC):\n`;
            literatureRefs.forEach((ref) => {
                const currentRefId = refIndex++;
                citations.push({
                    id: currentRefId.toString(),
                    title: ref.title,
                    author: ref.author,
                    journal: ref.journal,
                    year: ref.year,
                    url: ref.url
                });
                literatureContext += `--- LITERATURE REFERENCE [${currentRefId}] (${ref.type || 'Study'}) ---\n`;
                literatureContext += `Title: ${ref.title}\n`;
                literatureContext += `Journal: ${ref.journal} (${ref.year})\n`;
                literatureContext += `Abstract: ${ref.abstract ? ref.abstract.substring(0, 1000) : ''}...\n`;
                literatureContext += `---------------------------------------------------------\n\n`;
            });
        }

        // Combine all knowledge sources
        const medicalKnowledgeContext = (rawKnowledge || literatureContext || customContext)
            ? `\n### SPECIALIZED CLINICAL KNOWLEDGE BASE (EVIDENCE-BASED GROUNDING):\n` +
            `The following are verified excerpts retrieved directly from curated international guidelines, textbooks, and peer-reviewed literature:\n\n` +
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

        let systemPrompt = `
${personaInstruction}

YOUR MISSION: Synthesize clinical evidence into actionable, high-yield guidance while maintaining unbroken session context and clinical safety.

KNOWLEDGE RESOURCES:
${medicalKnowledgeContext || 'NONE AVAILABLE (AI: SYNTHESIZE FROM AUTHORITATIVE INTERNATIONAL CLINICAL GUIDELINES & CONSENSUS)'}

### 1. SESSION CONTINUITY & DEMOGRAPHIC PRESERVATION:
- **Preserve Established Context**: When the user asks a follow-up question (e.g. asking about a drug, dosage, or test like "what about tetracycline?"), you MUST interpret it strictly within the active clinical topic and patient demographic established in previous messages (e.g. pediatric age 10-18y H. pylori eradication).
- Never reset to generic adult or disconnected definitions unless the user explicitly introduces a completely new case or patient.

### 2. CLINICAL EVIDENCE GROUNDING & PEDIATRIC PHARMACOVIGILANCE:
- Base all recommendations, drug regimens, weight/age-adjusted dosages, and diagnostic criteria on established international clinical guidelines (e.g., ESPGHAN/NASPGHAN, AAP, IDSA, Maastricht VI).
- **Pediatric Age Restrictions & Contraindications**: Whenever discussing drugs with pediatric age cutoffs (e.g., Tetracyclines contraindicated in children <8 years due to tooth discoloration and enamel hypoplasia; Fluoroquinolones limitations; Aspirin Reye's syndrome risk), explicitly state the age constraints, weight thresholds, and safe alternative protocols.
- **Pediatric H. pylori Protocols**:
  * First-line (ESPGHAN/NASPGHAN): 14-day high-dose Amoxicillin + Clarithromycin (if clarithromycin resistance <15%) OR Amoxicillin + Metronidazole.
  * Rescue / Bismuth Quadruple: In children ≥8 years or adolescents (depending on regional guidelines / weight >40kg), Tetracycline/Metronidazole/Bismuth/PPI may be considered; in children <8 years, Tetracycline is strictly avoided.
- Deliver direct, high-confidence clinical answers without generic boilerplate or robotic meta-disclaimers.
- Use bracketed citations [1], [2] referencing the source in the provided context where applicable.

### 3. INTELLIGENT INTENT-FIRST ARCHITECTURE:
- Deliver the EXACT clinical answer first with zero introductory filler.
- **Dynamic Section Header Selection**:
  * **Treatment / Management query**: -> ##SECTION: MANAGEMENT PROTOCOL## and ##SECTION: FIRST-LINE PHARMACOTHERAPY##
  * **Pediatric / Drug safety query**: -> ##SECTION: PEDIATRIC SAFETY & CONTRAINDICATIONS## and ##SECTION: RECOMMENDED REGIMEN & DOSING##
  * **Diagnostic Criteria query**: -> ##SECTION: DIAGNOSTIC CRITERIA & SCORING##
  * **Acute Emergency / Field Scenario**: -> ##SECTION: EMERGENCY PROTOCOL & IMMEDIATE ACTION##
- Always include ##SECTION: CLINICAL PEARLS & PITFALLS## highlighting common pitfalls or resistance patterns.

### 4. KNOWLEDGE DISTILLATION (ACTIVE LEARNING):
- If the "KNOWLEDGE RESOURCES" (e.g., Europe PMC) provide a new standard of care, specific dosage, or landmark trial results NOT present in the primary "DATABASE CONTEXT", you MUST include a hidden block at the very end:
  ##KNOWLEDGE_UPDATE##
  [Topic Name]: [Summary of the new information to be added to the permanent database]
  [Reference]: [Full citation string]
  ##END_UPDATE##

### 5. FORMATTING & THEMED SECTION HEADERS:
- You MUST wrap every distinct card in a themed section header: ##SECTION: HEADING_NAME##
- **No Markdown Tables**: Never use markdown tables (| or ---). Use structured bullet points:
  - **Drug Name**: Dosage | Route | Frequency | Duration/Notes
- **Language**: Respond in the language of the query (e.g., Arabic), but keep drug names, scores, and medical terms in English.
- Cite references inline using [1], [2] where applicable.

### 6. SUGGESTIONS:
At the very end, provide ##SUGGESTIONS## with 2-3 focused clinical follow-up prompts tailored to the ongoing case.
`;

        const rawReply = await callAI(systemPrompt, message, history);

        let normalized = rawReply;
        
        // 1. EXTRACT KNOWLEDGE UPDATE (ACTIVE LEARNING)
        const updateMatch = normalized.match(/##KNOWLEDGE_UPDATE##([\s\S]*?)##END_UPDATE##/i);
        if (updateMatch && updateMatch[1]) {
            const updateBody = updateMatch[1].trim();
            const lines = updateBody.split('\n');
            const topicLine = lines.find(l => l.toLowerCase().includes('[topic name]')) || 'Unknown Topic';
            const refLine = lines.find(l => l.toLowerCase().includes('[reference]')) || 'No Ref';

            // Log it for review (Asynchronous)
            logKnowledgeUpdateFromChat(
                topicLine.split(':')[1]?.trim() || (searchKeywords || 'Generic'),
                updateBody,
                refLine.split(':')[1]?.trim() || 'PMC Search',
                message
            );

            // Strip from user-facing reply
            normalized = normalized.replace(/##KNOWLEDGE_UPDATE##[\s\S]*?##END_UPDATE##/gi, '').trim();
        }

        // 2. DETECT KNOWLEDGE GAP (If custom knowledge database was empty for this query)
        if (customKnowledgeDocs.length === 0) {
            logKnowledgeGap(searchKeywords || message, category);
        }

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
            error: 'Failed to process clinical inquiry',
            details: err.message
        });
    }
});

module.exports = router;
