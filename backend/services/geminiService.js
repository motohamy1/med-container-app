const { GoogleGenerativeAI } = require('@google/generative-ai');

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

async function analyzeIntent(query) {
    const prompt = `Classify the following user message into exactly one of two categories: 'MEDICAL' or 'CONVERSATIONAL'. 
'MEDICAL' means the user is asking a clinical question, asking about a drug, symptom, disease, or medical scenario.
'CONVERSATIONAL' means the user is just saying hello, asking how you are, making small talk, or thanking you, without any actual medical inquiry.
Output ONLY the category name in all caps.
Message: "${query}"`;
    try {
         const result = await aiModel.generateContent(prompt);
         const text = result.response.text().trim().toUpperCase();
         return text.includes('CONVERSATIONAL') ? 'CONVERSATIONAL' : 'MEDICAL';
    } catch {
         return 'MEDICAL'; // default to medical on error
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

module.exports = {
    extractEnglishKeywords,
    analyzeIntent,
    callAI,
    hasApiKey: !!GEMINI_API_KEY && GEMINI_API_KEY !== 'PASTE_YOUR_GEMINI_KEY_HERE'
};
