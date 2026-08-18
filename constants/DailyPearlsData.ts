import { Colors } from './Colors';

export type ClinicalPearl = {
  id: string;
  title: string;
  category: string;
  specialtyId: string;
  specialtyName: string;
  specialtyColor: string;
  specialtyIcon: string;
  badge: string;
  rule: string;
  action: string;
  pitfall: string;
  citation: string;
};

export const CLINICAL_PEARLS_POOL: ClinicalPearl[] = [
  // CARDIOLOGY
  {
    id: 'pearl_cardio_1',
    title: 'RV Infarction Preload Collapse',
    category: 'Emergency Hemodynamics',
    specialtyId: 'heart',
    specialtyName: 'Cardiology',
    specialtyColor: Colors.specialty.cardiology,
    specialtyIcon: 'heart',
    badge: 'V4R STE ≥ 1mm',
    rule: 'Right ventricular infarction is strictly preload-dependent; nitroglycerin and morphine cause sudden catastrophic hypotension.',
    action: 'Obtain right-sided ECG (V4R) on all inferior STEMIs. Resuscitate hypotension with rapid IV crystalloid boluses.',
    pitfall: 'Do NOT administer nitrates or diuretics even if pulmonary rales are suspected before confirming RV status.',
    citation: 'AHA/ACC STEMI Guidelines 2023',
  },
  {
    id: 'pearl_cardio_2',
    title: 'Modified Sgarbossa in LBBB',
    category: 'ECG Diagnosis',
    specialtyId: 'heart',
    specialtyName: 'Cardiology',
    specialtyColor: Colors.specialty.cardiology,
    specialtyIcon: 'pulse',
    badge: 'ST/S Ratio ≤ -0.25',
    rule: 'ST/S ratio ≤ -0.25 in leads with discordant ST elevation identifies acute coronary occlusion with 91% sensitivity in LBBB.',
    action: 'Measure ST elevation at J-point divided by S-wave depth. If ≤ -0.25, activate emergency catheterization lab.',
    pitfall: 'Do not wait for biomarkers or rely on the outdated arbitrary 5mm discordant elevation rule.',
    citation: 'Smith et al. / ESC Guidelines 2024',
  },
  {
    id: 'pearl_cardio_3',
    title: 'Aortic Dissection Beta-Blocker First',
    category: 'Resuscitation Protocol',
    specialtyId: 'heart',
    specialtyName: 'Cardiology',
    specialtyColor: Colors.specialty.cardiology,
    specialtyIcon: 'flame',
    badge: 'HR < 60 | SBP 100-120',
    rule: 'IV Beta-blockade MUST precede vasodilator therapy to eliminate reflex tachycardia and aortic shear stress (dP/dt).',
    action: 'Infuse IV Esmolol or Labetalol targeting HR < 60 bpm, then add IV Nicardipine/Nitroprusside for SBP 100–120 mmHg.',
    pitfall: 'Giving vasodilators first accelerates intimal tear propagation due to reflex sympathetic inotropy.',
    citation: 'AHA/ACC Aortic Disease Consensus',
  },

  // INFECTIOUS DISEASE & CRITICAL CARE
  {
    id: 'pearl_fever_1',
    title: 'Bacterial Meningitis Steroid Timing',
    category: 'Neuro-Infectious',
    specialtyId: 'fever',
    specialtyName: 'Infectious Disease',
    specialtyColor: Colors.specialty.infectious,
    specialtyIcon: 'thermometer',
    badge: '10mg IV Dexamethasone',
    rule: 'Dexamethasone reduces neurological sequelae and hearing loss only when given BEFORE or WITH initial antibiotics.',
    action: 'Administer Dexamethasone 10 mg IV immediately prior to or with Ceftriaxone 2g IV + Vancomycin 15–20 mg/kg IV.',
    pitfall: 'Steroids administered >1 hour after antibiotics provide zero clinical benefit due to completed bacterial lysis.',
    citation: 'IDSA Bacterial Meningitis Guidelines',
  },
  {
    id: 'pearl_fever_2',
    title: 'Balanced Crystalloids in Sepsis',
    category: 'Fluid Resuscitation',
    specialtyId: 'fever',
    specialtyName: 'Critical Care',
    specialtyColor: Colors.specialty.infectious,
    specialtyIcon: 'water',
    badge: '30 mL/kg Balanced Solution',
    rule: 'Lactated Ringer / Plasma-Lyte significantly reduces acute kidney injury and dialysis compared to 0.9% Normal Saline.',
    action: 'Infuse 30 mL/kg balanced crystalloids within 3 hours. Reassess volume status via capillary refill and dynamic response.',
    pitfall: 'Large volumes of 0.9% Saline (154 mEq/L chloride) cause hyperchloremic metabolic acidosis and renal vasoconstriction.',
    citation: 'Surviving Sepsis / SMART Trial',
  },
  {
    id: 'pearl_fever_3',
    title: 'Febrile Neutropenia Golden Hour',
    category: 'Oncology Emergency',
    specialtyId: 'fever',
    specialtyName: 'Infectious Disease',
    specialtyColor: Colors.specialty.infectious,
    specialtyIcon: 'shield-checkmark',
    badge: 'ANC < 500 | T ≥ 38.3°C',
    rule: 'Every 60-minute delay in antipseudomonal antibiotic delivery increases in-hospital mortality in neutropenic fever.',
    action: 'Initiate Cefepime 2g IV q8h or Piperacillin-Tazobactam 4.5g IV q6h within 1 hour of fever presentation.',
    pitfall: 'Do not withhold empiric antibiotics while waiting for chest X-rays, blood cultures, or urinalysis results.',
    citation: 'ASCO/IDSA Sepsis Guidelines',
  },

  // NEUROLOGY
  {
    id: 'pearl_neuro_1',
    title: 'Status Epilepticus 5-Min Benchmark',
    category: 'Emergency Neurology',
    specialtyId: 'neuro',
    specialtyName: 'Neurology',
    specialtyColor: Colors.specialty.neurology,
    specialtyIcon: 'flash',
    badge: '5-Minute Threshold',
    rule: 'Seizures persisting ≥5 minutes rarely stop spontaneously and cause GABA-receptor internalisation and neuronal death.',
    action: 'Min 5–10: Lorazepam 4 mg IV or Midazolam 10 mg IM. Min 10–20: Levetiracetam 60 mg/kg IV (max 4500mg) over 10 min.',
    pitfall: 'Do not repeat benzodiazepines multiple times without escalating to full-dose 2nd-line ASM.',
    citation: 'AES Guidelines / ESETT Trial',
  },
  {
    id: 'pearl_neuro_2',
    title: 'Permissive HTN in Ischemic Stroke',
    category: 'Neurovascular Protocol',
    specialtyId: 'neuro',
    specialtyName: 'Neurology',
    specialtyColor: Colors.specialty.neurology,
    specialtyIcon: 'hardware-chip',
    badge: 'Target < 220/120 mmHg',
    rule: 'The ischemic penumbra depends entirely on collateral perfusion pressure; aggressive BP lowering precipitates infarct extension.',
    action: 'Maintain BP up to 220/120 mmHg unless end-organ damage occurs. If thrombolysis planned, titrate strictly to < 185/110 mmHg.',
    pitfall: 'Never give sublingual nifedipine or aggressive IV anti-hypertensives in acute stroke without tPA indication.',
    citation: 'AHA/ASA Ischemic Stroke Guidelines',
  },

  // PULMONOLOGY
  {
    id: 'pearl_lungs_1',
    title: 'ARDS Low Tidal Volume Strategy',
    category: 'Mechanical Ventilation',
    specialtyId: 'lungs',
    specialtyName: 'Pulmonology',
    specialtyColor: Colors.specialty.pulmonology,
    specialtyIcon: 'fitness',
    badge: '6 mL/kg Predicted Weight',
    rule: 'Ventilator lung injury is prevented by setting tidal volume based on PREDICTED Body Weight (PBW), not actual weight.',
    action: 'Set initial Vt = 6 mL/kg PBW. Maintain plateau pressure Pplat < 30 cmH2O and driving pressure < 15 cmH2O.',
    pitfall: 'Using actual weight in obese patients leads to catastrophic barotrauma and massive inflammatory cytokine surge.',
    citation: 'ARDSNet ARMA Trial / ATS Guidelines',
  },
  {
    id: 'pearl_lungs_2',
    title: 'COPD Exacerbation Steroid Ceiling',
    category: 'Evidence Pulmonology',
    specialtyId: 'lungs',
    specialtyName: 'Pulmonology',
    specialtyColor: Colors.specialty.pulmonology,
    specialtyIcon: 'leaf',
    badge: 'Prednisone 40mg x 5 Days',
    rule: '5 days of oral systemic steroids is non-inferior to 14 days and avoids high-dose immunosuppression and hyperglycemia.',
    action: 'Prescribe Prednisone 40 mg PO once daily for exactly 5 days with bronchodilators and targeted antibiotics if purulent sputum.',
    pitfall: 'Do not extend corticosteroid courses beyond 5 days; it increases re-hospitalization without symptom benefit.',
    citation: 'GOLD 2024 / REDUCE Trial',
  },

  // GASTROENTEROLOGY
  {
    id: 'pearl_git_1',
    title: 'Variceal Bleed Antibiotic Mandate',
    category: 'Hepatology Emergency',
    specialtyId: 'git',
    specialtyName: 'Gastroenterology',
    specialtyColor: Colors.specialty.git,
    specialtyIcon: 'restaurant',
    badge: 'Ceftriaxone 1g IV Daily',
    rule: 'Bacterial translocation occurs in up to 50% of cirrhotic GI bleeds; early antibiotics slash 30-day mortality by >50%.',
    action: 'Start Ceftriaxone 1g IV daily immediately upon triage, along with Octreotide 50mcg IV bolus + 50mcg/hr infusion.',
    pitfall: 'Delaying antibiotics until endoscopic confirmation significantly increases recurrent hemorrhage and fatal bacteremia.',
    citation: 'AASLD / Baveno VII Consensus',
  },
  {
    id: 'pearl_git_2',
    title: 'Acute Pancreatitis Early Enteral Diet',
    category: 'Clinical Nutrition',
    specialtyId: 'git',
    specialtyName: 'Gastroenterology',
    specialtyColor: Colors.specialty.git,
    specialtyIcon: 'nutrition',
    badge: 'Oral Diet within 24h',
    rule: 'Early enteral feeding protects the gut mucosal barrier, preventing gut bacterial translocation and infected necrosis.',
    action: 'Initiate low-fat solid or liquid oral diet as soon as nausea and abdominal pain improve, regardless of lipase levels.',
    pitfall: 'Prolonged NPO (bowel rest) and TPN increase infectious complications, ICU stay, and mortality.',
    citation: 'ACG Guidelines / PANTER & PYTHON Trials',
  },

  // DERMATOLOGY
  {
    id: 'pearl_skin_1',
    title: 'Anaphylaxis IM Thigh Epinephrine',
    category: 'Emergency Allergy',
    specialtyId: 'skin',
    specialtyName: 'Dermatology',
    specialtyColor: Colors.specialty.dermatology,
    specialtyIcon: 'body',
    badge: '0.3-0.5mg IM (1:1,000)',
    rule: 'Intramuscular injection into the mid-anterolateral thigh achieves peak plasma levels in 8 min vs >34 min subcutaneously.',
    action: 'Inject Epinephrine 1:1,000 (0.3–0.5 mL) IM into anterolateral thigh immediately. Repeat q5–15 min for refractory symptoms.',
    pitfall: 'Never substitute antihistamines or steroids as first-line therapy; they do not reverse airway edema or shock.',
    citation: 'WAO / EAACI Anaphylaxis Guidelines',
  },
  {
    id: 'pearl_skin_2',
    title: 'SCORTEN in SJS / TEN Transfer',
    category: 'Dermatology ICU',
    specialtyId: 'skin',
    specialtyName: 'Dermatology',
    specialtyColor: Colors.specialty.dermatology,
    specialtyIcon: 'bandage',
    badge: 'SCORTEN ≥ 3 = ICU/Burn',
    rule: 'Calculate SCORTEN within the first 24 hours of admission to assess epidermal detachment risk and predict mortality.',
    action: 'Evaluate 7 criteria (Age, HR, Malignancy, Detachment >10%, Urea, Glucose, Bicarbonate). Score ≥3 mandates Burn ICU transfer.',
    pitfall: 'Do not manage extensive epidermal necrosis in general wards without specialized fluid and barrier wound care.',
    citation: 'BAD Guidelines / SCORTEN Consensus',
  },

  // OBSTETRICS & GYNECOLOGY
  {
    id: 'pearl_gyn_1',
    title: 'Severe Preeclampsia Magnesium',
    category: 'Obstetric Emergency',
    specialtyId: 'gynacology',
    specialtyName: 'OB/GYN',
    specialtyColor: Colors.specialty.obgyn,
    specialtyIcon: 'woman',
    badge: '4-6g IV Loading Dose',
    rule: 'Magnesium Sulfate is the definitive seizure prophylaxis drug of choice; it is NOT an antihypertensive agent.',
    action: 'Loading: 4–6 g IV over 15–20 min, then 1–2 g/hr maintenance. Keep 10% Calcium Gluconate 1g IV bedside for loss of patellar reflexes.',
    pitfall: 'Do not withhold magnesium in severe features (BP ≥160/110, platelets <100k, visual disturbances, epigastric pain).',
    citation: 'ACOG Practice Bulletin No. 222',
  },
  {
    id: 'pearl_gyn_2',
    title: 'Postpartum Hemorrhage Stepwise 4Ts',
    category: 'Obstetric Resuscitation',
    specialtyId: 'gynacology',
    specialtyName: 'OB/GYN',
    specialtyColor: Colors.specialty.obgyn,
    specialtyIcon: 'medkit',
    badge: 'Blood Loss > 1000 mL',
    rule: 'Assess the 4Ts (Tone 70%, Trauma 20%, Tissue 10%, Thrombin 1%) and advance uterotonics rapidly in sequence.',
    action: 'Oxytocin 10–40 IU ➔ Methylergonovine 0.2mg IM (Avoid in HTN) ➔ Carboprost 250mcg IM (Avoid in Asthma) ➔ Misoprostol 800mcg.',
    pitfall: 'Do not delay surgical or tamponade intervention if 2nd-line uterotonics fail to achieve uterine tone within 15 minutes.',
    citation: 'ACOG / WHO Postpartum Guidelines',
  }
];

export function getDailyPearls(seedDateStr?: string, count: number = 5, offset: number = 0): ClinicalPearl[] {
  const total = CLINICAL_PEARLS_POOL.length;
  if (total === 0) return [];

  const dateKey = seedDateStr || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }

  const baseIndex = Math.abs(hash + offset * 5) % total;
  const selected: ClinicalPearl[] = [];
  const selectedIds = new Set<string>();

  for (let i = 0; i < total && selected.length < Math.min(count, total); i++) {
    const idx = (baseIndex + i * 3) % total;
    const item = CLINICAL_PEARLS_POOL[idx];
    if (!selectedIds.has(item.id)) {
      selectedIds.add(item.id);
      selected.push(item);
    }
  }

  return selected;
}
