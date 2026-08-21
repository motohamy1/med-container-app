import { Ionicons } from "@expo/vector-icons";
import { Colors } from "./Colors";

export type QuickPrompt = {
  id?: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  prompt: string;
  color: string;
  category?: string;
};

export const CLINICAL_PRESETS_POOL: QuickPrompt[] = [
  // 1. Acute Coronary Syndrome
  {
    id: "acs_protocol",
    icon: "heart-outline",
    title: "ACS Protocol",
    subtitle: "STEMI vs NSTEMI workup",
    prompt:
      "Provide the acute coronary syndrome (ACS) STEMI vs NSTEMI initial emergency workup, diagnostic criteria, and catheterization timing.",
    color: Colors.pink,
    category: "Cardiology",
  },
  // 2. Sepsis
  {
    id: "sepsis_bundle",
    icon: "flash-outline",
    title: "Sepsis 1-Hr Bundle",
    subtitle: "qSOFA & resuscitation",
    prompt:
      "Detail the Surviving Sepsis Campaign 1-hour resuscitation bundle, qSOFA scoring, and antibiotic timing.",
    color: Colors.lime,
    category: "Critical Care",
  },
  // 3. Hypertensive Crisis
  {
    id: "htn_crisis",
    icon: "speedometer-outline",
    title: "Hypertensive Crisis",
    subtitle: "Urgency vs emergency BP",
    prompt:
      "Explain the management of Hypertensive Urgency vs Emergency, including IV drug choices and target blood pressure reduction rates.",
    color: Colors.accent,
    category: "Cardiology",
  },
  // 4. Liver Scoring
  {
    id: "liver_scoring",
    icon: "analytics-outline",
    title: "Liver Scoring",
    subtitle: "Child-Pugh vs MELD-Na",
    prompt:
      "Compare Child-Pugh vs MELD-Na scoring systems for chronic liver failure and surgical mortality risk assessment.",
    color: Colors.lavender,
    category: "Gastroenterology",
  },
  // 5. Stroke Triage
  {
    id: "stroke_triage",
    icon: "git-network-outline",
    title: "Acute Stroke Triage",
    subtitle: "tPA & thrombectomy window",
    prompt:
      "Outline the acute ischemic stroke thrombolysis (tPA/TNK) eligibility criteria, BP targets, and endovascular thrombectomy window.",
    color: Colors.lime,
    category: "Neurology",
  },
  // 6. ARDS Ventilation
  {
    id: "ards_vent",
    icon: "fitness-outline",
    title: "ARDS Ventilation",
    subtitle: "6 mL/kg lung protection",
    prompt:
      "Detail the ARDS low tidal volume ventilation strategy (6 mL/kg PBW), plateau pressure limits, and driving pressure targets.",
    color: Colors.accent,
    category: "Pulmonology",
  },
  // 7. DKA Protocol
  {
    id: "dka_protocol",
    icon: "flame-outline",
    title: "DKA Management",
    subtitle: "Insulin & Potassium protocol",
    prompt:
      "Provide the Diabetic Ketoacidosis (DKA) resuscitation protocol, IV insulin infusion titration, and potassium repletion thresholds.",
    color: Colors.pink,
    category: "Endocrinology",
  },
  // 8. Anaphylaxis
  {
    id: "anaphylaxis_dosing",
    icon: "shield-checkmark-outline",
    title: "Anaphylaxis Dosing",
    subtitle: "IM Epinephrine algorithm",
    prompt:
      "Outline the emergency anaphylaxis algorithm, intramuscular epinephrine 1:1000 dosing, refractory shock IV infusions, and airway rescue.",
    color: Colors.lavender,
    category: "Resuscitation",
  },
  // 9. Pulmonary Embolism
  {
    id: "pe_thrombolysis",
    icon: "pulse-outline",
    title: "PE Thrombolysis",
    subtitle: "Massive vs Submassive PE",
    prompt:
      "Explain the risk stratification for Acute Pulmonary Embolism (massive vs submassive), PESI score, and systemic vs catheter-directed thrombolysis indications.",
    color: Colors.pink,
    category: "Pulmonology",
  },
  // 10. Hyperkalemia Shift
  {
    id: "hyperkalemia_shift",
    icon: "water-outline",
    title: "Hyperkalemia Shift",
    subtitle: "Calcium & Insulin protocol",
    prompt:
      "Detail the emergent severe hyperkalemia management protocol: cardiac membrane stabilization with Calcium Gluconate, cellular shift with insulin/dextrose, and removal agents.",
    color: Colors.lime,
    category: "Nephrology",
  },
  // 11. Upper GI Bleed
  {
    id: "gi_bleed",
    icon: "medkit-outline",
    title: "Upper GI Bleed",
    subtitle: "PPI, Octreotide & Scope",
    prompt:
      "Detail the initial resuscitation and pharmacotherapy (IV PPI, Octreotide, Ceftriaxone) for acute Upper GI Bleeding and endoscopy timing within 24 hours.",
    color: Colors.accent,
    category: "Gastroenterology",
  },
  // 12. Status Epilepticus
  {
    id: "status_epilepticus",
    icon: "hardware-chip-outline",
    title: "Status Epilepticus",
    subtitle: "Benzos & 2nd-line AEDs",
    prompt:
      "Outline the emergent status epilepticus treatment ladder: 0-5 min Lorazepam/Midazolam, 5-20 min Levetiracetam/Fosphenytoin, and refractory general anesthesia.",
    color: Colors.lavender,
    category: "Neurology",
  },
  // 13. Bacterial Meningitis
  {
    id: "meningitis_workup",
    icon: "bandage-outline",
    title: "Meningitis Workup",
    subtitle: "LP, Steroids & Antibiotics",
    prompt:
      "Detail the acute bacterial meningitis workup: LP timing, empiric Ceftriaxone + Vancomycin + Ampicillin, and Dexamethasone timing before or with 1st antibiotic dose.",
    color: Colors.lime,
    category: "Infectious Disease",
  },
  // 14. Acute Pancreatitis
  {
    id: "pancreatitis_mgmt",
    icon: "warning-outline",
    title: "Acute Pancreatitis",
    subtitle: "Fluids & BISAP score",
    prompt:
      "Explain the initial management of Acute Pancreatitis: goal-directed Lactated Ringer's resuscitation, BISAP/Ranson risk stratification, and enteral nutrition timing.",
    color: Colors.pink,
    category: "Gastroenterology",
  },
  // 15. Atrial Fibrillation
  {
    id: "afib_rate_control",
    icon: "radio-outline",
    title: "Afib Rate Control",
    subtitle: "Beta-blocker vs Diltiazem",
    prompt:
      "Compare initial IV Beta-blocker vs Diltiazem vs Amiodarone for rapid atrial fibrillation rate control, with consideration of HFrEF vs preserved ejection fraction.",
    color: Colors.accent,
    category: "Cardiology",
  },
  // 16. Syncope Rules
  {
    id: "syncope_rules",
    icon: "help-buoy-outline",
    title: "Syncope Risk Rules",
    subtitle: "San Francisco & Canadian",
    prompt:
      "Detail the clinical decision rules (San Francisco Syncope Rule and Canadian Syncope Risk Score) for outpatient vs inpatient admission of syncopal episodes.",
    color: Colors.lavender,
    category: "Emergency",
  },
  // 17. Aortic Dissection
  {
    id: "aortic_dissection",
    icon: "flame-outline",
    title: "Aortic Dissection",
    subtitle: "Anti-impulse & BP targets",
    prompt:
      "Outline the acute aortic dissection type A vs B emergency management, IV beta-blocker anti-impulse therapy (target HR < 60), and vasodilator sequencing.",
    color: Colors.pink,
    category: "Cardiology",
  },
  // 18. Severe Hyponatremia
  {
    id: "hyponatremia_correction",
    icon: "water-outline",
    title: "Severe Hyponatremia",
    subtitle: "8-10 mEq/24h limit & 3% NaCl",
    prompt:
      "Detail the acute symptomatic hyponatremia resuscitation protocol using 3% hypertonic saline boluses and the strict 8 mEq/24h correction limit to prevent osmotic demyelination syndrome.",
    color: Colors.lime,
    category: "Nephrology",
  },
  // 19. Acute Cholangitis
  {
    id: "cholangitis_tokyo",
    icon: "git-merge-outline",
    title: "Acute Cholangitis",
    subtitle: "Tokyo Guidelines & ERCP",
    prompt:
      "Explain the Tokyo Guidelines 2018 diagnostic criteria and severity grading for Acute Cholangitis, empiric antibiotics, and urgent biliary drainage timing.",
    color: Colors.accent,
    category: "Gastroenterology",
  },
  // 20. Tension Pneumothorax
  {
    id: "tension_pneumo",
    icon: "alert-circle-outline",
    title: "Tension Pneumothorax",
    subtitle: "Needle decompression site",
    prompt:
      "Detail the immediate management of tension pneumothorax: 4th/5th ICS anterior-axillary line needle decompression vs finger thoracostomy and chest tube placement.",
    color: Colors.lavender,
    category: "Trauma / Pulmonology",
  },
  // 21. Cardiogenic Shock
  {
    id: "cardiogenic_shock",
    icon: "heart-dislike-outline",
    title: "Cardiogenic Shock",
    subtitle: "SCAI stages & Inotropes",
    prompt:
      "Explain the SCAI shock classification staging (A to E), Norepinephrine vs Dobutamine/Milrinone selection, and timing for mechanical circulatory support (Impella/IABP).",
    color: Colors.pink,
    category: "Cardiology",
  },
  // 22. Refractory Asthma
  {
    id: "refractory_asthma",
    icon: "leaf-outline",
    title: "Refractory Asthma",
    subtitle: "IV Magnesium & BiPAP",
    prompt:
      "Outline the acute severe life-threatening asthma exacerbation algorithm: continuous nebulization, IV Magnesium Sulfate, systemic steroids, and non-invasive ventilation criteria.",
    color: Colors.lime,
    category: "Pulmonology",
  },
  // 23. Thyroid Storm
  {
    id: "thyroid_storm",
    icon: "flame-outline",
    title: "Thyroid Storm",
    subtitle: "Burch-Wartofsky & 4-step Tx",
    prompt:
      "Provide the Burch-Wartofsky diagnostic score criteria and the 4-step emergency pharmacotherapy (PTU/Methimazole, Lugol iodine, Propranolol, Hydrocortisone).",
    color: Colors.accent,
    category: "Endocrinology",
  },
  // 24. Adrenal Crisis
  {
    id: "adrenal_crisis",
    icon: "shield-outline",
    title: "Adrenal Crisis",
    subtitle: "Stress Hydrocortisone IV",
    prompt:
      "Detail the acute adrenal crisis emergency management: 100 mg IV Hydrocortisone bolus, rapid normal saline hydration, and electrolyte stabilization without waiting for cortisol labs.",
    color: Colors.lavender,
    category: "Endocrinology",
  },
  // 25. Spontaneous Bacterial Peritonitis
  {
    id: "sbp_cirrhosis",
    icon: "flask-outline",
    title: "SBP Diagnosis",
    subtitle: "Paracentesis PMN ≥ 250",
    prompt:
      "Explain Spontaneous Bacterial Peritonitis (SBP) diagnostic paracentesis thresholds (PMN ≥ 250/mm³), 3rd-generation cephalosporin choice, and IV Albumin infusion protocol (1.5g/kg on day 1).",
    color: Colors.pink,
    category: "Gastroenterology",
  },
  // 26. Massive Transfusion Protocol
  {
    id: "massive_transfusion",
    icon: "medkit-outline",
    title: "Massive Transfusion",
    subtitle: "1:1:1 MTP & Tranexamic Acid",
    prompt:
      "Detail the Massive Transfusion Protocol (MTP 1:1:1 PRBC:FFP:Platelets), Tranexamic Acid (TXA) 1g within 3 hours, and calcium repletion in hemorrhagic shock.",
    color: Colors.lime,
    category: "Trauma / Surgery",
  },
  // 27. Severe Preeclampsia / Eclampsia
  {
    id: "preeclampsia_mg",
    icon: "fitness-outline",
    title: "Preeclampsia / Eclampsia",
    subtitle: "Magnesium Sulfate protocol",
    prompt:
      "Detail the Magnesium Sulfate seizure prophylaxis regimen (4-6g IV loading over 20 min, 1-2g/hr maintenance), toxicity monitoring (patellar reflexes), and urgent BP lowering with Labetalol/Hydralazine.",
    color: Colors.accent,
    category: "OB/GYN",
  },
  // 28. Postpartum Hemorrhage
  {
    id: "pph_protocol",
    icon: "pulse-outline",
    title: "Postpartum Hemorrhage",
    subtitle: "4Ts & Stepwise Uterotonics",
    prompt:
      "Outline the 4Ts etiology and stepwise uterotonic escalation (Oxytocin -> Methylergonovine -> Carboprost -> Misoprostol) and intrauterine balloon tamponade indications.",
    color: Colors.lavender,
    category: "OB/GYN",
  },
  // 29. Febrile Neutropenia
  {
    id: "febrile_neutropenia",
    icon: "thermometer-outline",
    title: "Febrile Neutropenia",
    subtitle: "MASCC score & Empiric Abx",
    prompt:
      "Explain the risk stratification (MASCC score) and emergent 1-hour antipseudomonal beta-lactam monotherapy (Cefepime/Piperacillin-Tazobactam) in Febrile Neutropenia.",
    color: Colors.pink,
    category: "Infectious / Oncology",
  },
  // 30. Acetaminophen Toxicity
  {
    id: "apap_toxicity",
    icon: "beaker-outline",
    title: "APAP Overdose",
    subtitle: "Rumack-Matthew & NAC",
    prompt:
      "Detail the Rumack-Matthew nomogram interpretation for acute Acetaminophen overdose and the IV N-Acetylcysteine (NAC) 3-bag vs 2-bag infusion regimen.",
    color: Colors.lime,
    category: "Toxicology",
  },
  // 31. Elevated ICP
  {
    id: "elevated_icp",
    icon: "hardware-chip-outline",
    title: "Intracranial HTN",
    subtitle: "Mannitol vs 3% Saline & HOB 30°",
    prompt:
      "Outline the tiered emergency algorithm for acute severe intracranial hypertension: head of bed 30°, hyperosmolar therapy (Mannitol vs Hypertonic Saline), and mild hyperventilation rescue.",
    color: Colors.accent,
    category: "Neurology / Neurocritical",
  },
  // 32. Necrotizing Fasciitis
  {
    id: "necfasc_lrinec",
    icon: "cut-outline",
    title: "Necrotizing Fasciitis",
    subtitle: "LRINEC score & Debridement",
    prompt:
      "Detail the clinical recognition of Necrotizing Soft Tissue Infections, utility and limits of the LRINEC score, empiric triple antibiotics, and emergency surgical debridement timing.",
    color: Colors.lavender,
    category: "Surgery",
  },
  // 33. Acute Mesenteric Ischemia
  {
    id: "mesenteric_ischemia",
    icon: "nutrition-outline",
    title: "Mesenteric Ischemia",
    subtitle: "Pain out of proportion & CTA",
    prompt:
      "Explain the presentation of acute mesenteric ischemia (severe pain out of proportion to exam), biphasic CTA diagnostic gold standard, systemic anticoagulation, and urgent surgical revascularization.",
    color: Colors.pink,
    category: "Vascular / Surgery",
  },
  // 34. Myasthenic Crisis
  {
    id: "myasthenic_crisis",
    icon: "barbell-outline",
    title: "Myasthenic Crisis",
    subtitle: "FVC/MIP & Plasma Exchange",
    prompt:
      "Provide the respiratory monitoring thresholds (20/30/40 rule: FVC < 20 mL/kg, MIP < 30 cmH2O), intubation triggers, and IVIG vs Plasmapheresis in acute Myasthenic Crisis.",
    color: Colors.lime,
    category: "Neurology",
  },
  // 35. Tumor Lysis Syndrome
  {
    id: "tls_cairo_bishop",
    icon: "planet-outline",
    title: "Tumor Lysis Syndrome",
    subtitle: "Cairo-Bishop & Rasburicase",
    prompt:
      "Detail the Cairo-Bishop diagnostic definition of laboratory and clinical Tumor Lysis Syndrome, hyperhydration targets, and Rasburicase vs Allopurinol indications.",
    color: Colors.accent,
    category: "Hematology / Oncology",
  },
  // 36. Pediatric Septic Shock
  {
    id: "pediatric_sepsis",
    icon: "people-outline",
    title: "Pediatric Sepsis",
    subtitle: "10-20 mL/kg & Epinephrine",
    prompt:
      "Outline the pediatric septic shock resuscitation bundle: 10-20 mL/kg isotonic fluid boluses reassessed for hepatomegaly/rales, and first-line Epinephrine vs Norepinephrine infusion.",
    color: Colors.lavender,
    category: "Pediatrics",
  },
];

/**
 * Generates an integer seed from a date string (e.g. "2026-08-21").
 * Uses local calendar date if dateStr is not provided.
 */
export function getDailyDateKey(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailySeed(dateStr?: string): number {
  const dateKey = dateStr || getDailyDateKey();
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Deterministic Mulberry32 32-bit PRNG
 */
function createMulberry32(seed: number) {
  let a = seed;
  return function () {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a daily deterministic shuffled list of preset prompt batches.
 * Every day (dateKey) generates a unique randomized order and combination of batches.
 * Within the same day, the batches remain deterministic and stable.
 */
export function getDailyPromptBatches(
  dateStr?: string,
  batchSize: number = 4
): QuickPrompt[][] {
  const seed = getDailySeed(dateStr);
  const rng = createMulberry32(seed);

  // Clone pool and shuffle with seeded Fisher-Yates
  const pool = [...CLINICAL_PRESETS_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }

  // Chunk into batches of size batchSize
  const batches: QuickPrompt[][] = [];
  for (let i = 0; i < pool.length; i += batchSize) {
    const chunk = pool.slice(i, i + batchSize);
    if (chunk.length === batchSize) {
      batches.push(chunk);
    }
  }

  return batches.length > 0 ? batches : [CLINICAL_PRESETS_POOL.slice(0, 4)];
}
