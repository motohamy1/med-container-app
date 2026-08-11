import { Ionicons } from '@expo/vector-icons';

export type ClinicalSection = {
  title: string;
  content: string;
};

export type TopicItem = {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  aiScopeDescription: string;
  illustration?: any;
  clinicalContent?: ClinicalSection[];
};

export type SpecialtyCategory = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  topics: TopicItem[];
};

export type SpecialtyData = {
  id: string;
  name: string;
  scientificName: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  illustration: any;
  generalScope: string;
  categories: SpecialtyCategory[];
};

export const SPECIALTY_KNOWLEDGE: Record<string, SpecialtyData> = {
  heart: {
    id: 'heart',
    name: 'Heart',
    scientificName: 'Cardiology',
    icon: 'heart',
    color: '#d18c90',
    illustration: require('../assets/images/specialties/cardiology.jpg'), // we will generate this
    generalScope: 'Focus exclusively on the cardiovascular system, heart diseases, vascular conditions, ECGs, and cardiac interventions.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute conditions and protocols',
        icon: 'warning',
        topics: [
      {
        id: 'acs',
        title: 'Acute Coronary Syndrome',
        subtitle: 'STEMI vs NSTEMI Workup & Management',
        type: 'Clinical Protocol',
        aiScopeDescription: 'Focus strictly on Acute Coronary Syndrome (ACS), STEMI, NSTEMI, Unstable Angina, ECG changes in ischemia, cardiac biomarkers (troponin), and reperfusion therapies (PCI, thrombolytics). Do not discuss non-cardiac causes of chest pain unless distinguishing from ACS.',
        illustration: require('../assets/images/topics/acs.jpg'),
        clinicalContent: [
          { title: 'Definition & Pathophysiology', content: 'Acute Coronary Syndrome (ACS) encompasses a spectrum of conditions ranging from Unstable Angina (UA) to Non-ST-segment Elevation Myocardial Infarction (NSTEMI) and ST-segment Elevation Myocardial Infarction (STEMI). It is primarily caused by the rupture or erosion of an atherosclerotic plaque, leading to partial or complete thrombosis of a coronary artery.' },
          { title: 'Clinical Presentation', content: 'Patients typically present with substernal chest pain or pressure, often described as a "weight on the chest." Pain may radiate to the left arm, jaw, or back. Associated symptoms include diaphoresis, dyspnea, nausea, and lightheadedness. Atypical presentations (e.g., isolated dyspnea, weakness) are common in women, diabetics, and the elderly.' },
          { title: 'Investigations', content: '1. 12-lead ECG (within 10 minutes of arrival): Look for ST-elevation, ST-depression, T-wave inversions, or new LBBB.\n2. Cardiac Biomarkers: High-sensitivity Troponin (hs-TnI or hs-TnT) drawn at 0 and 1-3 hours.\n3. CXR: To rule out aortic dissection or pneumothorax.\n4. Labs: CBC, BMP, Coags, Lipid profile.' },
          { title: 'Acute Management', content: 'Initial therapy (MONA-BASH): Morphine (if pain refractory), Oxygen (if SpO2 < 90%), Nitroglycerin (SL), Aspirin (324mg chewed).\nFor STEMI: Emergent reperfusion via Primary PCI (door-to-balloon <90 mins) or Fibrinolysis (door-to-needle <30 mins if PCI unavailable).\nFor NSTEMI/UA: Dual Antiplatelet Therapy (DAPT), Anticoagulation (Heparin/Enoxaparin), and risk stratification (TIMI/GRACE score) for early invasive strategy.' }
        ]
      },
      {
        id: 'heart_failure',
        title: 'Heart Failure Management',
        subtitle: 'HFrEF vs HFpEF Evidence-based Guidelines',
        type: 'Guidelines',
        aiScopeDescription: 'Focus strictly on Heart Failure (HFrEF and HFpEF), acute decompensated heart failure, fluid management, diuretic therapy, guideline-directed medical therapy (GDMT - beta blockers, ACEi/ARB, ARNIs, SGLT2i), and echocardiography findings related to ejection fraction.',
        illustration: require('../assets/images/topics/heart_failure.jpg'),
        clinicalContent: [
          { title: 'Definition & Classification', content: 'Heart failure is a complex clinical syndrome resulting from structural or functional impairment of ventricular filling or ejection. It is classified by Ejection Fraction (EF): HFrEF (EF ≤40%), HFmrEF (EF 41-49%), and HFpEF (EF ≥50%).' },
          { title: 'Clinical Picture', content: 'Left-sided failure: Dyspnea on exertion, orthopnea, paroxysmal nocturnal dyspnea (PND), pulmonary crackles, and S3 gallop.\nRight-sided failure: Peripheral edema, elevated JVP, hepatojugular reflux, and ascites.' },
          { title: 'Investigations', content: 'Echocardiogram is the gold standard for assessing EF and structural abnormalities. Labs: BNP or NT-proBNP (elevated in wall stress), CBC, CMP (renal function and electrolytes), ECG, and Chest X-ray (cardiomegaly, pulmonary edema).' },
          { title: 'Treatment (GDMT for HFrEF)', content: 'The four pillars of Guideline-Directed Medical Therapy (GDMT):\n1. ARNI (Sacubitril/Valsartan) or ACEi/ARB.\n2. Evidence-based Beta-blocker (Carvedilol, Metoprolol succinate, Bisoprolol).\n3. MRA (Spironolactone, Eplerenone).\n4. SGLT2 Inhibitor (Dapagliflozin, Empagliflozin).\nDiuretics (e.g., Furosemide) are used for symptom relief and volume control.' }
        ]
      },
      {
        id: 'afib',
        title: 'Atrial Fibrillation',
        subtitle: 'Rate vs Rhythm control & CHA2DS2-VASc',
        type: 'Scoring & Protocol',
        aiScopeDescription: 'Focus strictly on Atrial Fibrillation (AFib), rhythm vs rate control strategies, cardioversion, anticoagulation guidelines, and scoring systems like CHA2DS2-VASc and HAS-BLED.',
        illustration: require('../assets/images/topics/afib.jpg'),
        clinicalContent: [
          { title: 'Definition', content: 'Atrial Fibrillation (AFib) is a supraventricular tachyarrhythmia characterized by uncoordinated atrial activation and consequent deterioration of atrial mechanical function. It is the most common sustained cardiac arrhythmia.' },
          { title: 'Clinical Presentation', content: 'Patients may be asymptomatic or present with palpitations, fatigue, lightheadedness, dyspnea, or chest pain. Pulse is typically "irregularly irregular."' },
          { title: 'Diagnosis', content: 'ECG confirms the diagnosis: Absence of distinct P waves, replaced by rapid fibrillatory waves with an irregularly irregular ventricular response (QRS complexes).' },
          { title: 'Management', content: '1. Rate Control: First-line for stable patients. Beta-blockers (metoprolol) or non-dihydropyridine CCBs (diltiazem, verapamil).\n2. Rhythm Control: For symptomatic patients despite rate control or young patients. Antiarrhythmics (amiodarone, flecainide) or electrical cardioversion.\n3. Anticoagulation: Assessed via CHA2DS2-VASc score. Score ≥2 in men or ≥3 in women warrants oral anticoagulation (DOACs preferred over Warfarin).' }
        ]
      }
    ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: []
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: []
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: []
      }
    ],
  },
  git: {
    id: 'git',
    name: 'GIT',
    scientificName: 'Gastroenterology',
    icon: 'restaurant',
    color: '#d2b689',
    illustration: require('../assets/images/specialties/gastroenterology.jpg'),
    generalScope: 'Focus exclusively on the gastrointestinal tract, liver, pancreas, biliary tree, and related GI pathology and endoscopy.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute conditions and protocols',
        icon: 'warning',
        topics: [
      {
        id: 'upper_gi_bleed',
        title: 'Acute Upper GI Bleeding',
        subtitle: 'Endoscopy timing, Glasgow-Blatchford Score',
        type: 'Emergency Workup',
        aiScopeDescription: 'Focus strictly on Upper GI Bleeding (UGIB), variceal vs non-variceal bleeding, resuscitation, endoscopic interventions, and risk scoring (Glasgow-Blatchford, Rockall).',
        illustration: require('../assets/images/topics/upper_gi_bleed.jpg'),
        clinicalContent: [
          { title: 'Definition', content: 'Acute Upper Gastrointestinal Bleeding (UGIB) refers to hemorrhage originating proximal to the ligament of Treitz (esophagus, stomach, or duodenum). The most common causes are peptic ulcer disease and esophageal varices.' },
          { title: 'Clinical Presentation', content: 'Hematemesis (bright red blood or "coffee-ground" emesis) and melena (black, tarry stools). Severe bleeding may present with hematochezia and hemodynamic instability (tachycardia, hypotension).' },
          { title: 'Initial Resuscitation', content: '1. ABCs and immediate hemodynamic stabilization.\n2. Two large-bore IVs (18G or larger).\n3. Fluid resuscitation with crystalloids.\n4. Blood transfusion if Hb < 7 g/dL (or < 8 g/dL with active cardiovascular disease).' },
          { title: 'Medical Management', content: 'Non-variceal: High-dose IV PPI (e.g., Pantoprazole bolus + infusion).\nVariceal (suspected): Add IV Octreotide and prophylactic antibiotics (Ceftriaxone).' },
          { title: 'Endoscopy & Scoring', content: 'Glasgow-Blatchford Score (GBS) helps identify patients needing intervention. Endoscopy should ideally be performed within 24 hours of presentation, or within 12 hours for suspected variceal bleeding.' }
        ]
      },
      {
        id: 'ibd',
        title: 'Inflammatory Bowel Disease',
        subtitle: 'Crohn\'s vs Ulcerative Colitis Differential',
        type: 'Differential',
        aiScopeDescription: 'Focus strictly on IBD (Crohn\'s Disease, Ulcerative Colitis), pathophysiology, colonoscopy findings, medical management (biologics, steroids, aminosalicylates), and surgical indications.',
        clinicalContent: [
          { title: 'Definition', content: 'Inflammatory Bowel Disease (IBD) comprises two major chronic, idiopathic inflammatory disorders of the GI tract: Crohn’s Disease (CD) and Ulcerative Colitis (UC).' },
          { title: 'Clinical Presentation', content: 'Ulcerative Colitis: Typically presents with bloody diarrhea, tenesmus, and crampy lower abdominal pain. Involves the rectum and extends proximally in a continuous fashion.\nCrohn’s Disease: Non-bloody chronic diarrhea, RLQ abdominal pain, weight loss, and potentially perianal fistulas/abscesses. Can affect any part of the GI tract from mouth to anus (skip lesions).' },
          { title: 'Diagnosis', content: 'Endoscopy/Colonoscopy with biopsy is required.\nUC: Continuous mucosal inflammation, loss of vascular pattern, crypt abscesses.\nCD: Cobblestone mucosa, deep "bear-claw" ulcers, strictures, transmural inflammation, and non-caseating granulomas.' },
          { title: 'Management', content: 'Mild-Moderate: 5-Aminosalicylates (Mesalamine) primarily for UC, topical/oral steroids for flares.\nModerate-Severe: Immunomodulators (Azathioprine) and Biologics (Anti-TNF like Infliximab, Adalimumab).\nSurgery: Curative (Proctocolectomy) for UC; reserved for complications (strictures, fistulas, failure of medical therapy) in CD.' }
        ]
      }
    ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: []
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: []
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: []
      }
    ]
  },
  fever: {
    id: 'fever',
    name: 'Fever',
    scientificName: 'Infectious Disease & Critical Care',
    icon: 'thermometer',
    color: '#6f9ccb',
    illustration: require('../assets/images/specialties/infectious.jpg'),
    generalScope: 'Focus exclusively on systemic infections, sepsis, febrile illnesses, antibiotics, and critical care resuscitation.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute conditions and protocols',
        icon: 'warning',
        topics: [
      {
        id: 'sepsis',
        title: 'Sepsis & Septic Shock',
        subtitle: 'qSOFA & Surviving Sepsis Campaign Guidelines',
        type: 'Critical Care',
        aiScopeDescription: 'Focus strictly on sepsis, septic shock, Surviving Sepsis Campaign bundles, vasopressors, fluid resuscitation, broad-spectrum antibiotics, and organ dysfunction scoring (qSOFA, SOFA).',
        illustration: require('../assets/images/topics/sepsis.jpg'),
        clinicalContent: [
          { title: 'Definition', content: 'Sepsis is defined as life-threatening organ dysfunction caused by a dysregulated host response to infection. Septic shock is a subset of sepsis with profound circulatory, cellular, and metabolic abnormalities associated with a greater risk of mortality.' },
          { title: 'Clinical Presentation', content: 'Fever, tachycardia, tachypnea, altered mental status, and hypotension. Signs of poor perfusion: oliguria, mottled skin, delayed capillary refill.' },
          { title: 'Screening (qSOFA & SOFA)', content: 'qSOFA (Quick SOFA): Identifies high-risk patients outside the ICU. Criteria (1 point each): Respiratory rate ≥ 22/min, Altered mentation, Systolic BP ≤ 100 mmHg. Score ≥ 2 suggests high risk.\nSOFA Score evaluates 6 organ systems: Respiration (PaO2/FiO2), Coagulation (Platelets), Liver (Bilirubin), Cardiovascular (MAP/Vasopressors), CNS (GCS), Renal (Creatinine/Urine output).' },
          { title: 'The 1-Hour Bundle (Surviving Sepsis)', content: '1. Measure lactate level.\n2. Obtain blood cultures BEFORE administering antibiotics.\n3. Administer broad-spectrum antibiotics.\n4. Begin rapid administration of 30 mL/kg crystalloid for hypotension or lactate ≥ 4 mmol/L.\n5. Apply vasopressors if hypotensive during or after fluid resuscitation to maintain MAP ≥ 65 mmHg.' },
          { title: 'Vasopressors & Adjuncts', content: 'First-line vasopressor: Norepinephrine.\nSecond-line: Vasopressin or Epinephrine.\nConsider IV hydrocortisone only if hemodynamic stability is not achieved with fluids and vasopressors.' }
        ]
      },
      {
        id: 'fuo',
        title: 'Fever of Unknown Origin',
        subtitle: 'Diagnostic Algorithm & Investigation Workflow',
        type: 'Workup',
        aiScopeDescription: 'Focus strictly on the diagnostic workup for Fever of Unknown Origin (FUO), including infectious, autoimmune, and neoplastic causes.',
        clinicalContent: [
          { title: 'Definition (Classic Petersdorf & Beeson)', content: '1. Fever ≥ 38.3°C (101°F) on multiple occasions.\n2. Duration of illness ≥ 3 weeks.\n3. Failure to reach a diagnosis after 1 week of inpatient investigation (or 3 outpatient visits).' },
          { title: 'Etiology Categories', content: '1. Infections (30-40%): Tuberculosis, endocarditis, occult abscesses, osteomyelitis.\n2. Neoplasms (20-30%): Lymphoma (Hodgkin/Non-Hodgkin), leukemia, renal cell carcinoma.\n3. Autoimmune/Rheumatologic (10-20%): Still’s disease, SLE, temporal arteritis, polyarteritis nodosa.\n4. Miscellaneous: Drug fever, DVT, factitious fever.' },
          { title: 'Initial Investigations', content: 'Comprehensive history & physical (travel, pets, exposures, murmurs, lymphadenopathy).\nLabs: CBC with diff, peripheral smear, ESR/CRP, LFTs, LDH, UA.\nCultures: Blood (x3 from different sites off antibiotics), Urine.\nImaging: CXR, CT Chest/Abdomen/Pelvis.' },
          { title: 'Advanced Workup', content: 'If initial workup is negative: Consider Echocardiography (TTE/TEE for endocarditis), autoantibody panel (ANA, ANCA, RF), viral serologies (HIV, CMV, EBV), or 18F-FDG PET/CT scan.' }
        ]
      }
    ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: []
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: []
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: []
      }
    ]
  },
  neuro: {
    id: 'neuro',
    name: 'Neuro',
    scientificName: 'Neurology',
    icon: 'nutrition',
    color: '#70b19a',
    illustration: require('../assets/images/specialties/neurology.jpg'),
    generalScope: 'Focus exclusively on the central and peripheral nervous system, stroke, seizures, and neuroimaging.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute conditions and protocols',
        icon: 'warning',
        topics: [
      {
        id: 'stroke',
        title: 'Acute Ischemic Stroke',
        subtitle: 'tPA Window, NIHSS Score & CT Protocol',
        type: 'Emergency',
        aiScopeDescription: 'Focus strictly on acute ischemic stroke, tPA/thrombolysis inclusion/exclusion criteria, NIHSS scoring, mechanical thrombectomy, and CT/MRI stroke protocols.',
        clinicalContent: [
          { title: 'Definition', content: 'An acute ischemic stroke represents focal neurological deficits lasting >24 hours caused by a reduction in cerebral blood flow, leading to cerebral infarction. TIA (Transient Ischemic Attack) resolves within 24 hours without infarction on MRI.' },
          { title: 'Clinical Presentation', content: 'Sudden onset of focal neurological deficits: hemiparesis, facial droop, aphasia, dysarthria, hemianopia, or ataxia. "Time is Brain." Use FAST (Face, Arms, Speech, Time) screening.' },
          { title: 'Emergency Evaluation', content: 'Immediate Non-contrast CT Head to rule out hemorrhage.\nAssess severity using the NIH Stroke Scale (NIHSS).\nCheck point-of-care blood glucose to rule out hypoglycemia.\nCT Angiography (CTA) to identify Large Vessel Occlusion (LVO).' },
          { title: 'Acute Management', content: '1. IV Alteplase (tPA) or Tenecteplase (TNK): Given within 4.5 hours of last known normal. Strict BP control required (BP <185/110 before lytic, maintain <180/105 after).\n2. Mechanical Thrombectomy: Indicated for LVO in the anterior circulation within 24 hours of onset (based on DAWN/DEFUSE-3 criteria).\n3. Permissive Hypertension: If not receiving tPA, allow BP up to 220/120 to maintain cerebral perfusion.' }
        ]
      },
      {
        id: 'status_epilepticus',
        title: 'Status Epilepticus',
        subtitle: 'First & Second-line Anticonvulsant Protocol',
        type: 'Protocol',
        aiScopeDescription: 'Focus strictly on the management of Status Epilepticus, stepwise anticonvulsant therapy (benzodiazepines, levetiracetam, fosphenytoin), and EEG monitoring.',
        clinicalContent: [
          { title: 'Definition', content: 'Status Epilepticus (SE) is defined as a continuous clinical or electrographic seizure lasting ≥ 5 minutes, or recurrent seizures without full recovery of consciousness between events. It is a neurological emergency.' },
          { title: 'Initial Stabilization (0-5 mins)', content: 'ABCs. Secure airway, provide oxygen. Check fingerstick glucose (treat with D50 if hypoglycemic, give thiamine first in suspected alcoholics). Obtain IV access.' },
          { title: 'First-Line Therapy (5-20 mins)', content: 'Benzodiazepines are the drug of choice:\n1. Lorazepam 4 mg IV (preferred, repeats once).\n2. Midazolam 10 mg IM (if no IV access).\n3. Diazepam 10-20 mg IV or PR.' },
          { title: 'Second-Line Therapy (20-40 mins)', content: 'If seizures continue, load with an anti-seizure medication (ASM) to prevent recurrence:\n1. Fosphenytoin (20 mg PE/kg IV).\n2. Levetiracetam (60 mg/kg, max 4500 mg IV).\n3. Valproic Acid (40 mg/kg IV).' },
          { title: 'Third-Line Therapy (Refractory SE)', content: 'If seizures continue >40 minutes, escalate to general anesthesia with continuous EEG monitoring. Use Propofol, Midazolam infusion, or Pentobarbital coma. Intubation is required.' }
        ]
      }
    ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: []
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: []
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: []
      }
    ]
  },
  skin: {
    id: 'skin',
    name: 'Skin',
    scientificName: 'Dermatology',
    icon: 'body',
    color: '#8e86c0',
    illustration: require('../assets/images/specialties/dermatology.jpg'),
    generalScope: 'Focus exclusively on skin, hair, nail disorders, dermatologic emergencies, and cutaneous manifestations of systemic disease.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute conditions and protocols',
        icon: 'warning',
        topics: [
      {
        id: 'scar',
        title: 'Severe Cutaneous Adverse Reactions',
        subtitle: 'SJS/TEN Diagnosis & Burn Unit Transfer',
        type: 'Dermatology',
        aiScopeDescription: 'Focus strictly on dermatologic emergencies including SJS (Stevens-Johnson Syndrome), TEN (Toxic Epidermal Necrolysis), DRESS syndrome, triggers, and acute management.',
        clinicalContent: [
          { title: 'Definition & Spectrum', content: 'SJS and TEN are rare, severe, life-threatening mucocutaneous reactions primarily triggered by medications. They are part of a disease spectrum based on body surface area (BSA) detachment: SJS (<10% BSA), SJS/TEN overlap (10-30% BSA), and TEN (>30% BSA).' },
          { title: 'Common Culprit Drugs', content: 'High-risk medications include: Allopurinol, Anticonvulsants (Carbamazepine, Phenytoin, Lamotrigine), Antibiotics (Sulfonamides, Minocycline), and NSAIDs.' },
          { title: 'Clinical Presentation', content: 'Prodrome: Fever, malaise, upper respiratory symptoms.\nCutaneous: Painful, atypical targetoid macules that coalesce, leading to flaccid blisters and epidermal detachment (positive Nikolsky sign).\nMucosal involvement: Severe stomatitis, conjunctivitis, and genital erosions.' },
          { title: 'Management', content: '1. Immediate withdrawal of the suspected culprit drug.\n2. Supportive care in an Intensive Care Unit (ICU) or Burn Center (wound care, fluid/electrolyte management, nutritional support).\n3. Medical therapy: Systemic corticosteroids, IVIG, or Cyclosporine may be considered, though evidence is mixed and guidelines vary.' }
        ]
      }
    ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: []
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: []
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: []
      }
    ]
  },
  gynacology: {
    id: 'gynacology',
    name: 'Gynacology',
    scientificName: 'Obstetrics & Gynecology',
    icon: 'woman',
    color: '#c08ebb',
    illustration: require('../assets/images/specialties/gynecology.jpg'),
    generalScope: 'Focus exclusively on female reproductive system disorders, pregnancy complications, and gynecologic oncology.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute conditions and protocols',
        icon: 'warning',
        topics: [
      {
        id: 'preeclampsia',
        title: 'Preeclampsia & Eclampsia',
        subtitle: 'MgSO4 Protocol & Delivery Timing',
        type: 'OB/GYN Protocol',
        aiScopeDescription: 'Focus strictly on hypertensive disorders of pregnancy, preeclampsia, eclampsia, magnesium sulfate seizure prophylaxis, and indications for delivery.',
        clinicalContent: [
          { title: 'Definition', content: 'Preeclampsia is a multisystem progressive disorder characterized by new-onset hypertension (≥140/90 mmHg) and proteinuria, or new-onset hypertension and significant end-organ dysfunction, developing after 20 weeks of gestation. Eclampsia is the occurrence of generalized seizures in a patient with preeclampsia.' },
          { title: 'Severe Features', content: 'BP ≥160/110 mmHg, thrombocytopenia (<100K), impaired liver function (elevated transaminases), renal insufficiency (creatinine >1.1 mg/dL), pulmonary edema, or new-onset cerebral/visual disturbances.' },
          { title: 'Management (Without Severe Features)', content: 'Expectant management until 37 0/7 weeks of gestation, followed by delivery. Close monitoring of BP, platelets, LFTs, and fetal well-being.' },
          { title: 'Management (With Severe Features)', content: '1. Magnesium Sulfate IV: Used for seizure prophylaxis (NOT for BP control).\n2. Acute Antihypertensives: IV Labetalol, IV Hydralazine, or PO Nifedipine to keep BP <160/110.\n3. Delivery: The only definitive treatment. Indicated at ≥34 0/7 weeks, or earlier if maternal/fetal condition deteriorates.' }
        ]
      }
    ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: []
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: []
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: []
      }
    ]
  },
  lungs: {
    id: 'lungs',
    name: 'Lungs',
    scientificName: 'Pulmonology',
    icon: 'leaf',
    color: '#6ec2be',
    illustration: require('../assets/images/specialties/pulmonology.jpg'),
    generalScope: 'Focus exclusively on respiratory diseases, pulmonary mechanics, mechanical ventilation, and chest imaging.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute conditions and protocols',
        icon: 'warning',
        topics: [
      {
        id: 'pe',
        title: 'Acute Pulmonary Embolism',
        subtitle: 'Wells Score, PERC Rule & Anticoagulation',
        type: 'Clinical Decision',
        aiScopeDescription: 'Focus strictly on Pulmonary Embolism (PE), DVT, Wells Score, PERC criteria, d-dimer testing, CT pulmonary angiography, and anticoagulation/thrombolysis guidelines.',
        clinicalContent: [
          { title: 'Definition & Pathophysiology', content: 'A Pulmonary Embolism (PE) occurs when a thrombus (usually originating from a Deep Vein Thrombosis in the lower extremities) dislodges and occludes the pulmonary arterial system, leading to V/Q mismatch and potentially right ventricular failure.' },
          { title: 'Clinical Presentation', content: 'Sudden-onset dyspnea, pleuritic chest pain, cough, hemoptysis, and tachycardia. Massive PE presents with hypotension (systolic BP <90 mmHg) and obstructive shock.' },
          { title: 'Diagnostic Workup', content: '1. Low pretest probability (Wells Score <4): Apply PERC rule. If PERC negative, rule out PE. If PERC positive, order D-dimer.\n2. Moderate pretest probability: Order D-dimer. If elevated, proceed to CTA.\n3. High pretest probability (Wells >4): Skip D-dimer; proceed directly to CT Pulmonary Angiography (CTPA).\n4. ECG: Sinus tachycardia is most common. Classic S1Q3T3 pattern is rare.' },
          { title: 'Treatment', content: 'Hemodynamically Stable: Anticoagulation (DOACs like Apixaban/Rivaroxaban, or LMWH).\nHemodynamically Unstable (Massive PE): Systemic thrombolysis (IV tPA) or catheter-directed embolectomy/surgical embolectomy if tPA is contraindicated.' }
        ]
      },
      {
        id: 'asthma',
        title: 'Severe Asthma Exacerbation',
        subtitle: 'Peak Flow, Steroids & Ventilator Management',
        type: 'Protocol',
        aiScopeDescription: 'Focus strictly on acute asthma exacerbation management, bronchodilators, systemic corticosteroids, magnesium sulfate, and non-invasive/invasive ventilation strategies.',
        clinicalContent: [
          { title: 'Clinical Assessment', content: 'Assess severity based on dyspnea, respiratory rate, accessory muscle use, wheezing, SpO2, and Peak Expiratory Flow Rate (PEFR). "Silent chest" implies impending respiratory arrest.' },
          { title: 'Initial Medical Therapy', content: '1. Oxygen: Maintain SpO2 93-95%.\n2. SABA + SAMA: Albuterol (Salbutamol) and Ipratropium nebulized every 20 minutes (or continuously for severe cases).\n3. Systemic Corticosteroids: Oral prednisone/prednisolone or IV methylprednisolone (early administration is critical to reduce inflammation).' },
          { title: 'Adjunct Therapy (Severe/Refractory)', content: '1. IV Magnesium Sulfate: Promotes bronchodilation in patients not responding to initial therapy.\n2. Non-Invasive Ventilation (BiPAP): Can reduce work of breathing and avoid intubation.\n3. Epinephrine/Terbutaline IM: For anaphylaxis-induced asthma or severe refractory cases.' },
          { title: 'Intubation Indications', content: 'Impending respiratory failure, altered mental status, silent chest, severe hypoxemia/hypercapnia refractory to maximal medical therapy and BiPAP.' }
        ]
      }
    ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: []
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: []
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: []
      }
    ]
  }
};
