const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Master catalog of comprehensive, reference-grounded topics
const MASTER_TOPICS = [
  // =========================================================================
  // FEVER / INFECTIOUS DISEASE & CRITICAL CARE
  // =========================================================================
  // Fever: Emergencies
  {
    id: 'fever_septic_shock_hour1',
    specialty_id: 'fever', category_id: 'emergencies',
    title: 'Septic Shock & Sepsis-3 Resuscitation',
    subtitle: 'Hour-1 Bundle, 30 mL/kg Balanced Crystalloids & Norepinephrine',
    type: 'Emergency Protocol',
    ai_scope_description: 'Sepsis-3 definitions, SOFA score, balanced crystalloids, norepinephrine, vasopressin, lactate clearance, stress-dose steroids.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Septic shock definition: Persistent hypotension requiring vasopressors to maintain MAP ≥65 mmHg AND serum lactate >2 mmol/L despite adequate fluid resuscitation. Red Flags: Mottling, oliguria (<0.5 mL/kg/hr), acute encephalopathy, thrombocytopenia.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: '• Sepsis-3: Infection + Acute increase in SOFA score ≥2.\n• qSOFA Bedside Triage (≥2): RR ≥22, GCS <15, SBP ≤100 mmHg.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Resuscitation Fluid: Balanced crystalloids 30 mL/kg IV within 3 hours.\n• Vasopressor 1: Norepinephrine 0.05-0.2 mcg/kg/min IV infusion.\n• Vasopressor 2: Vasopressin 0.03 units/min fixed infusion.\n• Inotrope: Dobutamine 2.5-20 mcg/kg/min for myocardial dysfunction.\n• Hydrocortisone 200 mg/day IV (50 mg q6h) for refractory shock.' },
      { title: 'Stepwise Management Algorithm', content: '1. Blood cultures x2 before antibiotics.\n2. Broad-spectrum IV antibiotics within 1 hour.\n3. Dynamic fluid responsiveness monitoring.\n4. Surgical source control within 6-12 hours.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never delay antibiotics for imaging or culture collection; each hour of delay increases mortality by 7.6%.' },
      { title: 'Exact Reference & Guideline Citations', content: '2021 Surviving Sepsis Campaign Guidelines (Crit Care Med 2021); Sepsis-3 (JAMA 2016).' }
    ]
  },
  {
    id: 'fever_acute_meningitis_protocol',
    specialty_id: 'fever', category_id: 'emergencies',
    title: 'Acute Bacterial Meningitis Protocol',
    subtitle: 'Immediate Dexamethasone, Lumbar Puncture & Empiric Triad',
    type: 'Emergency Protocol',
    ai_scope_description: 'Fever, neck stiffness, altered mental status, Dexamethasone timing, Ceftriaxone, Vancomycin, Ampicillin.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Fever, severe headache, nuchal rigidity, Kernig/Brudzinski signs. Red Flags: Papilledema, focal neuro signs, new seizures, petechial purpura.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'CSF: Opening pressure >200 mmH2O, Pleocytosis (>1,000 WBC/µL with >80% PMNs), Protein >100-500 mg/dL, Glucose <40 mg/dL (CSF/serum ratio <0.4).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Dexamethasone 10 mg IV given 15-20 mins BEFORE or WITH 1st antibiotic dose (repeat q6h x 4d).\n• Ceftriaxone 2 g IV q12h PLUS Vancomycin 15-20 mg/kg IV q8-12h.\n• Add Ampicillin 2 g IV q4h if age >50 or immunocompromised (covers Listeria).' },
      { title: 'Stepwise Management Algorithm', content: '1. If no neuro signs: Immediate LP -> Dexamethasone + Antibiotics.\n2. If CT required: Blood cultures -> Dexamethasone + Antibiotics IMMEDIATELY -> Head CT -> LP.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never delay antibiotics for Head CT or LP; give empiric therapy before sending patient to CT scan.' },
      { title: 'Exact Reference & Guideline Citations', content: '2024 IDSA Healthcare-Associated Ventriculitis & Meningitis; ESCMID Guidelines.' }
    ]
  },
  {
    id: 'fever_necrotizing_fasciitis_protocol',
    specialty_id: 'fever', category_id: 'emergencies',
    title: 'Necrotizing Soft Tissue Infections (NSTI)',
    subtitle: 'LRINEC Score, Clindamycin Toxin Suppression & Emergent Debridement',
    type: 'Emergency Protocol',
    ai_scope_description: 'Necrotizing fasciitis, gas gangrene, LRINEC score, Vancomycin, Zosyn, Clindamycin antitoxin, emergent surgery.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Pain out of proportion to exam, skin bullae, crepitus, dishwater discharge, rapid erythema progression, septic shock.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'LRINEC Score ≥6: CRP ≥150 (4), WBC >25k (2), Hb <11 (2), Na <135 (2), Cr >1.6 (2), Glucose >180 (1). Score ≥8 strongly predictive (>75% risk).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Vancomycin 25-30 mg/kg load PLUS Piperacillin-Tazobactam 4.5 g IV q6h PLUS Clindamycin 900 mg IV q8h (inhibits Group A Strep toxin production).\n• High-dose IVIG 1 g/kg Day 1, 0.5 g/kg Days 2-3 for Streptococcal TSS.' },
      { title: 'Stepwise Management Algorithm', content: '1. Emergent surgical consultation for exploratory fascial incision and debridement.\n2. Planned second-look re-exploration within 24 hours.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do not delay surgery for imaging; fascial necrosis spreads up to 1 inch/hour.' },
      { title: 'Exact Reference & Guideline Citations', content: '2014 IDSA Skin & Soft Tissue Guidelines; WSES 2018 Consensus.' }
    ]
  },
  {
    id: 'fever_febrile_neutropenia_protocol',
    specialty_id: 'fever', category_id: 'emergencies',
    title: 'Febrile Neutropenia in Oncology',
    subtitle: 'MASCC Risk Index, Cefepime Monotherapy & Empiric Antifungals',
    type: 'Emergency Protocol',
    ai_scope_description: 'ANC <500, oral temp ≥38.3°C, MASCC score, Cefepime, Zosyn, Meropenem, Vancomycin indications, antifungal stepup.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Oral temp ≥38.3°C with ANC <500 cells/µL. Red Flags: Severe mucositis, central line sepsis, hemodynamic shock, typhlitis.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'MASCC Score: ≥21 (Low Risk - outpatient oral therapy), <21 (High Risk - mandatory inpatient IV therapy).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Cefepime 2 g IV q8h OR Piperacillin-Tazobactam 4.5 g IV q6h (extended infusion) OR Meropenem 1 g IV q8h.\n• Add Vancomycin 15-20 mg/kg q8-12h for shock, catheter sepsis, or skin infection.\n• Persistent fever >4-7 days: Add Voriconazole or Liposomal Amphotericin B.' },
      { title: 'Stepwise Management Algorithm', content: '1. Blood cultures x2 (peripheral + central line).\n2. First antibiotic dose within 60 minutes.\n3. Daily ANC and clinical reassessment.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never perform digital rectal exams or give rectal suppositories in neutropenic patients (breaks mucosal barrier causing fatal bacteremia).' },
      { title: 'Exact Reference & Guideline Citations', content: '2018 ASCO/IDSA Febrile Neutropenia Guidelines; NCCN 2021.' }
    ]
  },
  {
    id: 'fever_toxic_shock_protocol',
    specialty_id: 'fever', category_id: 'emergencies',
    title: 'Toxic Shock Syndrome (TSS)',
    subtitle: 'Staphylococcal / Streptococcal TSS, Clindamycin & IVIG Neutralization',
    type: 'Emergency Protocol',
    ai_scope_description: 'High fever, sunburn rash, shock, multiorgan involvement, TSST-1, Clindamycin protein synthesis inhibition, IVIG.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Fever ≥38.9°C, diffuse macular erythroderma, SBP ≤90 mmHg, involvement of ≥3 organ systems, desquamation of palms/soles.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'CDC 5-point criteria: Fever, Rash, Desquamation (1-2w), Hypotension, Multisystem organ failure.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Vancomycin 25-30 mg/kg IV PLUS Clindamycin 900 mg IV q8h (essential for protein synthesis/toxin suppression).\n• IVIG 1 g/kg Day 1, 0.5 g/kg Days 2-3 for refractory shock.' },
      { title: 'Stepwise Management Algorithm', content: '1. Remove all foreign bodies (tampons, nasal packs).\n2. Aggressive crystalloid hydration for capillary leak.\n3. Surgical drainage of focal infection.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never use beta-lactams alone (cell lysis can cause massive surge in superantigen toxin release; always co-administer Clindamycin).' },
      { title: 'Exact Reference & Guideline Citations', content: 'CDC TSS Case Definitions; IDSA SSTI Guidelines.' }
    ]
  },
  {
    id: 'fever_severe_malaria_protocol',
    specialty_id: 'fever', category_id: 'emergencies',
    title: 'Severe Falciparum Malaria',
    subtitle: 'IV Artesunate Dosing, Parasitemia Monitoring & Cerebral Malaria',
    type: 'Emergency Protocol',
    ai_scope_description: 'Plasmodium falciparum, parasitemia >5%, cerebral malaria, IV Artesunate, Artemether-Lumefantrine stepdown.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Impaired consciousness, severe anemia (Hb <7), acute renal failure, pulmonary edema, hypoglycemia, parasitemia >5%.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'Thick and thin Giemsa blood smears; rapid diagnostic test (HRP2 antigen); parasitemia quantification.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• IV Artesunate 2.4 mg/kg IV at 0, 12, 24 hours, then daily until oral intake tolerated (give 3.0 mg/kg if body weight <20 kg).\n• Oral Stepdown: Artemether-Lumefantrine (Coartem) 6-dose regimen over 3 days.' },
      { title: 'Stepwise Management Algorithm', content: '1. Start IV Artesunate immediately upon diagnosis.\n2. Monitor blood glucose q4h (frequent hypoglycemia).\n3. Recheck blood smears daily to confirm parasite clearance.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT use Quinine if IV Artesunate is available (Artesunate reduces mortality by 35% and has significantly fewer cardiac/hypoglycemic adverse events).' },
      { title: 'Exact Reference & Guideline Citations', content: '2022 WHO Guidelines for Malaria; CDC Malaria Treatment Protocol.' }
    ]
  },

  // Fever: Clinical Topics
  {
    id: 'fever_cap_guidelines_topic',
    specialty_id: 'fever', category_id: 'clinical_topics',
    title: 'Community-Acquired Pneumonia (CAP)',
    subtitle: 'ATS/IDSA Guidelines, CURB-65 & Beta-Lactam + Macrolide Evidence',
    type: 'Clinical Guideline',
    ai_scope_description: 'CAP diagnosis, CURB-65 score, outpatient vs inpatient antimicrobial selection, 5-day therapy duration.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Fever, productive cough, pleuritic chest pain, localized rales, infiltrate on CXR. Red Flags: Confusion, tachypnea >30, SpO2 <90%, hypotension.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'CURB-65 (0-5 pts): Confusion, Urea >19, RR ≥30, BP <90/60, Age ≥65. Score 0-1: Outpatient; Score 2: Inpatient ward; Score 3-5: ICU.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Outpatient: Amoxicillin 1 g PO TID OR Doxycycline 100 mg PO BID x 5d.\n• Inpatient Ward: Ceftriaxone 1-2 g IV daily + Azithromycin 500 mg daily x 5d (or Levofloxacin 750 mg daily).\n• Inpatient ICU: Ceftriaxone 2 g IV + Azithromycin 500 mg IV.' },
      { title: 'Stepwise Management Algorithm', content: '1. Stratify with CURB-65/PSI.\n2. Initiate antibiotics within 4 hours.\n3. Discontinue after 5 days if afebrile for 48h and clinically stable.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Avoid macrolide monotherapy in areas with >25% Pneumococcal macrolide resistance.' },
      { title: 'Exact Reference & Guideline Citations', content: '2019 ATS/IDSA CAP Clinical Practice Guideline (AJRCCM 2019).' }
    ]
  },
  {
    id: 'fever_c_difficile_guidelines',
    specialty_id: 'fever', category_id: 'clinical_topics',
    title: 'Clostridioides difficile Colitis',
    subtitle: 'Fidaxomicin First-Line, Oral Vancomycin & Recurrence Protocols',
    type: 'Clinical Guideline',
    ai_scope_description: 'Watery diarrhea, post-antibiotic colitis, Fidaxomicin 200 mg BID, oral Vancomycin, Bezlotoxumab, FMT.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: '≥3 unformed stools in 24h + recent antibiotics. Red Flags: Severe CDI (WBC ≥15k or Cr >1.5), Fulminant CDI (hypotension, ileus, megacolon >6 cm).' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'Stool NAAT (PCR) + Toxin A/B EIA on diarrheal stool. Non-severe vs Severe (WBC ≥15k, Cr >1.5).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• First-Line: Fidaxomicin 200 mg PO BID x 10 days (PREFERRED) OR Oral Vancomycin 125 mg PO QID x 10 days.\n• Fulminant: Oral Vancomycin 500 mg QID + IV Metronidazole 500 mg q8h (+ Vancomycin retention enema if ileus).\n• Recurrent CDI: Fidaxomicin + Bezlotoxumab 10 mg/kg IV or Fecal Microbiota Transplant (FMT).' },
      { title: 'Stepwise Management Algorithm', content: '1. Stop culprit antibiotics.\n2. Contact precautions with soap & water.\n3. Prescribe Fidaxomicin 10-day course.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never give IV Vancomycin for C. diff (zero colonic excretion; must be given orally).' },
      { title: 'Exact Reference & Guideline Citations', content: '2021 IDSA/SHEA Focused Update on C. difficile (Clin Infect Dis 2021).' }
    ]
  },
  {
    id: 'fever_hiv_art_opportunistic_topic',
    specialty_id: 'fever', category_id: 'clinical_topics',
    title: 'HIV / AIDS & Opportunistic Prophylaxis',
    subtitle: 'Same-Day ART, CD4 Prophylaxis Thresholds & PCP Corticosteroids',
    type: 'Clinical Guideline',
    ai_scope_description: 'INSTI-based ART (Biktarvy/Triumeq), CD4 <200 PCP Bactrim, Cryptococcal meningitis ART delay, high-dose TMP-SMX.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Advanced HIV (CD4 <200). Red Flags: PCP hypoxemia (PaO2 <70), Cryptococcal meningitis (elevated ICP), Toxoplasma CNS lesions, CMV retinitis.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'CD4 <200: TMP-SMX DS 1 tab daily (PCP prophylaxis); CD4 <100 & IgG+: TMP-SMX DS 1 tab daily (Toxoplasma prophylaxis).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• First-Line ART: Biktarvy (Bictegravir/TAF/FTC) 1 tab PO daily.\n• Acute Severe PCP (PaO2 <70 or A-a ≥35): TMP-SMX 15-20 mg/kg/day IV + Prednisone 40 mg BID x 5d, 40 mg daily x 5d, 20 mg daily x 11d.' },
      { title: 'Stepwise Management Algorithm', content: '1. Rapid same-day ART initiation upon diagnosis.\n2. Delay ART 2-6 weeks in Cryptococcal meningitis to prevent fatal CNS IRIS.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Mandatory HLA-B*5701 testing before Abacavir to prevent fatal hypersensitivity reactions.' },
      { title: 'Exact Reference & Guideline Citations', content: '2023 HHS HIV Guidelines; CDC/NIH/IDSA Opportunistic Infections.' }
    ]
  },
  {
    id: 'fever_infective_endocarditis_topic',
    specialty_id: 'fever', category_id: 'clinical_topics',
    title: 'Infective Endocarditis (IE)',
    subtitle: 'Modified Duke Criteria, Targeted Antimicrobials & Surgical Triggers',
    type: 'Clinical Guideline',
    ai_scope_description: 'Fever, new murmur, Duke criteria, blood cultures, TEE vegetations, Vancomycin + Ceftriaxone, surgical indications.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Fever, new regurgitant heart murmur, splinter hemorrhages, Osler nodes, Janeway lesions, Roth spots. Red Flags: Heart failure, stroke, conduction blocks, ring abscess.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'Modified Duke Criteria (2 Major OR 1 Major + 3 Minor OR 5 Minor):\n• Major: 2 positive blood cultures with typical organism, Echocardiogram positive (vegetation, abscess, dehiscence).\n• Minor: Predisposition, Fever ≥38°C, Vascular phenomena, Immunologic phenomena, Microbiologic evidence.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Empiric Native Valve: Vancomycin 15-20 mg/kg IV q8-12h PLUS Ceftriaxone 2 g IV q24h.\n• Empiric Prosthetic Valve: Vancomycin 15-20 mg/kg IV + Cefepime 2 g IV q8h + Gentamicin 1 mg/kg IV q8h + Rifampin 300 mg PO q8h.\n• Viridans Strep Native Valve: Penicillin G 24 million units/day IV continuous OR Ceftriaxone 2 g IV daily x 4 weeks.' },
      { title: 'Stepwise Management Algorithm', content: '1. Draw 3 sets of blood cultures from separate venipuncture sites at least 30 mins apart.\n2. Perform Transthoracic (TTE) followed by Transesophageal Echocardiogram (TEE).\n3. Urgent Cardiac Surgery: Heart failure from valve destruction, persistent bacteremia >5-7d on therapy, fungal IE, mobile vegetation >10 mm with embolism.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT start antibiotics prior to drawing 3 separate blood culture sets unless patient is in septic shock (prior antibiotics sterilize cultures and complicate diagnosis).' },
      { title: 'Exact Reference & Guideline Citations', content: '2023 ESC Guidelines for the management of endocarditis; 2015 AHA Scientific Statement.' }
    ]
  },

  // Fever: Tools & Diagnostics
  {
    id: 'fever_sofa_scoring_tool',
    specialty_id: 'fever', category_id: 'tools',
    title: 'SOFA & qSOFA Sepsis Scoring Tools',
    subtitle: 'Multisystem Organ Dysfunction Quantifier & Mortality Prediction',
    type: 'Diagnostic Tool',
    ai_scope_description: 'Calculation of SOFA score (0-24) across respiration, platelets, bilirubin, MAP/vasopressors, GCS, creatinine.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Acute change in SOFA score ≥2 points in the setting of infection represents a mortality risk >10%.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: '6 Organ Systems (0-4 pts each):\n1. Respiration: PaO2/FiO2 (400=0, <400=1, <300=2, <200=3, <100=4).\n2. Coagulation: Platelets (>150=0, <150=1, <100=2, <50=3, <20=4).\n3. Liver: Bilirubin (<1.2=0, 1.2-1.9=1, 2-5.9=2, 6-11.9=3, >12=4).\n4. Cardio: MAP ≥70=0, <70=1, Dopamine ≤5=2, Norepi ≤0.1=3, Norepi >0.1=4.\n5. CNS: GCS (15=0, 13-14=1, 10-12=2, 6-9=3, <6=4).\n6. Renal: Creatinine (<1.2=0, 1.2-1.9=1, 2-3.4=2, 3.5-4.9=3, >5.0=4).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool).' },
      { title: 'Stepwise Management Algorithm', content: 'Score baseline SOFA. An increase of ≥2 points confirms Sepsis and triggers ICU admission.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'qSOFA was designed for out-of-hospital triage; do not withhold sepsis treatment if qSOFA <2 when clinical suspicion is high.' },
      { title: 'Exact Reference & Guideline Citations', content: 'Sepsis-3 Consensus Definitions (JAMA 2016); Surviving Sepsis Campaign 2021.' }
    ]
  },
  {
    id: 'fever_lrinec_score_tool',
    specialty_id: 'fever', category_id: 'tools',
    title: 'LRINEC Score for Necrotizing Fasciitis',
    subtitle: 'Laboratory Risk Indicator for Soft Tissue Necrosis',
    type: 'Diagnostic Tool',
    ai_scope_description: 'LRINEC 13-point scoring tool: CRP, WBC, Hemoglobin, Sodium, Creatinine, Glucose.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Clinical suspicion of deep soft tissue necrosis. Score ≥6 indicates high risk; Score ≥8 indicates >75% risk.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'Point Breakdown:\n• CRP ≥150 mg/L (4 pts)\n• WBC: 15-25k (1 pt), >25k (2 pts)\n• Hemoglobin: 11-13.5 (1 pt), <11 g/dL (2 pts)\n• Sodium <135 mEq/L (2 pts)\n• Creatinine >1.6 mg/dL (2 pts)\n• Glucose >180 mg/dL (1 pt).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool).' },
      { title: 'Stepwise Management Algorithm', content: 'Score ≥6 warrants immediate surgical exploration and empiric IV antibiotics.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'A low LRINEC score (<6) does NOT completely exclude early necrotizing fasciitis; clinical suspicion always trumps lab scores.' },
      { title: 'Exact Reference & Guideline Citations', content: 'Wong CH, et al. The LRINEC Score (Crit Care Med 2004).' }
    ]
  },

  // Fever: Research
  {
    id: 'fever_short_course_abx_trials',
    specialty_id: 'fever', category_id: 'research',
    title: 'Short-Course Antibiotic Paradigms',
    subtitle: 'Evidence for 5-Day Pneumonia, 7-Day Bacteremia & STOP-IT Trials',
    type: 'Trial & Evidence',
    ai_scope_description: 'Landmark trials showing clinical equivalence of shorter antibiotic durations for pneumonia, bacteremia, and intra-abdominal sepsis.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Excessive antibiotic durations drive C. difficile colitis, multi-drug resistance, and adverse events without clinical benefit.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'Key Trials:\n• STOP-IT (NEJM 2015): 4 days post-source control equivalent to 10 days in intra-abdominal infection.\n• BALANCE (JAMA 2023): 7 days equivalent to 14 days in gram-negative bacteremia.\n• CAP-START (NEJM 2015): 5 days equivalent to 10 days in community pneumonia.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Step down to oral therapy once afebrile for 24-48h, stable, and tolerating oral intake.' },
      { title: 'Stepwise Management Algorithm', content: '1. Establish source control.\n2. Reassess clinical stability criteria.\n3. Stop antibiotics at 5-7 days for uncomplicated infections.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'The axiom "always finish the 14-day course" is obsolete; stop antibiotics once clinical stability is established.' },
      { title: 'Exact Reference & Guideline Citations', content: 'STOP-IT Trial (NEJM 2015); BALANCE Bacteremia (JAMA 2023); 2023 IDSA Guidance.' }
    ]
  },

  // =========================================================================
  // NEUROLOGY & NEUROCRITICAL CARE
  // =========================================================================
  // Neuro: Emergencies
  {
    id: 'neuro_elevated_icp_protocol',
    specialty_id: 'neuro', category_id: 'emergencies',
    title: 'Acute Elevated ICP & Brainstem Herniation',
    subtitle: '3% Hypertonic Saline, 20% Mannitol & Emergency Decompression',
    type: 'Emergency Protocol',
    ai_scope_description: 'ICP >20-22 mmHg, Cushing triad, uncal herniation, 3% hypertonic saline, 20% mannitol, EVD, decompressive craniectomy.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'ICP >20-22 mmHg. Cushing Triad: Hypertension + Bradycardia + Irregular respirations. Uncal herniation: Blown pupil + contralateral hemiplegia.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'Target ICP <20-22 mmHg, Target CPP 60-70 mmHg (CPP = MAP - ICP). Avoid CPP <50 mmHg.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• 3% Hypertonic Saline: 250-500 mL IV bolus over 15 mins (target Na 145-155 mEq/L) - PREFERRED in hypotension.\n• 20% Mannitol: 0.5-1.0 g/kg IV over 20 mins (avoid if SBP <90 or severe renal failure).\n• Acute Hyperventilation: PaCO2 30-35 mmHg (temporary bridge only for <1-2h).' },
      { title: 'Stepwise Management Algorithm', content: '1. Head of bed 30°, neck midline, sedation (Propofol).\n2. 3% NaCl boluses + EVD CSF drainage.\n3. Decompressive Hemicraniectomy for refractory swelling.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer hypotonic IV fluids (0.45% Saline or D5W) in neurocritical care (worsens cerebral edema).' },
      { title: 'Exact Reference & Guideline Citations', content: '2020 Neurocritical Care Society Guidelines on Cerebral Edema (Neurocrit Care 2020).' }
    ]
  },
  {
    id: 'neuro_myasthenia_gbs_crisis',
    specialty_id: 'neuro', category_id: 'emergencies',
    title: 'Myasthenic Crisis & Guillain-Barré Syndrome',
    subtitle: 'The 20/30/40 Rule, Negative Inspiratory Force (NIF), IVIG & Plasma Exchange',
    type: 'Emergency Protocol',
    ai_scope_description: 'Neuromuscular respiratory failure, 20/30/40 rule, NIF <-30, FVC <20 mL/kg, IVIG 2 g/kg, Plasmapheresis, avoiding neuromuscular blockers.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Progressive respiratory and bulbar weakness. Red Flags: Paradoxical breathing, single-breath count <20, FVC <20 mL/kg, NIF worse than -30 cmH2O.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: '20/30/40 Rule for Intubation: FVC <20 mL/kg, NIF worse than -30 cmH2O, MEP <40 cmH2O.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• IVIG: 2 g/kg total divided as 0.4 g/kg/day IV x 5 days OR\n• Therapeutic Plasma Exchange (PLEX): 5 sessions over 10-14 days.\n• Hold Pyridostigmine during mechanical ventilation to reduce airway secretions.' },
      { title: 'Stepwise Management Algorithm', content: '1. Monitor serial bedside FVC/NIF q4-6h.\n2. Elective intubation based on pulmonary mechanics before respiratory arrest occurs.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT wait for blood gas hypoxia or hypercapnia to intubate (diaphragm collapse is sudden and catastrophic).' },
      { title: 'Exact Reference & Guideline Citations', content: '2020 International MG Consensus (Neurology 2021); AAN GBS Guidelines.' }
    ]
  },

  // Neuro: Clinical Topics
  {
    id: 'neuro_parkinsons_guidelines',
    specialty_id: 'neuro', category_id: 'clinical_topics',
    title: 'Parkinson’s Disease Management',
    subtitle: 'TRAP Tetrad, Levodopa Optimization, Dopamine Agonists & Motor Fluctuations',
    type: 'Clinical Guideline',
    ai_scope_description: 'Resting tremor, rigidity, bradykinesia, postural instability, Sinemet titration, COMT inhibitors, DBS.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Resting pill-rolling tremor (4-6 Hz), cogwheel rigidity, bradykinesia, postural instability. Exclude atypical Parkinsonism (early falls, early dementia).' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'MDS Criteria: Bradykinesia + Resting Tremor or Rigidity + Clear positive response to Levodopa.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Carbidopa/Levodopa (Sinemet) 25/100 mg PO TID 30-60 mins BEFORE meals.\n• Dopamine Agonists: Pramipexole 0.125-1.5 mg TID or Ropinirole 0.25-8 mg TID (monitor for impulse control disorders).\n• MAO-B Inhibitors: Rasagiline 0.5-1.0 mg PO daily.' },
      { title: 'Stepwise Management Algorithm', content: '1. Titrate Levodopa.\n2. Manage wearing-off: Add Entacapone 200 mg with each dose.\n3. Advanced refractory: Deep Brain Stimulation (DBS).' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never prescribe dopamine blockers (Haloperidol, Metoclopramide) in Parkinson’s (causes catastrophic motor freezing).' },
      { title: 'Exact Reference & Guideline Citations', content: '2021 MDS Clinical Practice Guidelines (Mov Disord 2021); NICE NG71.' }
    ]
  },
  {
    id: 'neuro_multiple_sclerosis_topic',
    specialty_id: 'neuro', category_id: 'clinical_topics',
    title: 'Multiple Sclerosis & Demyelinating Disease',
    subtitle: 'McDonald 2017 Criteria, High-Dose Steroid Relapse & High-Efficacy DMTs',
    type: 'Clinical Guideline',
    ai_scope_description: 'McDonald 2017 criteria, optic neuritis, oligoclonal bands, IV Methylprednisolone 1g, Ocrelizumab, Natalizumab, JCV risk.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Optic neuritis, transverse myelitis, Lhermitte sign, Uhthoff phenomenon, asymmetric limb weakness.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: '2017 McDonald Criteria: Dissemination in Space (DIS: ≥1 T2 lesion in ≥2 areas) + Dissemination in Time (DIT: simultaneous enhancing/non-enhancing lesions or CSF oligoclonal bands).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Acute Relapse: Methylprednisolone 1,000 mg IV daily x 3-5 days (or PLEX for steroid-refractory).\n• High-Efficacy DMTs: Ocrelizumab 600 mg IV q6m OR Natalizumab 300 mg IV q4w (check anti-JCV antibody).' },
      { title: 'Stepwise Management Algorithm', content: '1. Brain & Full Spine MRI with Gadolinium.\n2. CSF Oligoclonal bands & IgG index.\n3. Early high-efficacy DMT to prevent axonal loss.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Screen for JC Virus before Natalizumab (high risk of fatal PML in JCV+ patients after 2 years).' },
      { title: 'Exact Reference & Guideline Citations', content: '2017 McDonald Criteria (Lancet Neurol 2018); ECTRIMS/EAN 2021 Guidelines.' }
    ]
  },

  // Neuro: Tools & Diagnostics
  {
    id: 'neuro_nihss_tool',
    specialty_id: 'neuro', category_id: 'tools',
    title: 'NIH Stroke Scale (NIHSS 0-42) Tool',
    subtitle: 'Standardized Neurologic Deficit Score & Reperfusion Eligibility',
    type: 'Diagnostic Tool',
    ai_scope_description: '11-item NIHSS scoring system, stroke severity grading, documentation standards.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Score 0 (normal) to 42 (severe stroke). Score ≥6: moderate stroke; Score ≥10-15: suggests Large Vessel Occlusion (LVO).' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: '11 Items: 1a-c LOC, 2 Gaze, 3 Visual fields, 4 Facial palsy, 5-6 Motor arm/leg, 7 Limb ataxia, 8 Sensory, 9 Language, 10 Dysarthria, 11 Extinction/Inattention.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool).' },
      { title: 'Stepwise Management Algorithm', content: 'Score what patient DOES, not what you think they can do. Repeat at 1h post-lytic.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do not coach or repeat test words during language assessment.' },
      { title: 'Exact Reference & Guideline Citations', content: 'NINDS NIHSS Standard; AHA/ASA 2019.' }
    ]
  },

  // Neuro: Research
  {
    id: 'neuro_anti_amyloid_alzheimers_trials',
    specialty_id: 'neuro', category_id: 'research',
    title: 'Anti-Amyloid Monoclonals in Alzheimer’s',
    subtitle: 'Lecanemab (Clarity AD) & Donanemab (TRAILBLAZER) Breakthroughs',
    type: 'Trial & Evidence',
    ai_scope_description: 'Lecanemab, Donanemab, amyloid plaque clearance, CDR-SB cognitive decline slowing, ARIA-E and ARIA-H safety.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Early Alzheimer’s and Mild Cognitive Impairment with confirmed amyloid pathology.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clarity AD (NEJM 2023): Lecanemab slowed CDR-SB clinical decline by 27% at 18 months. TRAILBLAZER-ALZ 2 (JAMA 2023): Donanemab slowed cognitive decline by 35%.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Lecanemab: 10 mg/kg IV q2w.\n• Donanemab: 700 mg IV q4w x 3 doses then 1400 mg IV q4w.' },
      { title: 'Stepwise Management Algorithm', content: '1. Confirm amyloid by PET or CSF Aβ42/40.\n2. APOE ε4 genotyping.\n3. Surveillance MRIs at 5, 7, 14 weeks for ARIA.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'High risk of fatal brain hemorrhage if given with tPA in acute stroke.' },
      { title: 'Exact Reference & Guideline Citations', content: 'Clarity AD (NEJM 2023); TRAILBLAZER-ALZ 2 (JAMA 2023).' }
    ]
  },

  // =========================================================================
  // PULMONOLOGY & RESPIRATORY MEDICINE
  // =========================================================================
  // Lungs: Emergencies
  {
    id: 'lungs_tension_pneumothorax_protocol',
    specialty_id: 'lungs', category_id: 'emergencies',
    title: 'Tension Pneumothorax & Massive Hemothorax',
    subtitle: 'Emergency Needle Decompression (5th ICS MAL), Chest Tube & Thoracotomy Triggers',
    type: 'Emergency Protocol',
    ai_scope_description: 'Tension pneumothorax, one-way valve, tracheal deviation, obstructive shock, 14G needle thoracostomy, tube thoracostomy.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Sudden pleuritic pain, absent breath sounds, JVD, tracheal deviation, obstructive shock (severe hypotension).' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clinical diagnosis. Massive Hemothorax: >1,500 mL initial drainage or >200 mL/hr x 2-4h (triggers thoracotomy).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Needle Decompression: 14G needle (≥8 cm) at 5th ICS anterior to Mid-Axillary Line (or 2nd ICS MCL).\n• Tube Thoracostomy: 28-32 Fr for hemothorax, 20-24 Fr for pneumothorax connected to -20 cmH2O suction.' },
      { title: 'Stepwise Management Algorithm', content: '1. Decompress immediately upon clinical diagnosis.\n2. Place definitive chest tube in triangle of safety.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never send patient to radiology for a CXR if tension pneumothorax is suspected (delay causes cardiac arrest).' },
      { title: 'Exact Reference & Guideline Citations', content: 'ATLS 10th Edition; BTS Pleural Disease 2023.' }
    ]
  },

  // Lungs: Clinical Topics
  {
    id: 'lungs_asthma_smart_guidelines',
    specialty_id: 'lungs', category_id: 'clinical_topics',
    title: 'Asthma Stepwise Management (GINA 2024)',
    subtitle: 'SMART / MART Strategy, Formoterol-ICS Reliever & Biologic Phenotyping',
    type: 'Clinical Guideline',
    ai_scope_description: 'GINA 2024 Track 1 (ICS-Formoterol reliever/controller), FeNO, blood eosinophils, Dupilumab, Tezepelumab.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Recurrent wheezing, shortness of breath, reversible airflow obstruction on spirometry (FEV1 increase ≥12% and ≥200 mL).' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'GINA Track 1: Low-dose ICS-Formoterol as both daily controller AND symptom reliever.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Step 1-2: As-needed Budesonide/Formoterol 160/4.5 mcg 1 puff PRN.\n• Step 3: Budesonide/Formoterol 160/4.5 mcg 1 puff BID + 1 puff PRN.\n• Step 4: Budesonide/Formoterol 160/4.5 mcg 2 puffs BID + 1 puff PRN.\n• Step 5: Add Tiotropium + Biologics (Dupilumab 300 mg q2w, Tezepelumab 210 mg q4w).' },
      { title: 'Stepwise Management Algorithm', content: '1. Prescribe ICS-Formoterol single inhaler.\n2. Review inhaler technique at every visit.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never treat asthma with SABA monotherapy (Albuterol alone increases severe exacerbation and death risk; always pair with ICS).' },
      { title: 'Exact Reference & Guideline Citations', content: 'GINA 2024 Strategy Report; NAEPP 2020.' }
    ]
  },

  // Lungs: Tools & Diagnostics
  {
    id: 'lungs_lights_criteria_tool',
    specialty_id: 'lungs', category_id: 'tools',
    title: 'Light’s Criteria & Pleural Fluid Analysis',
    subtitle: 'Transudate vs Exudate Differentiation & Empyema Criteria',
    type: 'Diagnostic Tool',
    ai_scope_description: 'Light criteria: Pleural/Serum protein >0.5, Pleural/Serum LDH >0.6, Pleural LDH >2/3 ULN. Empyema pH <7.20.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Complicated parapneumonic effusion / Empyema (pleural pH <7.20, glucose <40, positive Gram stain; mandates chest tube).' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'Light’s Criteria (Exudate if ≥1 met):\n1. Pleural/Serum Protein > 0.5\n2. Pleural/Serum LDH > 0.6\n3. Pleural LDH > 2/3 Upper Limit of Normal Serum LDH.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool).' },
      { title: 'Stepwise Management Algorithm', content: '1. Diagnostic thoracentesis with ultrasound.\n2. Send for Protein, LDH, Glucose, pH, Gram stain, Cytology.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'In heart failure patients on diuretics, check Serum-Pleural Albumin Gradient (>1.2 g/dL indicates true transudate).' },
      { title: 'Exact Reference & Guideline Citations', content: 'Light RW (Ann Intern Med 1972); BTS Pleural Guidelines 2023.' }
    ]
  },

  // Lungs: Research
  {
    id: 'lungs_tezepelumab_tslp_trials',
    specialty_id: 'lungs', category_id: 'research',
    title: 'TSLP Inhibition & Biologics in Severe Asthma',
    subtitle: 'NAVIGATOR & DESTINATION Trials: Tezepelumab Evidence',
    type: 'Trial & Evidence',
    ai_scope_description: 'Tezepelumab (anti-TSLP), NAVIGATOR trial, pan-asthma efficacy across high and low eosinophil phenotypes.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Severe uncontrolled asthma with frequent exacerbations despite high-dose ICS-LABA.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'NAVIGATOR Trial (NEJM 2021): Tezepelumab reduced annualized exacerbation rates by 56% across all biomarker subgroups.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Tezepelumab: 210 mg SC once every 4 weeks.' },
      { title: 'Stepwise Management Algorithm', content: '1. Evaluate uncontrolled Step 4/5 patients.\n2. First-line choice for low-eosinophil or overlapping phenotypes.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do not abruptly stop maintenance inhaled steroids when initiating biologic therapy.' },
      { title: 'Exact Reference & Guideline Citations', content: 'NAVIGATOR (NEJM 2021); DESTINATION (Lancet Resp Med 2022).' }
    ]
  },

  // =========================================================================
  // GASTROENTEROLOGY & HEPATOLOGY (GIT) - Missing Categories
  // =========================================================================
  // GIT: Tools & Diagnostics
  {
    id: 'git_blatchford_rockall_tool',
    specialty_id: 'git', category_id: 'tools',
    title: 'Glasgow-Blatchford & Rockall Bleeding Scores',
    subtitle: 'Upper GI Hemorrhage Triage & Outpatient Discharge Thresholds',
    type: 'Diagnostic Tool',
    ai_scope_description: 'Glasgow-Blatchford Score (GBS 0-23) for pre-endoscopic triage, Rockall post-endoscopic rebleeding calculation.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'Upper GI bleeding (hematemesis, melena). GBS score 0-1 indicates very low risk suitable for outpatient discharge.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'GBS Components: BUN, Hemoglobin, SBP, Pulse ≥100, Melena, Syncope, Hepatic disease, Heart failure. Score ≥6 = high risk (>50% need intervention).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool).' },
      { title: 'Stepwise Management Algorithm', content: '1. Calculate GBS on ED arrival.\n2. GBS ≤1: Outpatient discharge.\n3. GBS ≥2: Inpatient admission + IV PPI + Endoscopy <24h.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'GBS is significantly superior to clinical intuition in predicting transfusion and rebleeding needs.' },
      { title: 'Exact Reference & Guideline Citations', content: 'Glasgow-Blatchford Score (Lancet 2000); ACG Upper GI Bleeding 2021.' }
    ]
  },
  {
    id: 'git_child_pugh_meld_tool',
    specialty_id: 'git', category_id: 'tools',
    title: 'Child-Pugh & MELD-Na Cirrhosis Calculators',
    subtitle: 'Hepatic Functional Reserve & 90-Day Liver Transplant Priority',
    type: 'Diagnostic Tool',
    ai_scope_description: 'Child-Pugh Class A/B/C (5-15 pts: Encephalopathy, Ascites, Bilirubin, Albumin, INR) and MELD-Na (Bilirubin, INR, Creatinine, Sodium).',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'End-stage liver disease, decompensated cirrhosis, MELD-Na >15 (triggers liver transplantation evaluation).' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: '• Child-Pugh Score (5-15 pts): Bilirubin, Albumin, INR, Ascites, Encephalopathy (Class A: 5-6, Class B: 7-9, Class C: 10-15).\n• MELD-Na Score: Incorporates Bilirubin, INR, Serum Creatinine, and Serum Sodium (predicts 90-day mortality from <2% to >70%).' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool).' },
      { title: 'Stepwise Management Algorithm', content: 'Calculate MELD-Na for all hospitalized cirrhotic patients to guide ICU admission and UNOS transplant listing.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'In patients on Warfarin or DOACs, INR is artificially elevated and distorts MELD score; document anticoagulation status.' },
      { title: 'Exact Reference & Guideline Citations', content: 'AASLD Practice Guidelines: Management of Cirrhosis; UNOS MELD-Na Policy.' }
    ]
  },

  // GIT: Research
  {
    id: 'git_resmetirom_nash_trials',
    specialty_id: 'git', category_id: 'research',
    title: 'Thyroid Hormone Receptor-β Agonism in MASH',
    subtitle: 'MAESTRO-NASH Landmark Trial & Resmetirom FDA Approval',
    type: 'Trial & Evidence',
    ai_scope_description: 'Resmetirom in MASH with liver fibrosis (F2-F3), MAESTRO-NASH Phase 3 trial data, fibrosis reversal.',
    clinical_content: [
      { title: 'Immediate Triage & Red Flags', content: 'MASH with stage F2-F3 liver fibrosis leading to cirrhosis and liver failure.' },
      { title: 'Diagnostic Criteria & Scoring Systems', content: 'MAESTRO-NASH (NEJM 2024): Resmetirom achieved MASH resolution in 29.9% vs 9.7% placebo, and fibrosis improvement in 25.9% vs 14.2%.' },
      { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Resmetirom (Rezdiffra): 80 mg PO daily (<100 kg) or 100 mg PO daily (≥100 kg).' },
      { title: 'Stepwise Management Algorithm', content: '1. Identify patients with FIB-4 >1.3 and FibroScan stiffness >8.0 kPa.\n2. Prescribe Resmetirom alongside metabolic management.' },
      { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Avoid in decompensated cirrhosis (Child-Pugh B or C; approved only for non-cirrhotic MASH F2-F3).' },
      { title: 'Exact Reference & Guideline Citations', content: 'MAESTRO-NASH Trial (NEJM 2024); FDA Approval 2024; AASLD 2024.' }
    ]
  }
];

async function run() {
  console.log(`🚀 Upserting ${MASTER_TOPICS.length} reference topics into Supabase...`);
  
  for (const topic of MASTER_TOPICS) {
    const record = {
      id: topic.id,
      specialty_id: topic.specialty_id,
      category_id: topic.category_id,
      title: topic.title,
      subtitle: topic.subtitle,
      type: topic.type,
      ai_scope_description: topic.ai_scope_description,
      clinical_content: topic.clinical_content
    };

    // Check if topic exists
    const { data: existing } = await supabase
      .from('topics')
      .select('id')
      .eq('id', record.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('topics').update(record).eq('id', record.id);
      if (error) console.error(`❌ Update failed for ${record.id}:`, error.message);
      else console.log(`🔄 Updated [${record.specialty_id} -> ${record.category_id}]: ${record.title}`);
    } else {
      const { error } = await supabase.from('topics').insert(record);
      if (error) console.error(`❌ Insert failed for ${record.id}:`, error.message);
      else console.log(`✅ Inserted [${record.specialty_id} -> ${record.category_id}]: ${record.title}`);
    }
  }

  console.log('\n🎉 Population complete! Checking updated category counts...');
  const { data } = await supabase.from('topics').select('specialty_id, category_id');
  const counts = {};
  data.forEach(row => {
    const key = row.specialty_id + ' -> ' + row.category_id;
    counts[key] = (counts[key] || 0) + 1;
  });
  console.log('Final Supabase Topic Counts:', counts);
}

run();
