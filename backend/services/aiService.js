const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const aiModel = genAI ? genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
    }
}) : null;

async function executeAI(systemPrompt, userPrompt) {
    let lastError = null;

    // 1. Try Groq (Ultra-fast inference: 300+ tokens/sec)
    if (GROQ_API_KEY) {
        const groqModels = ["openai/gpt-oss-120b", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"];
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
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userPrompt }
                        ],
                        temperature: 0.2
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        let text = data.choices[0].message.content.trim();
                        text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                        return text;
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
            const fullPrompt = `${systemPrompt}\n\nUSER QUERY:\n${userPrompt}`;
            const result = await aiModel.generateContent(fullPrompt);
            const text = result.response.text().trim();
            if (text) return text;
        } catch (err) {
            lastError = err;
            console.warn(`[AI Router] Gemini failed: ${err.message.substring(0, 100)}...`);
        }
    }

    // 3. Fallback to Nvidia NIM
    if (NVIDIA_API_KEY) {
        try {
            const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${NVIDIA_API_KEY}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ 
                    model: "meta/llama-3.1-70b-instruct", 
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    max_tokens: 4000
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content.trim();
                }
            }
        } catch (fetchErr) {
            console.error("[AI Router] Nvidia Fetch Error:", fetchErr.message);
        }
    }

    // 4. Fallback to OpenRouter
    if (OPENROUTER_API_KEY) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ 
                    model: "openrouter/free", 
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ] 
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content.trim();
                }
            }
        } catch (fetchErr) {
            console.error("[AI Router] OpenRouter Fetch Error:", fetchErr.message);
        }
    }

    throw lastError || new Error("No AI providers available or all quotas exhausted.");
}

async function extractEnglishKeywords(query) {
    if (!/[\u0600-\u06FF]/.test(query)) return query;
    
    const systemPrompt = `You are a medical keyword extractor. Extract 1-4 core English medical search keywords from the query for a scientific database search. Translate concepts to English. Output a pure JSON array of strings ONLY. No markdown, no conversational text. Example: ["typhoid fever", "treatment"]`;
    try {
        const result = await executeAI(systemPrompt, query);
        const cleaned = result.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const keywords = JSON.parse(cleaned);
        if (Array.isArray(keywords) && keywords.length > 0) {
            return keywords.join(' ');
        }
    } catch (e) {
        console.warn('[Keyword Extractor] Failed to parse JSON keywords, falling back to query');
    }
    return query;
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

async function callAI(systemPrompt, userPrompt = '') {
    return executeAI(systemPrompt, userPrompt);
}

module.exports = {
    hasApiKey: !!(GEMINI_API_KEY || GROQ_API_KEY || OPENROUTER_API_KEY || NVIDIA_API_KEY),
    callAI,
    extractEnglishKeywords,
    analyzeIntent,
};
