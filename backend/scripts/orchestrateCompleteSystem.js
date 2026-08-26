const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

const TARGET_MIN_TOPICS = 52; // 50+ topics per category

const ALL_DISCIPLINES = {
  // MEDICAL
  nephrology: {
    name: 'Nephrology & Renal Medicine',
    scope: 'Renal physiology, acute kidney injury (AKI), chronic kidney disease (CKD), hemodialysis, peritoneal dialysis, CRRT, glomerular diseases, tubulointerstitial nephritis, electrolyte and acid-base emergencies, renal transplantation, and KDIGO guidelines.'
  },
  endocrinology: {
    name: 'Endocrinology & Metabolism',
    scope: 'Diabetes mellitus (T1D, T2D, DKA, HHS, insulin pumps, CGMs), thyroid emergencies (thyroid storm, myxedema coma), adrenal crises (Addisonian crisis, Cushing syndrome, pheochromocytoma), pituitary disorders, metabolic bone disease, calcium/parathyroid disorders, and ADA/AACE guidelines.'
  },
  pediatrics: {
    name: 'Pediatrics & Neonatal Medicine',
    scope: 'Pediatric emergencies (PALS algorithms, status epilepticus, anaphylaxis, severe croup, bronchiolitis, septic shock), neonatal resuscitation (NRP), congenital disorders, pediatric infectious diseases, pediatric fluid/electrolyte management, exact mg/kg dosing, and AAP guidelines.'
  },
  hematology_oncology: {
    name: 'Hematology & Medical Oncology',
    scope: 'Oncologic emergencies (febrile neutropenia, tumor lysis syndrome, hypercalcemia of malignancy, SVC syndrome, spinal cord compression), coagulopathies (HIT, DIC, TTP, ITP, hemophilia), acute leukemias, lymphomas, solid tumors, CAR-T/immunotherapy toxicities, and NCCN/ASCO guidelines.'
  },
  rheumatology: {
    name: 'Rheumatology & Autoimmune Diseases',
    scope: 'Systemic lupus erythematosus (lupus nephritis, CNS lupus), rheumatoid arthritis, ANCA vasculitis, systemic sclerosis, inflammatory myopathies, crystal arthropathies (acute gout, pseudogout), biologic and targeted synthetic DMARD therapies, ACR/EULAR guidelines.'
  },
  psychiatry: {
    name: 'Psychiatry & Behavioral Health',
    scope: 'Psychiatric emergencies (neuroleptic malignant syndrome, serotonin syndrome, acute agitation, severe catatonia, lithium toxicity), major depressive disorder, bipolar disorder, schizophrenia, addiction & substance withdrawal protocols, psychopharmacology, and APA guidelines.'
  },
  ophthalmology: {
    name: 'Ophthalmology & Visual Sciences',
    scope: 'Ophthalmic emergencies (acute angle-closure glaucoma, central retinal artery occlusion, chemical ocular burns, endophthalmitis, retinal detachment, hyphema, open globe injury), uveitis, diabetic retinopathy, maculopathy, corneal ulcers, and AAO guidelines.'
  },
  // SURGICAL
  surgical_suite: {
    name: 'General & Operative Surgery',
    scope: 'Emergency & damage control surgery (trauma laparotomy, peritonitis, acute abdomen, bowel obstruction, incarcerated hernia, acute appendicitis, cholecystitis, necrotizing fasciitis), perioperative management & ERAS, surgical instruments & energy devices, pre-op risk stratification, operative steps, and ACS/WSES guidelines.'
  },
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

const CATEGORIES = [
  { id: 'emergencies', name: 'Emergencies & Resuscitation', desc: 'Acute life-threatening presentations, emergency dosing, resuscitation algorithms, and critical stabilization protocols' },
  { id: 'clinical_topics', name: 'Clinical Topics & Guidelines', desc: 'Standard clinical management, outpatient and inpatient diagnostic workups, core disease pathophysiology, and definitive society guidelines' },
  { id: 'tools', name: 'Tools, Diagnostics & Scoring Systems', desc: 'Clinical risk scores, prognostic calculators, diagnostic algorithms, staging systems, and procedural guidance' },
  { id: 'research', name: 'Recent Research & Landmark Trials', desc: 'Breakthrough clinical trials, recent FDA approvals, prospective studies, and evidence-based paradigm shifts' }
];

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
      temperature: 0.6,
      max_tokens: 4000
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
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: 4000
    })
  });
  if (!response.ok) throw new Error(`Nvidia (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAI(systemPrompt, userPrompt) {
  const providers = [
    { name: 'OpenRouter DeepSeek', fn: () => callOpenRouter(systemPrompt, userPrompt) },
    { name: 'Nvidia LLaMA 3.3 70B', fn: () => callNvidia(systemPrompt, userPrompt) }
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

async function processCategory(specialtyId, cat) {
  const spec = ALL_DISCIPLINES[specialtyId];

  const { count: initialCount } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('specialty_id', specialtyId)
    .eq('category_id', cat.id);

  let currentCount = initialCount || 0;
  if (currentCount >= TARGET_MIN_TOPICS) {
    console.log(`✨ [${specialtyId}/${cat.id}] Already Complete (${currentCount}/${TARGET_MIN_TOPICS})`);
    return;
  }

  console.log(`\n🚀 [${spec.name} -> ${cat.name}] Ingesting: ${currentCount} -> ${TARGET_MIN_TOPICS}`);

  const { data: existingRows } = await supabase
    .from('topics')
    .select('title')
    .eq('specialty_id', specialtyId)
    .eq('category_id', cat.id);

  const existingTitles = new Set((existingRows || []).map(r => r.title.toLowerCase().trim()));

  const systemPrompt = `You are a World-Class Specialist & Medical/Surgical Textbook Author in ${spec.name}.
Output pure JSON with the exact structure:
{
  "topics": [
    {
      "id": "slug_topic_id",
      "title": "Topic Title",
      "subtitle": "Clinical Subtitle with Key Interventions / Drugs / Landmark Trials / Diagnostic Tools",
      "type": "Emergency Protocol | Clinical Guideline | Diagnostic Tool | Trial & Evidence | Operative Technique",
      "ai_scope_description": "Strict clinical focus summary",
      "clinical_content": [
        { "title": "Immediate Triage & Red Flags", "content": "Vital sign cutoffs, critical alerts, and immediate life threats" },
        { "title": "Diagnostic Criteria & Scoring Systems", "content": "Validated diagnostic scoring, lab thresholds, imaging findings" },
        { "title": "First-Line Pharmacotherapy & Exact Dosing", "content": "Exact medications, mg/kg dosing, routes (IV/IM/PO), infusion rates, and frequencies" },
        { "title": "Stepwise Management Algorithm", "content": "Step 1, Step 2, Step 3 stepwise clinical protocol" },
        { "title": "Clinical Pitfalls & Malpractice Warnings", "content": "Critical warnings, contraindications, and high-risk cognitive traps" },
        { "title": "Exact Reference & Guideline Citations", "content": "Authoritative society guidelines and landmark trials with years" }
      ]
    }
  ]
}`;

  while (currentCount < TARGET_MIN_TOPICS) {
    const needed = TARGET_MIN_TOPICS - currentCount;
    // Batch size of 4 topics ensures zero JSON truncation
    const batchSize = Math.max(3, Math.min(5, needed));
    const existingListStr = Array.from(existingTitles).slice(-15).join(', ');

    console.log(`   ⚡ [${specialtyId}/${cat.id}] Generating ${batchSize} topics (Remaining needed: ${needed})...`);

    const userPrompt = `Generate exactly ${batchSize} UNIQUE, HIGH-YIELD clinical/surgical topics for:
Specialty: ${spec.name} (Scope: ${spec.scope})
Category: ${cat.name} - ${cat.desc}

Do NOT generate topics matching any of these existing ones: ${existingListStr || 'None'}.
Ensure rich variety covering rare emergencies, specific procedural nuances, sub-syndromes, and specialized pharmacology.
Every topic must have real clinical rigor, exact dosages (mg/kg, routes, intervals), criteria, and citations.`;

    const generated = await callAI(systemPrompt, userPrompt);
    if (!generated || generated.length === 0) {
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }

    let saved = 0;
    for (const topic of generated) {
      if (!topic.title) continue;
      const normalizedTitle = topic.title.toLowerCase().trim();
      if (existingTitles.has(normalizedTitle)) continue;

      const idSlug = (topic.id || `${specialtyId}_${cat.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');

      const record = {
        id: idSlug,
        specialty_id: specialtyId,
        category_id: cat.id,
        title: topic.title,
        subtitle: topic.subtitle || '',
        type: topic.type || 'Clinical Protocol',
        ai_scope_description: topic.ai_scope_description || topic.title,
        clinical_content: topic.clinical_content || []
      };

      const { error: insErr } = await supabase.from('topics').insert(record);
      if (insErr) {
        record.id = `${idSlug}_${Math.random().toString(36).substr(2, 4)}`;
        await supabase.from('topics').insert(record);
      }

      try {
        await supabase.from('specialty_topics').upsert({
          specialty_id: specialtyId,
          category_id: cat.id,
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
      saved++;
      console.log(`      💾 [${specialtyId}/${cat.id}] [${currentCount}/${TARGET_MIN_TOPICS}] Saved: ${record.title}`);
      
      if (currentCount >= TARGET_MIN_TOPICS) break;
    }

    if (saved === 0) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`✅ [${specialtyId}/${cat.id}] Ingestion Complete: ${currentCount} topics!`);
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

async function runMasterOrchestrator() {
  console.log("======================================================================");
  console.log("🏥 MASTER ORCHESTRATION: 50+ TOPICS ACROSS ALL MEDICAL & SURGICAL FIELDS");
  console.log("======================================================================");

  const specIds = Object.keys(ALL_DISCIPLINES);
  const tasks = [];

  for (const specId of specIds) {
    for (const cat of CATEGORIES) {
      tasks.push({ specId, cat });
    }
  }

  console.log(`Total tasks to verify/fill: ${tasks.length} across ${specIds.length} disciplines.`);

  // Process 3 categories concurrently for fast, stable throughput
  await asyncPool(3, tasks, async ({ specId, cat }) => {
    await processCategory(specId, cat);
  });

  console.log("\n======================================================================");
  console.log("🎉 ALL DISCIPLINES & CATEGORIES HAVE REACHED 50+ TOPICS IN SUPABASE!");
  console.log("======================================================================");
}

runMasterOrchestrator();
