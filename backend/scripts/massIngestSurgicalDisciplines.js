const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

const TARGET_MIN_TOPICS = 52; // 50+ topics per category

const SURGICAL_SPECIALTY_META = {
  surgery_gi: {
    name: 'GI & Acute Care Surgery',
    scope: 'Hepatobiliary surgery, laparoscopic cholecystectomy, common bile duct exploration, colorectal resections, bariatric surgery, acute peritonitis, toxic megacolon, mesenteric ischemia, and complex abdominal wall reconstruction.'
  },
  surgery_neuro: {
    name: 'Neurosurgery & Spine',
    scope: 'Craniotomy for acute subdural/epidural hematomas, intracranial pressure (ICP) management, brain tumor resection, subarachnoid hemorrhage & aneurysm clipping/coiling, anterior cervical discectomy and fusion (ACDF), and spine trauma stabilization.'
  },
  surgery_cardio: {
    name: 'Cardiothoracic Surgery',
    scope: 'Coronary artery bypass grafting (CABG on-pump/off-pump), aortic valve replacement (AVR/TAVR), mitral valve repair/replacement, ascending aortic dissection repair (Type A), VATS lobectomy, pneumonectomy, and cardiopulmonary bypass (CPB) management.'
  },
  surgery_vascular: {
    name: 'Vascular & Endovascular Surgery',
    scope: 'Abdominal aortic aneurysm (AAA) repair (EVAR vs open), carotid endarterectomy (CEA) & CAS, acute limb ischemia embolectomy/thrombolysis, peripheral artery bypass (fem-pop), deep venous thrombosis interventions, and arteriovenous fistula (AVF) creation.'
  },
  surgery_trauma: {
    name: 'Trauma & Damage Control Surgery',
    scope: 'ATLS trauma resuscitation, damage control laparotomy, resuscitative thoracotomy, REBOA placement, pelvic packing, liver/splenic trauma packing, massive transfusion protocols (1:1:1), and thoracic trauma chest tubes/thoracoscopy.'
  },
  surgery_ortho: {
    name: 'Orthopedic & Trauma Surgery',
    scope: 'Open fracture debridement & Gustilo-Anderson classification, emergent fasciotomy for acute compartment syndrome, pelvic ring injury stabilization, septic arthritis arthrotomy, total hip/knee arthroplasty, and spinal trauma reduction/fixation.'
  },
  surgery_urology: {
    name: 'Urological & Genitourinary Surgery',
    scope: 'Obstructive stone emergency (ureteral stenting/nephrostomy), testicular torsion detorsion/orchiopexy, Fournier gangrene debridement, priapism aspiration/shunt, radical prostatectomy, radical cystectomy with ileal conduit, and partial/radical nephrectomy.'
  }
};

const CATEGORY_META = {
  emergencies: {
    name: 'Emergencies & Trauma',
    desc: 'Acute operative indications, damage control, hemorrhagic shock resuscitation, and emergent surgical interventions'
  },
  clinical_topics: {
    name: 'Operative & Clinical Topics',
    desc: 'Core operative procedures, surgical anatomy, indications, elective workups, and disease management'
  },
  tools: {
    name: 'Surgical Tools & Scoring Systems',
    desc: 'Operative instruments, energy devices (electrocautery, ultrasonic, bipolar), surgical risk scores (ASA, POSSUM, NSQIP), and staging classifications'
  },
  research: {
    name: 'Surgical Trials & ERAS Protocols',
    desc: 'Landmark randomized surgical trials, Enhanced Recovery After Surgery (ERAS) protocols, and evidence-based surgical innovation'
  }
};

async function callOpenRouter(systemPrompt, userPrompt) {
  if (!OPENROUTER_KEY) throw new Error("No OpenRouter key");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 3800
    })
  });
  if (!response.ok) throw new Error(`OpenRouter (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

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
      max_tokens: 3800
    })
  });
  if (!response.ok) throw new Error(`Nvidia (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAIWithFallback(systemPrompt, userPrompt) {
  const providers = [
    { name: 'OpenRouter DeepSeek', fn: () => callOpenRouter(systemPrompt, userPrompt) },
    { name: 'Nvidia LLaMA 3.1 70B', fn: () => callNvidia(systemPrompt, userPrompt) }
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
      console.warn(`   ⚠️ [${provider.name}] warning: ${err.message.substring(0, 80)}`);
    }
  }
  return null;
}

async function populateSurgicalCategory(specialtyId, categoryId) {
  const spec = SURGICAL_SPECIALTY_META[specialtyId];
  const cat = CATEGORY_META[categoryId];

  const { count: initialCount, error: countErr } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('specialty_id', specialtyId)
    .eq('category_id', categoryId);

  if (countErr) {
    console.error(`Database count error for ${specialtyId} -> ${categoryId}:`, countErr.message);
    return;
  }

  let currentCount = initialCount || 0;
  if (currentCount >= TARGET_MIN_TOPICS) {
    console.log(`✨ [${spec.name} -> ${cat.name}] Already satisfied: ${currentCount}/${TARGET_MIN_TOPICS}`);
    return;
  }

  console.log(`\n======================================================================`);
  console.log(`🔪 [${spec.name} -> ${cat.name}] Starting surgical ingestion: ${currentCount} -> ${TARGET_MIN_TOPICS}`);
  console.log(`======================================================================`);

  const { data: existingRows } = await supabase
    .from('topics')
    .select('title')
    .eq('specialty_id', specialtyId)
    .eq('category_id', categoryId);

  const existingTitles = new Set((existingRows || []).map(r => r.title.toLowerCase().trim()));

  const systemPrompt = `You are a Master Attending Surgeon & Editor of Sabiston/Schwartz Textbook of Surgery in ${spec.name}.
Output pure JSON with the exact format:
{
  "topics": [
    {
      "id": "slug_topic_id",
      "title": "Topic Title",
      "subtitle": "Operative Subtitle with Key Techniques / Instruments / Trials / Scores",
      "type": "Operative Technique | Emergency Protocol | Diagnostic Tool | Trial & Evidence",
      "ai_scope_description": "Strict surgical focus summary",
      "clinical_content": [
        { "title": "Immediate Triage & Red Flags", "content": "Surgical emergency criteria, vitals, operative indications" },
        { "title": "Diagnostic Criteria & Scoring Systems", "content": "Surgical classifications, imaging findings, risk scores" },
        { "title": "First-Line Pharmacotherapy & Exact Dosing", "content": "Perioperative antibiotics, anesthesia considerations, exact dosing, resuscitation fluids" },
        { "title": "Stepwise Management Algorithm", "content": "Step 1 incision/exposure, Step 2 operative dissection/resection, Step 3 reconstruction/closure" },
        { "title": "Clinical Pitfalls & Malpractice Warnings", "content": "Critical surgical pitfalls, anatomical danger zones, iatrogenic injury prevention" },
        { "title": "Exact Reference & Guideline Citations", "content": "Official surgical society guidelines (ACS, WSES, EAST, STS, SVS, AUA, AAOS, AANS) and landmark trials" }
      ]
    }
  ]
}`;

  while (currentCount < TARGET_MIN_TOPICS) {
    const needed = TARGET_MIN_TOPICS - currentCount;
    const batchSize = Math.min(6, needed);
    const existingListStr = Array.from(existingTitles).slice(-25).join(', ');

    console.log(`   ⚡ [${specialtyId}/${categoryId}] Generating batch of ${batchSize} surgical topics (Remaining needed: ${needed})...`);

    const userPrompt = `Generate exactly ${batchSize} DISTINCT, HIGH-YIELD surgical topics for:
Specialty: ${spec.name} (Scope: ${spec.scope})
Category: ${cat.name} - ${cat.desc}

Do NOT duplicate any of these recently added topics: ${existingListStr || 'None'}.

Every topic must have genuine operative rigor, stepwise surgical steps, anatomical landmarks, energy device selections, and peer-reviewed guideline citations.`;

    const generated = await callAIWithFallback(systemPrompt, userPrompt);

    if (!generated || generated.length === 0) {
      console.warn(`   ⚠️ No surgical topics generated in this turn, pausing 2s...`);
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }

    let savedInBatch = 0;
    for (const topic of generated) {
      if (!topic.title) continue;
      const normalizedTitle = topic.title.toLowerCase().trim();
      if (existingTitles.has(normalizedTitle)) continue;

      const idSlug = (topic.id || `${specialtyId}_${categoryId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');

      const record = {
        id: idSlug,
        specialty_id: specialtyId,
        category_id: categoryId,
        title: topic.title,
        subtitle: topic.subtitle || '',
        type: topic.type || 'Operative Protocol',
        ai_scope_description: topic.ai_scope_description || topic.title,
        clinical_content: topic.clinical_content || []
      };

      // 1. Insert into topics
      const { error: insErr } = await supabase.from('topics').insert(record);
      if (insErr) {
        record.id = `${idSlug}_${Math.random().toString(36).substr(2, 4)}`;
        await supabase.from('topics').insert(record);
      }

      // 2. Mirror into specialty_topics
      try {
        await supabase.from('specialty_topics').upsert({
          specialty_id: specialtyId,
          category_id: categoryId,
          topic_id: record.id,
          title: record.title,
          subtitle: record.subtitle,
          type: record.type,
          ai_scope_description: record.ai_scope_description,
          clinical_content: record.clinical_content,
          updated_at: new Date().toISOString()
        }, { onConflict: 'specialty_id,topic_id' });
      } catch (_) {}

      existingTitles.add(normalizedTitle);
      currentCount++;
      savedInBatch++;
      console.log(`      💾 [${specialtyId}/${categoryId}] [${currentCount}/${TARGET_MIN_TOPICS}] Saved: ${record.title}`);
    }

    if (savedInBatch === 0) {
      await new Promise(r => setTimeout(r, 1500));
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`✅ [${spec.name} -> ${cat.name}] Successfully reached ${currentCount} topics!`);
}

async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    if (poolLimit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

async function runSurgicalExpansion() {
  console.log("======================================================================");
  console.log("🔪 MASS INGESTION OF SURGICAL SUBSPECIALTIES (50+ TOPICS PER CATEGORY)");
  console.log("======================================================================");

  const specialties = Object.keys(SURGICAL_SPECIALTY_META);
  const categories = Object.keys(CATEGORY_META);

  const taskQueue = [];
  for (const specId of specialties) {
    for (const catId of categories) {
      taskQueue.push({ specId, catId });
    }
  }

  console.log(`Total surgical category tasks to process: ${taskQueue.length} across ${specialties.length} surgical disciplines.`);

  // Run 2 surgical category workers concurrently
  await asyncPool(2, taskQueue, async ({ specId, catId }) => {
    await populateSurgicalCategory(specId, catId);
  });

  console.log("\n======================================================================");
  console.log("🎉 ALL SURGICAL DISCIPLINES FULLY INGESTED (>= 50 TOPICS EACH)!");
  console.log("======================================================================");
}

runSurgicalExpansion();
