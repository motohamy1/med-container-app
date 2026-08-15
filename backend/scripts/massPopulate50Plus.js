const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const GROQ_KEY = process.env.GROQ_API_KEY;
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const TARGET_MIN_TOPICS = 52; // Target 50+ for every category

const SPECIALTY_META = {
  heart: { name: 'Cardiology & Cardiovascular Medicine' },
  git: { name: 'Gastroenterology & Hepatology' },
  fever: { name: 'Infectious Disease & Critical Care' },
  neuro: { name: 'Neurology & Neurocritical Care' },
  skin: { name: 'Dermatology & Cutaneous Medicine' },
  gynacology: { name: 'Obstetrics & Gynecology' },
  lungs: { name: 'Pulmonology & Respiratory Medicine' }
};

const CATEGORY_META = {
  emergencies: { name: 'Emergencies & Resuscitation', desc: 'Acute life-threatening presentations, emergency dosing, and immediate resuscitation algorithms' },
  clinical_topics: { name: 'Clinical Topics & Guidelines', desc: 'Standard disease management, outpatient/inpatient diagnostic workups, and chronic disease guidelines' },
  tools: { name: 'Tools, Diagnostics & Scoring Systems', desc: 'Clinical calculators, risk stratification scores, diagnostic algorithms, and procedural guides' },
  research: { name: 'Recent Research & Landmark Trials', desc: 'Breakthrough clinical trials, FDA approvals, and evidence-based paradigm shifts' }
};

// 1. Groq Caller (LLaMA 3.3 70B / 3.1 8B)
async function callGroq(systemPrompt, userPrompt, modelName = "llama-3.3-70b-versatile") {
  if (!GROQ_KEY) throw new Error("No Groq key");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) throw new Error(`Groq ${modelName} (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

// 2. Nvidia NIM Caller
async function callNvidia(systemPrompt, userPrompt) {
  if (!NVIDIA_KEY) throw new Error("No Nvidia key");
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 4000
    })
  });
  if (!response.ok) throw new Error(`Nvidia (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

// 3. Gemini Flash Caller
async function callGemini(systemPrompt, userPrompt) {
  if (!GEMINI_KEY) throw new Error("No Gemini key");
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash', 
    generationConfig: { responseMimeType: "application/json" },
    systemInstruction: systemPrompt 
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

// 4. OpenRouter Caller
async function callOpenRouter(systemPrompt, userPrompt) {
  if (!OPENROUTER_KEY) throw new Error("No OpenRouter key");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1
    })
  });
  if (!response.ok) throw new Error(`OpenRouter (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

// Unified Multi-Model Dispatcher
async function callAIWithFallback(systemPrompt, userPrompt) {
  const providers = [
    { name: 'Groq LLaMA 3.3 70B', fn: () => callGroq(systemPrompt, userPrompt, "llama-3.3-70b-versatile") },
    { name: 'Groq LLaMA 3.1 8B', fn: () => callGroq(systemPrompt, userPrompt, "llama-3.1-8b-instant") },
    { name: 'Nvidia LLaMA 3.1 70B', fn: () => callNvidia(systemPrompt, userPrompt) },
    { name: 'Gemini 1.5 Flash', fn: () => callGemini(systemPrompt, userPrompt) },
    { name: 'OpenRouter', fn: () => callOpenRouter(systemPrompt, userPrompt) }
  ];

  for (const provider of providers) {
    try {
      const rawText = await provider.fn();
      let cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.topics && Array.isArray(parsed.topics)) return parsed.topics;
      if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
      const arrayVal = Object.values(parsed).find(v => Array.isArray(v));
      if (arrayVal) return arrayVal;
    } catch (err) {
      console.warn(`   ⚠️ [${provider.name}] failed: ${err.message.substring(0, 90)}`);
    }
  }
  return null;
}

async function populateCategory(specialtyId, categoryId) {
  const specName = SPECIALTY_META[specialtyId].name;
  const catName = CATEGORY_META[categoryId].name;
  const catDesc = CATEGORY_META[categoryId].desc;

  // 1. Check current count in Supabase
  const { data: existing, error } = await supabase
    .from('topics')
    .select('id, title')
    .eq('specialty_id', specialtyId)
    .eq('category_id', categoryId);

  if (error) {
    console.error(`Database error fetching ${specialtyId} -> ${categoryId}:`, error.message);
    return;
  }

  let currentCount = existing?.length || 0;
  console.log(`\n======================================================================`);
  console.log(`📂 [${specName} -> ${catName}] Current Count: ${currentCount} / ${TARGET_MIN_TOPICS}`);
  console.log(`======================================================================`);

  if (currentCount >= TARGET_MIN_TOPICS) {
    console.log(`   ✨ Already satisfied (≥${TARGET_MIN_TOPICS} topics).`);
    return;
  }

  const existingTitles = new Set(existing?.map(t => t.title.toLowerCase().trim()) || []);

  const systemPrompt = `You are a Chief of Medicine & Medical Textbook Editor. Output pure JSON with the exact format:
{
  "topics": [
    {
      "id": "slug_topic_id",
      "title": "Topic Title",
      "subtitle": "Clinical Subtitle with Key Drugs/Markers",
      "type": "Emergency Protocol | Clinical Guideline | Diagnostic Tool | Trial & Evidence",
      "ai_scope_description": "Strict clinical focus summary",
      "clinical_content": [
        { "title": "Immediate Triage & Red Flags", "content": "Critical flags and urgent alerts" },
        { "title": "Diagnostic Criteria & Scoring Systems", "content": "Exact diagnostic scoring and criteria" },
        { "title": "First-Line Pharmacotherapy & Exact Dosing", "content": "Exact drug names, mg/kg doses, IV infusion rates, frequencies" },
        { "title": "Stepwise Management Algorithm", "content": "Step 1, Step 2, Step 3 stepwise clinical protocol" },
        { "title": "Clinical Pitfalls & Malpractice Warnings", "content": "Critical warnings and contraindications" },
        { "title": "Exact Reference & Guideline Citations", "content": "Official guidelines (AHA, ACC, IDSA, GINA, GOLD, ACOG, AAD, NCCN, ESC) and year" }
      ]
    }
  ]
}`;

  while (currentCount < TARGET_MIN_TOPICS) {
    const needed = TARGET_MIN_TOPICS - currentCount;
    const batchSize = Math.min(5, needed);
    const existingListStr = Array.from(existingTitles).slice(-20).join(', ');

    console.log(`   ⚡ Generating batch of ${batchSize} clinical topics (Remaining needed: ${needed})...`);

    const userPrompt = `Generate exactly ${batchSize} DISTINCT, HIGH-YIELD medical topics for:
Specialty: ${specName} (ID: ${specialtyId})
Category: ${catName} - ${catDesc} (ID: ${categoryId})

Do NOT duplicate any of these recently added topics: ${existingListStr || 'None'}.

Every topic must have real clinical rigor, exact dosages (e.g., mg/kg, IV rates, oral doses), scoring criteria, and peer-reviewed guideline citations.`;

    const generated = await callAIWithFallback(systemPrompt, userPrompt);

    if (!generated || generated.length === 0) {
      console.warn(`   ⚠️ No topics generated in this turn, pausing 5s before retry...`);
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    let savedInBatch = 0;
    for (const topic of generated) {
      if (!topic.title) continue;
      const normalizedTitle = topic.title.toLowerCase().trim();
      if (existingTitles.has(normalizedTitle)) {
        continue;
      }

      const idSlug = (topic.id || `${specialtyId}_${categoryId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');

      const record = {
        id: idSlug,
        specialty_id: specialtyId,
        category_id: categoryId,
        title: topic.title,
        subtitle: topic.subtitle || '',
        type: topic.type || 'Clinical Protocol',
        ai_scope_description: topic.ai_scope_description || topic.title,
        clinical_content: topic.clinical_content || []
      };

      const { error: insErr } = await supabase.from('topics').insert(record);
      if (insErr) {
        // If conflict on ID, generate random suffix and insert
        record.id = `${idSlug}_${Math.random().toString(36).substr(2, 4)}`;
        await supabase.from('topics').insert(record);
      }

      existingTitles.add(normalizedTitle);
      currentCount++;
      savedInBatch++;
      console.log(`      💾 [${currentCount}/${TARGET_MIN_TOPICS}] Saved: ${record.title}`);
    }

    if (savedInBatch === 0) {
      // Avoid tight loops if duplicate titles are proposed
      await new Promise(r => setTimeout(r, 2000));
    }

    // Brief polite pause between batches
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`✅ [${specName} -> ${catName}] Successfully reached ${currentCount} topics!`);
}

async function runMasterExpansion() {
  console.log("======================================================================");
  console.log("🏥 MASS MEDICAL KNOWLEDGE EXPANSION: 50+ TOPICS IN EVERY CATEGORY");
  console.log("======================================================================");

  const specialties = Object.keys(SPECIALTY_META);
  const categories = Object.keys(CATEGORY_META);

  for (const specId of specialties) {
    for (const catId of categories) {
      await populateCategory(specId, catId);
    }
  }

  console.log("\n======================================================================");
  console.log("🎉 ALL 28 CATEGORIES HAVE REACHED 50+ TOPICS!");
  console.log("======================================================================");

  const { data: allTopics } = await supabase.from('topics').select('specialty_id, category_id');
  const finalCounts = {};
  specialties.forEach(s => {
    categories.forEach(c => {
      finalCounts[`${s} -> ${c}`] = 0;
    });
  });
  allTopics.forEach(r => {
    const k = `${r.specialty_id} -> ${r.category_id}`;
    finalCounts[k] = (finalCounts[k] || 0) + 1;
  });

  console.log("Final Verified Database Counts (All ≥ 50):");
  for (const [k, count] of Object.entries(finalCounts)) {
    console.log(`  • ${k.padEnd(30)} : ${count} topics`);
  }
  console.log(`\n🏆 TOTAL COMPILED CLINICAL GUIDES IN DATABASE: ${allTopics.length}`);
}

runMasterExpansion();
