const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

const providers = [];
if (GEMINI_KEY) providers.push('gemini');
if (OPENROUTER_KEY) providers.push('openrouter');
if (NVIDIA_KEY) providers.push('nvidia');

if (providers.length === 0) {
    console.error("❌ ERROR: No API keys found in backend/.env (Need at least one: GEMINI, OPENROUTER, or NVIDIA)");
    process.exit(1);
}

let currentProviderIndex = 0;

const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-flash-latest', generationConfig: { responseMimeType: "application/json" } }) : null;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SPECIALTIES = [
    { id: 'heart', name: 'Cardiology' },
    { id: 'git', name: 'Gastroenterology' },
    { id: 'fever', name: 'Infectious Disease & Critical Care' },
    { id: 'neuro', name: 'Neurology' },
    { id: 'skin', name: 'Dermatology' },
    { id: 'gynacology', name: 'Obstetrics & Gynecology' },
    { id: 'lungs', name: 'Pulmonology' }
];

const CATEGORIES = [
    { id: 'emergencies', name: 'Emergencies', desc: 'Acute conditions and protocols' },
    { id: 'clinical_topics', name: 'Clinical Topics', desc: 'Standard guidelines and diseases' },
    { id: 'tools', name: 'Tools & Diagnostics', desc: 'Interpretations and procedures' },
    { id: 'research', name: 'Recent Research', desc: 'Latest evidence-based medicine and landmark trials' }
];

async function callGeminiDirect(prompt) {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
}

async function callOpenRouter(prompt) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENROUTER_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "openrouter/free", messages: [{ role: "user", content: prompt }] })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`429 OpenRouter Quota Error (${response.status}): ${errText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callNvidia(prompt) {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${NVIDIA_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
            model: "meta/llama-3.1-70b-instruct", 
            messages: [{ role: "user", content: prompt }],
            max_tokens: 4000
        })
    });
    if (!response.ok) throw new Error(`429 Nvidia Quota Error (${response.status}): ${await response.text()}`);
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callAI(prompt, retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const providerName = providers[currentProviderIndex];
        try {
            let text = "";
            if (providerName === 'gemini') {
                text = await callGeminiDirect(prompt);
            } else if (providerName === 'openrouter') {
                text = await callOpenRouter(prompt);
            } else if (providerName === 'nvidia') {
                text = await callNvidia(prompt);
            }

            text = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
            text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, " "); // Clean control chars
            
            return JSON.parse(text);

        } catch (error) {
            console.error(`   ⚠️ [${providerName.toUpperCase()}] Attempt ${attempt} failed: ${error.message.substring(0, 150)}...`);
            
            // Check for Rate Limit or Quota
            if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
                console.log(`   🔄 Quota exhausted for ${providerName.toUpperCase()}. Routing to next provider...`);
                currentProviderIndex = (currentProviderIndex + 1) % providers.length;
                console.log(`   ➡️ Switched AI Engine to: ${providers[currentProviderIndex].toUpperCase()}`);
                
                // If we've looped through all providers and they ALL rate limit, sleep for 30s
                if (currentProviderIndex === 0) {
                    console.log(`   ⏳ All providers exhausted! Sleeping 30 seconds...`);
                    await new Promise(r => setTimeout(r, 30000));
                }
                
                continue; // Immediately try the next provider without incrementing standard retry wait
            }
            
            if (attempt === retries) return null;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    return null;
}

async function getExhaustiveTopicList(specialty, category) {
    console.log(`\n🔍 Fetching exhaustive topic blueprint for ${specialty.name} - ${category.name} (Using ${providers[currentProviderIndex].toUpperCase()})...`);
    
    const prompt = `
    You are a Chief Medical Officer building an exhaustive medical encyclopedia.
    List absolutely EVERY major and minor topic for the specialty "${specialty.name}" in the category "${category.name}" (${category.desc}).
    This must be an exhaustive, completely comprehensive list. Include everything a doctor would ever need to look up.
    
    Return a JSON array of objects with this exact schema:
    {
      "id": "string (unique identifier, e.g., 'acs_stemi', lowercase, underscores)",
      "title": "string (e.g., 'Acute Coronary Syndrome')",
      "subtitle": "string (e.g., 'STEMI vs NSTEMI Workup & Management')",
      "type": "string (e.g., 'Clinical Protocol', 'Guidelines')",
      "ai_scope_description": "string (A detailed instruction of what clinical content should be written for this topic)"
    }
    `;

    const topicList = await callAI(prompt);
    if (!topicList) return [];
    
    console.log(`📋 Discovered ${topicList.length} exhaustive topics for ${specialty.name} - ${category.name}`);
    return topicList;
}

async function generateTopicContent(specialty, category, topic) {
    console.log(`   ✍️ Generating deep clinical content for topic: ${topic.title} (Using ${providers[currentProviderIndex].toUpperCase()})...`);
    
    const prompt = `
    You are an expert physician writing content for a medical encyclopedia.
    Write the deep clinical content for the topic "${topic.title}" (${topic.subtitle}) in the specialty "${specialty.name}".
    Scope of what to write: ${topic.ai_scope_description}.
    Use high-yield references (e.g., AHA, IDSA, UpToDate).
    
    Return a JSON array of objects representing the sections of the content.
    Schema:
    [
      { "title": "string (e.g., 'Definition')", "content": "string (The detailed medical text)" },
      { "title": "string (e.g., 'Clinical Presentation')", "content": "string" },
      { "title": "string (e.g., 'Management Guidelines')", "content": "string" }
    ]
    Include as many sections as needed for extreme comprehensiveness.
    `;

    const content = await callAI(prompt, 3);
    return content || [];
}

async function generateTopicsForCategory(specialty, category) {
    const topicsBlueprint = await getExhaustiveTopicList(specialty, category);
    if (topicsBlueprint.length === 0) return;

    const { data: existingTopics } = await supabase
        .from('topics')
        .select('id')
        .eq('specialty_id', specialty.id)
        .eq('category_id', category.id);
        
    const existingIds = new Set(existingTopics?.map(t => t.id) || []);

    for (const topicBlueprint of topicsBlueprint) {
        if (existingIds.has(topicBlueprint.id)) {
            console.log(`   ⏩ Skipping ${topicBlueprint.title}, already exists.`);
            continue;
        }

        const clinicalContent = await generateTopicContent(specialty, category, topicBlueprint);
        
        if (clinicalContent && clinicalContent.length > 0) {
            const record = {
                specialty_id: specialty.id,
                category_id: category.id,
                id: topicBlueprint.id,
                title: topicBlueprint.title,
                subtitle: topicBlueprint.subtitle,
                type: topicBlueprint.type,
                ai_scope_description: topicBlueprint.ai_scope_description,
                clinical_content: clinicalContent
            };

            const { error } = await supabase.from('topics').upsert(record);
            if (error) {
                console.error(`   ❌ Failed to save ${topicBlueprint.title}:`, error.message);
            } else {
                console.log(`   💾 Saved ${topicBlueprint.title} successfully.`);
            }
        }
        
        // Minor rate limit between successes
        await new Promise(r => setTimeout(r, 2000));
    }
}

async function run() {
    console.log(`🚀 Starting Multi-Engine Medical Knowledge Generation...`);
    console.log(`Enabled AI Engines: ${providers.join(', ').toUpperCase()}`);
    
    for (const specialty of SPECIALTIES) {
        for (const category of CATEGORIES) {
            await generateTopicsForCategory(specialty, category);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    
    console.log("🎉 Complete! All exhaustive specialties generated and saved.");
}

run();
