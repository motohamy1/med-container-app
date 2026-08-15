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
    color: '#c98c87',
    illustration: require('../assets/images/specialties/cardiology.jpg'),
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
          },
          {
            id: 'aortic_dissection',
            title: 'Acute Aortic Dissection',
            subtitle: 'Stanford Classification & Emergency Stabilization',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on Acute Aortic Dissection, Stanford Type A vs B, emergency hemodynamics (impulse control with IV beta blockers and vasodilators), CT angiography findings, and surgical versus medical management.',
            clinicalContent: [
              { title: 'Pathophysiology & Classification', content: 'A tear in the aortic intima allows blood to surge into the media, creating a false lumen. Classified by Stanford system: Type A involves ascending aorta (surgical emergency); Type B involves descending aorta distal to left subclavian artery (primarily medical management).' },
              { title: 'Clinical Presentation', content: 'Sudden onset of severe, sharp, "tearing" or "ripping" chest pain radiating to the interscapular region. Pulse differentials between arms (>20 mmHg SBP difference), focal neurological deficits, or new diastolic murmur of aortic regurgitation.' },
              { title: 'Diagnostic Workup', content: 'CT Angiography (CTA) of chest, abdomen, and pelvis is the diagnostic modality of choice in hemodynamically stable patients. Transesophageal Echocardiography (TEE) or bedside point-of-care ultrasound (POCUS) if unstable.' },
              { title: 'Emergency Management', content: '1. Heart Rate & Blood Pressure Control: Target HR <60 bpm and SBP 100-120 mmHg. Start IV Esmolol or Labetalol first, followed by IV Nitroprusside or Nicardipine (never give vasodilator before beta blocker to avoid reflex tachycardia).\n2. Type A: Emergent cardiothoracic surgical consultation for ascending aortic repair.\n3. Type B: Medical anti-impulse therapy unless complicated by rupture, malperfusion, or intractable pain (TEVAR indicated).' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: [
          {
            id: 'hypertension_guidelines',
            title: 'Essential Hypertension Guidelines',
            subtitle: 'ACC/AHA & ESC Targets and Pharmacotherapy',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus strictly on essential hypertension, classification stages, ambulatory BP monitoring, lifestyle modifications, first-line antihypertensive classes (ACEi/ARB, CCB, thiazides), and resistant hypertension.',
            clinicalContent: [
              { title: 'Diagnostic Criteria & BP Stages', content: 'Stage 1 HTN: SBP 130-139 or DBP 80-89 mmHg. Stage 2 HTN: SBP ≥140 or DBP ≥90 mmHg. Diagnosis requires at least 2 readings on ≥2 separate clinical encounters or confirmation via 24-hour Ambulatory Blood Pressure Monitoring (ABPM).' },
              { title: 'First-Line Pharmacotherapy', content: 'Four primary classes: 1. ACE Inhibitors (e.g., Lisinopril) or ARBs (e.g., Losartan); 2. Dihydropyridine Calcium Channel Blockers (e.g., Amlodipine); 3. Thiazide-like Diuretics (Chlorthalidone or Indapamide preferred over Hydrochlorothiazide). Combination therapy is recommended for Stage 2 HTN with BP >20/10 mmHg over goal.' },
              { title: 'Special Populations', content: 'Black patients: CCB or Thiazide initial therapy.\nDiabetic kidney disease or CKD with albuminuria: ACEi or ARB is mandatory for renal protection.\nCoronary artery disease: Beta-blocker plus ACEi/ARB.' },
              { title: 'Resistant Hypertension', content: 'Blood pressure remaining above goal despite concurrent use of 3 antihypertensive agents of different classes (one being a diuretic). Add Spironolactone (mineralocorticoid receptor antagonist) as 4th-line agent after ruling out secondary causes (OSA, renal artery stenosis, hyperaldosteronism).' }
            ]
          },
          {
            id: 'cad_stable_angina',
            title: 'Chronic Coronary Syndromes',
            subtitle: 'Stable Angina Workup & Revascularization',
            type: 'Disease Management',
            aiScopeDescription: 'Focus on Chronic Coronary Syndromes (CCS), stable ischemic heart disease, stress testing modalities (SPECT, stress echo, CMR, CCTA), medical anti-anginal optimization, and ISCHEMIA trial evidence.',
            clinicalContent: [
              { title: 'Definition & Symptoms', content: 'Predictable, transient chest discomfort provoked by physical exertion or emotional stress and relieved by rest or sublingual nitroglycerin within minutes. Caused by flow-limiting coronary atheromas.' },
              { title: 'Diagnostic Strategy', content: 'Pre-test probability guides non-invasive testing: Coronary CT Angiography (CCTA) preferred for anatomical evaluation in low-to-intermediate risk; Functional stress testing (Stress CMR, PET/SPECT, Stress Echo) evaluates ischemia.' },
              { title: 'Medical Therapy (Prognostic & Symptomatic)', content: 'Prognostic: Aspirin 81 mg daily, high-intensity Statin (Atorvastatin 80mg), and ACEi (if hypertension, DM, or EF <40%).\nAnti-anginal: First-line Beta-blockers (Metoprolol succinate, Bisoprolol) and/or CCBs (Amlodipine). Second-line Long-acting nitrates, Ranolazine, or Ivabradine.' },
              { title: 'Revascularization Decisions', content: 'Guided by ISCHEMIA trial: Optimal medical therapy is non-inferior to initial invasive revascularization (PCI/CABG) for reduction of death/MI in stable disease, but revascularization provides superior symptom relief in refractory angina.' }
            ]
          },
          {
            id: 'hyperlipidemia_statin',
            title: 'Dyslipidemia & ASCVD Prevention',
            subtitle: 'Statin Intensity, Ezetimibe & PCSK9 Inhibitors',
            type: 'Prevention Guideline',
            aiScopeDescription: 'Focus strictly on dyslipidemia, 10-year ASCVD risk calculation, high-intensity vs moderate-intensity statins, non-statin therapies (Ezetimibe, PCSK9 monoclonals, Bempedoic acid), and LDL-C targets.',
            clinicalContent: [
              { title: 'Risk Stratification & LDL-C Goals', content: 'Secondary Prevention (Clinical ASCVD): Very high risk requires LDL-C <55 mg/dL (<1.4 mmol/L) and ≥50% reduction from baseline. Primary Prevention: 10-year ASCVD risk calculator determines threshold for statin initiation.' },
              { title: 'Statin Regimens', content: 'High-Intensity (lowers LDL-C ≥50%): Atorvastatin 40-80 mg, Rosuvastatin 20-40 mg.\nModerate-Intensity (lowers LDL-C 30-49%): Atorvastatin 10-20 mg, Rosuvastatin 5-10 mg, Simvastatin 20-40 mg.' },
              { title: 'Add-On Non-Statin Therapies', content: 'If LDL-C remains above goal on maximally tolerated statin:\n1. Ezetimibe 10 mg daily (adds 15-20% LDL-C reduction).\n2. PCSK9 Inhibitors (Evolocumab, Alirocumab SC biweekly - reduces LDL-C up to 60%).\n3. Bempedoic Acid (ATP citrate lyase inhibitor) for statin-intolerant patients.' },
              { title: 'Monitoring & Safety', content: 'Baseline lipid panel and ALT. Recheck lipids 4-12 weeks after initiation or dose adjustment. Routine CK monitoring is not recommended unless myalgia symptoms arise.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: [
          {
            id: 'ecg_interpretation',
            title: 'Systematic 12-Lead ECG Interpretation',
            subtitle: 'Axis, Ischemia, Conduction Blocks & Intervals',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus strictly on systematic 12-lead electrocardiogram (ECG) interpretation, rate, rhythm, axis calculation, bundle branch blocks, hypertrophy criteria, ischemic territories, and QT interval correction.',
            clinicalContent: [
              { title: 'Stepwise Interpretation Methodology', content: '1. Rate & Rhythm: Sinus rhythm requires upright P waves in leads I, II, aVF. Rate = 300 / large boxes between R-R.\n2. Axis: Normal (-30° to +90°). Lead I positive + aVF positive = Normal axis; Lead I positive + aVF negative = LAD (verify with lead II).\n3. Intervals: PR (120-200 ms), QRS (<120 ms), QTc (<440 ms men, <460 ms women by Bazett formula).' },
              { title: 'Coronary Ischemic Territories', content: 'Anterior/Septal (LAD): V1-V4.\nLateral (LCx or diagonal): I, aVL, V5, V6.\nInferior (RCA or LCx): II, III, aVF (always obtain right-sided V4R to check for RV infarction).\nPosterior (RCA/LCx): ST depressions and tall R waves in V1-V3 (obtain V7-V9).' },
              { title: 'Conduction System Abnormalities', content: 'RBBB: QRS ≥120 ms, rsR\' "rabbit ears" in V1-V2, wide slurred S wave in I and V6.\nLBBB: QRS ≥120 ms, broad notched R wave in I, aVL, V5-V6, deep QS in V1. (New LBBB with ischemic symptoms treated as STEMI equivalent; use Sgarbossa criteria for acute MI in LBBB).' }
            ]
          },
          {
            id: 'echo_ef_assessment',
            title: 'Echocardiography & EF Assessment',
            subtitle: 'Wall Motion, Diastology & Valvular Gradients',
            type: 'Imaging Guide',
            aiScopeDescription: 'Focus on Transthoracic Echocardiography (TTE), Simpson\'s biplane ejection fraction calculation, diastolic dysfunction grading (E/A ratio, E/e\'), wall motion abnormalities, and valvular stenosis/regurgitation criteria.',
            clinicalContent: [
              { title: 'Ejection Fraction Calculation', content: 'Biplane Method of Disks (modified Simpson’s rule) using apical 4-chamber and 2-chamber views is the clinical standard for Left Ventricular Ejection Fraction (LVEF). Normal LVEF is 52-72% in men, 54-74% in women.' },
              { title: 'Diastolic Dysfunction Assessment', content: 'Evaluated using Mitral inflow velocity (E/A ratio), Tissue Doppler annular velocities (e\'), average E/e\' ratio (>14 indicates elevated LV filling pressures), Tricuspid regurgitation peak velocity (>2.8 m/s), and Left Atrial Volume Index (LAVI >34 mL/m²).' },
              { title: 'Regional Wall Motion Scoring', content: 'LV is divided into 17 segments corresponding to coronary perfusion. Segments are graded: 1 = Normal, 2 = Hypokinetic, 3 = Akinetic, 4 = Dyskinetic (paradoxical systolic expansion), 5 = Aneurysmal.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: [
          {
            id: 'sglt2i_cardioprotection',
            title: 'SGLT2 Inhibitors across Heart Failure',
            subtitle: 'DAPA-HF, EMPEROR-Preserved & DELIVER',
            type: 'Evidence Review',
            aiScopeDescription: 'Focus on clinical trials and mechanisms of Sodium-Glucose Cotransporter-2 (SGLT2) inhibitors in heart failure across all ejection fractions regardless of diabetic status.',
            clinicalContent: [
              { title: 'Key Landmark Trials', content: 'DAPA-HF & EMPEROR-Reduced established Dapagliflozin and Empagliflozin in reducing CV death and HF hospitalizations in HFrEF by ~25%. EMPEROR-Preserved and DELIVER expanded benefits across HFpEF (LVEF >40%), establishing SGLT2i as the first class with universal guideline recommendation across the entire EF spectrum.' },
              { title: 'Mechanisms of Cardioprotection', content: 'Osmotic diuresis and natriuresis without sympathetic activation, reduction in preload/afterload, improvement in myocardial energetics (increased ketone oxidation), inhibition of cardiac Na+/H+ exchanger (NHE), and attenuation of cardiac fibrosis.' },
              { title: 'Clinical Practice Recommendations', content: 'Initiate Dapagliflozin 10 mg daily or Empagliflozin 10 mg daily in all stable HF patients regardless of baseline eGFR down to 20-25 mL/min/1.73m². No routine dose titration required.' }
            ]
          },
          {
            id: 'glp1_ascvd_trials',
            title: 'GLP-1 Receptor Agonists in CV Outcomes',
            subtitle: 'SELECT Trial & Obesity-Related Cardiomyopathy',
            type: 'Trial Summary',
            aiScopeDescription: 'Focus on Glucagon-Like Peptide-1 (GLP-1) receptor agonists (Semaglutide, Tirzepatide), cardiovascular outcomes trials (SELECT, SUSTAIN-6), and benefits in HFpEF and ASCVD reduction in non-diabetic populations.',
            clinicalContent: [
              { title: 'SELECT Trial Evidence', content: 'The SELECT trial demonstrated that Semaglutide 2.4 mg weekly reduced Major Adverse Cardiovascular Events (MACE: CV death, non-fatal MI, non-fatal stroke) by 20% in patients with overweight/obesity and established CVD without diabetes (HR 0.80, p<0.001).' },
              { title: 'STEP-HFpEF Trial Findings', content: 'Semaglutide significantly improved KCCQ clinical summary scores (+16.6 vs +8.7 points, p<0.001), 6-minute walk distance, and body weight in patients with obesity-phenotype HFpEF.' },
              { title: 'Guideline Integration', content: 'Modern cardiovascular guidelines now recommend GLP-1 RAs for secondary ASCVD prevention in overweight/obese patients with established cardiovascular disease, representing a major paradigm shift in cardiometabolic therapeutics.' }
            ]
          }
        ]
      }
    ]
  },
  git: {
    id: 'git',
    name: 'GIT',
    scientificName: 'Gastroenterology',
    icon: 'restaurant',
    color: '#a9a069',
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
            id: 'acute_pancreatitis',
            title: 'Acute Pancreatitis Management',
            subtitle: 'Revised Atlanta Criteria, BISAP & Resuscitation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on Acute Pancreatitis, Revised Atlanta classification, severity scoring (BISAP, Ranson), aggressive goal-directed crystalloid resuscitation, enteral nutrition timing, and necrotizing pancreatitis interventions.',
            clinicalContent: [
              { title: 'Diagnostic Criteria (2 of 3 Required)', content: '1. Severe epigastric pain radiating to the back.\n2. Serum lipase or amylase >3 times the upper limit of normal.\n3. Characteristic cross-sectional imaging findings (CT or MRI).' },
              { title: 'Etiology & Initial Workup', content: 'Gallstones (40-50%) and Alcohol (30-35%) are the most common causes. Other causes: Hypertriglyceridemia (triglycerides >1000 mg/dL), post-ERCP, hypercalcemia, medications. Order: LFTs (ALT >150 IU/L has 95% PPV for biliary etiology), RUQ ultrasound, lipid panel, calcium, and BUN/Creatinine.' },
              { title: 'Goal-Directed Fluid Resuscitation', content: 'Administer Lactated Ringer’s solution (preferred over Normal Saline to reduce metabolic acidosis). Recommended rate: 200-500 mL/hr or 5-10 mL/kg/hr for the first 12-24 hours. Reassess volume status frequently (target BUN drop, normal urine output >0.5 mL/kg/hr).' },
              { title: 'Nutrition & Antibiotic Stewardship', content: 'Early oral feeding with low-fat solid or liquid diet as soon as pain improves and ileus resolves (no need to keep NPO until lipase normalizes). Prophylactic antibiotics are NOT recommended for sterile necrosis; reserve antibiotics (Carbapenems) for infected necrosis confirmed by gas on CT or FNA.' }
            ]
          },
          {
            id: 'acute_cholangitis',
            title: 'Acute Ascending Cholangitis',
            subtitle: 'Tokyo Guidelines, Charcot\'s Triad & Biliary Drainage',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on acute ascending cholangitis, Charcot\'s triad, Reynolds\' pentad, Tokyo Guidelines diagnostic criteria, broad-spectrum IV antibiotics, and urgent ERCP biliary decompression.',
            clinicalContent: [
              { title: 'Pathophysiology & Presentation', content: 'Biliary obstruction (choledocholithiasis, stricture, stent occlusion) combined with bacterial infection of the stagnant bile. Classic Charcot’s Triad: Fever, RUQ abdominal pain, Jaundice. Reynolds’ Pentad (indicates severe suppurative cholangitis): Charcot’s triad + Hypotension + Altered Mental Status.' },
              { title: 'Tokyo Guidelines (TG18) Diagnostics', content: 'A. Systemic inflammation (Fever/shaking chills or elevated WBC/CRP).\nB. Cholestasis (Jaundice Total Bili ≥2 mg/dL or elevated ALP/GGT/ALT/AST).\nC. Imaging findings (Biliary dilatation or evidence of obstruction on US, CT, or MRCP).\nDefinite diagnosis requires 1 from A + 1 from B + 1 from C.' },
              { title: 'Emergency Management', content: '1. Resuscitation: IV crystalloids and hemodynamic stabilization.\n2. Empiric IV Antibiotics: Piperacillin-Tazobactam or Ceftriaxone + Metronidazole.\n3. Biliary Decompression: Emergent ERCP with sphincterotomy and stent placement within 24 hours for moderate/severe disease. Percutaneous transhepatic cholangiography (PTC) or surgical drainage if ERCP unavailable or fails.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: [
          {
            id: 'ibd',
            title: 'Inflammatory Bowel Disease',
            subtitle: 'Crohn\'s vs Ulcerative Colitis Differential & Biologics',
            type: 'Chronic Disease Guideline',
            aiScopeDescription: 'Focus strictly on IBD (Crohn\'s Disease, Ulcerative Colitis), pathophysiology, colonoscopy findings, medical management (biologics, steroids, aminosalicylates), and surgical indications.',
            clinicalContent: [
              { title: 'Definition & Differences', content: 'Inflammatory Bowel Disease (IBD) comprises two major chronic inflammatory disorders: Crohn’s Disease (CD) and Ulcerative Colitis (UC).\nUC: Involves mucosal layer only, continuous involvement beginning in rectum and progressing proximally, leads to bloody diarrhea and tenesmus.\nCD: Transmural inflammation, skip lesions anywhere from mouth to anus (terminal ileum most common), complications include strictures, fistulas, and abscesses.' },
              { title: 'Diagnostic Workup', content: 'Ileocolonoscopy with mucosal biopsies is essential. Fecal Calprotectin (>150-250 mcg/g) correlates with mucosal inflammation and disease activity. Cross-sectional imaging (CT or MR Enterography) evaluates small bowel involvement and extra-intestinal complications.' },
              { title: 'Stepwise Pharmacotherapy', content: 'Mild-Moderate UC: Oral/topical 5-ASA (Mesalamine).\nModerate-Severe UC & CD: Anti-TNF agents (Infliximab, Adalimumab), Anti-Integrins (Vedolizumab), Anti-IL12/23 (Ustekinumab), or JAK Inhibitors (Tofacitinib, Upadacitinib).\nAcute flare management: Systemic corticosteroids (Prednisone, IV Methylprednisolone) for induction only (never for maintenance).' },
              { title: 'Cancer Surveillance', content: 'Surveillance colonoscopy with high-definition chromoendoscopy starting 8 years after disease onset (or immediately upon diagnosis if co-existing Primary Sclerosing Cholangitis).' }
            ]
          },
          {
            id: 'gerd_peptic_ulcer',
            title: 'GERD & Peptic Ulcer Disease',
            subtitle: 'H. Pylori Eradication & PPI Stewardship',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Gastroesophageal Reflux Disease (GERD), Barrett\'s Esophagus, Peptic Ulcer Disease (PUD), Helicobacter pylori quadruple eradication regimens, and long-term PPI safety.',
            clinicalContent: [
              { title: 'GERD & "Alarm" Features', content: 'Empiric once-daily PPI trial for 4-8 weeks is appropriate for classic heartburn and acid regurgitation. Endoscopy (EGD) is indicated if alarm symptoms exist: Dysphagia, odynophagia, unintentional weight loss, GI bleeding, iron-deficiency anemia, or persistent symptoms despite standard PPI therapy.' },
              { title: 'H. Pylori First-Line Treatment', content: 'Bismuth Quadruple Therapy for 14 days is preferred due to high clarithromycin resistance:\n1. PPI (standard dose BID)\n2. Bismuth subsalicylate (120-300 mg QID)\n3. Metronidazole (500 mg TID or QID)\n4. Tetracycline (500 mg QID)\nConfirm eradication via urea breath test or stool antigen at least 4 weeks post-treatment and 2 weeks off PPI.' },
              { title: 'Barrett\'s Esophagus Management', content: 'Intestinal metaplasia with goblet cells on distal esophageal biopsy. Non-dysplastic Barrett\'s: Endoscopic surveillance every 3-5 years. Dysplastic Barrett\'s: Endoscopic mucosal resection (EMR) and radiofrequency ablation (RFA).' }
            ]
          },
          {
            id: 'cirrhosis_portal_htn',
            title: 'Decompensated Cirrhosis & Portal HTN',
            subtitle: 'Ascites, Hepatic Encephalopathy & Varices',
            type: 'Disease Protocol',
            aiScopeDescription: 'Focus on chronic liver disease, Child-Pugh and MELD-Na scoring, management of ascites (paracentesis, spironolactone/furosemide), SBP prophylaxis, hepatic encephalopathy (lactulose, rifaximin), and variceal screening.',
            clinicalContent: [
              { title: 'Ascites & Spontaneous Bacterial Peritonitis (SBP)', content: 'Perform diagnostic paracentesis on all hospitalized cirrhotic patients with new/worsening ascites. SAAG ≥1.1 g/dL indicates portal hypertension. SBP diagnosis: Ascitic fluid PMN count ≥250 cells/mm³. Treat SBP with IV Cefotaxime/Ceftriaxone + 1.5 g/kg IV Albumin on Day 1 and 1.0 g/kg on Day 3.' },
              { title: 'Diuretic Regimen for Ascites', content: 'Dual therapy with Spironolactone (100 mg) and Furosemide (40 mg) maintaining a 100:40 mg ratio to preserve serum potassium balance. Titrate every 3-5 days to a maximum of 400 mg Spironolactone / 160 mg Furosemide with sodium restriction (<2000 mg/day).' },
              { title: 'Hepatic Encephalopathy (HE)', content: 'First-line: Lactulose titrated to 2-3 soft bowel movements daily. Add Rifaximin 550 mg BID for secondary prevention after recurrent episodes. Always identify precipitating factors: Infection, GI bleed, constipation, hypokalemia, or sedative medications.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: [
          {
            id: 'lft_interpretation',
            title: 'Liver Function Tests & FIB-4 Score',
            subtitle: 'Hepatocellular vs Cholestatic Patterns',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on LFT pattern analysis, differentiating hepatocellular (ALT/AST) from cholestatic (ALP/GGT/Bilirubin) patterns, AST:ALT ratio (alcoholic hepatitis vs viral/NAFLD), and non-invasive fibrosis calculation (FIB-4).',
            clinicalContent: [
              { title: 'Pattern Recognition', content: 'Hepatocellular Pattern: Disproportionate elevation of ALT/AST compared to ALP. Markedly elevated ALT >1000 IU/L indicates acute ischemic hepatitis (shock liver), acute viral hepatitis, or toxic/drug-induced liver injury (Acetaminophen).\nCholestatic Pattern: Disproportionate elevation of ALP and GGT compared to ALT/AST. Differential: Biliary obstruction, PBC, PSC, or drug-induced cholestasis.' },
              { title: 'R Ratio Calculation', content: 'R = (ALT / ALT Upper Limit of Normal) / (ALP / ALP Upper Limit of Normal).\nR > 5: Hepatocellular injury.\nR < 2: Cholestatic injury.\nR between 2 and 5: Mixed injury pattern.' },
              { title: 'FIB-4 Index for Liver Fibrosis', content: 'FIB-4 = (Age [years] × AST [U/L]) / (Platelet count [10⁹/L] × √ALT [U/L]).\nScore < 1.3: Low risk of advanced fibrosis (NPV >90%).\nScore > 2.67: High risk of advanced fibrosis (PPV 80%), warrants elastography or hepatology referral.' }
            ]
          },
          {
            id: 'endoscopy_indications',
            title: 'Endoscopy & Colonoscopy Quality Metrics',
            subtitle: 'Screening Intervals & ASGE Guidelines',
            type: 'Procedural Guide',
            aiScopeDescription: 'Focus on upper endoscopy (EGD) and colonoscopy indications, bowel prep quality assessment, adenoma detection rate (ADR), and post-polypectomy surveillance intervals.',
            clinicalContent: [
              { title: 'Colorectal Cancer Screening Recommendations', content: 'Average-risk screening starts at age 45. Colonoscopy every 10 years, or annual FIT / Stool DNA-FIT every 3 years. Patients with a first-degree relative with CRC diagnosed <60 years: Start screening at age 40 or 10 years before youngest relative, repeat every 5 years.' },
              { title: 'Post-Polypectomy Surveillance Intervals', content: '1-2 tubular adenomas <10mm: Repeat in 7-10 years.\n3-4 tubular adenomas <10mm: Repeat in 3-5 years.\n5-10 adenomas, adenoma ≥10mm, villous histology, or high-grade dysplasia: Repeat in 3 years.\n>10 adenomas: Repeat in 1 year.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: [
          {
            id: 'biologics_jak_ibd',
            title: 'Small Molecules & Biologics in Refractory IBD',
            subtitle: 'Upadacitinib, Risankizumab & Mirikizumab',
            type: 'Therapeutic Advances',
            aiScopeDescription: 'Focus on recent clinical trials of selective JAK-1 inhibitors (Upadacitinib) and IL-23 p19 subunit antagonists (Risankizumab, Mirikizumab, Guselkumab) for moderate-to-severe Crohn\'s disease and Ulcerative Colitis.',
            clinicalContent: [
              { title: 'IL-23 p19 Selective Antagonists', content: 'ADVANCE & MOTIVATE trials demonstrated high rates of clinical remission and endoscopic response with Risankizumab in moderate-to-severe Crohn’s disease, including anti-TNF refractory patients. Mirikizumab (LUCENT trials) demonstrated superiority in Ulcerative Colitis.' },
              { title: 'Selective JAK-1 Inhibition (Upadacitinib)', content: 'U-ACHIEVE and U-ACCOMPLISH trials showed rapid symptom resolution (within 3 days) and high mucosal healing rates in moderate-to-severe UC, providing an effective oral alternative to injectable biologics.' },
              { title: 'Head-to-Head Comparative Efficacy', content: 'Network meta-analyses and trials like SEAVUE highlight the evolution toward early biologic positioning and mucosal healing as the primary therapeutic target (Treat-to-Target Strategy).' }
            ]
          },
          {
            id: 'microbiome_fmt',
            title: 'Fecal Microbiota Transplantation & Biotherapeutics',
            subtitle: 'FDA-Approved Live Microbiota for C. Difficile',
            type: 'Microbiome Medicine',
            aiScopeDescription: 'Focus on Fecal Microbiota Transplantation (FMT) and newly approved standardized live biotherapeutic products (FMT-based oral and rectal capsules) for recurrent Clostridioides difficile infection.',
            clinicalContent: [
              { title: 'Clinical Indication & Efficacy', content: 'FMT is indicated for patients with ≥2 recurrences of Clostridioides difficile infection following standard antibiotic courses (Vancomycin or Fidaxomicin), achieving cure rates exceeding 85-90%.' },
              { title: 'Standardized Live Biotherapeutics (FDA Approved)', content: 'Transition from donor stool slurries to standardized microbial consortia (Fecal Microbiota, live-jslm [Rebyota] rectal suspension and Fecal Microbiota Spores [Vowst] oral capsules), eliminating screening variability.' },
              { title: 'Mechanisms of Protection', content: 'Restoration of bile acid metabolism (conversion of primary to secondary bile acids which inhibit C. diff spore germination), niche competition, and production of short-chain fatty acids (SCFAs).' }
            ]
          }
        ]
      }
    ]
  },
  fever: {
    id: 'fever',
    name: 'Fever',
    scientificName: 'Infectious Disease & Critical Care',
    icon: 'thermometer',
    color: '#79a3cb',
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
            id: 'meningitis_encephalitis',
            title: 'Acute Bacterial Meningitis',
            subtitle: 'Empiric Antibiotics, Dexamethasone & LP Algorithm',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on acute bacterial meningitis, triad of fever/stiff neck/altered mental status, CT head before lumbar puncture indications, empiric antibiotics by age group, and adjunctive dexamethasone timing.',
            clinicalContent: [
              { title: 'Clinical Presentation & Triad', content: 'Classic triad: Fever, nuchal rigidity, and altered mental status. Kernig\'s and Brudzinski\'s signs may be present. Petechial/purpuric rash suggests Neisseria meningitidis.' },
              { title: 'CT Head Indications Prior to LP', content: 'Do NOT delay antibiotics for LP or CT! Indications for CT head before LP: 1. Immunocompromised state; 2. History of CNS disease; 3. New-onset seizure (<1 week); 4. Papilledema; 5. Focal neurological deficit; 6. Altered level of consciousness (GCS <10).' },
              { title: 'Empiric Antimicrobial Regimen', content: 'Adults (18-50 yrs): Ceftriaxone 2g IV q12h + Vancomycin 15-20 mg/kg IV q8-12h.\nAdults >50 yrs or Immunocompromised: Ceftriaxone + Vancomycin + Ampicillin 2g IV q4h (to cover Listeria monocytogenes).' },
              { title: 'Adjunctive Dexamethasone', content: 'Administer Dexamethasone 10 mg IV with or just prior to the first dose of antibiotics. Continue 10 mg q6h for 4 days if Streptococcus pneumoniae is confirmed. Discontinue if other pathogens are identified.' }
            ]
          },
          {
            id: 'necrotizing_fasciitis',
            title: 'Necrotizing Soft Tissue Infections',
            subtitle: 'LRINEC Score & Emergency Surgical Debridement',
            type: 'Surgical Emergency',
            aiScopeDescription: 'Focus on Necrotizing Fasciitis, Type I (polymicrobial) vs Type II (Group A Strep), LRINEC scoring, clinical signs (pain out of proportion, dishwater fluid, crepitus), and emergent surgical consultation.',
            clinicalContent: [
              { title: 'Pathophysiology & Classification', content: 'Rapidly progressive, life-threatening infection of subcutaneous tissue and fascia.\nType I: Polymicrobial (aerobes + anaerobes), common in diabetics and post-surgical patients.\nType II: Monomicrobial (Group A Streptococcus, with or without S. aureus), can occur in young, healthy individuals.' },
              { title: 'Clinical Hallmarks', content: 'Pain out of proportion to physical exam findings is the earliest and most critical clue. Rapid progression with erythema progressing to dusky purple/bullae, cutaneous anesthesia, and subcutaneous crepitus with systemic sepsis.' },
              { title: 'LRINEC Score (Laboratory Risk Indicator)', content: 'Evaluates: CRP (≥150 mg/L), Total WBC (>15 or >25 k/µL), Hemoglobin (<13.5 or <11 g/dL), Sodium (<135 mmol/L), Creatinine (>1.6 mg/dL), and Glucose (>180 mg/dL). Score ≥6 suggests necrotizing infection, score ≥8 strongly predictive.' },
              { title: 'Emergency Management', content: '1. Immediate Surgical Consultation for operative exploration and radical debridement (definitive diagnosis and treatment).\n2. Empiric IV Antibiotics: Meropenem or Vancomycin + Clindamycin (Clindamycin suppresses Strep/Staph exotoxin production).\n3. Hemodynamic resuscitation in the ICU.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: [
          {
            id: 'fuo',
            title: 'Fever of Unknown Origin',
            subtitle: 'Diagnostic Algorithm & Investigation Workflow',
            type: 'Workup Protocol',
            aiScopeDescription: 'Focus strictly on the diagnostic workup for Fever of Unknown Origin (FUO), including infectious, autoimmune, and neoplastic causes.',
            clinicalContent: [
              { title: 'Definition (Classic Petersdorf & Beeson)', content: '1. Fever ≥ 38.3°C (101°F) on multiple occasions.\n2. Duration of illness ≥ 3 weeks.\n3. Failure to reach a diagnosis after 1 week of inpatient investigation (or 3 outpatient visits).' },
              { title: 'Etiology Categories', content: '1. Infections (30-40%): Tuberculosis, endocarditis, occult abscesses, osteomyelitis.\n2. Neoplasms (20-30%): Lymphoma (Hodgkin/Non-Hodgkin), leukemia, renal cell carcinoma.\n3. Autoimmune/Rheumatologic (10-20%): Still’s disease, SLE, temporal arteritis, polyarteritis nodosa.\n4. Miscellaneous: Drug fever, DVT, factitious fever.' },
              { title: 'Initial Investigations', content: 'Comprehensive history & physical (travel, pets, exposures, murmurs, lymphadenopathy).\nLabs: CBC with diff, peripheral smear, ESR/CRP, LFTs, LDH, UA.\nCultures: Blood (x3 from different sites off antibiotics), Urine.\nImaging: CXR, CT Chest/Abdomen/Pelvis.' },
              { title: 'Advanced Workup', content: 'If initial workup is negative: Consider Echocardiography (TTE/TEE for endocarditis), autoantibody panel (ANA, ANCA, RF), viral serologies (HIV, CMV, EBV), or 18F-FDG PET/CT scan.' }
            ]
          },
          {
            id: 'cap_pneumonia',
            title: 'Community-Acquired Pneumonia',
            subtitle: 'CURB-65 Score & ATS/IDSA Guidelines',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Community-Acquired Pneumonia (CAP), diagnostic criteria, CURB-65 triage scoring, outpatient vs inpatient empiric antibiotic regimens, and MRSA/Pseudomonas risk factors.',
            clinicalContent: [
              { title: 'Diagnosis & Severity Triage (CURB-65)', content: 'Criteria (1 point each):\n• C: Confusion\n• U: Urea (BUN >19 mg/dL)\n• R: Respiratory Rate ≥30/min\n• B: Blood Pressure (SBP <90 or DBP ≤60 mmHg)\n• 65: Age ≥65 years\nScore 0-1: Outpatient care. Score 2: Inpatient medical ward. Score ≥3: High risk, consider ICU admission.' },
              { title: 'Empiric Outpatient Therapy', content: 'Healthy without comorbidities: Amoxicillin 1g TID OR Doxycycline 100mg BID.\nWith Comorbidities (COPD, DM, CKD, CHF): Combination therapy with Amoxicillin-Clavulanate + Azithromycin/Doxycycline OR Monotherapy with Respiratory Fluoroquinolone (Levofloxacin 750mg daily or Moxifloxacin 400mg daily).' },
              { title: 'Empiric Inpatient Therapy', content: 'Non-Severe Inpatient: Ceftriaxone 1-2g IV daily + Azithromycin 500mg IV daily OR Respiratory Fluoroquinolone.\nSevere Inpatient (ICU): Ceftriaxone + Azithromycin (or Fluoroquinolone). Add Vancomycin (for MRSA) and Cefepime/Piperacillin-Tazobactam (for Pseudomonas) if risk factors or prior isolation exist.' }
            ]
          },
          {
            id: 'uti_pyelonephritis',
            title: 'Complicated UTI & Pyelonephritis',
            subtitle: 'Antimicrobial Selection & Resistance Mitigation',
            type: 'Treatment Guideline',
            aiScopeDescription: 'Focus on acute uncomplicated cystitis vs complicated UTI, acute pyelonephritis workup, urine culture interpretation, oral vs IV regimens, and managing ESBL pathogens.',
            clinicalContent: [
              { title: 'Uncomplicated Cystitis First-Line', content: '1. Nitrofurantoin 100 mg BID × 5 days (avoid if eGFR <30 mL/min).\n2. Trimethoprim-Sulfamethoxazole (TMP-SMX) 1 DS tab BID × 3 days (only if local E. coli resistance <20%).\n3. Fosfomycin 3 g single oral sachet.\n(Avoid Fluoroquinolones for simple cystitis due to collateral damage).' },
              { title: 'Acute Pyelonephritis Management', content: 'Outpatient (Mild/Moderate): Oral Ciprofloxacin 500mg BID × 7 days or Levofloxacin 750mg daily × 5 days (give initial IV Ceftriaxone 1g dose if fluoroquinolone resistance >10%).\nInpatient (Complicated/Severe): IV Ceftriaxone 1-2g daily, Cefepime, or Piperacillin-Tazobactam.' },
              { title: 'Catheter-Associated UTI (CA-UTI)', content: 'Always remove or replace indwelling catheter if placed >2 weeks prior to culturing urine. Treat only symptomatic patients; do not treat asymptomatic bacteriuria (except in pregnancy or prior to urologic procedures).' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: [
          {
            id: 'antibiogram_interpretation',
            title: 'Antibiograms & MIC Interpretation',
            subtitle: 'Susceptibility Testing & PK/PD Targets',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on institutional antibiograms, Minimum Inhibitory Concentration (MIC), CLSI breakpoints, pharmacokinetic/pharmacodynamic (PK/PD) principles (time-dependent vs concentration-dependent killing).',
            clinicalContent: [
              { title: 'Understanding the Antibiogram', content: 'Institutional summary of bacterial isolates tested against antimicrobial agents over a 1-year period. Guides empiric therapy selection (target ≥85-90% institutional susceptibility for severe empiric coverage).' },
              { title: 'MIC & CLSI Breakpoints', content: 'Minimum Inhibitory Concentration (MIC) is the lowest drug concentration that inhibits visible bacterial growth. Susceptibility is determined by comparing the MIC to established clinical breakpoints, NOT by the numerical value alone.' },
              { title: 'PK/PD Optimization', content: 'Time-Dependent (Beta-lactams): Efficacy correlates with time above MIC (%T > MIC). Optimize with extended or continuous infusions (e.g., 4-hour Piperacillin-Tazobactam infusion).\nConcentration-Dependent (Aminoglycosides, Daptomycin): Efficacy correlates with peak-to-MIC ratio (Cmax/MIC). Optimize with high-dose once-daily dosing.' }
            ]
          },
          {
            id: 'procalcitonin_crp_kinetics',
            title: 'Procalcitonin vs CRP Kinetics',
            subtitle: 'Biomarkers in Sepsis & Antibiotic De-escalation',
            type: 'Laboratory Guide',
            aiScopeDescription: 'Focus on Procalcitonin (PCT) and C-Reactive Protein (CRP) kinetics, differentiating viral vs bacterial infections, and antibiotic stewardship de-escalation protocols in LRTI and sepsis.',
            clinicalContent: [
              { title: 'Procalcitonin Kinetics', content: 'Synthesized by neuroendocrine cells and parenchymal tissue in response to bacterial endotoxins (IL-1β, TNF-α). Rises within 2-4 hours, peaks at 12-24 hours. Attenuated by interferon-gamma in viral infections.' },
              { title: 'Antibiotic Stopping Algorithms', content: 'Lower Respiratory Tract Infection: PCT <0.25 mcg/L strongly discourages antibiotic initiation or indicates stopping therapy.\nSepsis/ICU: Discontinue antibiotics when PCT drops by ≥80% from peak level or reaches <0.5 mcg/L in clinically improving patients.' },
              { title: 'CRP vs PCT Comparison', content: 'CRP reflects generalized hepatic inflammation and rises slower (peaks 36-48 hours). Useful for monitoring chronic inflammatory disease activity and response to treatment in osteomyelitis and endocarditis.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: [
          {
            id: 'short_course_antibiotics',
            title: 'Short-Course Antibiotic Regimens',
            subtitle: 'Evidence from Multicenter Non-Inferiority RCTs',
            type: 'Evidence Review',
            aiScopeDescription: 'Focus on randomized controlled trials supporting shorter courses of antimicrobial therapy in CAP, uncomplicated pyelonephritis, bacteremia, and intra-abdominal infections ("Shorter is Better").',
            clinicalContent: [
              { title: 'Evidence Summary by Indication', content: '• Uncomplicated CAP: 3-5 days is non-inferior to 7-10 days once afebrile for 48 hours.\n• Uncomplicated Pyelonephritis: 5-7 days (Fluoroquinolones) or 7-10 days (Beta-lactams).\n• Uncomplicated Gram-negative Bacteremia: 7 days is non-inferior to 14 days.\n• Intra-abdominal Infection: 4 days post source control (STOP-IT trial).' },
              { title: 'Benefits of Short Courses', content: 'Significant reduction in Clostridioides difficile colonization, lower rates of antimicrobial resistance emergence, fewer adverse drug events, and reduced hospital costs without increasing recurrence rates.' }
            ]
          },
          {
            id: 'novel_multidrug_resistant_agents',
            title: 'Novel Agents for MDR Gram-Negatives',
            subtitle: 'Cefiderocol, Ceftazidime-Avibactam & Meropenem-Vaborbactam',
            type: 'Pharmacotherapy Update',
            aiScopeDescription: 'Focus on newer beta-lactamase inhibitor combinations and siderophore cephalosporins for Carbapenem-Resistant Enterobacterales (CRE), Pseudomonas, and Acinetobacter baumannii.',
            clinicalContent: [
              { title: 'Ceftazidime-Avibactam & Meropenem-Vaborbactam', content: 'Active against KPC (Klebsiella pneumoniae carbapenemase) and OXA-48 carbapenemases. Established first-line therapy for severe CRE bacteremia and pneumonia.' },
              { title: 'Cefiderocol (Siderophore Cephalosporin)', content: 'Utilizes a novel "Trojan horse" iron transport mechanism to cross outer bacterial membranes. Retains potent activity against Metallo-beta-lactamases (NDM, VIM) and Carbapenem-resistant Acinetobacter baumannii (CRAB).' }
            ]
          }
        ]
      }
    ]
  },
  neuro: {
    id: 'neuro',
    name: 'Neuro',
    scientificName: 'Neurology',
    icon: 'nutrition',
    color: '#7dac86',
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
          },
          {
            id: 'subarachnoid_hemorrhage',
            title: 'Subarachnoid Hemorrhage',
            subtitle: 'Ottawa SAH Rule, Hunt & Hess, Nimodipine Protocol',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on spontaneous Subarachnoid Hemorrhage (SAH), saccular aneurysm rupture, non-contrast CT and LP sensitivity, Hunt and Hess scoring, BP management, and prevention of vasospasm with Nimodipine.',
            clinicalContent: [
              { title: 'Clinical Presentation', content: 'Classic "thunderclap headache" (worst headache of life, reaching peak intensity within seconds to 1 minute). Accompanied by nausea, vomiting, photophobia, syncope, or meningismus.' },
              { title: 'Diagnostic Workup', content: '1. Non-contrast CT Head: >98% sensitive within the first 6 hours of headache onset.\n2. Lumbar Puncture (LP): Indicated if CT is negative or equivocal >6 hours from onset. Diagnostic finding: Xanthochromia (yellow CSF supernatant from hemoglobin breakdown) or elevated RBCs that do not clear in tube 4.\n3. CTA or Digital Subtraction Angiography (DSA) to identify causative aneurysm.' },
              { title: 'Acute Medical Management', content: '1. SBP Control: Target SBP <140 mmHg prior to aneurysm securing using IV Nicardipine or Labetalol.\n2. Nimodipine: 60 mg orally every 4 hours for 21 days to prevent delayed cerebral ischemia (vasospasm).\n3. Neurosurgical Intervention: Emergent surgical clipping or endovascular coiling within 24 hours.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: [
          {
            id: 'migraine_headache',
            title: 'Migraine & Primary Headaches',
            subtitle: 'Acute Abortion, CGRP Antagonists & Prevention',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Migraine diagnosis (ICHD-3 criteria), acute abortive therapies (Triptans, Gepants, NSAIDs), preventive therapies (Beta-blockers, Topiramate, CGRP monoclonal antibodies), and red flags (SNOOP).',
            clinicalContent: [
              { title: 'ICHD-3 Diagnostic Criteria', content: 'Unilateral, pulsating, moderate-to-severe headache lasting 4-72 hours, aggravated by physical activity, accompanied by at least one of: Nausea/vomiting OR Photophobia and Phonophobia. 20-30% have associated aura (visual scintillating scotoma).' },
              { title: 'Acute Abortive Therapy', content: 'Mild-Moderate: NSAIDs (Naproxen, Ibuprofen) or Acetaminophen/Aspirin/Caffeine combination.\nModerate-Severe: Triptans (Sumatriptan, Rizatriptan) or Gepants (Rimegepant, Ubrogepant). Combine Triptan with NSAID for synergism. Contraindications to Triptans: Ischemic heart disease, stroke, uncontrolled hypertension.' },
              { title: 'Preventive Therapy Indications & Options', content: 'Indicated for ≥4 headache days/month or significant disability. First-line oral agents: Topiramate, Propranolol/Metoprolol, Amitriptyline. Advanced targeted agents: CGRP monoclonal antibodies (Erenumab, Fremanezumab, Galcanezumab SC monthly).' }
            ]
          },
          {
            id: 'epilepsy_maintenance',
            title: 'Chronic Epilepsy Management',
            subtitle: 'Anti-Seizure Medication Selection & Monitoring',
            type: 'Chronic Disease Guideline',
            aiScopeDescription: 'Focus on seizure classification (focal vs generalized), anti-seizure medication (ASM) selection (Levetiracetam, Lamotrigine, Carbamazepine, Valproate), teratogenicity counseling, and drug-resistant epilepsy.',
            clinicalContent: [
              { title: 'ASM Selection by Seizure Type', content: 'Focal Seizures: Levetiracetam, Lamotrigine, Lacosamide, Carbamazepine.\nGeneralized Onset (Tonic-Clonic/Myoclonic/Absence): Broad-spectrum agents mandatory: Levetiracetam, Valproate, Lamotrigine, Topiramate. (Avoid narrow-spectrum sodium channel blockers like Carbamazepine/Phenytoin in generalized epilepsy as they may worsen myoclonus or absence seizures).' },
              { title: 'Women of Childbearing Age', content: 'Avoid Valproic Acid due to high risk of neural tube defects and neurodevelopmental delay. Levetiracetam and Lamotrigine have the most favorable pregnancy safety profiles. Prescribe high-dose folic acid (4-5 mg daily).' },
              { title: 'Drug-Resistant Epilepsy', content: 'Defined as failure of adequate trials of 2 tolerated and appropriately chosen ASM schedules. Refer to comprehensive epilepsy center for surgical evaluation, vagus nerve stimulation (VNS), or responsive neurostimulation (RNS).' }
            ]
          },
          {
            id: 'parkinsons_disease',
            title: 'Parkinson\'s Disease & Movement Disorders',
            subtitle: 'Levodopa Optimization & Motor Complications',
            type: 'Disease Management',
            aiScopeDescription: 'Focus on Parkinson\'s disease cardinal motor features (TRAP: Tremor, Rigidity, Akinesia, Postural instability), initial therapy (Levodopa vs Dopamine Agonists), and managing motor fluctuations (wearing-off, dyskinesias).',
            clinicalContent: [
              { title: 'Cardinal Features & Diagnosis', content: 'Clinical diagnosis based on Bradykinesia PLUS at least one of: 1. 4-6 Hz resting "pill-rolling" tremor; 2. Lead-pipe or cogwheel rigidity; 3. Postural instability. Asymmetric onset and robust response to Levodopa support diagnosis.' },
              { title: 'Pharmacotherapy Initiation', content: 'Levodopa/Carbidopa is the most effective symptomatic treatment. In younger patients (<60 yrs), dopamine agonists (Pramipexole, Ropinirole) or MAO-B inhibitors (Rasagiline) may be considered to delay Levodopa-induced motor complications.' },
              { title: 'Managing Motor Complications', content: '"Wearing-off" phenomenon: Increase Levodopa dosing frequency, add COMT inhibitor (Entacapone) or MAO-B inhibitor. Peak-dose dyskinesia: Reduce individual Levodopa doses or add Amantadine.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: [
          {
            id: 'nihss_gcs_scoring',
            title: 'Neurologic Assessment Scales (NIHSS & GCS)',
            subtitle: 'Standardized Neurological Deficit Scoring',
            type: 'Clinical Scoring Tool',
            aiScopeDescription: 'Focus on National Institutes of Health Stroke Scale (NIHSS 0-42) item-by-item breakdown, Glasgow Coma Scale (GCS 3-15), and FOUR score in acute neurologic monitoring.',
            clinicalContent: [
              { title: 'NIH Stroke Scale (NIHSS) Breakdown', content: '11-item clinical scale (scores 0-42):\n1. Level of consciousness (1a, 1b, 1c)\n2. Best gaze\n3. Visual fields\n4. Facial palsy\n5. Motor arm & 6. Motor leg\n7. Limb ataxia\n8. Sensory\n9. Best language (aphasia)\n10. Dysarthria\n11. Extinction & inattention.\nScore <5: Mild; 5-14: Moderate; 15-24: Severe; ≥25: Very severe stroke.' },
              { title: 'Glasgow Coma Scale (GCS)', content: 'Eye Opening (1-4): 4=Spontaneous, 3=To sound, 2=To pressure, 1=None.\nVerbal Response (1-5): 5=Oriented, 4=Confused, 3=Inappropriate words, 2=Incomprehensible sounds, 1=None.\nMotor Response (1-6): 6=Obeys commands, 5=Localizing, 4=Normal flexion, 3=Abnormal flexion (decorticate), 2=Extension (decerebrate), 1=None.\nGCS ≤8: Coma, requires definitive airway protection ("GCS of 8, intubate").' }
            ]
          },
          {
            id: 'lumbar_puncture_csf',
            title: 'CSF Analysis & Opening Pressure',
            subtitle: 'Cytology, Protein, Glucose & Oligoclonal Bands',
            type: 'Laboratory Guide',
            aiScopeDescription: 'Focus on cerebrospinal fluid (CSF) analysis patterns in bacterial vs viral vs fungal meningitis, albuminocytologic dissociation in Guillain-Barré, oligoclonal bands in MS, and opening pressure measurements.',
            clinicalContent: [
              { title: 'Meningitis CSF Patterns', content: '• Bacterial: High opening pressure (>200 mmH2O), PMN pleocytosis (>1000/µL), elevated protein (>100-500 mg/dL), low CSF:serum glucose ratio (<0.4).\n• Viral: Normal/mildly elevated pressure, Lymphocytic pleocytosis (50-500/µL), normal/mildly elevated protein, normal glucose ratio (>0.6).\n• Fungal/TB: Elevated pressure, Lymphocytic pleocytosis, markedly elevated protein, low glucose ratio.' },
              { title: 'Specialized Diagnostic Patterns', content: 'Albuminocytologic Dissociation: Markedly elevated CSF protein (>100 mg/dL) with normal WBC count (<5/µL), classic for Guillain-Barré Syndrome (GBS).\nOligoclonal Bands: Presence of ≥2 unique bands in CSF not found in serum indicates intrathecal IgG synthesis (95% sensitive for Multiple Sclerosis).' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: [
          {
            id: 'anti_amyloid_mabs',
            title: 'Anti-Amyloid Monoclonal Antibodies',
            subtitle: 'Lecanemab & Donanemab in Early Alzheimer\'s',
            type: 'Therapeutic Advances',
            aiScopeDescription: 'Focus on disease-modifying therapies in Alzheimer\'s disease, Phase 3 trials of amyloid-beta clearing antibodies (Lecanemab, Donanemab), and management of ARIA (Amyloid-Related Imaging Abnormalities).',
            clinicalContent: [
              { title: 'Phase 3 Clinical Trial Results', content: 'Clarity AD (Lecanemab) and TRAILBLAZER-ALZ 2 (Donanemab) demonstrated statistically significant slowing of cognitive and functional decline (by 27-35% on CDR-SB) at 18 months in patients with Mild Cognitive Impairment (MCI) or mild Alzheimer\'s dementia with confirmed amyloid pathology.' },
              { title: 'Safety & ARIA Monitoring', content: 'Amyloid-Related Imaging Abnormalities (ARIA-E for edema, ARIA-H for microhemorrhages/siderosis) occur in 10-30% of patients. Highest risk in APOE ε4 homozygotes. Mandatory baseline and serial safety brain MRI at weeks 9, 12, and 52.' }
            ]
          },
          {
            id: 'cgrp_longterm_safety',
            title: 'Targeted CGRP Therapeutics in Headache',
            subtitle: 'Real-World Efficacy & Cardiovascular Safety',
            type: 'Neuro-Pharmacology',
            aiScopeDescription: 'Focus on long-term safety, cardiovascular outcomes, and real-world efficacy of CGRP-pathway antagonists for chronic migraine prevention and acute treatment.',
            clinicalContent: [
              { title: 'Long-Term Efficacy & Remission', content: 'Extension studies demonstrate sustained reduction of monthly migraine days (MMD) by 50-75% over 5 years of continuous therapy with CGRP monoclonals without evidence of receptor down-regulation or tachyphylaxis.' },
              { title: 'Cardiovascular Safety Profile', content: 'Because CGRP is a potent endogenous vasodilator, safety data in patients with hypertension and Raynaud’s phenomenon show manageable risk, but close BP monitoring is recommended for Erenumab.' }
            ]
          }
        ]
      }
    ]
  },
  skin: {
    id: 'skin',
    name: 'Skin',
    scientificName: 'Dermatology',
    icon: 'body',
    color: '#9d97ca',
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
          },
          {
            id: 'erythroderma',
            title: 'Exfoliative Erythroderma',
            subtitle: 'Red Man Syndrome, Metabolic Collapse & Etiologies',
            type: 'Dermatologic Emergency',
            aiScopeDescription: 'Focus on Exfoliative Erythroderma (>90% BSA erythema/scaling), underlying etiologies (psoriasis, eczema, drug eruption, CTCL/Sézary syndrome), thermoregulatory failure, and intensive supportive care.',
            clinicalContent: [
              { title: 'Definition & Pathophysiology', content: 'Generalized redness and scaling involving >90% of total body surface area. Severe cutaneous vasodilation leads to profound heat loss (hypothermia), high-output cardiac failure, massive protein loss from exfoliation, and fluid/electrolyte shifts.' },
              { title: 'Etiology Breakdown', content: '1. Pre-existing dermatoses (Psoriasis, Atopic Dermatitis, Seborrheic Dermatitis - ~50%).\n2. Drug hypersensitivity reactions (~20%).\n3. Cutaneous T-cell Lymphoma / Sézary Syndrome (~15%).\n4. Idiopathic (~15%).' },
              { title: 'Emergency Inpatient Management', content: '1. Maintain warm ambient room temperature to prevent hypothermia.\n2. Fluid and electrolyte replacement with hemodynamic monitoring.\n3. Bland emollients (petrolatum) and wet dressings (avoid aggressive topical steroids over large BSA to prevent systemic absorption toxicity).\n4. Skin biopsy to identify underlying etiology once acute phase is stabilized.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: [
          {
            id: 'psoriasis_vulgaris',
            title: 'Psoriasis Vulgaris & Psoriatic Arthritis',
            subtitle: 'PASI Scoring, Systemic Agents & Biologics',
            type: 'Chronic Disease Guideline',
            aiScopeDescription: 'Focus on plaque psoriasis, PASI scoring, topical therapies (corticosteroids, vitamin D analogues), conventional systemic agents (Methotrexate, Apremilast), and targeted biologics (anti-TNF, anti-IL-17, anti-IL-23).',
            clinicalContent: [
              { title: 'Clinical Features', content: 'Well-demarcated erythematous plaques with silvery-white micaceous scales, predominantly on extensor surfaces (elbows, knees), scalp, and lumbosacral region. Auspitz sign (punctate bleeding upon scale removal) and Koebner phenomenon (lesions at sites of trauma).' },
              { title: 'Topical Therapy (Mild Disease <3-5% BSA)', content: 'High-potency topical corticosteroids (Clobetasol 0.05%) combined with Vitamin D3 analogues (Calcipotriene) for synergism and steroid-sparing benefit. Topical calcineurin inhibitors (Tacrolimus) for facial/intertriginous areas.' },
              { title: 'Systemic & Biologic Therapy (Moderate-to-Severe)', content: 'Conventional: Methotrexate (15-25 mg weekly with folic acid) or Apremilast (PDE4 inhibitor).\nBiologics: Anti-IL-17 (Secukinumab, Ixekizumab), Anti-IL-23 (Guselkumab, Risankizumab), Anti-TNF (Adalimumab). Biologics achieve PASI 90/100 skin clearance in >70-80% of patients.' }
            ]
          },
          {
            id: 'atopic_dermatitis',
            title: 'Atopic Dermatitis (Eczema)',
            subtitle: 'Barrier Restoration, Dupilumab & JAK Inhibitors',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on atopic dermatitis pathogenesis (filaggrin deficiency, Th2 immunity), pruritus cycle, topical anti-inflammatory therapy, phototherapy, and systemic targeted therapies (Dupilumab, Tralokinumab, Upadacitinib).',
            clinicalContent: [
              { title: 'Pathophysiology & Presentation', content: 'Defective epidermal barrier function (loss-of-function filaggrin mutations) combined with dysregulated Th2 immune response. Intense pruritus ("the itch that rashes"), xerosis, and lichenification. Infantile: Face and extensor surfaces. Adolescent/Adult: Flexural folds (antecubital and popliteal fossae).' },
              { title: 'Foundational Barrier Management', content: 'Frequent application of ceramide-dominant thick emollients (ointments/creams immediately after lukewarm bathing). Avoid irritants, harsh soaps, and synthetic fabrics.' },
              { title: 'Stepwise Medical Therapy', content: 'Topical: Low-to-mid potency corticosteroids for flares; Topical Calcineurin Inhibitors (Tacrolimus/Pimecrolimus) or Crisaborole (PDE4 inhibitor) for maintenance.\nSystemic for Moderate-Severe: Dupilumab (IL-4Rα antagonist SC biweekly) or oral JAK-1 inhibitors (Upadacitinib, Abrocitinib).' }
            ]
          },
          {
            id: 'acne_rosacea_management',
            title: 'Acne Vulgaris & Rosacea',
            subtitle: 'Topical Retinoids, Antibiotics & Isotretinoin',
            type: 'Treatment Guideline',
            aiScopeDescription: 'Focus on acne grading (comedonal vs inflammatory vs nodulocystic), topical retinoids, benzoyl peroxide, oral doxycycline, oral isotretinoin protocol, and differentiating rosacea subtypes.',
            clinicalContent: [
              { title: 'Acne Treatment Ladder', content: '1. Mild (Comedonal): Topical Retinoid (Adapalene, Tretinoin) + Benzoyl Peroxide (BPO).\n2. Moderate (Inflammatory Papules/Pustules): Topical Retinoid + BPO + Topical Clindamycin. Add Oral Doxycycline 100 mg daily if widespread.\n3. Severe/Nodulocystic: Oral Isotretinoin (cumulative dose 120-150 mg/kg).' },
              { title: 'Oral Isotretinoin Protocol', content: 'Teratogenic (requires strict contraception/iPLEDGE program). Monitor baseline and monthly fasting lipids and liver enzymes. Expect mucocutaneous dryness (cheilitis in 100%).' },
              { title: 'Rosacea Subtypes & Management', content: 'Erythematotelangiectatic (flushing, persistent erythema): Topical Brimonidine or Oxymetazoline.\nPapulopustular: Topical Ivermectin 1% or Metronidazole 0.75%, oral Doxycycline 40mg (anti-inflammatory sub-antimicrobial dose).\nPhymatous (rhinophyma): Surgical/laser debulking.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: [
          {
            id: 'dermoscopy_fundamentals',
            title: 'Dermoscopy & Melanoma Evaluation',
            subtitle: 'ABCDE Criteria & Two-Step Dermoscopic Algorithm',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on dermoscopy, ABCDE clinical rule, Chaos and Clues algorithm, differentiating melanocytic vs non-melanocytic lesions, and dermoscopic signs of melanoma (atypical pigment network, blue-white veil).',
            clinicalContent: [
              { title: 'Clinical ABCDE Rule for Melanoma', content: '• A: Asymmetry (one half does not match the other)\n• B: Border irregularity (scalloped, poorly defined)\n• C: Color variation (multiple shades of brown, black, red, white, blue)\n• D: Diameter (>6 mm)\n• E: Evolving (change in size, shape, color, or new elevation - most sensitive clue).' },
              { title: 'Two-Step Dermoscopy Method', content: 'Step 1: Determine if lesion is melanocytic (presence of pigment network, aggregated globules, or homogeneous blue color).\nStep 2: If melanocytic, evaluate for malignancy criteria (atypical pigment network, irregular dots/globules, blue-white veil, radial streaming/pseudopods).' }
            ]
          },
          {
            id: 'skin_biopsy_methods',
            title: 'Cutaneous Biopsy Techniques',
            subtitle: 'Punch, Shave & Excisional Selection',
            type: 'Procedural Guide',
            aiScopeDescription: 'Focus on skin biopsy selection (punch vs deep shave vs excisional), anesthesia, orientation along Langer\'s relaxed skin tension lines, and specimen handling.',
            clinicalContent: [
              { title: 'Technique Selection by Suspected Pathology', content: '• Suspected Melanoma: Complete narrow-margin (1-3 mm) excisional biopsy or deep saucerization shave. (Avoid superficial shave that transects base, preventing accurate Breslow depth measurement).\n• Inflammatory Dermatoses / Bullous Diseases: 4 mm Punch Biopsy spanning deep dermis and subcutaneous fat.\n• Superficial Lesions (Seborrheic keratosis, BCC, SCC): Shave biopsy / tangential excision.' },
              { title: 'Direct Immunofluorescence (DIF)', content: 'For suspected autoimmune bullous diseases (Pemphigus, Pemphigoid): Take punch biopsy from normal-appearing perilesional skin (within 1 cm of blister) and place in Michel\'s transport medium (NOT formalin).' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: [
          {
            id: 'jak_inhibitors_dermatology',
            title: 'JAK Inhibitors in Alopecia Areata & Vitiligo',
            subtitle: 'Baricitinib, Ritlecitinib & Ruxolitinib Cream',
            type: 'Therapeutic Advances',
            aiScopeDescription: 'Focus on Janus Kinase (JAK) inhibitors in immune-mediated dermatologic conditions, FDA approvals in Alopecia Areata and Vitiligo, efficacy, and safety monitoring.',
            clinicalContent: [
              { title: 'Alopecia Areata Breakthroughs', content: 'BRAVE-AA1/2 and ALLEGRO Phase 3 trials demonstrated that oral Baricitinib (JAK1/2) and Ritlecitinib (JAK3/TEC) achieved ≥80% scalp hair coverage (SALT score ≤20) in over 35-40% of patients with severe alopecia areata.' },
              { title: 'Topical Ruxolitinib in Vitiligo', content: 'TRuE-V1/V2 trials showed that topical Ruxolitinib 1.5% cream (JAK1/2 inhibitor) induced significant facial and total body repigmentation (F-VASI 75 in ~50% of patients at 52 weeks) by inhibiting IFN-gamma mediated melanocyte destruction.' }
            ]
          },
          {
            id: 'checkpoint_cutaneous_toxicities',
            title: 'Immune Checkpoint Inhibitor Dermatitis',
            subtitle: 'Cutaneous Adverse Events (irCAEs) Management',
            type: 'Immuno-Dermatology',
            aiScopeDescription: 'Focus on cutaneous immune-related adverse events from anti-PD-1, anti-PD-L1, and anti-CTLA-4 therapies (maculopapular eruptions, lichenoid reactions, bullous pemphigoid).',
            clinicalContent: [
              { title: 'Clinical Spectrum & Timing', content: 'Skin toxicities are the earliest and most common irCAEs (occurring within 2-6 weeks of starting immunotherapy). Range from mild morbilliform eruptions to severe autoimmune blistering (anti-PD-1 induced bullous pemphigoid).' },
              { title: 'Graded Management Strategy', content: 'Grade 1-2 (<30% BSA): Continue immunotherapy, treat with potent topical corticosteroids and oral antihistamines.\nGrade 3 (>30% BSA or severe symptoms): Hold checkpoint inhibitor, start systemic corticosteroids (Prednisone 0.5-1 mg/kg/day). Resume once toxicity resolves to Grade ≤1.' }
            ]
          }
        ]
      }
    ]
  },
  gynacology: {
    id: 'gynacology',
    name: 'Gynacology',
    scientificName: 'Obstetrics & Gynecology',
    icon: 'woman',
    color: '#bc8db1',
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
          },
          {
            id: 'postpartum_hemorrhage',
            title: 'Postpartum Hemorrhage (PPH)',
            subtitle: 'The 4Ts, Uterotonics & Bakri Balloon Tamponade',
            type: 'Obstetric Emergency',
            aiScopeDescription: 'Focus on Postpartum Hemorrhage (PPH), definitions (blood loss ≥1000 mL or hypovolemia), 4Ts etiology (Tone, Tissue, Trauma, Thrombin), stepwise uterotonics, intrauterine balloon tamponade, and Massive Transfusion Protocol (MTP).',
            clinicalContent: [
              { title: 'Definition & The 4Ts Etiology', content: 'Cumulative blood loss ≥1,000 mL or blood loss accompanied by signs/symptoms of hypovolemia within 24 hours of birth.\n• Tone (70-80%): Uterine atony (soft, boggy uterus).\n• Tissue: Retained placenta or membranes.\n• Trauma: Vaginal, cervical, or perineal lacerations; uterine rupture.\n• Thrombin: Coagulopathies (DIC, placental abruption, amniotic fluid embolism).' },
              { title: 'Initial Resuscitation & Bimanual Massage', content: 'Immediate fundal and bimanual uterine massage. Place two large-bore IV lines (16G), catheterize bladder, warm IV crystalloids, initiate Massive Transfusion Protocol (1:1:1 PRBC : FFP : Platelets) if ongoing bleeding.' },
              { title: 'Stepwise Uterotonic Pharmacotherapy', content: '1. Oxytocin: 10-40 units in 1000 mL IV infusion or 10 units IM.\n2. Methylergonovine (Methergine): 0.2 mg IM (Contraindicated in Hypertension).\n3. Carboprost (Hemabate / 15-methyl PGF2α): 250 mcg IM/intramyometrial (Contraindicated in Asthma).\n4. Misoprostol: 800-1000 mcg sublingually or rectally.\n5. Tranexamic Acid (TXA): 1 g IV over 10 minutes within 3 hours of birth.' },
              { title: 'Procedural & Surgical Escalation', content: 'Intrauterine balloon tamponade (Bakri balloon inflated with 300-500 mL sterile saline), uterine compression sutures (B-Lynch), uterine artery embolization, or emergency hysterectomy.' }
            ]
          },
          {
            id: 'ectopic_pregnancy',
            title: 'Acute Ectopic Pregnancy',
            subtitle: 'Diagnostic β-hCG Algorithm & Medical vs Surgical',
            type: 'Emergency Workup',
            aiScopeDescription: 'Focus on ectopic pregnancy, discriminatory hCG zone, transvaginal ultrasound (TVUS) findings, methotrexate inclusion/exclusion criteria, and surgical laparoscopy for ruptured ectopic.',
            clinicalContent: [
              { title: 'Clinical Presentation', content: 'First-trimester vaginal bleeding and unilateral lower abdominal/pelvic pain in a reproductive-aged woman with a positive pregnancy test. Rupture presents with sudden severe pain, peritoneal signs, shoulder tip pain (diaphragmatic irritation from hemoperitoneum), and hemodynamic collapse.' },
              { title: 'Diagnostic Algorithm (TVUS & β-hCG)', content: 'Discriminatory zone is serum quantitative β-hCG 1500-2000 mIU/mL. At this level, a normal intrauterine gestational sac must be visible on TVUS. Absence of intrauterine pregnancy with β-hCG above discriminatory zone strongly suggests ectopic pregnancy.' },
              { title: 'Medical Management (Methotrexate Protocol)', content: 'Candidate Criteria: Hemodynamically stable, no significant pain, unruptured mass <3.5 cm, absence of embryonic cardiac activity, baseline β-hCG <5000 mIU/mL, and normal liver/renal function.\nRegimen: Single-dose Methotrexate (50 mg/m² IM). Check β-hCG on Day 4 and Day 7 (expect ≥15% decrease between Day 4 and 7).' },
              { title: 'Surgical Indications', content: 'Hemodynamic instability, signs of rupture/peritonitis, contraindications to methotrexate, or failure of medical therapy. Perform emergent laparoscopic salpingectomy (or salpingostomy if preserving fertility).' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: [
          {
            id: 'pcos_management',
            title: 'Polycystic Ovary Syndrome (PCOS)',
            subtitle: 'Rotterdam Criteria, Metabolic Risks & Ovulation',
            type: 'Endocrine Guideline',
            aiScopeDescription: 'Focus on Polycystic Ovary Syndrome (PCOS), Rotterdam criteria, hyperandrogenism, insulin resistance, oral contraceptives, Metformin, and ovulation induction with Letrozole.',
            clinicalContent: [
              { title: 'Rotterdam Diagnostic Criteria (2 of 3 Required)', content: '1. Ovulatory dysfunction (oligo- or anovulation presenting as irregular menses).\n2. Clinical and/or biochemical hyperandrogenism (hirsutism, acne, androgenic alopecia, elevated total/free testosterone).\n3. Polycystic ovarian morphology on ultrasound (≥20 follicles per ovary or ovarian volume ≥10 mL).\n(Exclude hyperprolactinemia, thyroid disease, and non-classic congenital adrenal hyperplasia).' },
              { title: 'Metabolic & Cardiovascular Assessment', content: 'Screen all PCOS patients with a 75g 2-hour Oral Glucose Tolerance Test (OGTT), fasting lipid panel, and blood pressure screening due to high prevalence of insulin resistance, MASLD, and metabolic syndrome.' },
              { title: 'Management by Patient Goals', content: 'Not Seeking Pregnancy: Combined oral contraceptive pills (COCPs) are first-line for cycle regulation and hyperandrogenism. Add Spironolactone (anti-androgen) if hirsutism persists after 6 months of COCPs.\nSeeking Pregnancy: Letrozole (aromatase inhibitor) is first-line for ovulation induction (superior live-birth rates compared to Clomiphene Citrate).' }
            ]
          },
          {
            id: 'abnormal_uterine_bleeding',
            title: 'Abnormal Uterine Bleeding (AUB)',
            subtitle: 'PALM-COEIN Classification & Management',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Abnormal Uterine Bleeding (AUB), FIGO PALM-COEIN classification (structural vs non-structural), endometrial biopsy indications, and medical vs surgical management.',
            clinicalContent: [
              { title: 'PALM-COEIN Classification (FIGO)', content: 'Structural Causes (PALM):\n• P: Polyp\n• A: Adenomyosis\n• L: Leiomyoma (Fibroids)\n• M: Malignancy & Hyperplasia\nNon-Structural Causes (COEIN):\n• C: Coagulopathy (e.g., von Willebrand disease)\n• O: Ovulatory dysfunction\n• E: Endometrial\n• I: Iatrogenic\n• N: Not otherwise classified.' },
              { title: 'Indications for Endometrial Biopsy (EMB)', content: 'Perform EMB to rule out endometrial carcinoma in: 1. All women with AUB aged ≥45 years; 2. Women <45 years with risk factors for unopposed estrogen (obesity, chronic anovulation/PCOS, Tamoxifen, Lynch syndrome); 3. Postmenopausal bleeding (endometrial stripe >4 mm on TVUS).' },
              { title: 'Medical Management Options', content: 'First-line: Levonorgestrel-releasing Intrauterine Device (LNG-IUD) provides superior reduction in heavy menstrual bleeding. Alternative: Combined oral contraceptives, high-dose oral progestins, or Tranexamic Acid (1300 mg TID during menses).' }
            ]
          },
          {
            id: 'cervical_cancer_screening',
            title: 'Cervical Cancer Screening & ASCCP Guidelines',
            subtitle: 'Pap Smear, High-Risk HPV & Colposcopy Algorithms',
            type: 'Screening Guideline',
            aiScopeDescription: 'Focus on cervical cancer screening intervals (USPSTF/ACOG), high-risk HPV cotesting, ASCCP risk-based management consensus guidelines for abnormal cytology, and colposcopy indications.',
            clinicalContent: [
              { title: 'Screening Intervals by Age', content: '• Age 21-29: Cervical cytology (Pap smear) alone every 3 years. (Do NOT test for HPV in this age group due to high transient infection rates).\n• Age 30-65: Three acceptable strategies:\n  1. High-risk HPV (hrHPV) testing alone every 5 years (preferred);\n  2. hrHPV + Cytology Cotesting every 5 years;\n  3. Cytology alone every 3 years.\n• Age >65: Discontinue if adequate prior negative screening.' },
              { title: 'ASCCP Risk-Based Management Principles', content: 'Management is based on immediate risk of CIN 3+:\n• Immediate risk ≥4%: Immediate Colposcopy indicated.\n• Immediate risk 25-59%: Colposcopy or immediate treatment (LEEP) acceptable.\n• Immediate risk ≥60%: Expedited treatment (LEEP) strongly recommended over biopsy.\n• Immediate risk <4%: Surveillance in 1 or 3 years.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: [
          {
            id: 'fetal_heart_rate_monitoring',
            title: 'Intrapartum Fetal Heart Rate Monitoring (CTG)',
            subtitle: 'NICHD Category I, II, III Interpretations',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on Electronic Fetal Monitoring (EFM), baseline rate, variability, accelerations, early vs variable vs late decelerations, and NICHD Category I, II, III algorithms.',
            clinicalContent: [
              { title: 'EFM Features Definition', content: '• Baseline FHR: Normal 110-160 bpm.\n• Variability: Moderate (6-25 bpm) is the single most reliable indicator of normal fetal acid-base balance.\n• Accelerations: Increase ≥15 bpm lasting ≥15 sec (≥10 bpm for <32 weeks).\n• Decelerations: Early (head compression), Variable (cord compression), Late (uteroplacental insufficiency).' },
              { title: 'NICHD 3-Tier Categorization', content: '• Category I (Normal): Strongly predictive of normal acid-base status. Requires: Baseline 110-160, Moderate variability, No late/variable decels, +/- Accelerations.\n• Category III (Abnormal): Predictive of abnormal acid-base status. Requires: Absent variability with recurrent late decels, recurrent variable decels, or bradycardia; OR Sinusoidal pattern. (Prompts immediate delivery preparation).\n• Category II (Indeterminate): All tracings not classified as Cat I or III. Requires intrauterine resuscitation.' },
              { title: 'Intrauterine Resuscitation Measures', content: 'Reposition patient (left lateral decubitus), IV fluid bolus, discontinue oxytocin/uterotonics, administer maternal oxygen, treat maternal hypotension (Ephedrine/Phenylephrine), and tocolysis (Terbutaline 0.25 mg SC) for uterine tachysystole.' }
            ]
          },
          {
            id: 'pelvic_ultrasound_tvus',
            title: 'Pelvic Ultrasound & Adnexal Mass Scoring',
            subtitle: 'IOTA Simple Rules & Endometrial Evaluation',
            type: 'Imaging Guide',
            aiScopeDescription: 'Focus on Transvaginal Ultrasound (TVUS), evaluating ovarian cysts/adnexal masses using IOTA Simple Rules, differentiating simple vs complex cysts, and measuring endometrial thickness.',
            clinicalContent: [
              { title: 'IOTA Simple Rules for Ovarian Masses', content: 'Benign Features (B-features): Unilocular cyst, presence of solid components <7 mm, acoustic shadows, smooth multilocular tumor <100 mm, no blood flow (color score 1).\nMalignant Features (M-features): Irregular solid tumor, ascites, at least 4 papillary structures, irregular multilocular-solid tumor ≥100 mm, very strong blood flow (color score 4).' },
              { title: 'Endometrial Thickness Assessment', content: 'Postmenopausal Bleeding: Endometrial thickness ≤4 mm has a >99% negative predictive value for endometrial cancer. If >4 mm (or if bleeding is persistent), endometrial tissue sampling is mandatory.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: [
          {
            id: 'aspirin_preeclampsia_prevention',
            title: 'Low-Dose Aspirin for Preeclampsia Prevention',
            subtitle: 'ASPRE Trial Guidelines & Risk Assessment',
            type: 'Evidence Review',
            aiScopeDescription: 'Focus on the ASPRE trial, first-trimester screening for preeclampsia risk, low-dose aspirin (81-150 mg daily) initiation between 12-16 weeks of gestation, and reduction of preterm preeclampsia.',
            clinicalContent: [
              { title: 'ASPRE Trial Findings', content: 'The landmark ASPRE trial demonstrated that administration of Aspirin 150 mg daily at bedtime starting between 11-14 weeks until 36 weeks of gestation reduced the incidence of preterm preeclampsia (<37 weeks) by 62% in high-risk women (HR 0.38, 95% CI 0.20-0.74).' },
              { title: 'High-Risk Indications for Prophylaxis (ACOG/USPSTF)', content: 'Initiate Low-Dose Aspirin (81-150 mg daily) at 12-16 weeks if ≥1 High-Risk factor: Prior preeclampsia, chronic hypertension, pre-gestational diabetes, renal disease, autoimmune disease (APS, SLE), or multifetal gestation; OR ≥2 Moderate-Risk factors (nulliparity, obesity BMI >30, maternal age ≥35, IVF, family history).' }
            ]
          },
          {
            id: 'parp_inhibitors_gyn_onc',
            title: 'PARP Inhibitors in Ovarian & Endometrial Cancers',
            subtitle: 'Olaparib, Niraparib & Synthetic Lethality',
            type: 'Gynecologic Oncology',
            aiScopeDescription: 'Focus on Poly (ADP-ribose) Polymerase (PARP) inhibitors (Olaparib, Niraparib, Rucaparib), BRCA1/2 mutation status, homologous recombination deficiency (HRD), and maintenance therapy in advanced ovarian cancer.',
            clinicalContent: [
              { title: 'Mechanism of Synthetic Lethality', content: 'PARP enzymes repair single-strand DNA breaks. PARP inhibitors trap PARP on DNA, converting single-strand breaks into double-strand breaks during replication. In cells with homologous recombination deficiency (HRD, such as BRCA1/2 mutation), inability to repair double-strand breaks leads to selective cancer cell death.' },
              { title: 'Landmark Trial Data (SOLO-1 & PRIMA)', content: 'SOLO-1 demonstrated a substantial 5-year progression-free survival benefit (56% vs 14% on placebo) with maintenance Olaparib in patients with newly diagnosed advanced BRCA-mutated ovarian cancer following platinum-based chemotherapy.' }
            ]
          }
        ]
      }
    ]
  },
  lungs: {
    id: 'lungs',
    name: 'Lungs',
    scientificName: 'Pulmonology',
    icon: 'leaf',
    color: '#63aeaa',
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
          },
          {
            id: 'tension_pneumothorax',
            title: 'Tension Pneumothorax & Pleural Emergencies',
            subtitle: 'Needle Decompression & Tube Thoracostomy',
            type: 'Emergency Procedure',
            aiScopeDescription: 'Focus on Tension Pneumothorax, clinical diagnosis without delaying for CXR, anatomic sites for emergent needle thoracostomy, chest tube thoracostomy insertion, and drainage management.',
            clinicalContent: [
              { title: 'Clinical Diagnosis (Do NOT wait for CXR!)', content: 'A one-way valve air leak allows intrapleural pressure to exceed atmospheric pressure, causing lung collapse, mediastinal shift, compression of vena cava, and obstructive shock. Triad: Severe dyspnea/tachypnea, unilateral absent breath sounds with hyperresonance, and hypotension with jugular venous distention and tracheal deviation away from affected side.' },
              { title: 'Immediate Needle Thoracostomy (Decompression)', content: 'Perform immediately with a 14-16G, 3.25-inch catheter over needle at either:\n1. 2nd intercostal space in the midclavicular line (superior to the 3rd rib); OR\n2. 4th/5th intercostal space in the anterior-to-midaxillary line.' },
              { title: 'Definitive Tube Thoracostomy (Chest Tube)', content: 'Insert a 28-32 Fr (for hemothorax) or 16-24 Fr (for pneumothorax) chest tube at the "Triangle of Safety" (5th intercostal space, anterior to midaxillary line, superior to the rib margin). Connect to water-seal drainage and obtain post-procedure CXR.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines',
        icon: 'book',
        topics: [
          {
            id: 'copd_gold_guidelines',
            title: 'COPD Management (GOLD 2024)',
            subtitle: 'ABE Group Classification & Inhaler Optimization',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Chronic Obstructive Pulmonary Disease (COPD), post-bronchodilator FEV1/FVC <0.70, GOLD 2024 ABE staging, LAMA/LABA dual bronchodilation, inhaled corticosteroids (ICS) based on blood eosinophils, and acute exacerbation management.',
            clinicalContent: [
              { title: 'Diagnosis & GOLD 2024 ABE Classification', content: 'Diagnosis requires post-bronchodilator spirometry showing FEV1/FVC < 0.70.\n• Group A: 0-1 moderate exacerbations (not hospitalized), low symptoms (mMRC 0-1 or CAT <10). Initial therapy: Bronchodilator (LAMA or LABA).\n• Group B: 0-1 moderate exacerbations, high symptoms (mMRC ≥2 or CAT ≥10). Initial therapy: Dual LABA + LAMA.\n• Group E: ≥2 moderate exacerbations or ≥1 exacerbation leading to hospitalization. Initial therapy: Dual LABA + LAMA (add Inhaled Corticosteroid if blood eosinophils ≥300 cells/µL).' },
              { title: 'Inhaled Corticosteroids (ICS) Stewardship', content: 'Blood eosinophil count guides ICS addition to LABA+LAMA:\n• Eosinophils ≥300 cells/µL: Strong recommendation for Triple Therapy.\n• Eosinophils <100 cells/µL: ICS has little to no benefit and increases pneumonia risk.' },
              { title: 'Acute COPD Exacerbation Management', content: '1. SABA + SAMA nebulizers;\n2. Oral Prednisone 40 mg daily for 5 days;\n3. Antibiotics (Azithromycin, Doxycycline, or Amoxicillin-Clavulanate) for 5 days if increased sputum purulence plus dyspnea or volume;\n4. Non-Invasive Positive Pressure Ventilation (BiPAP) as first-line for acute hypercapnic respiratory failure (pH <7.35 and PaCO2 >45 mmHg).' }
            ]
          },
          {
            id: 'interstitial_lung_disease',
            title: 'Idiopathic Pulmonary Fibrosis & ILD',
            subtitle: 'HRCT UIP Pattern & Antifibrotic Therapies',
            type: 'Disease Protocol',
            aiScopeDescription: 'Focus on Interstitial Lung Disease (ILD), Idiopathic Pulmonary Fibrosis (IPF), Usual Interstitial Pneumonia (UIP) pattern on High-Resolution CT (HRCT), autoimmune serologies, and antifibrotic agents (Nintedanib, Pirfenidone).',
            clinicalContent: [
              { title: 'Clinical Presentation & Exam', content: 'Progressive exertional dyspnea, dry non-productive cough, bilateral fine inspiratory "Velcro-like" crackles at lung bases, and digital clubbing in an older adult (>60 years).' },
              { title: 'HRCT Findings (UIP Pattern)', content: 'Definite UIP pattern: Subpleural and basal predominance, reticular abnormalities, honeycombing with or without traction bronchiectasis, and absence of inconsistent features (such as ground-glass opacities, nodules, or air trapping).' },
              { title: 'Pharmacotherapy & Management', content: 'Antifibrotic Agents (slow FEV1 decline by ~50%):\n1. Nintedanib (Tyrosine kinase inhibitor 150 mg BID);\n2. Pirfenidone (TGF-beta inhibitor).\n(Avoid systemic corticosteroids and immunosuppressants in IPF as they increase mortality). Refer early for pulmonary rehabilitation and lung transplantation evaluation.' }
            ]
          },
          {
            id: 'pulmonary_nodules',
            title: 'Incidental Pulmonary Nodules',
            subtitle: 'Fleischner Society Guidelines & Lung-RADS',
            type: 'Imaging Guideline',
            aiScopeDescription: 'Focus on incidental solid and subsolid pulmonary nodules, Fleischner Society management guidelines, malignancy risk assessment (Brock model), and Lung-RADS classification for CT screening.',
            clinicalContent: [
              { title: 'Fleischner Society Guidelines (Solid Nodules in Adults ≥35 yrs)', content: '• Single Nodule <6 mm: No routine follow-up in low-risk; optional CT at 12 months in high-risk.\n• Single Nodule 6-8 mm: CT at 6-12 months, then consider CT at 18-24 months in high-risk.\n• Single Nodule >8 mm: Consider CT at 3 months, PET-CT, tissue biopsy, or surgical excision based on risk score.' },
              { title: 'Subsolid & Ground-Glass Nodules', content: 'Pure ground-glass nodules <6 mm require no follow-up. Pure ground-glass nodules ≥6 mm: CT at 6-12 months to confirm persistence, then every 2 years until 5 years. Part-solid nodules with solid component ≥6 mm warrant high suspicion for adenocarcinoma.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations and procedures',
        icon: 'construct',
        topics: [
          {
            id: 'spirometry_pft_interpretation',
            title: 'Pulmonary Function Tests (PFTs) & Spirometry',
            subtitle: 'Obstructive vs Restrictive Patterns & DLCO',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on systematic interpretation of Pulmonary Function Tests (PFTs), spirometry (FEV1, FVC, FEV1/FVC), lung volumes (TLC, RV), bronchodilator reversibility testing, and Diffusion Capacity (DLCO).',
            clinicalContent: [
              { title: 'Stepwise PFT Interpretation Algorithm', content: '1. Check FEV1/FVC ratio: If <0.70 (or < lower limit of normal / LLN), an Obstructive pattern is present.\n2. If FEV1/FVC is normal/high, check Total Lung Capacity (TLC): If TLC <80% predicted, a Restrictive pattern is present.\n3. Check Bronchodilator Reversibility (Post-SABA): Positive if FEV1 or FVC increases by ≥12% AND ≥200 mL.\n4. Check DLCO (Diffusing Capacity of the Lung for Carbon Monoxide).' },
              { title: 'Differential by DLCO Findings', content: '• Obstructive + Low DLCO: Emphysema.\n• Obstructive + Normal/High DLCO: Asthma, Chronic Bronchitis.\n• Restrictive + Low DLCO: Intrinsic Lung Disease (IPF, Sarcoidosis, Pneumonitis).\n• Restrictive + Normal DLCO: Extrinsic / Chest wall / Neuromuscular disorders (ALS, Myasthenia, Kyphoscoliosis).\n• Normal Spirometry/Volumes + Isolated Low DLCO: Pulmonary Arterial Hypertension (PAH), early ILD, or Chronic Thromboembolic Pulmonary Hypertension (CTEPH).' }
            ]
          },
          {
            id: 'abg_acid_base_analysis',
            title: 'Arterial Blood Gas (ABG) & Acid-Base',
            subtitle: 'Winter\'s Formula, Anion Gap & Delta-Delta Ratio',
            type: 'Laboratory Tool',
            aiScopeDescription: 'Focus on systematic Arterial Blood Gas (ABG) analysis, primary acid-base disorders, anion gap calculation, Winter\'s formula for metabolic acidosis compensation, and Delta-Delta ratio for mixed disorders.',
            clinicalContent: [
              { title: 'Stepwise Interpretation', content: '1. pH: Normal (7.35-7.45). <7.35 = Acidemia; >7.45 = Alkalemia.\n2. Identify Primary Disorder: Compare PaCO2 (respiratory) and HCO3- (metabolic) with pH direction.\n3. In Metabolic Acidosis, Calculate Anion Gap: AG = Na+ - (Cl- + HCO3-). Normal is 8-12 mEq/L. High AG (>12) indicates unmeasured anions (MUDPILES / GOLDMARK: Glycols, Oxoproline, L-Lactate, D-Lactate, Methanol, Aspirin, Renal failure, Ketoacidosis).' },
              { title: 'Assessing Respiratory Compensation (Winter\'s Formula)', content: 'Expected PaCO2 = (1.5 × [HCO3-]) + 8 ± 2.\n• If measured PaCO2 = Expected: Pure metabolic acidosis with adequate respiratory compensation.\n• If measured PaCO2 > Expected: Concomitant Respiratory Acidosis.\n• If measured PaCO2 < Expected: Concomitant Respiratory Alkalosis.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine',
        icon: 'flask',
        topics: [
          {
            id: 'triple_therapy_copd',
            title: 'Single-Inhaler Triple Therapy in COPD',
            subtitle: 'Mortality Benefits in ETHOS and IMPACT Trials',
            type: 'Therapeutic Advances',
            aiScopeDescription: 'Focus on single-inhaler triple therapy (LAMA/LABA/ICS) in moderate-to-severe COPD, exacerbation reduction, and all-cause mortality reduction established in ETHOS and IMPACT landmark trials.',
            clinicalContent: [
              { title: 'Landmark Trial Evidence (ETHOS & IMPACT)', content: 'The ETHOS and IMPACT multicenter RCTs demonstrated that single-inhaler triple therapy (e.g., Fluticasone furoate / Umeclidinium / Vilanterol or Budesonide / Glycopyrrolate / Formoterol) significantly reduced moderate-to-severe exacerbations and, crucially, reduced all-cause mortality compared to dual LAMA/LABA therapy in symptomatic COPD patients with a history of exacerbations.' },
              { title: 'Clinical Practice Implications', content: 'Current international guidelines recommend prompt initiation of single-inhaler triple therapy for patients with persistent exacerbations and blood eosinophil counts ≥100-300 cells/µL to maximize lung function and survival.' }
            ]
          },
          {
            id: 'targeted_biologics_asthma',
            title: 'Biologic Therapies in Severe Asthma',
            subtitle: 'Dupilumab, Tezepelumab, Mepolizumab & Benralizumab',
            type: 'Immuno-Pulmonology',
            aiScopeDescription: 'Focus on phenotype-guided biologic selection in severe refractory asthma: Anti-IL-5 (Mepolizumab, Reslizumab), Anti-IL-5R (Benralizumab), Anti-IL-4/13 (Dupilumab), and Anti-TSLP (Tezepelumab).',
            clinicalContent: [
              { title: 'Biomarker-Driven Biologic Selection', content: '• Eosinophilic Asthma (Blood Eos ≥150-300 cells/µL): Anti-IL-5 (Mepolizumab) or Anti-IL-5Rα (Benralizumab) effectively reduces eosinophil counts and exacerbations by ~50%.\n• Type 2 High (FeNO ≥25 ppb or Eosinophils ≥150): Anti-IL-4Rα (Dupilumab) blocks IL-4 and IL-13 signaling, improving FEV1 and reducing oral corticosteroid dependence.\n• Non-T2 / Low-Biomarker Asthma: Anti-TSLP (Tezepelumab) acts upstream at the epithelial alarmin level, providing broad efficacy regardless of baseline eosinophil or FeNO counts.' }
            ]
          }
        ]
      }
    ]
  }
};
