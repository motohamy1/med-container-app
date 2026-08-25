const { GoogleGenerativeAI } = require('@google/generative-ai');
const { cleanAIResponse, safeParseJSON, parseTopicSynthesis } = require('./jsonUtils');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const aiModel = genAI ? genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
    }
}) : null;

function cleanText(text) {
    return cleanAIResponse(text);
}

/**
 * Standardize incoming conversation history into [{ role: 'user'|'assistant', content: string }]
 */
function normalizeHistory(history = []) {
    if (!Array.isArray(history)) return [];
    return history.map(item => {
        if (!item) return null;
        if (item.role && item.content) {
            return {
                role: item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user',
                content: String(item.content).trim()
            };
        }
        if (typeof item.text === 'string') {
            return {
                role: item.isUser ? 'user' : 'assistant',
                content: item.text.trim()
            };
        }
        return null;
    }).filter(Boolean);
}

async function executeAI(systemPrompt, userPrompt, rawHistory = []) {
    let lastError = null;
    const history = normalizeHistory(rawHistory).slice(-8); // Keep last 8 turns for high relevance

    // Build chat history text snippet for models that combine prompts
    const historyTextSnippet = history.length > 0 
        ? `\n\n### CONVERSATION HISTORY (PRESERVE PATIENT CONTEXT, AGE, AND CLINICAL DEMOGRAPHICS ACROSS TURNS):\n` +
          history.map(h => `${h.role === 'user' ? 'Physician' : 'Medical Arena AI'}: ${h.content}`).join('\n\n') +
          `\n\n### CURRENT CLINICAL QUESTION:\n${userPrompt}`
        : userPrompt;

    // 1. Try Groq (Ultra-fast inference: 300+ tokens/sec, highly reliable models)
    if (GROQ_API_KEY) {
        const groqModels = [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
            "qwen/qwen3.6-27b"
        ];
        const groqMessages = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: userPrompt }
        ];

        for (const modelName of groqModels) {
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: groqMessages,
                        temperature: 0.1,
                        max_tokens: 4096
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        const content = cleanText(data.choices[0].message.content);
                        if (content && content.length > 0) {
                            return content;
                        }
                    }
                }
            } catch (groqErr) {
                console.warn(`[AI Router] Groq ${modelName} error:`, groqErr.message);
            }
        }
    }

    // 2. Try Native Gemini Flash API
    if (aiModel) {
        try {
            const fullPrompt = `${systemPrompt}\n\n${historyTextSnippet}`;
            const result = await aiModel.generateContent(fullPrompt);
            const text = result.response.text();
            if (text) return cleanText(text);
        } catch (err) {
            lastError = err;
            console.warn(`[AI Router] Gemini failed: ${err.message.substring(0, 100)}...`);
        }
    }

    // 3. Fallback to Nvidia NIM
    if (NVIDIA_API_KEY) {
        try {
            const nvidiaMessages = [
                { role: "system", content: systemPrompt },
                ...history,
                { role: "user", content: userPrompt }
            ];

            const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${NVIDIA_API_KEY}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ 
                    model: "meta/llama-3.1-70b-instruct", 
                    messages: nvidiaMessages,
                    max_tokens: 4096,
                    temperature: 0.1
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return cleanText(data.choices[0].message.content);
                }
            }
        } catch (fetchErr) {
            console.error("[AI Router] Nvidia Fetch Error:", fetchErr.message);
        }
    }

    // 4. Fallback to OpenRouter
    if (OPENROUTER_API_KEY) {
        try {
            const openRouterMessages = [
                { role: "system", content: systemPrompt },
                ...history,
                { role: "user", content: userPrompt }
            ];

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ 
                    model: "openrouter/free", 
                    messages: openRouterMessages,
                    max_tokens: 4096
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return cleanText(data.choices[0].message.content);
                }
            }
        } catch (fetchErr) {
            console.error("[AI Router] OpenRouter Fetch Error:", fetchErr.message);
        }
    }

    throw lastError || new Error("No AI providers available or all quotas exhausted.");
}

async function extractEnglishKeywords(query, rawHistory = []) {
    const history = normalizeHistory(rawHistory).slice(-4);
    let contextSnippet = '';
    if (history.length > 0) {
        contextSnippet = `\nRecent Conversation Context:\n` + 
            history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content.substring(0, 150)}`).join('\n') + `\n`;
    }

    const systemPrompt = `You are a medical search query specialist. Extract 1-4 canonical medical MeSH keywords and correct any typos from the clinical query for searching PubMed / Europe PMC.
If the latest query is a follow-up (e.g., "what about tetracycline?", "what are the dosages?"), resolve coreferences using the recent conversation context so the search keywords accurately reflect the clinical topic (e.g., ["Helicobacter pylori", "tetracycline", "pediatric", "safety"]).

Examples:
- "latest treatment of h.pylori in childern uder 17" -> ["Helicobacter pylori", "treatment", "pediatric", "adolescent"]
- Follow up: "what about tetracycline?" (when prior context was pediatric H. pylori) -> ["Helicobacter pylori", "tetracycline", "pediatric", "safety"]
- "علاج التيفود المقاوم للمضادات الحيوية" -> ["typhoid fever", "antimicrobial resistance", "treatment"]
- "criteria of septic shock only" -> ["septic shock", "diagnostic criteria", "consensus"]

Output a pure JSON array of strings ONLY. No markdown, no conversational text.`;

    const userPrompt = `${contextSnippet}Latest Query: "${query}"`;

    try {
        const result = await executeAI(systemPrompt, userPrompt);
        const parsed = safeParseJSON(result);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.join(' ');
        }
    } catch (e) {
        console.warn('[Keyword Extractor] Failed to parse JSON keywords, falling back to basic cleanup');
    }
    // Basic fallback: remove common conversational filler
    return query
        .replace(/\b(latest|recent|treatment|manage|management|what is|how to|criteria of|guideline|guidelines|for|in|under|the|of|a|an)\b/gi, ' ')
        .replace(/[^\w\s.-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

async function analyzeIntent(message) {
    const trimmed = message.trim();
    if (trimmed.length < 25 && /^(hi|hello|hey|welcome|how are you|good morning|good evening|مرحبا|اهلا|السلام عليكم|صباح الخير|مساء الخير|شكرا|thank you|thanks)/i.test(trimmed)) {
        return 'CONVERSATIONAL';
    }

    const systemPrompt = `You are a fast intent classifier for a clinical medical AI system.
Classify the user message into either:
- "CONVERSATIONAL": simple greetings, compliments, chit-chat, thanks, or questions about what you can do.
- "CLINICAL": medical questions, disease queries, medications, symptoms, guidelines, differentials, lab interpretations, treatment protocols.

Output ONLY ONE WORD: either CONVERSATIONAL or CLINICAL.`;

    try {
        const result = await executeAI(systemPrompt, message);
        return result.trim().toUpperCase().includes('CONVERSATIONAL') ? 'CONVERSATIONAL' : 'CLINICAL';
    } catch (e) {
        return 'CLINICAL';
    }
}

async function callAI(systemPrompt, userPrompt = '', history = []) {
    return executeAI(systemPrompt, userPrompt, history);
}

module.exports = {
    hasApiKey: !!(GEMINI_API_KEY || GROQ_API_KEY || OPENROUTER_API_KEY || NVIDIA_API_KEY),
    callAI,
    extractEnglishKeywords,
    analyzeIntent,
};
