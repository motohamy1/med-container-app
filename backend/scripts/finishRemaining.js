const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

const TARGET_MIN_TOPICS = 52;

const REMAINING_TASKS = [
  { specialtyId: 'lungs', categoryId: 'clinical_topics', name: 'Pulmonology & Respiratory Medicine', catName: 'Clinical Topics & Guidelines', desc: 'Standard disease management, outpatient/inpatient diagnostic workups, and chronic disease guidelines' },
  { specialtyId: 'lungs', categoryId: 'tools', name: 'Pulmonology & Respiratory Medicine', catName: 'Tools, Diagnostics & Scoring Systems', desc: 'Clinical calculators, risk stratification scores, diagnostic algorithms, and procedural guides' },
  { specialtyId: 'lungs', categoryId: 'research', name: 'Pulmonology & Respiratory Medicine', catName: 'Recent Research & Landmark Trials', desc: 'Breakthrough clinical trials, FDA approvals, and evidence-based paradigm shifts' },
  { specialtyId: 'nephrology', categoryId: 'emergencies', name: 'Nephrology & Renal Medicine', catName: 'Emergencies & Resuscitation', desc: 'Acute life-threatening presentations, emergency dialysis indications, hyperkalemia, acute kidney injury' },
  { specialtyId: 'nephrology', categoryId: 'clinical_topics', name: 'Nephrology & Renal Medicine', catName: 'Clinical Topics & Guidelines', desc: 'CKD staging, glomerulonephritis, nephrotic syndrome, electrolyte disorders, KDIGO guidelines' },
  { specialtyId: 'nephrology', categoryId: 'tools', name: 'Nephrology & Renal Medicine', catName: 'Tools, Diagnostics & Scoring Systems', desc: 'eGFR calculators, urine anion gap, FeNa/FeUrea, KDIGO staging, fractional excretion' },
  { specialtyId: 'nephrology', categoryId: 'research', name: 'Nephrology & Renal Medicine', catName: 'Recent Research & Landmark Trials', desc: 'SGLT2 inhibitors in CKD (DAPA-CKD, EMPA-KIDNEY), Finerenone (FIDELIO), landmark trials' }
];

async function callAI(systemPrompt, userPrompt) {
  const providers = [
    {
      name: 'OpenRouter DeepSeek',
      fn: async () => {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENROUTER_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "deepseek/deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.1, max_tokens: 4000 })
        });
        const d = await res.json();
        return d.choices[0].message.content;
      }
    },
    {
      name: 'Nvidia LLaMA 3.1 70B',
      fn: async () => {
        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${NVIDIA_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "meta/llama-3.1-70b-instruct", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.1, max_tokens: 4000 })
        });
        const d = await res.json();
        return d.choices[0].message.content;
      }
    }
  ];

  for (const provider of providers) {
    try {
      let rawText = await provider.fn();
      rawText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      let cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");

      const firstBracket = cleaned.indexOf('{');
      const firstArray = cleaned.indexOf('[');
      if (firstBracket !== -1 && (firstArray === -1 || firstBracket < firstArray)) {
        const lastBracket = cleaned.lastIndexOf('}');
        if (lastBracket !== -1) cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      } else if (firstArray !== -1) {
        const lastArray = cleaned.lastIndexOf(']');
        if (lastArray !== -1) cleaned = cleaned.substring(firstArray, lastArray + 1);
      }

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.topics && Array.isArray(parsed.topics)) return parsed.topics;
      if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
      const arrayVal = Object.values(parsed).find(v => Array.isArray(v));
      if (arrayVal) return arrayVal;
    } catch (err) {
      console.warn(`   ⚠️ [${provider.name}] ${err.message.substring(0, 60)}`);
    }
  }
  return null;
}

async function ingestTargetCategory(target) {
  const { count: initialCount } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('specialty_id', target.specialtyId)
    .eq('category_id', target.categoryId);

  let currentCount = initialCount || 0;
  if (currentCount >= TARGET_MIN_TOPICS) {
    console.log(`✨ [${target.specialtyId}/${target.categoryId}] Already at ${currentCount} topics.`);
    return;
  }

  const { data: existingRows } = await supabase
    .from('topics')
    .select('title')
    .eq('specialty_id', target.specialtyId)
    .eq('category_id', target.categoryId);

  const existingTitles = new Set((existingRows || []).map(r => r.title.toLowerCase().trim()));
  console.log(`🚀 [${target.specialtyId}/${target.categoryId}] Starting ingestion from ${currentCount} -> ${TARGET_MIN_TOPICS}`);

  const systemPrompt = `You are an elite Clinical Knowledge Compiler. Output pure JSON format:
{
  "topics": [
    {
      "id": "slug_id",
      "title": "Clear Clinical Title",
      "subtitle": "Informative Subtitle with Key Drugs/Calculations",
      "type": "Emergency Protocol | Clinical Guideline | Diagnostic Tool | Trial & Evidence",
      "ai_scope_description": "Precise clinical focus summary",
      "clinical_content": [
        { "title": "Immediate Triage & Red Flags", "content": "Critical alerts, vital thresholds" },
        { "title": "Diagnostic Criteria & Scoring Systems", "content": "Validated cutoffs and scoring" },
        { "title": "First-Line Pharmacotherapy & Exact Dosing", "content": "Exact medications, mg/kg dosing, routes, frequencies" },
        { "title": "Stepwise Management Algorithm", "content": "1-2-3 Stepwise protocol" },
        { "title": "Clinical Pitfalls & Malpractice Warnings", "content": "Contraindications and dangerous mistakes" },
        { "title": "Exact Reference & Guideline Citations", "content": "Authoritative guidelines (KDIGO, GINA, GOLD, ATS/ERS, ASN) and landmark trials" }
      ]
    }
  ]
}`;

  while (currentCount < TARGET_MIN_TOPICS) {
    const needed = TARGET_MIN_TOPICS - currentCount;
    const batchSize = Math.min(6, needed);
    const existingListStr = Array.from(existingTitles).slice(-20).join(', ');

    const userPrompt = `Generate exactly ${batchSize} DISTINCT, HIGH-YIELD clinical topics for:
Specialty: ${target.name} (ID: ${target.specialtyId})
Category: ${target.catName} - ${target.desc} (ID: ${target.categoryId})

Avoid duplicates of: ${existingListStr || 'None'}.
Every topic must have real clinical rigor, exact dosages (mg/kg, routes, intervals), criteria, and citations.`;

    const generated = await callAI(systemPrompt, userPrompt);
    if (!generated || generated.length === 0) {
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }

    let saved = 0;
    for (const topic of generated) {
      if (!topic.title) continue;
      const norm = topic.title.toLowerCase().trim();
      if (existingTitles.has(norm)) continue;

      const idSlug = (topic.id || `${target.specialtyId}_${target.categoryId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');

      const record = {
        id: idSlug,
        specialty_id: target.specialtyId,
        category_id: target.categoryId,
        title: topic.title,
        subtitle: topic.subtitle || '',
        type: topic.type || 'Clinical Protocol',
        ai_scope_description: topic.ai_scope_description || topic.title,
        clinical_content: topic.clinical_content || []
      };

      const { error: err1 } = await supabase.from('topics').insert(record);
      if (err1) {
        record.id = `${idSlug}_${Math.random().toString(36).substr(2, 4)}`;
        await supabase.from('topics').insert(record);
      }

      try {
        await supabase.from('specialty_topics').upsert({
          specialty_id: target.specialtyId,
          category_id: target.categoryId,
          topic_id: record.id,
          title: record.title,
          subtitle: record.subtitle,
          type: record.type,
          ai_scope_description: record.ai_scope_description,
          clinical_content: record.clinical_content,
          updated_at: new Date().toISOString()
        }, { onConflict: 'specialty_id,topic_id' });
      } catch (_) {}

      existingTitles.add(norm);
      currentCount++;
      saved++;
      console.log(`   💾 [${target.specialtyId}/${target.categoryId}] [${currentCount}/${TARGET_MIN_TOPICS}] Saved: ${record.title}`);
    }

    if (saved === 0) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`✅ [${target.specialtyId}/${target.categoryId}] Ingestion Complete: ${currentCount} topics!`);
}

async function runFinish() {
  console.log("======================================================================");
  console.log("🎯 COMPLETING REMAINING CATEGORIES TO REACH 50+ IN EVERY SPECIALTY");
  console.log("======================================================================");

  // Run 2 parallel category workers
  const poolLimit = 2;
  const executing = [];
  for (const target of REMAINING_TASKS) {
    const p = Promise.resolve().then(() => ingestTargetCategory(target));
    if (poolLimit <= REMAINING_TASKS.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  await Promise.all(executing);

  console.log("\n======================================================================");
  console.log("🎉 ALL MEDICAL SPECIALTIES & CATEGORIES HAVE REACHED 50+ TOPICS!");
  console.log("======================================================================");
}

runFinish();
