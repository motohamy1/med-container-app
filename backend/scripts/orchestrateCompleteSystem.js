const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const TARGET_MIN_TOPICS = 52; // 50+ topics per category

const ALL_DISCIPLINES = {
  // --- PRIMARY MEDICAL SPECIALTIES ---
  heart: {
    name: 'Cardiology',
    scientificName: 'Cardiovascular Medicine',
    icon: 'heart',
    color: '#d18c90',
    scope: 'Acute coronary syndromes, heart failure, cardiogenic shock, arrhythmias, valvular heart disease, hypertension, lipidology, and ACC/AHA/ESC guidelines.'
  },
  git: {
    name: 'Gastroenterology',
    scientificName: 'Gastroenterology & Hepatology',
    icon: 'restaurant',
    color: '#d2b689',
    scope: 'Acute GI bleeding, acute pancreatitis, acute liver failure, cirrhosis/portal hypertension, IBD, peptic ulcer disease, endoscopy, and ACG/AGA guidelines.'
  },
  fever: {
    name: 'Infectious Disease',
    scientificName: 'Infectious Disease & Critical Care',
    icon: 'thermometer',
    color: '#6f9ccb',
    scope: 'Sepsis resuscitation, septic shock, bacterial meningitis, severe pneumonia, fungal/viral infections, antimicrobial stewardship, HIV/TB, and IDSA/Surviving Sepsis guidelines.'
  },
  neuro: {
    name: 'Neurology',
    scientificName: 'Neurology & Neurocritical Care',
    icon: 'eye',
    color: '#a78bfa',
    scope: 'Acute ischemic stroke (tPA/thrombectomy), intracerebral hemorrhage, status epilepticus, myasthenia crisis, Guillain-Barré, meningitis, coma, and AAN/AHA guidelines.'
  },
  skin: {
    name: 'Dermatology',
    scientificName: 'Dermatology & Cutaneous Medicine',
    icon: 'flower',
    color: '#f472b6',
    scope: 'Dermatologic emergencies (SJS/TEN, DRESS, angioedema), psoriasis, eczema, bullous pemphigoid, melanoma/NMSC, cutaneous infections, and AAD guidelines.'
  },
  gynacology: {
    name: 'OB/GYN',
    scientificName: 'Obstetrics & Gynecology',
    icon: 'female',
    color: '#fb7185',
    scope: 'Obstetric emergencies (postpartum hemorrhage, preeclampsia/eclampsia, ectopic pregnancy), pelvic inflammatory disease, gynecologic oncology, abnormal uterine bleeding, and ACOG guidelines.'
  },
  lungs: {
    name: 'Pulmonology',
    scientificName: 'Pulmonology & Respiratory Care',
    icon: 'cloudy',
    color: '#38bdf8',
    scope: 'Acute respiratory failure, ARDS, massive PE, severe asthma/COPD exacerbations, diffuse parenchymal lung disease, pleural effusion, and ATS/ERS/GOLD guidelines.'
  },
  nephrology: {
    name: 'Nephrology',
    scientificName: 'Nephrology & Renal Medicine',
    icon: 'water',
    color: '#defff9',
    scope: 'Renal physiology, acute kidney injury (AKI), chronic kidney disease (CKD), hemodialysis, peritoneal dialysis, CRRT, glomerular diseases, tubulointerstitial nephritis, electrolyte and acid-base emergencies, and KDIGO guidelines.'
  },
  endocrinology: {
    name: 'Endocrinology',
    scientificName: 'Endocrinology & Metabolism',
    icon: 'speedometer',
    color: '#ffc3dd',
    scope: 'Diabetes mellitus (T1D, T2D, DKA, HHS, insulin pumps, CGMs), thyroid emergencies (thyroid storm, myxedema coma), adrenal crises (Addisonian crisis, Cushing syndrome, pheochromocytoma), pituitary disorders, metabolic bone disease, calcium/parathyroid disorders, and ADA/AACE guidelines.'
  },
  critical_care: {
    name: 'Critical Care',
    scientificName: 'Emergency & Critical Care Medicine (ICU)',
    icon: 'medkit',
    color: '#6dc2bd',
    scope: 'Undifferentiated shock resuscitation (RUSH protocol), mechanical ventilation & ARDS lung-protective strategies, rapid sequence intubation (RSI) in hemodynamic instability, vasoactive/inotrope titration, invasive hemodynamic monitoring (arterial lines, CVC, PiCCO), ICU sedation, delirium, and sepsis bundles.'
  },
  pediatrics: {
    name: 'Pediatrics',
    scientificName: 'Pediatrics & Neonatal Medicine',
    icon: 'happy',
    color: '#defff9',
    scope: 'Pediatric emergencies (PALS algorithms, status epilepticus, anaphylaxis, severe croup, bronchiolitis, septic shock), neonatal resuscitation (NRP), congenital disorders, pediatric infectious diseases, pediatric fluid/electrolyte management, exact mg/kg dosing, and AAP guidelines.'
  },
  hematology_oncology: {
    name: 'Heme-Oncology',
    scientificName: 'Hematology & Medical Oncology',
    icon: 'fitness',
    color: '#dbd4fd',
    scope: 'Oncologic emergencies (febrile neutropenia, tumor lysis syndrome, hypercalcemia of malignancy, SVC syndrome, spinal cord compression), coagulopathies (HIT, DIC, TTP, ITP, hemophilia), acute leukemias, lymphomas, solid tumors, CAR-T/immunotherapy toxicities, and NCCN/ASCO guidelines.'
  },
  rheumatology: {
    name: 'Rheumatology',
    scientificName: 'Rheumatology & Autoimmune Diseases',
    icon: 'body',
    color: '#ffc3dd',
    scope: 'Systemic lupus erythematosus (lupus nephritis, CNS lupus), rheumatoid arthritis, ANCA vasculitis, systemic sclerosis, inflammatory myopathies, crystal arthropathies (acute gout, pseudogout), biologic and targeted synthetic DMARD therapies, ACR/EULAR guidelines.'
  },
  psychiatry: {
    name: 'Psychiatry',
    scientificName: 'Psychiatry & Behavioral Health',
    icon: 'sparkles',
    color: '#6dc2bd',
    scope: 'Psychiatric emergencies (neuroleptic malignant syndrome, serotonin syndrome, acute agitation, severe catatonia, lithium toxicity), major depressive disorder, bipolar disorder, schizophrenia, addiction & substance withdrawal protocols, psychopharmacology, and APA guidelines.'
  },
  ophthalmology: {
    name: 'Ophthalmology',
    scientificName: 'Ophthalmology & Visual Sciences',
    icon: 'eye',
    color: '#dbd4fd',
    scope: 'Ophthalmic emergencies (acute angle-closure glaucoma, central retinal artery occlusion, chemical ocular burns, endophthalmitis, retinal detachment, hyphema, open globe injury), uveitis, diabetic retinopathy, maculopathy, corneal ulcers, and AAO guidelines.'
  },

  // --- SURGICAL SPECIALTIES ---
  surgical_suite: {
    name: 'Surgery',
    scientificName: 'General & Operative Surgery',
    icon: 'cut',
    color: '#d18c90',
    scope: 'Emergency & damage control surgery (trauma laparotomy, peritonitis, acute abdomen, bowel obstruction, incarcerated hernia, acute appendicitis, cholecystitis, necrotizing fasciitis), perioperative management & ERAS, surgical instruments & energy devices, pre-op risk stratification, operative steps, and ACS/WSES guidelines.'
  },
  surgery_gi: {
    name: 'GI Surgery',
    scientificName: 'Gastrointestinal & General Surgery',
    icon: 'cut',
    color: '#ffc3dd',
    scope: 'Hepatobiliary surgery, laparoscopic cholecystectomy, common bile duct exploration, colorectal resections, bariatric surgery, acute peritonitis, toxic megacolon, mesenteric ischemia, and complex abdominal wall reconstruction.'
  },
  surgery_neuro: {
    name: 'Neurosurgery',
    scientificName: 'Neurological & Spine Surgery',
    icon: 'pulse',
    color: '#defff9',
    scope: 'Craniotomy for acute subdural/epidural hematomas, intracranial pressure (ICP) management, brain tumor resection, subarachnoid hemorrhage & aneurysm clipping/coiling, anterior cervical discectomy and fusion (ACDF), and spine trauma stabilization.'
  },
  surgery_cardio: {
    name: 'Cardiothoracic Surgery',
    scientificName: 'Cardiothoracic & Thoracic Surgery',
    icon: 'heart',
    color: '#6dc2bd',
    scope: 'Coronary artery bypass grafting (CABG on-pump/off-pump), aortic valve replacement (AVR/TAVR), mitral valve repair/replacement, ascending aortic dissection repair (Type A), VATS lobectomy, pneumonectomy, and cardiopulmonary bypass (CPB) management.'
  },
  surgery_vascular: {
    name: 'Vascular Surgery',
    scientificName: 'Vascular & Endovascular Surgery',
    icon: 'git-network',
    color: '#dbd4fd',
    scope: 'Abdominal aortic aneurysm (AAA) repair (EVAR vs open), carotid endarterectomy (CEA) & CAS, acute limb ischemia embolectomy/thrombolysis, peripheral artery bypass (fem-pop), deep venous thrombosis interventions, and arteriovenous fistula (AVF) creation.'
  },
  surgery_trauma: {
    name: 'Trauma Surgery',
    scientificName: 'Trauma & Acute Care Surgery',
    icon: 'flame',
    color: '#ffc3dd',
    scope: 'ATLS trauma resuscitation, damage control laparotomy, resuscitative thoracotomy, REBOA placement, pelvic packing, liver/splenic trauma packing, massive transfusion protocols (1:1:1), and thoracic trauma chest tubes/thoracoscopy.'
  },
  surgery_ortho: {
    name: 'Orthopedic Surgery',
    scientificName: 'Orthopedic & Trauma Surgery',
    icon: 'fitness',
    color: '#defff9',
    scope: 'Open fracture debridement & Gustilo-Anderson classification, emergent fasciotomy for acute compartment syndrome, pelvic ring injury stabilization, septic arthritis arthrotomy, total hip/knee arthroplasty, and spinal trauma reduction/fixation.'
  },
  surgery_urology: {
    name: 'Urological Surgery',
    scientificName: 'Urological & Genitourinary Surgery',
    icon: 'medkit',
    color: '#6dc2bd',
    scope: 'Obstructive stone emergency (ureteral stenting/nephrostomy), testicular torsion detorsion/orchiopexy, Fournier gangrene debridement, priapism aspiration/shunt, radical prostatectomy, radical cystectomy with ileal conduit, and partial/radical nephrectomy.'
  },
  surgery_plastics: {
    name: 'Plastic Surgery',
    scientificName: 'Plastic, Reconstructive & Burn Surgery',
    icon: 'body',
    color: '#ffc3dd',
    scope: 'Microvascular free tissue transfer (ALT flap, DIEP flap, fibula flap), complex wound coverage, severe thermal/chemical burn resuscitation (Parkland formula) & tangential excision/grafting, facial trauma fractures & soft tissue repair, hand trauma/tendon repairs, and replantation.'
  },
  surgery_pediatric: {
    name: 'Pediatric Surgery',
    scientificName: 'Pediatric & Neonatal Surgery',
    icon: 'people',
    color: '#defff9',
    scope: 'Neonatal surgical emergencies (tracheoesophageal fistula/esophageal atresia, congenital diaphragmatic hernia, omphalocele/gastroschisis, necrotizing enterocolitis/NEC), hypertrophic pyloric stenosis pyloromyotomy, malrotation with midgut volvulus (Ladd procedure), Hirschsprung pull-through, and pediatric intussusception.'
  },
  surgery_ent: {
    name: 'ENT / Head & Neck',
    scientificName: 'Otolaryngology & Head/Neck Surgery',
    icon: 'headset',
    color: '#6dc2bd',
    scope: 'Emergency surgical airway (cricothyroidotomy, open/percutaneous tracheostomy), total thyroidectomy with intraoperative nerve monitoring (IONM), parathyroidectomy, selective/radical neck dissection, endoscopic sinus surgery (FESS), peritonsillar/retropharyngeal space infection drainage, and epistaxis control.'
  },
  surgery_onco: {
    name: 'Surgical Oncology',
    scientificName: 'Complex General Surgical Oncology',
    icon: 'shield',
    color: '#dbd4fd',
    scope: 'Cytoreductive surgery and hyperthermic intraperitoneal chemotherapy (HIPEC), retroperitoneal sarcoma compartmental resection, sentinel lymph node biopsy & completion lymphadenectomy, gastric adenocarcinoma D2 gastrectomy, melanoma wide local excision, and hepatic metastasis resection.'
  },
  surgery_transplant: {
    name: 'Transplant Surgery',
    scientificName: 'Abdominal & Thoracic Organ Transplantation',
    icon: 'repeat',
    color: '#defff9',
    scope: 'Deceased and living-donor kidney transplantation, orthotopic liver transplantation (piggyback vs bicaval technique), simultaneous pancreas-kidney transplantation, organ procurement & machine perfusion, cold/warm ischemia mitigation, acute cellular rejection management, and surgical vascular complications.'
  },
  surgery_bariatric: {
    name: 'Bariatric Surgery',
    scientificName: 'Bariatric & Metabolic Surgery',
    icon: 'resize',
    color: '#ffc3dd',
    scope: 'Laparoscopic sleeve gastrectomy (LSG), Roux-en-Y gastric bypass (RYGB), single-anastomosis duodeno-ileal bypass (SADI-S), bariatric staple line leaks, internal hernia with closed-loop obstruction, marginal ulceration, and nutritional deficiency replacement.'
  },
  surgery_hepatobiliary: {
    name: 'HPB Surgery',
    scientificName: 'Hepatobiliary & Pancreatic Surgery',
    icon: 'flask',
    color: '#6dc2bd',
    scope: 'Pancreaticoduodenectomy (Whipple procedure), major anatomic hepatectomies (right/left hemihepatectomy), laparoscopic liver wedge resection, iatrogenic bile duct injury reconstruction (Roux-en-Y hepaticojejunostomy), acute necrotizing pancreatitis step-up approach, and distal pancreatectomy.'
  },
  surgery_maxillofacial: {
    name: 'Maxillofacial Surgery',
    scientificName: 'Oral & Maxillofacial Surgery',
    icon: 'happy',
    color: '#dbd4fd',
    scope: 'Complex cranio-maxillofacial trauma (Le Fort I, II, III fractures, mandible angle/body fractures), open reduction and internal fixation (ORIF) with titanium miniplates, zygomaticomaxillary complex (ZMC) fractures, orbital blowout reconstruction, Ludwig angina deep neck space drainage, and temporomandibular joint (TMJ) ankylosis.'
  },
  surgery_endocrine: {
    name: 'Endocrine Surgery',
    scientificName: 'Endocrine & Thyroid Surgery',
    icon: 'nuclear',
    color: '#defff9',
    scope: 'Minimally invasive parathyroidectomy with rapid intraoperative PTH monitoring, posterior retroperitoneoscopic adrenalectomy (for pheochromocytoma, Conn adenoma, Cushing), central compartment neck dissection for thyroid cancer, and management of multiple endocrine neoplasia (MEN-1, MEN-2A, MEN-2B).'
  }
};

const CATEGORIES = [
  { id: 'emergencies', name: 'Emergencies & Resuscitation', desc: 'Acute life-threatening presentations, emergency dosing, resuscitation algorithms, and critical stabilization protocols' },
  { id: 'clinical_topics', name: 'Clinical Topics & Guidelines', desc: 'Standard clinical management, outpatient and inpatient diagnostic workups, core disease pathophysiology, and definitive society guidelines' },
  { id: 'tools', name: 'Tools, Diagnostics & Scoring Systems', desc: 'Clinical risk scores, prognostic calculators, diagnostic algorithms, staging systems, and procedural guidance' },
  { id: 'research', name: 'Recent Research & Landmark Trials', desc: 'Breakthrough clinical trials, recent FDA approvals, prospective studies, and evidence-based paradigm shifts' }
];

async function callOpenRouter(modelName, systemPrompt, userPrompt) {
  if (!OPENROUTER_KEY) throw new Error("No OpenRouter key");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 3800
      })
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`OpenRouter ${modelName} (${response.status}): ${await response.text()}`);
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

function parseJSON(rawText) {
  let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
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

  return JSON.parse(cleaned);
}

async function callAI(systemPrompt, userPrompt) {
  const models = [
    'deepseek/deepseek-chat',
    'qwen/qwen-2.5-72b-instruct'
  ];

  for (const model of models) {
    try {
      const rawText = await callOpenRouter(model, systemPrompt, userPrompt);
      return parseJSON(rawText);
    } catch (err) {
      console.warn(`   ⚠️ [${model}] ${err.message.substring(0, 80)}`);
    }
  }
  throw new Error("All AI models failed for current batch.");
}

async function generateBatch(specialtyId, specialtyData, category, existingTitles, countNeeded) {
  const batchCount = Math.min(countNeeded, 5);

  const systemPrompt = `You are a Senior Academic Physician & Master Board Examiner in ${specialtyData.name}.
Generate exactly ${batchCount} HIGH-YIELD, RIGOROUS, DISTINCT clinical topic guides for category: "${category.name}" in ${specialtyData.name}.

SPECIALTY SCOPE:
${specialtyData.scope}

CRITICAL RULES:
1. Return ONLY a valid JSON Array with exactly ${batchCount} objects.
2. Structure of each object:
   - "id": unique snake_case identifier (e.g. "${specialtyId}_${category.id}_topic_slug")
   - "title": Clear, authoritative clinical title
   - "subtitle": High-yield clinical subtitle detailing key diagnostics, dosages, or procedures
   - "type": "${category.id === 'emergencies' ? 'Emergency Protocol' : category.id === 'clinical_topics' ? 'Clinical Guideline' : category.id === 'tools' ? 'Diagnostic Tool & Calculator' : 'Landmark Clinical Trial'}"
   - "aiScopeDescription": 1-2 sentence precise clinical scope
   - "clinicalContent": Array of 7 comprehensive sections with exact keys:
       1) "Clinical Definition & Overview"
       2) "Immediate Triage & Red Flags"
       3) "Diagnostic Criteria & Scoring Systems"
       4) "First-Line Pharmacotherapy & Exact Dosing" (include mg, mg/kg, IV rates)
       5) "Stepwise Management Algorithm" (chronological 1-2-3 steps)
       6) "Clinical Pitfalls & Malpractice Warnings"
       7) "Exact Reference & Guideline Citations" (society names, trial acronyms, years)
3. Content MUST be mathematically precise with real drug dosages, cutoff thresholds, and evidence citations.
4. DO NOT repeat any of these already existing topics:
${existingTitles.slice(-50).map(t => `   - ${t}`).join('\n')}`;

  const userPrompt = `Generate ${batchCount} new, unique, authoritative clinical guides for ${specialtyData.name} -> ${category.name}. Return raw JSON array only.`;

  return await callAI(systemPrompt, userPrompt);
}

async function ingestDisciplineCategory(specialtyId, specialtyData, category) {
  const { count: currentCount } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('specialty_id', specialtyId)
    .eq('category_id', category.id);

  const existing = currentCount || 0;
  if (existing >= TARGET_MIN_TOPICS) {
    console.log(`✨ [${specialtyId}/${category.id}] Already Complete (${existing}/${TARGET_MIN_TOPICS})`);
    return;
  }

  let remaining = TARGET_MIN_TOPICS - existing;
  console.log(`\n🚀 [${specialtyData.name} -> ${category.name}] Progress: ${existing}/${TARGET_MIN_TOPICS} (Needed: ${remaining})`);

  const { data: existingRows } = await supabase
    .from('topics')
    .select('title')
    .eq('specialty_id', specialtyId)
    .eq('category_id', category.id);

  const existingTitles = (existingRows || []).map(r => r.title);
  let totalSaved = existing;

  while (remaining > 0) {
    const batchSize = Math.min(remaining, 5);

    try {
      const generated = await generateBatch(specialtyId, specialtyData, category, existingTitles, batchSize);

      if (!Array.isArray(generated) || generated.length === 0) {
        console.warn(`   ⚠️ [${specialtyId}/${category.id}] Invalid batch, retrying...`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      const payloads = [];
      for (const item of generated) {
        if (!item.title) continue;

        const baseSlug = (item.id || item.title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .substring(0, 60);
        const uniqueId = `${specialtyId}_${category.id}_${baseSlug}_${Date.now().toString().slice(-4)}_${Math.random().toString(36).substring(2, 5)}`;

        payloads.push({
          id: uniqueId,
          specialty_id: specialtyId,
          category_id: category.id,
          title: item.title,
          subtitle: item.subtitle || '',
          type: item.type || 'Clinical Guide',
          ai_scope_description: item.aiScopeDescription || item.ai_scope_description || item.title,
          clinical_content: item.clinicalContent || item.clinical_content || []
        });
        existingTitles.push(item.title);
      }

      if (payloads.length > 0) {
        const { error: err1 } = await supabase.from('topics').upsert(payloads);
        if (err1) console.warn(`   ⚠️ Error bulk upserting topics: ${err1.message}`);
        await supabase.from('specialty_topics').upsert(payloads);

        totalSaved += payloads.length;
        remaining = Math.max(0, TARGET_MIN_TOPICS - totalSaved);
        console.log(`   💾 [${specialtyId}/${category.id}] [${totalSaved}/${TARGET_MIN_TOPICS}] (+${payloads.length} saved: "${payloads[0].title}")`);
      }

      if (remaining <= 0) break;
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.warn(`   ⚠️ Batch error [${specialtyId}/${category.id}]: ${err.message}. Retrying...`);
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log(`🎉 [${specialtyId}/${category.id}] Complete! Total: ${totalSaved}`);
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

async function main() {
  console.log("======================================================================");
  console.log("⚡ FAST TURBO INGESTION: 32 DISCIPLINES & 128 CATEGORIES");
  console.log("======================================================================");

  // Parallel fetch counts for all categories
  const checkPromises = [];
  for (const [specId, specData] of Object.entries(ALL_DISCIPLINES)) {
    for (const cat of CATEGORIES) {
      checkPromises.push(
        supabase
          .from('topics')
          .select('*', { count: 'exact', head: true })
          .eq('specialty_id', specId)
          .eq('category_id', cat.id)
          .then(({ count }) => ({
            specId,
            specData,
            cat,
            current: count || 0
          }))
      );
    }
  }

  const allCategoryStatus = await Promise.all(checkPromises);
  const pendingTasks = allCategoryStatus.filter(t => t.current < TARGET_MIN_TOPICS);
  
  console.log(`Total category tasks: ${allCategoryStatus.length}`);
  console.log(`Pending category tasks to complete: ${pendingTasks.length}\n`);

  // Run with concurrency 8
  await asyncPool(8, pendingTasks, async ({ specId, specData, cat }) => {
    await ingestDisciplineCategory(specId, specData, cat);
  });

  console.log("\n======================================================================");
  console.log("🎉 ALL 32 DISCIPLINES & 128 CATEGORIES COMPLETE WITH 52+ TOPICS EACH!");
  console.log("======================================================================");
}

main().catch(err => {
  console.error("Fatal Orchestrator Error:", err);
});
