const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const aiModel = genAI ? genAI.getGenerativeModel({ 
    model: 'gemini-flash-latest',
    generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
    }
}) : null;

async function executeAI(prompt) {
    let lastError = null;

    // 1. Try Native Gemini API first
    if (aiModel) {
        try {
            const result = await aiModel.generateContent(prompt);
            return result.response.text().trim() || '';
        } catch (err) {
            lastError = err;
            console.warn(`[AI Router] Gemini failed: ${err.message.substring(0, 100)}...`);
            // If it's not a quota/rate-limit error, throw immediately
            if (!err.message.includes('429') && !err.message.toLowerCase().includes('quota')) {
                throw err;
            }
        }
    }

    // 2. Fallback to OpenRouter (Free Auto-Router) if Gemini hit Quota
    if (OPENROUTER_API_KEY) {
        console.log("[AI Router] Routing request to OpenRouter (openrouter/free)...");
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ 
                    model: "openrouter/free", 
                    messages: [{ role: "user", content: prompt }] 
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content.trim();
                }
            } else {
                console.error("[AI Router] OpenRouter failed:", await response.text());
            }
        } catch (fetchErr) {
            console.error("[AI Router] OpenRouter Fetch Error:", fetchErr.message);
        }
    }

    // 3. Fallback to Nvidia NIM if OpenRouter also failed
    if (NVIDIA_API_KEY) {
        console.log("[AI Router] Routing request to NVIDIA (meta/llama-3.1-70b-instruct)...");
        try {
            const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${NVIDIA_API_KEY}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ 
                    model: "meta/llama-3.1-70b-instruct", 
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 4000
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content.trim();
                }
            } else {
                console.error("[AI Router] Nvidia failed:", await response.text());
            }
        } catch (fetchErr) {
            console.error("[AI Router] Nvidia Fetch Error:", fetchErr.message);
        }
    }

    throw lastError || new Error("No AI providers available or all quotas exhausted.");
}

async function extractEnglishKeywords(query) {
    if (!/[\u0600-\u06FF]/.test(query)) return query;
    
    const prompt = `Extract 1-4 core English medical search keywords from this user query for a scientific database search. Translate the core medical concepts to English. Do NOT return sentences, only the keywords separated by spaces. Query: "${query}"`;
    try {
        const result = await executeAI(prompt);
        return result || query;
    } catch {
        return query;
    }
}

async function analyzeIntent(query) {
    const prompt = `Classify the following user message into exactly one of two categories: 'MEDICAL' or 'CONVERSATIONAL'. 
'MEDICAL' means the user is asking a clinical question, asking about a drug, symptom, disease, or medical scenario.
'CONVERSATIONAL' means the user is just saying hello, asking how you are, making small talk, or thanking you, without any actual medical inquiry.
Output ONLY the category name in all caps.
Message: "${query}"`;
    try {
         const text = await executeAI(prompt);
         return text.toUpperCase().includes('CONVERSATIONAL') ? 'CONVERSATIONAL' : 'MEDICAL';
    } catch {
         return 'MEDICAL'; // default to medical on error
    }
}

async function callAI(prompt, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await executeAI(prompt);
        } catch (err) {
            console.error(`Attempt ${attempt + 1} failed:`, err.message.substring(0, 100));
            if (attempt < retries - 1) {
                await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
                continue;
            }
            throw err;
        }
    }
}

module.exports = {
    extractEnglishKeywords,
    analyzeIntent,
    callAI,
    hasApiKey: !!GEMINI_API_KEY || !!OPENROUTER_API_KEY || !!NVIDIA_API_KEY
};
