const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function loadEnv() {
    try {
        const envContent = fs.readFileSync('backend/.env', 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}
const env = loadEnv();
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || env.EXPO_PUBLIC_GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ 
    model: 'gemini-flash-latest',
    generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
    }
});

async function run() {
    const prompt = `
STRICT OUTPUT RULE:
- Your response MUST START immediately with the first ##SECTION HEADING##.
- LANGUAGE RULE: Match the user's language perfectly. If the query is in English, respond ONLY in English. If the query is in Arabic, respond in Arabic with medical terminology in English in parentheses.
- ZERO markdown formatting allowed inside sections.
- ALL HEADINGS must be in ALL CAPS.

HEADING CATEGORIES (Pick the most relevant 3-5 sections):
- CLINICAL: ##DEFINITION##, ##CLINICAL ASSESSMENT##, ##DIFFERENTIAL DIAGNOSIS##, ##INVESTIGATIONS / WORKUP##, ##MANAGEMENT PROTOCOL##

NOW RESPOND TO THE CLINICAL QUERY (START WITH ##):
ايه الفرق بين ال cholangitis و ال cholestasis
`;
    const res = await aiModel.generateContent(prompt);
    let rawReply = res.response.text();
    console.log('--- RAW REPLY ---');
    console.log(rawReply);
    
    let normalized = rawReply;
    normalized = normalized.replace(/^(#{1,4})\s*([^#\n]+?)\s*#*$/gm, (m, h, t) => `##${t.trim().toUpperCase()}##`);
    normalized = normalized.replace(/^\*\*\s*([^*\n]+)\s*\*\*$/gm, (m, t) => `##${t.trim().toUpperCase()}##`);
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
    console.log('--- FINAL REPLY ---');
    console.log(finalReply);
}
run();
