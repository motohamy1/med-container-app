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

export type TopicSearchResult = TopicItem & {
  specialtyId: string;
  specialtyName: string;
  specialtyScientificName: string;
  specialtyColor: string;
  specialtyIcon: keyof typeof Ionicons.glyphMap;
  categoryId: string;
  categoryTitle: string;
};

export const SPECIALTY_KNOWLEDGE: Record<string, SpecialtyData> = {
  heart: {
    id: 'heart',
    name: 'Heart',
    scientificName: 'Cardiology',
    icon: 'heart',
    color: '#c98c87',
    illustration: require('../assets/images/specialties/cardiology.jpg'),
    generalScope: 'Focus exclusively on cardiovascular pathology, acute coronary syndromes, heart failure, arrhythmias, vascular emergencies, and evidence-based interventions.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute conditions and resuscitation protocols',
        icon: 'warning',
        topics: [
          {
            id: 'acs',
            title: 'Acute Coronary Syndrome',
            subtitle: 'STEMI vs NSTEMI Workup, DAPT & PCI Timing',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on Acute Coronary Syndrome, STEMI, NSTEMI, Unstable Angina, ECG ischemia, high-sensitivity troponins, and emergent reperfusion.',
            illustration: require('../assets/images/topics/acs.jpg'),
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Substernal crushing chest pain >20 mins, diaphoresis, dyspnea, hypotension, pulmonary edema. Red Flags: Hemodynamic instability (Killip Class IV / Cardiogenic shock), new holosystolic murmur (VSD / papillary muscle rupture), or sustained VT/VF.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '12-lead ECG within 10 minutes of arrival. STEMI: J-point elevation ≥1 mm in ≥2 contiguous leads (≥2 mm in V2-V3 in men, ≥1.5 mm in women) or new LBBB. NSTEMI: Ischemic ST depression or T-wave inversions with dynamic high-sensitivity troponin rise. Stratify NSTEMI with TIMI (0-7) or GRACE score (>140 = high risk).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Aspirin: 324 mg PO chewed immediately.\n• P2Y12 Inhibitor: Ticagrelor 180 mg PO loading (preferred) OR Prasugrel 60 mg PO loading (if anatomy known/PCI planned) OR Clopidogrel 600 mg PO loading.\n• Anticoagulation: Unfractionated Heparin 60 U/kg IV bolus (max 4000 U) then 12 U/kg/hr (target aPTT 50-70s) OR Enoxaparin 1 mg/kg SC q12h.\n• SL Nitroglycerin: 0.4 mg q5min x 3 doses (contraindicated if SBP <90, HR <50 or >100, RV infarction, or PDE-5 inhibitor use within 24-48h).\n• High-intensity Statin: Atorvastatin 80 mg PO.' },
              { title: 'Stepwise Management Algorithm', content: '1. STEMI: Emergent Primary PCI (Door-to-Balloon <90 mins; Door-to-Needle <30 mins with Tenecteplase if PCI transfer >120 mins).\n2. Very High-Risk NSTEMI (refractory pain, shock, VT): Immediate coronary angiography (<2 hours).\n3. High-Risk NSTEMI (GRACE >140, dynamic troponins): Early invasive strategy (<24 hours).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer nitrates or morphine in inferior STEMI without right-sided ECG (V4R) to rule out Right Ventricular Infarction (preload dependent; treat RV shock with IV fluids, avoid nitrates). Sgarbossa criteria required to identify STEMI in patients with pre-existing LBBB or paced rhythm.' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 ESC Guidelines for the management of acute coronary syndromes; 2021 ACC/AHA/SCAI Guideline for Coronary Artery Revascularization.' }
            ]
          },
          {
            id: 'heart_failure_shock',
            title: 'Acute Decompensated HF & Cardiogenic Shock',
            subtitle: 'Wet/Cold Hemodynamic Profiling, Inotropes & GDMT',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute decompensated heart failure, Stevenson hemodynamic classification, loop diuretic resistance, inotropic support (dobutamine, milrinone), and vasopressors in cardiogenic shock.',
            illustration: require('../assets/images/topics/heart_failure.jpg'),
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Acute severe dyspnea, orthopnea, bilateral crackles, JVD, S3 gallop, pink frothy sputum. Cardiogenic Shock signs: SBP <90 mmHg, cold clammy extremities, altered mentation, oliguria (<0.5 mL/kg/hr), serum lactate >2.0 mmol/L.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Stevenson Profile: Warm & Dry (compensated), Warm & Wet (congested), Cold & Dry (hypovolemic), Cold & Wet (cardiogenic shock/severe congestion). NT-proBNP >300 pg/mL (or BNP >100 pg/mL) confirms cardiac etiology. Bedside TTE: Ejection fraction, RV function, inferior vena cava plethoric diameter.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Warm & Wet: IV Furosemide at 2 to 2.5 times the home oral dose as IV bolus (or 40-80 mg IV if loop-naive). Add IV Nitroglycerin (10-200 mcg/min) or Nitroprusside for afterload reduction if SBP >110 mmHg.\n• Cold & Wet (Cardiogenic Shock): Norepinephrine (0.05-0.5 mcg/kg/min) to maintain MAP ≥65 mmHg PLUS Inotrope (Dobutamine 2.5-20 mcg/kg/min or Milrinone 0.125-0.75 mcg/kg/min).\n• Diuretic Resistance: Add oral Metolazone 2.5-10 mg 30 minutes prior to IV loop diuretic (sequential nephron blockade).' },
              { title: 'Stepwise Management Algorithm', content: '1. Place on continuous pulse oximetry, telemetry, and non-invasive positive pressure ventilation (BiPAP/CPAP) for acute pulmonary edema.\n2. Titrate IV loop diuretics to achieve net negative fluid balance of 1-2 L/24h.\n3. In cardiogenic shock: Insert arterial line and early mechanical circulatory support (Impella, IABP, or VA-ECMO) if refractory to dual inotrope/vasopressor therapy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT discontinue chronic beta-blockers during mild-to-moderate decompensation unless patient is in overt cardiogenic shock (abrupt cessation triggers rebound adrenergic tachycardia). Avoid aggressive fluid boluses in undifferentiated shock before bedside echocardiogram.' },
              { title: 'Exact Reference & Guideline Citations', content: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure; 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure.' }
            ]
          },
          {
            id: 'afib_rvr',
            title: 'Atrial Fibrillation with RVR',
            subtitle: 'Rate vs Rhythm Control & CHA2DS2-VASc Anticoagulation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on atrial fibrillation with rapid ventricular response, acute rate control (metoprolol, diltiazem), synchronized cardioversion, and thromboembolic prophylaxis.',
            illustration: require('../assets/images/topics/afib.jpg'),
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Heart rate 130-180 bpm with palpitations, chest discomfort, presyncope. Unstable Red Flags: Hypotension (SBP <90), ischemic chest pain, altered mental status, or pulmonary edema.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '12-lead ECG: Irregularly irregular rhythm, absence of discrete P waves, fibrillatory baseline waves. Risk stratification for stroke: CHA2DS2-VASc (CHF, HTN, Age ≥75 [2], DM, Stroke/TIA [2], Vascular disease, Age 65-74, Sex category female).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Rate Control (Preserved EF ≥40%): Diltiazem 0.25 mg/kg IV bolus over 2 mins (e.g. 15-20 mg), may repeat with 0.35 mg/kg in 15 mins, followed by continuous infusion 5-15 mg/hr OR Metoprolol tartrate 5 mg IV q5min up to 3 doses (15 mg total).\n• Rate Control (Reduced EF <40% / Acute HF): Amiodarone 150 mg IV over 10 mins then 1 mg/min x 6h then 0.5 mg/min x 18h OR Digoxin 0.25-0.5 mg IV.\n• Anticoagulation: Direct Oral Anticoagulant (DOAC - Apixaban 5 mg PO BID or Rivaroxaban 20 mg PO daily) preferred over Warfarin.' },
              { title: 'Stepwise Management Algorithm', content: '1. Hemodynamically Unstable: Emergent Synchronized Electrical Cardioversion (120-200 J biphasic).\n2. Hemodynamically Stable: Rate control first (target resting HR <110 bpm).\n3. If AFib onset >48 hours (or unknown duration): Anticoagulate for ≥3 weeks before elective cardioversion OR perform Transesophageal Echocardiogram (TEE) to exclude left atrial appendage thrombus prior to cardioversion.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer AV nodal blockers (Diltiazem, Verapamil, Beta-blockers, Digoxin, Adenosine) to patients with Atrial Fibrillation with pre-excitation (Wolff-Parkinson-White / WPW). AV nodal blockade forces conduction down the accessory pathway, degenerating into Ventricular Fibrillation and cardiac arrest (use IV Procainamide or synchronized cardioversion instead).' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation.' }
            ]
          },
          {
            id: 'aortic_dissection_protocol',
            title: 'Acute Aortic Dissection',
            subtitle: 'Stanford Classification, Anti-Impulse Therapy & Surgery',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute aortic syndromes, Stanford Type A vs B, anti-impulse hemodynamic control (esmolol/labetalol), CT angiography findings, and emergent cardiothoracic repair.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Sudden onset of severe, tearing, "knife-like" anterior chest or interscapular back pain reaching peak intensity in seconds. Red Flags: Pulse deficit between arms (>20 mmHg SBP difference), focal neurological deficits, new diastolic murmur of aortic regurgitation, or cardiac tamponade.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Aortic Dissection Detection Risk Score (ADD-RS 0-3). Imaging Gold Standard: CT Angiography (CTA) Chest, Abdomen, Pelvis (visualizes true/false lumen, flap extent, and organ malperfusion). Bedside TTE/TEE if unstable.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Target Hemodynamics: Heart Rate <60 bpm and SBP 100-120 mmHg within 20 minutes (reduces aortic shear stress dP/dt).\n• Step 1: IV Beta-Blocker FIRST: Esmolol loading dose 500 mcg/kg over 1 min then infusion 50-300 mcg/kg/min OR IV Labetalol 20 mg bolus then 20-80 mg q10min (or 1-2 mg/min infusion).\n• Step 2: IV Vasodilator SECOND (only after HR <60): Nicardipine infusion 5-15 mg/hr OR Sodium Nitroprusside 0.5-10 mcg/kg/min.' },
              { title: 'Stepwise Management Algorithm', content: '1. Stanford Type A (Ascending aorta): Emergent surgical repair with graft replacement (mortality increases 1-2% per hour without surgery).\n2. Stanford Type B (Descending aorta distal to left subclavian): Medical anti-impulse therapy in ICU. Thoracic Endovascular Aortic Repair (TEVAR) indicated if complicated (refractory pain, malperfusion, rapid expansion, rupture).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'CRITICAL: Never administer a vasodilator (Nitroprusside/Nicardipine) BEFORE the beta-blocker. Vasodilation induces reflex tachycardia and increases aortic wall shear stress (dP/dt), precipitating catastrophic aortic rupture.' },
              { title: 'Exact Reference & Guideline Citations', content: '2022 ACC/AHA Guideline for the Diagnosis and Management of Aortic Disease; 2014 ESC Guidelines on the diagnosis and treatment of aortic diseases.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'hypertension_guidelines',
            title: 'Essential Hypertension',
            subtitle: 'ACC/AHA & ESC Staging, GDMT & Resistant HTN',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on essential hypertension, classification stages, ambulatory BP monitoring, lifestyle modifications, first-line antihypertensive classes, and secondary hypertension.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Asymptomatic elevated BP vs Hypertensive Crisis. Red Flags (Hypertensive Emergency): SBP ≥180 and/or DBP ≥120 with acute target organ damage (papilledema, acute kidney injury, encephalopathy, pulmonary edema, aortic dissection).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Normal: <120/<80 mmHg\n• Elevated: 120-129/<80 mmHg\n• Stage 1 HTN: SBP 130-139 or DBP 80-89 mmHg\n• Stage 2 HTN: SBP ≥140 or DBP ≥90 mmHg\nDiagnosis requires ≥2 readings on ≥2 separate clinical encounters or confirmation by 24-hour Ambulatory Blood Pressure Monitoring (ABPM average ≥130/80).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Four first-line classes:\n1. ACEi (Lisinopril 10-40 mg daily) or ARB (Losartan 50-100 mg daily, Telmisartan 40-80 mg daily).\n2. Dihydropyridine CCB (Amlodipine 5-10 mg daily).\n3. Thiazide-like Diuretic (Chlorthalidone 12.5-25 mg daily or Indapamide 1.25-2.5 mg daily preferred over HCTZ).\n• Initial Dual Combination: Recommended for Stage 2 HTN when BP is >20/10 mmHg above goal (e.g. ARB + CCB).' },
              { title: 'Stepwise Management Algorithm', content: '1. General Population BP Goal: <130/80 mmHg.\n2. Diabetic Kidney Disease or CKD with Albuminuria: ACEi or ARB is mandatory for renal preservation.\n3. Black Population (without CKD): Initial therapy should include CCB or Thiazide-like diuretic.\n4. Resistant Hypertension (uncontrolled on 3 agents including a diuretic): Add Spironolactone 25-50 mg daily as 4th-line agent after checking serum K+.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT combine an ACE inhibitor with an ARB (causes severe hyperkalemia, acute kidney injury, and syncope without cardiovascular benefit). In patients with severe bilateral renal artery stenosis, ACEi/ARBs can precipitate acute renal failure.' },
              { title: 'Exact Reference & Guideline Citations', content: '2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure; 2023 ESH Guidelines for the management of arterial hypertension.' }
            ]
          },
          {
            id: 'cad_stable_angina',
            title: 'Chronic Coronary Syndromes',
            subtitle: 'Stable Angina, CCTA, Functional Stress & ISCHEMIA Trial',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Chronic Coronary Syndromes, stable ischemic heart disease, non-invasive imaging (CCTA, stress CMR, PET), medical optimization, and revascularization.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Predictable exertional retrosternal discomfort relieved by rest or SL nitroglycerin within 5 minutes. Red Flags: Angina at rest, increasing frequency/duration (crescendo angina), or new syncope indicating severe left main disease or critical aortic stenosis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Pre-test probability (PTP) calculation guides non-invasive testing:\n• Low-Intermediate PTP: Coronary CT Angiography (CCTA) preferred (high negative predictive value, detects plaque burden).\n• High PTP or Known CAD: Functional testing for ischemia (Stress CMR, PET, SPECT, or Stress Echocardiogram).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Prognostic Therapy: Aspirin 81 mg daily + Atorvastatin 80 mg daily (or Rosuvastatin 20-40 mg) + ACEi (if EF <40%, DM, HTN, or CKD).\n• Anti-anginal First-Line: Beta-blocker (Metoprolol succinate 50-200 mg daily or Bisoprolol 5-10 mg daily) titrated to resting HR 55-60 bpm.\n• Anti-anginal Second-Line: Add Dihydropyridine CCB (Amlodipine 5-10 mg) or Ranolazine 500-1000 mg BID (inhibits late inward sodium current, no effect on BP/HR).' },
              { title: 'Stepwise Management Algorithm', content: '1. Optimize guideline-directed medical therapy (GDMT).\n2. Revascularization (PCI or CABG) is indicated for:\n  - Persistent angina refractory to maximal medical therapy.\n  - High-risk anatomy (Left Main stenosis >50%, multivessel disease with EF <35%, or severe proximal LAD stenosis).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Guided by the landmark ISCHEMIA trial: In stable coronary disease without left main disease or low EF, routine initial invasive revascularization (PCI/CABG) does NOT reduce death or myocardial infarction compared to optimal medical therapy; its primary role is symptom and quality of life improvement.' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ESC Guidelines for the diagnosis and management of chronic coronary syndromes; 2023 AHA/ACC/ACCP/ASPC/NLA/PCNA Guideline for the Management of Patients With Chronic Coronary Disease.' }
            ]
          },
          {
            id: 'hyperlipidemia_statin',
            title: 'Dyslipidemia & ASCVD Prevention',
            subtitle: 'Statin Intensity, Ezetimibe, PCSK9 & Non-Statin Regimens',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on dyslipidemia, 10-year ASCVD risk calculation, high-intensity statins, ezetimibe, PCSK9 monoclonals, and non-statin lipid lowering agents.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Very High-Risk Secondary ASCVD (acute coronary syndrome within 12 months, multiple ASCVD events, or ASCVD event + multiple high-risk conditions like DM, CKD, smoking). Extreme hypertriglyceridemia (>500-1000 mg/dL) carries acute pancreatitis risk.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Fasting Lipid Profile: Total cholesterol, Triglycerides, HDL-C, and calculated/direct LDL-C. Risk Categories:\n• Primary Prevention: Calculate 10-year ASCVD risk (Pooled Cohort Equations: <5% low, 5-7.5% borderline, 7.5-20% intermediate, ≥20% high risk).\n• Secondary Prevention (Clinical ASCVD): Target LDL-C <55 mg/dL (<1.4 mmol/L) and ≥50% reduction from baseline.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• High-Intensity Statin (lowers LDL ≥50%): Atorvastatin 40-80 mg daily OR Rosuvastatin 20-40 mg daily.\n• Moderate-Intensity Statin (lowers LDL 30-49%): Atorvastatin 10-20 mg, Rosuvastatin 5-10 mg, Simvastatin 20-40 mg.\n• Non-Statin Add-On (if LDL above goal on maximal statin):\n  1. Ezetimibe 10 mg PO daily (adds 15-20% LDL reduction).\n  2. PCSK9 Inhibitor (Evolocumab 140 mg SC q2w or Alirocumab 75-150 mg SC q2w - adds 50-60% LDL reduction).\n  3. Bempedoic Acid 180 mg PO daily (for statin intolerance).' },
              { title: 'Stepwise Management Algorithm', content: '1. Establish baseline lipid panel.\n2. Initiate high-intensity statin for all secondary ASCVD, severe primary hypercholesterolemia (LDL ≥190 mg/dL), and DM aged 40-75.\n3. Recheck lipid panel at 4-12 weeks.\n4. If LDL-C remains ≥55 mg/dL in very high-risk ASCVD, add Ezetimibe; if still elevated, add PCSK9 inhibitor.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT discontinue statins routinely for minor asymptomatic CK elevations. In suspected statin-associated muscle symptoms (SAMS), assess for drug interactions (CYP3A4 inhibitors with Simvastatin/Atorvastatin), check TSH (hypothyroidism exacerbates statin myopathy), and trial a lower dose, alternate-day dosing, or Rosuvastatin/Pravastatin.' },
              { title: 'Exact Reference & Guideline Citations', content: '2018 AHA/ACC/AACVPR/AAPA/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the Management of Blood Cholesterol; 2019 ESC/EAS Guidelines for the management of dyslipidaemias.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'ecg_interpretation',
            title: 'Systematic 12-Lead ECG Interpretation',
            subtitle: 'Axis, Ischemia Territories, Bundle Blocks & Intervals',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on systematic 12-lead electrocardiogram interpretation, axis, bundle branch blocks, hypertrophy criteria, ischemic territories, and QTc calculation.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Critical ECG Findings: Tombstone ST elevations, hyperacute T waves, Wellens warning (deep biphasic or inverted T waves in V2-V3 indicating critical LAD stenosis), de Winter T waves (ST depression with tall symmetrical T waves), and electrical alternans (pericardial tamponade).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '1. Rate & Rhythm: Sinus rhythm requires upright P wave in leads I, II, aVF. Rate = 300 / large squares between R-R.\n2. Electrical Axis: Normal (-30° to +90°). Lead I (+) and aVF (+) = Normal; Lead I (+) and aVF (-) with Lead II (-) = Left Axis Deviation; Lead I (-) and aVF (+) = Right Axis Deviation.\n3. Intervals: PR interval 120-200 ms; QRS duration <120 ms; QTc <440 ms in men, <460 ms in women (Bazett formula: QTc = QT / √RR; prolonged >500 ms carries high risk of Torsades de Pointes).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool). If QTc >500 ms with polymorphic VT (Torsades): Administer Magnesium Sulfate 2 g IV over 1-2 minutes and withdraw all QT-prolonging medications.' },
              { title: 'Stepwise Management Algorithm', content: 'Anatomical Coronary Territories:\n• Septal: V1-V2 (LAD)\n• Anterior: V3-V4 (LAD)\n• Lateral: I, aVL, V5, V6 (Left Circumflex / Diagonal)\n• Inferior: II, III, aVF (RCA in 85-90%)\n• Posterior: Horizontal ST depression and tall R waves in V1-V3 (obtain posterior leads V7-V9).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'RBBB: QRS ≥120 ms, rsR\' in V1-V2, wide slurred S in I and V6.\nLBBB: QRS ≥120 ms, broad notched R wave in I, aVL, V5-V6, deep QS in V1. Use Sgarbossa Criteria for acute MI in LBBB: Concordant ST elevation ≥1 mm in any lead (5 pts), Concordant ST depression ≥1 mm in V1-V3 (3 pts), Discordant ST elevation ≥5 mm or >25% of preceding S wave (Modified Sgarbossa, 2 pts). Score ≥3 has 98% specificity for STEMI.' },
              { title: 'Exact Reference & Guideline Citations', content: 'AHA/ACCF/HRS Recommendations for the Standardization and Interpretation of the Electrocardiogram; Marriott\'s Practical Electrocardiography 13th Ed.' }
            ]
          },
          {
            id: 'echo_ef_assessment',
            title: 'Echocardiography & EF Assessment',
            subtitle: 'Simpson Biplane, Diastology (E/e\') & Valvular Gradients',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on Transthoracic Echocardiography, ejection fraction calculation, diastolic grading, wall motion scoring, and valvular stenosis assessment.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Critical TTE Red Flags: Cardiac tamponade physiology (diastolic collapse of right ventricle/right atrium, plethoric non-collapsing IVC, >25% respiratory variation in mitral inflow velocity), dynamic LV outflow tract obstruction, and flail mitral leaflet.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• LVEF (Simpson Biplane Method): Normal (52-72% in men, 54-74% in women); Mild dysfunction (41-51%); Moderate (30-40%); Severe (<30%).\n• Diastolic Dysfunction Algorithm: Evaluated by average E/e\' ratio (>14 indicates elevated LV filling pressures), Septal e\' (<7 cm/s) or Lateral e\' (<10 cm/s), Tricuspid regurgitation peak velocity (>2.8 m/s), and Left Atrial Volume Index (LAVI >34 mL/m²).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool). Guides GDMT initiation and device therapy (ICD/CRT indication for EF ≤35% after ≥3 months of GDMT).' },
              { title: 'Stepwise Management Algorithm', content: '1. Acquire parasternal long-axis, short-axis, apical 4-chamber, 2-chamber, and subcostal views.\n2. Assess 17-segment regional wall motion score index (1=normal, 2=hypokinetic, 3=akinetic, 4=dyskinetic).\n3. Quantify valvular stenosis/regurgitation (Severe Aortic Stenosis: Aortic valve area <1.0 cm², mean gradient ≥40 mmHg, peak velocity ≥4.0 m/s).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'In low-flow, low-gradient aortic stenosis (EF <50%, mean gradient <40 mmHg, AVA <1.0 cm²), perform Dobutamine Stress Echocardiography to differentiate true severe AS from pseudo-severe AS and evaluate contractile reserve.' },
              { title: 'Exact Reference & Guideline Citations', content: 'ASE/EACVI Guidelines and Standards for Chamber Quantification by Echocardiography; 2020 ACC/AHA Guideline for the Management of Patients With Valvular Heart Disease.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'sglt2i_cardioprotection',
            title: 'SGLT2 Inhibitors across Heart Failure',
            subtitle: 'DAPA-HF, EMPEROR & DELIVER Trials',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on sodium-glucose cotransporter-2 inhibitors in heart failure across all ejection fractions regardless of diabetes status.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Euglycemic DKA risk in insulin-dependent patients during acute physiological stress or surgery (hold SGLT2i 3 days prior to elective major surgery).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark Trial Data:\n• DAPA-HF & EMPEROR-Reduced: Dapagliflozin 10 mg and Empagliflozin 10 mg reduced cardiovascular death and HF hospitalization by ~25% in HFrEF (EF ≤40%).\n• EMPEROR-Preserved & DELIVER: Established ~18-21% relative risk reduction in CV death or HF hospitalizations in HFpEF and HFmrEF (EF >40%), establishing SGLT2i as the first class with universal Class 1 recommendation across the entire EF spectrum.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Dapagliflozin 10 mg PO once daily OR Empagliflozin 10 mg PO once daily.\n• No dose titration required. Can be initiated in patients with eGFR down to 20 mL/min/1.73m².' },
              { title: 'Stepwise Management Algorithm', content: 'Initiate SGLT2i early during heart failure hospitalization once hemodynamically stable. An initial mild drop in eGFR (up to 30%) within 2-4 weeks reflects reversible glomerular hemodynamic unloading and should NOT trigger drug discontinuation.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT delay SGLT2 inhibitor initiation until outpatient follow-up. In-hospital initiation achieves superior 30-day readmission and mortality outcomes without increasing adverse event rates.' },
              { title: 'Exact Reference & Guideline Citations', content: 'DAPA-HF Trial (NEJM 2019); EMPEROR-Preserved Trial (NEJM 2021); DELIVER Trial (NEJM 2022); 2022 AHA/ACC/HFSA Heart Failure Guidelines.' }
            ]
          },
          {
            id: 'glp1_ascvd_trials',
            title: 'GLP-1 Receptor Agonists in CVD & Obesity',
            subtitle: 'SELECT Trial, STEP-HFpEF & Cardiometabolic Protection',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on GLP-1 receptor agonists (Semaglutide, Tirzepatide) in secondary cardiovascular prevention and obesity-phenotype HFpEF.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Contraindicated in personal or family history of Medullary Thyroid Carcinoma (MTC) or Multiple Endocrine Neoplasia type 2 (MEN 2). Monitor for acute pancreatitis and severe gastroparesis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark Trial Data:\n• SELECT Trial (NEJM 2023): Semaglutide 2.4 mg SC weekly reduced Major Adverse Cardiovascular Events (MACE: CV death, nonfatal MI, nonfatal stroke) by 20% in patients with overweight/obesity and established CVD without diabetes (HR 0.80, p<0.001).\n• STEP-HFpEF Trial (NEJM 2023): Produced significant improvements in KCCQ physical limitation score (+16.6 vs +8.7 points) and 6-minute walk distance in obesity-phenotype HFpEF.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Semaglutide SC once weekly: Initiate at 0.25 mg weekly x 4 weeks, escalate monthly through 0.5 mg, 1.0 mg, 1.7 mg, up to target maintenance dose of 2.4 mg weekly.' },
              { title: 'Stepwise Management Algorithm', content: 'Indicated for secondary ASCVD risk reduction in non-diabetic overweight/obese patients with established cardiovascular disease, representing a major paradigm shift in cardiometabolic therapeutics.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Counsel patients on slow eating and smaller portions to mitigate nausea/vomiting. Hold GLP-1 RAs before elective general anesthesia due to delayed gastric emptying and aspiration risk (follow ASA consensus guidance).' },
              { title: 'Exact Reference & Guideline Citations', content: 'SELECT Trial (NEJM 2023); STEP-HFpEF Trial (NEJM 2023); 2024 ADA Standards of Care in Diabetes.' }
            ]
          }
        ]
      }
    ]
  },

  git: {
    id: 'git',
    name: 'GIT',
    scientificName: 'Gastroenterology & Hepatology',
    icon: 'restaurant',
    color: '#a9a069',
    illustration: require('../assets/images/specialties/gastroenterology.jpg'),
    generalScope: 'Focus exclusively on the gastrointestinal tract, luminal disorders, hepatobiliary tree, pancreatitis, endoscopy, and liver cirrhosis.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute GI hemorrhages, infections, and surgical abdomen',
        icon: 'warning',
        topics: [
          {
            id: 'upper_gi_bleed',
            title: 'Acute Upper GI Bleeding',
            subtitle: 'Glasgow-Blatchford Score, Variceal vs Peptic Ulcer & Endoscopy',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on upper gastrointestinal bleeding, variceal vs non-variceal bleeding, octreotide, high-dose PPI, and emergent endoscopy.',
            illustration: require('../assets/images/topics/upper_gi_bleed.jpg'),
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Hematemesis (bright red blood or "coffee grounds"), melena, hematochezia with hemodynamic instability. Red Flags: SBP <90, HR >100, orthostatic syncope, altered mental status (indicates massive bleeding >20-25% blood volume loss).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Glasgow-Blatchford Score (GBS 0-23): GBS 0-1 identifies very low risk (safe for outpatient management); GBS ≥6 predicts high risk for endoscopic intervention or transfusion. Rockall Score assesses post-endoscopy rebleeding mortality.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Restrictive Transfusion Strategy: Transfuse PRBCs to target Hemoglobin 7-8 g/dL (transfuse at Hb <7.0 g/dL; target 8.0 g/dL in active acute coronary syndrome).\n• High-Dose PPI: IV Pantoprazole or Esomeprazole 80 mg bolus, followed by 8 mg/hr continuous infusion (or 40 mg IV BID).\n• Suspected Variceal Bleeding / Cirrhosis:\n  1. IV Octreotide: 50 mcg bolus, then 50 mcg/hr continuous IV infusion for 2-5 days.\n  2. Prophylactic Antibiotics: Ceftriaxone 1 g IV daily for 7 days (reduces mortality and rebleeding).' },
              { title: 'Stepwise Management Algorithm', content: '1. Secure 2 large-bore IV lines (16-18G) or central access; initiate crystalloid resuscitation.\n2. Reverse severe coagulopathy (4-Factor PCC for Warfarin reversal; Idarucizumab/Andexanet alfa for DOACs if life-threatening).\n3. Perform Endoscopy (EGD) within 24 hours of presentation (within 12 hours for suspected variceal hemorrhage after resuscitation).\n4. High-risk non-variceal ulcers (Forrest Ia, Ib, IIa): Dual endoscopic therapy (epinephrine injection + hemoclip or thermal coagulation).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT over-transfuse patients with suspected variceal bleeding (Hb target >9-10 g/dL increases portal pressure and precipitates uncontrollable rebound variceal rupture). Routine placement of nasogastric tube is not recommended and carries trauma risk.' },
              { title: 'Exact Reference & Guideline Citations', content: '2021 ACG Clinical Guideline: Upper Gastrointestinal and Ulcer Bleeding; 2022 AASLD Practice Guidance on Portal Hypertension Bleeding in Cirrhosis.' }
            ]
          },
          {
            id: 'acute_pancreatitis',
            title: 'Acute Pancreatitis Management',
            subtitle: 'Revised Atlanta Criteria, BISAP & Goal-Directed Resuscitation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute pancreatitis, Atlanta classification, BISAP scoring, lactated ringers fluid resuscitation, and infected necrosis.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Severe epigastric pain radiating directly to the back, nausea, vomiting. Red Flags: SIRS criteria (temp >38°C, HR >90, RR >20, WBC >12k), oliguria, elevated hematocrit >44% (hemoconcentration), or rising BUN (>20 mg/dL).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Requires ≥2 of 3 Revised Atlanta Criteria:\n1. Characteristic severe epigastric pain.\n2. Serum lipase or amylase >3x upper limit of normal.\n3. Cross-sectional imaging (CT or MRI) findings consistent with acute pancreatitis.\n• Severity Scoring: BISAP (BUN >25, Impaired mental status, SIRS, Age >60, Pleural effusion; score ≥3 indicates high mortality).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Goal-Directed Fluid Resuscitation: Lactated Ringer’s solution (preferred over Normal Saline to prevent hyperchloremic acidosis) at 200-500 mL/hr or 5-10 mL/kg/hr for first 12-24 hours.\n• Analgesia: IV Hydromorphone, Fentanyl, or Buprenorphine for multimodal pain control.\n• Antibiotics: Prophylactic antibiotics are NOT recommended for sterile acute pancreatitis; reserve Carbapenems (Meropenem 1g q8h) only for infected pancreatic necrosis (gas on CT or positive FNA).' },
              { title: 'Stepwise Management Algorithm', content: '1. Establish etiology: RUQ ultrasound (gallstones), serum triglycerides (if >1000 mg/dL consider insulin infusion), calcium, and alcohol history.\n2. Early Oral Feeding: Initiate low-fat solid/liquid oral diet as soon as abdominal pain improves and ileus resolves (no need to keep NPO until lipase normalizes).\n3. Biliary Pancreatitis with Cholangitis: Emergent ERCP within 24 hours.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT order routine contrast CT abdomen at ED arrival (<48-72 hours) unless diagnosis is in doubt. Early CT underestimates the extent of pancreatic necrosis and exposes patients to contrast nephropathy during active hypovolemia.' },
              { title: 'Exact Reference & Guideline Citations', content: '2018 ACG Clinical Guideline: Management of Acute Pancreatitis; 2019 IAP/APA Evidence-based guidelines for acute pancreatitis.' }
            ]
          },
          {
            id: 'acute_cholangitis',
            title: 'Acute Ascending Cholangitis',
            subtitle: 'Tokyo Guidelines (TG18), Charcot Triad & Biliary Drainage',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute ascending cholangitis, Charcot triad, Reynolds pentad, Tokyo guidelines, IV antibiotics, and urgent ERCP decompression.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Charcot\'s Triad: Fever, Right Upper Quadrant abdominal pain, Jaundice. Reynolds\' Pentad (Severe suppurative toxic cholangitis): Charcot\'s Triad + Septic Shock (Hypotension) + Altered Mental Status.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Tokyo Guidelines 2018 (TG18) Diagnostic Criteria:\nA. Systemic inflammation (Fever/chills or WBC <4k or >10k, CRP ≥1).\nB. Cholestasis (Jaundice Total Bili ≥2 mg/dL or elevated ALP/GGT/AST/ALT >1.5x ULN).\nC. Imaging findings (Biliary dilation or stricture/stone on US, CT, or MRCP).\nDefinite Diagnosis: 1 from A + 1 from B + 1 from C.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Broad-Spectrum IV Antibiotics:\n  1. Piperacillin-Tazobactam 4.5 g IV q6h OR\n  2. Ceftriaxone 2 g IV daily + Metronidazole 500 mg IV q8h OR\n  3. Meropenem 1 g IV q8h (if septic shock or risk of ESBL/multidrug resistance).\n• IV Fluid Resuscitation with crystalloids.' },
              { title: 'Stepwise Management Algorithm', content: '1. Immediate hemodynamic stabilization and blood cultures.\n2. Start empiric IV antibiotics within 1 hour.\n3. Biliary Decompression:\n  - Severe (TG18 Grade III / Shock): Emergent ERCP decompression with sphincterotomy and stent within 12 hours.\n  - Moderate (TG18 Grade II): Urgent ERCP within 24-48 hours.\n  - Percutaneous Transhepatic Biliary Drainage (PTBD) if ERCP fails or anatomy is surgically altered.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT delay ERCP decompression in severe cholangitis hoping antibiotics alone will resolve the infection. Biliary obstruction increases intrabiliary pressure, allowing bacteria to continually seed the systemic circulation; drainage is lifesaving.' },
              { title: 'Exact Reference & Guideline Citations', content: 'Tokyo Guidelines 2018 (TG18): Diagnostic criteria and severity assessment of acute cholangitis; 2021 ACG Clinical Guideline: Choledocholithiasis.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'ibd',
            title: 'Inflammatory Bowel Disease',
            subtitle: 'Crohn Disease vs Ulcerative Colitis, Biologics & Monitoring',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on IBD, differentiating Crohn from Ulcerative Colitis, endoscopic Mayo score, biologics (anti-TNF, anti-IL-23), and colorectal cancer surveillance.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Bloody diarrhea (>6-10 stools/day), abdominal pain, tenesmus, weight loss. Red Flags: Toxic Megacolon (colonic dilation >6 cm on abdominal radiograph with systemic toxicity), severe fever, tachycardia, peritoneal signs (perforation risk).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Ulcerative Colitis (UC): Mucosal continuous inflammation starting in rectum and extending proximally, absence of granulomas.\n• Crohn\'s Disease (CD): Transmural inflammation, skip lesions anywhere from mouth to anus (terminal ileum most common), cobblestoning, strictures, fistulas.\n• Biomarkers: Fecal Calprotectin (>150-250 mcg/g correlates with active mucosal inflammation) and CRP.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Mild-Moderate UC: Oral Mesalamine 2.4-4.8 g daily + Topical rectal 5-ASA 1 g suppository/enema daily.\n• Acute Severe Flare (Inpatient): IV Methylprednisolone 60 mg daily (or Hydrocortisone 100 mg q6h). Check response on Day 3 (Oxford criteria: >8 stools or CRP >45 predicts 85% colectomy rate without rescue therapy).\n• Moderate-to-Severe Maintenance (Biologics & Small Molecules):\n  1. Anti-TNF: Infliximab 5-10 mg/kg IV or Adalimumab 160/80/40 mg SC.\n  2. Anti-IL-23: Risankizumab (CD) or Mirikizumab/Ustekinumab.\n  3. Oral JAK Inhibitor: Upadacitinib 45 mg induction then 15-30 mg daily.' },
              { title: 'Stepwise Management Algorithm', content: '1. Confirm diagnosis via ileocolonoscopy with biopsies and cross-sectional MR/CT Enterography.\n2. Rule out Clostridioides difficile and CMV colitis before escalating immunosuppression during a flare.\n3. Cancer Surveillance: Surveillance colonoscopy with high-definition chromoendoscopy starting 8 years after disease onset, repeated every 1-3 years.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT use systemic corticosteroids for maintenance therapy in IBD (steroids induce remission but fail to maintain mucosal healing and carry devastating long-term toxicities). Prior to starting biologics (anti-TNF), mandatory screening for latent Tuberculosis (IGRA) and Hepatitis B (HBsAg, anti-HBc) is required.' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ACG Clinical Guideline: Ulcerative Colitis in Adults; 2021 AGA Clinical Practice Guidelines on the Management of Moderate-to-Severe Ulcerative Colitis and Crohn\'s Disease.' }
            ]
          },
          {
            id: 'cirrhosis_portal_htn',
            title: 'Decompensated Cirrhosis & Portal HTN',
            subtitle: 'Ascites, SBP, Hepatic Encephalopathy & Variceal Prophylaxis',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on decompensated cirrhosis, MELD-Na scoring, diagnostic paracentesis, spontaneous bacterial peritonitis, lactulose, and non-selective beta blockers.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'New-onset ascites, jaundice, confusion, hematemesis. Red Flags: Spontaneous Bacterial Peritonitis (fever, abdominal pain, worsening encephalopathy, acute renal injury), Hepatorenal Syndrome (unexplained creatinine rise in cirrhosis with ascites).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Child-Pugh Score (A: 5-6, B: 7-9, C: 10-15) and MELD-Na Score (assesses 90-day transplant waitlist mortality based on Bilirubin, INR, Creatinine, Sodium).\n• Diagnostic Paracentesis: Mandatory for all hospitalized patients with new or worsening ascites. Serum-Ascites Albumin Gradient (SAAG) ≥1.1 g/dL confirms portal hypertension. SBP Diagnosis: Ascitic fluid absolute neutrophil count (PMN) ≥250 cells/mm³ (0.25 x 10⁹/L).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• SBP Treatment: IV Ceftriaxone 2 g daily (or Cefotaxime 2 g q8h) + IV Albumin (1.5 g/kg on Day 1, and 1.0 g/kg on Day 3 - prevents hepatorenal syndrome and reduces mortality by 67%).\n• Ascites Diuretics: Dual therapy with Spironolactone 100 mg PO + Furosemide 40 mg PO once daily in a 100:40 ratio (titrate up to max 400:160 mg) + Sodium restriction <2000 mg/day.\n• Hepatic Encephalopathy: Lactulose 20-30 g (30-45 mL) PO 2-3 times daily titrated to achieve 2-3 soft bowel movements/day. Add Rifaximin 550 mg PO BID for recurrent HE prevention.\n• Variceal Prophylaxis: Carvedilol 6.25-12.5 mg PO daily (preferred non-selective beta-blocker) or Nadolol/Propranolol.' },
              { title: 'Stepwise Management Algorithm', content: '1. Screen all cirrhosis patients for esophageal varices via EGD or non-invasive elastography.\n2. For Large-Volume Paracentesis (>5 Liters): Administer IV Albumin 6-8 grams per liter of ascites removed to prevent post-paracentesis circulatory dysfunction (PICD).\n3. SBP Secondary Prophylaxis: Indefinite oral Ciprofloxacin 500 mg daily or TMP-SMX 1 DS tablet daily after first SBP episode.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer NSAIDs to patients with cirrhosis (NSAIDs block renal prostaglandins, precipitating acute renal failure and refractory ascites). Avoid sedatives and narcotics which trigger severe hepatic encephalopathy.' },
              { title: 'Exact Reference & Guideline Citations', content: '2021 AASLD Practice Guidance: Management of Ascites, Spontaneous Bacterial Peritonitis, and Hepatorenal Syndrome; 2021 EASL Clinical Practice Guidelines for decompensated cirrhosis.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'lft_interpretation',
            title: 'Liver Function Tests & FIB-4 Score',
            subtitle: 'Hepatocellular vs Cholestatic Patterns & R Ratio',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on LFT pattern recognition, AST/ALT ratio, R ratio calculation, non-invasive fibrosis scores (FIB-4), and viral/drug hepatotoxicity workup.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Markedly elevated transaminases (ALT/AST >1000-5000 IU/L) indicate acute severe liver injury: 1. Ischemic hepatitis ("shock liver"); 2. Acetaminophen/toxic necrosis; 3. Acute viral hepatitis (A, B, E); 4. Autoimmune hepatitis. Red Flags for Acute Liver Failure: Elevated INR ≥1.5 and altered mental status (hepatic encephalopathy) in a patient without pre-existing cirrhosis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• R Ratio (Differentiates Hepatocellular vs Cholestatic injury):\n  R = (ALT / ALT Upper Limit of Normal) / (ALP / ALP Upper Limit of Normal)\n  - R > 5: Hepatocellular injury\n  - R < 2: Cholestatic injury\n  - R 2 to 5: Mixed injury pattern\n• AST:ALT Ratio:\n  - AST/ALT > 2: Highly suggestive of Alcoholic Liver Disease\n  - ALT > AST: Characteristic of Metabolic Dysfunction-Associated Steatohepatitis (MASH) or Viral Hepatitis.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• FIB-4 Index (Non-Invasive Liver Fibrosis Assessment):\n  FIB-4 = (Age [years] x AST [U/L]) / (Platelet count [10⁹/L] x √ALT [U/L])\n  - Score < 1.30 (<2.0 in age >65): High negative predictive value for advanced fibrosis (NPV >90%, low risk).\n  - Score > 2.67: High probability of advanced fibrosis (F3-F4), prompts transient elastography (FibroScan) or hepatology referral.' },
              { title: 'Stepwise Management Algorithm', content: '1. Classify LFT abnormality into Hepatocellular vs Cholestatic vs Infiltrative.\n2. Hepatocellular: Check Viral serologies (HBsAg, anti-HCV, anti-HAV IgM), Acetaminophen level, Autoimmune markers (ANA, ASMA, IgG), Iron studies (Ferritin, Transferrin saturation for hemochromatosis), Ceruloplasmin (Wilson disease if age <40).\n3. Cholestatic (ALP/GGT): Order Right Upper Quadrant Ultrasound to exclude biliary duct dilation (choledocholithiasis, malignancy). If normal ducts, check Antimitochondrial Antibody (AMA for Primary Biliary Cholangitis) and MRCP (Primary Sclerosing Cholangitis).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Isolated alkaline phosphatase elevation can originate from bone, placenta, or intestine; always check serum GGT or fractionated ALP to confirm hepatic origin before initiating extensive biliary workups.' },
              { title: 'Exact Reference & Guideline Citations', content: '2017 ACG Clinical Guideline: Evaluation of Abnormal Liver Chemistries; 2023 AASLD Practice Guidance on NAFLD/NASH.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'resmetirom_mash',
            title: 'Resmetirom & Thyroid Hormone Receptor-β in MASH',
            subtitle: 'MAESTRO-NASH Landmark Trial & Liver Fibrosis Reversal',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on Resmetirom, thyroid hormone receptor-beta selective agonism, and first FDA-approved treatment for non-cirrhotic MASH with fibrosis.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Non-alcoholic Steatohepatitis (MASH) with significant fibrosis (F2-F3 stage) carries elevated risk of progression to decompensated cirrhosis and hepatocellular carcinoma.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'MAESTRO-NASH Phase 3 Trial (NEJM 2024):\n• Evaluated Resmetirom 80 mg and 100 mg daily in patients with biopsy-proven MASH and F1B, F2, or F3 fibrosis.\n• MASH Resolution with no worsening of fibrosis achieved in 25.9-29.9% of patients vs 9.7% on placebo (p<0.001).\n• Fibrosis Improvement by ≥1 stage with no worsening of NAFLD activity score achieved in 24.2-25.9% vs 14.2% on placebo (p<0.001).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Resmetirom (Rezdiffra) PO once daily:\n• Body weight < 100 kg: 80 mg PO once daily.\n• Body weight ≥ 100 kg: 100 mg PO once daily.\n• Administer with or without food.' },
              { title: 'Stepwise Management Algorithm', content: 'Indicated as an adjunct to diet and exercise for the treatment of adults with non-cirrhotic MASH with moderate-to-advanced liver fibrosis (consistent with stages F2 to F3). Monitor lipid panels and non-invasive fibrosis biomarkers (FIB-4, VCTE elastography).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Avoid concomitant use with strong CYP2C8 inhibitors (e.g., Gemfibrozil). Most common adverse events are mild-to-moderate diarrhea and nausea during treatment initiation.' },
              { title: 'Exact Reference & Guideline Citations', content: 'MAESTRO-NASH Phase 3 Trial (NEJM 2024); FDA Approval Summary for Resmetirom (March 2024).' }
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
    generalScope: 'Focus exclusively on severe systemic infections, sepsis, febrile illnesses, antibacterial stewardship, critical care resuscitation, and multi-drug resistance.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute sepsis bundles, septic shock, and fulminant infections',
        icon: 'warning',
        topics: [
          {
            id: 'sepsis',
            title: 'Sepsis & Septic Shock',
            subtitle: 'Surviving Sepsis 1-Hour Bundle, Vasopressors & Fluid Resuscitation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on sepsis, septic shock, Surviving Sepsis Campaign 1-hour bundle, crystalloid dosing, vasopressors, and lactate clearance.',
            illustration: require('../assets/images/topics/sepsis.jpg'),
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Fever or hypothermia (<36°C), tachycardia, tachypnea, altered mental status, mottling. Septic Shock Red Flags: Persistent hypotension requiring vasopressors to maintain MAP ≥65 mmHg AND serum lactate >2.0 mmol/L despite adequate fluid resuscitation.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Sepsis-3 Definition: Life-threatening organ dysfunction caused by a dysregulated host response to infection (SOFA score increase ≥2 points).\n• qSOFA Screening (≥2 points outside ICU): Respiratory rate ≥22/min, Altered mentation (GCS <15), Systolic BP ≤100 mmHg.\n• Full SOFA evaluates: PaO2/FiO2, Platelets, Bilirubin, MAP/Vasopressors, GCS, and Creatinine/Urine output.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• The Surviving Sepsis 1-Hour Bundle:\n  1. Measure Serum Lactate (remeasure within 2-4 hours if initial lactate >2.0 mmol/L).\n  2. Blood Cultures: 2 sets from different sites BEFORE starting antibiotics (do not delay antibiotics >45 mins if cultures delayed).\n  3. Broad-Spectrum IV Antibiotics: Administer within 1 hour of recognition (e.g. Vancomycin 15-20 mg/kg IV + Cefepime 2 g IV or Piperacillin-Tazobactam 4.5 g IV).\n  4. Rapid Fluid Resuscitation: 30 mL/kg of IV balanced crystalloid (Lactated Ringer’s) within 3 hours for hypotension or lactate ≥4.0 mmol/L.\n  5. First-Line Vasopressor: Norepinephrine infusion (0.05-0.5 mcg/kg/min, target MAP ≥65 mmHg).\n  6. Second-Line Vasopressor: Add Vasopressin 0.03 units/min fixed infusion (do NOT titrate) to reduce norepinephrine requirements.' },
              { title: 'Stepwise Management Algorithm', content: '1. Initiate dynamic measures of fluid responsiveness (passive leg raise test, stroke volume variation on arterial line) rather than static CVP.\n2. If MAP remains refractory to high-dose vasopressors, add IV Hydrocortisone 200 mg/day (50 mg IV q6h).\n3. De-escalate antibiotics at 48-72 hours based on culture sensitivities and clinical trajectory.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Avoid fluid overload after initial resuscitation. Once hemodynamically stabilized, transition to conservative fluid management (excess positive fluid balance increases ARDS risk, renal edema, and ICU mortality).' },
              { title: 'Exact Reference & Guideline Citations', content: 'Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021 (Critical Care Medicine / Intensive Care Medicine).' }
            ]
          },
          {
            id: 'meningitis_encephalitis',
            title: 'Acute Bacterial Meningitis',
            subtitle: 'Empiric Antibiotics, Dexamethasone & CT Head before LP Algorithm',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute bacterial meningitis, triad of fever/stiff neck/altered mental status, CT indications prior to lumbar puncture, and empiric antimicrobial regimens.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Classic Triad: Fever, nuchal rigidity, altered mental status. Red Flags: Petechial or purpuric rash (Meningococcemia), papilledema, focal neurologic deficits, new seizures, or GCS <10.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'CSF Analysis Findings (Bacterial Meningitis):\n• Opening Pressure: Elevated (>200 mmH2O)\n• WBC: 1,000 - 10,000 /µL (neutrophil predominance >80%)\n• Protein: Markedly elevated (>100-500 mg/dL)\n• Glucose: Low (CSF:serum glucose ratio <0.40)\n• Gram Stain & Bacterial PCR (BioFire FilmArray panel).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Adults (18-50 years): Ceftriaxone 2 g IV q12h + Vancomycin 15-20 mg/kg IV q8-12h.\n• Adults >50 years or Immunocompromised: Ceftriaxone 2 g IV q12h + Vancomycin 15-20 mg/kg + Ampicillin 2 g IV q4h (mandatory coverage for Listeria monocytogenes).\n• Adjunctive Dexamethasone: 10 mg IV administered with or 15-20 minutes BEFORE the first dose of antibiotics (continue 10 mg q6h for 4 days if Streptococcus pneumoniae is confirmed; discontinue if other pathogen).' },
              { title: 'Stepwise Management Algorithm', content: '1. Check CT Head indications prior to Lumbar Puncture: Immunocompromised, History of CNS disease, New seizure within 1 week, Papilledema, Focal neurological deficit, or Altered consciousness.\n2. If CT required: Draw blood cultures and immediately administer IV Dexamethasone and Antibiotics BEFORE sending patient to the CT scanner!' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'CRITICAL: Never delay antibiotic administration to obtain a CT scan or perform a lumbar puncture. Delaying antimicrobial therapy >2-3 hours in acute bacterial meningitis increases mortality and permanent neurologic disability significantly.' },
              { title: 'Exact Reference & Guideline Citations', content: '2024 ESCMID Guideline for the diagnosis and treatment of acute bacterial meningitis; IDSA Practice Guidelines for the Management of Bacterial Meningitis.' }
            ]
          },
          {
            id: 'necrotizing_fasciitis',
            title: 'Necrotizing Soft Tissue Infections',
            subtitle: 'LRINEC Score, Dishwater Pus & Emergent Surgical Debridement',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on necrotizing fasciitis, Type I polymicrobial vs Type II group A strep, LRINEC score, and emergent operative exploration.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Severe cutaneous pain disproportionate to visible physical exam findings (earliest hallmark). Red Flags: Rapid spread over hours, skin bullae, cutaneous anesthesia, bronze/purple discoloration, palpable crepitus, and septic shock.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• LRINEC Score (Laboratory Risk Indicator for Necrotizing Fasciitis):\n  Evaluates CRP (≥150), Total WBC (>15k or >25k), Hemoglobin (<13.5 or <11), Sodium (<135), Creatinine (>1.6), Glucose (>180). Score ≥6 raises suspicion; score ≥8 has >90% PPV.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Empiric Broad-Spectrum IV Antimicrobial Therapy:\n  1. Vancomycin 15-20 mg/kg IV q12h (or Daptomycin 8-10 mg/kg) PLUS\n  2. Meropenem 1 g IV q8h (or Piperacillin-Tazobactam 4.5 g q6h) PLUS\n  3. Clindamycin 900 mg IV q8h (essential antitoxin agent; shuts down ribosomal production of Group A Strep pyrogenic exotoxins and Staphylococcal PVL toxin).' },
              { title: 'Stepwise Management Algorithm', content: '1. IMMEDIATE surgical consultation for emergent operating room exploration and radical fascial debridement (the definitive diagnostic and therapeutic modality).\n2. "Dishwater" or foul-smelling fluid along fascial planes confirms diagnosis.\n3. Mandatory re-exploration in operating room at 24 hours ("second-look" debridement).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT delay surgical exploration for imaging (CT/MRI) or laboratory results if clinical suspicion is high. Necrotizing fasciitis travels along fascial planes faster than surface skin changes indicate; mortality increases every hour surgery is delayed.' },
              { title: 'Exact Reference & Guideline Citations', content: '2014 IDSA Practice Guidelines for the Diagnosis and Management of Skin and Soft Tissue Infections; 2018 World Society of Emergency Surgery (WSES) consensus guidelines.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'cap_pneumonia',
            title: 'Community-Acquired Pneumonia',
            subtitle: 'CURB-65 Severity Triage & ATS/IDSA Treatment Guidelines',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on CAP, CURB-65 triage, outpatient vs inpatient regimens, respiratory fluoroquinolones, and MRSA/Pseudomonas risk factors.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Fever, cough with purulent sputum, pleuritic chest pain, dyspnea, crackles. Red Flags: Severe hypoxemia (SpO2 <90%), confusion, hypotension, multilobar infiltrates on CXR, or respiratory rate ≥30/min.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• CURB-65 Score (1 point each):\n  - Confusion\n  - Urea (BUN >19 mg/dL or >7 mmol/L)\n  - Respiratory Rate ≥30/min\n  - Blood Pressure (SBP <90 or DBP ≤60 mmHg)\n  - Age ≥65 years\n• Triage: Score 0-1 = Outpatient; Score 2 = Inpatient general ward; Score ≥3 = High risk, consider ICU admission.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Outpatient (Healthy, No Comorbidities): Amoxicillin 1 g PO TID OR Doxycycline 100 mg PO BID x 5 days.\n• Outpatient (With Comorbidities: COPD, CHF, DM, CKD): Combination Amoxicillin-Clavulanate 875/125 mg PO BID + Azithromycin 500 mg Day 1 then 250 mg daily OR Respiratory Fluoroquinolone monotherapy (Levofloxacin 750 mg PO daily).\n• Inpatient (Non-Severe): Ceftriaxone 1-2 g IV daily + Azithromycin 500 mg IV/PO daily OR Levofloxacin 750 mg IV daily.\n• Inpatient (Severe / ICU): Ceftriaxone 2 g IV daily + Azithromycin 500 mg IV (or Levofloxacin). Add Vancomycin 15 mg/kg q12h and Cefepime 2 g q8h only if prior isolation or verified risk factors for MRSA/Pseudomonas.' },
              { title: 'Stepwise Management Algorithm', content: '1. Obtain CXR or non-contrast CT Chest.\n2. Inpatient blood and sputum cultures prior to antibiotics.\n3. Duration of Therapy: Minimum 5 days; discontinue when patient has been afebrile for ≥48 hours and clinically stable.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Routine coverage for anaerobes (aspiration pneumonia) is no longer recommended in CAP unless lung abscess or empyema is present. Procalcitonin should NOT be used to withhold initial antibiotic therapy in radiographically confirmed pneumonia.' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ATS/IDSA Clinical Practice Guideline on Community-Acquired Pneumonia.' }
            ]
          },
          {
            id: 'fuo',
            title: 'Fever of Unknown Origin',
            subtitle: 'Petersdorf Diagnostic Algorithm & PET-CT Strategy',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on classical Fever of Unknown Origin, diagnostic criteria, non-invasive workup workflow, and rheumatologic/infectious differentials.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Prolonged fever ≥38.3°C without localized signs. Red Flags: Weight loss, night sweats, new cardiac murmurs (endocarditis), temporal tenderness/vision loss in age >50 (Giant Cell Arteritis).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Classic Petersdorf & Beeson Criteria:\n1. Fever ≥ 38.3°C (101°F) on multiple occasions.\n2. Duration of illness ≥ 3 weeks.\n3. Failure to reach diagnosis after 1 week of comprehensive inpatient investigation (or 3 outpatient visits).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Empiric antibiotics or corticosteroids are contraindicated in stable FUO because they mask infectious cultures and delay definitive histologic diagnosis (withhold empiric therapy while workup is ongoing unless patient is hemodynamically unstable).' },
              { title: 'Stepwise Management Algorithm', content: '1. Phase 1 Workup: Blood cultures x3 from separate venipuncture sites, CBC with differential, ESR, CRP, Comprehensive Metabolic Panel, Urinalysis, HIV antigen/antibody, T-Spot/QuantiFERON TB, ANA, Rheumatoid Factor, CXR, and CT Chest/Abdomen/Pelvis.\n2. Phase 2: Transesophageal Echocardiogram (TEE) for occult endocarditis, viral serologies (CMV, EBV), Serum protein electrophoresis (SPEP/UPEP).\n3. Phase 3: 18F-FDG PET-CT scan (high diagnostic yield for occult large-vessel vasculitis, deep abscesses, and lymphomas).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Always perform a comprehensive medication review. Drug-induced fever (beta-lactams, sulfonamides, anticonvulsants, heparin) is a frequent cause of FUO that resolves within 72 hours of offending drug discontinuation.' },
              { title: 'Exact Reference & Guideline Citations', content: 'Harrison\'s Principles of Internal Medicine 21st Ed (Chapter on Fever of Unknown Origin); 2022 Journal of Internal Medicine FUO diagnostic consensus.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'antibiogram_interpretation',
            title: 'Antibiograms & PK/PD Dosing Targets',
            subtitle: 'MIC, CLSI Breakpoints, Extended Infusions & Time-Dependent Killing',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on institutional antibiograms, minimum inhibitory concentrations, beta-lactam extended infusions, and aminoglycoside peak/MIC monitoring.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Severe sepsis caused by MDR pathogens (Carbapenem-resistant Enterobacterales / CRE, ESBL, MRSA, or Pseudomonas aeruginosa). Under-dosing beta-lactams in augmented renal clearance (ARC in young septic trauma/ICU patients).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Minimum Inhibitory Concentration (MIC): The lowest antimicrobial concentration preventing visible bacterial growth.\n• Breakpoints (CLSI/EUCAST): Clinical categories (Susceptible, Intermediate, Resistant). Susceptibility is determined by comparing MIC to the established clinical breakpoint, NOT by the numerical value alone.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'PK/PD Optimization Strategies:\n• Time-Dependent Killing (Beta-lactams - Penicillins, Cephalosporins, Carbapenems):\n  Target: Time above MIC (%T > MIC) for 40-70% of dosing interval (100% in severe sepsis).\n  Optimization: Extended infusion (e.g. Piperacillin-Tazobactam 3.375-4.5 g infused over 4 hours q8h OR Cefepime 2 g infused over 4 hours q8h).\n• Concentration-Dependent Killing (Aminoglycosides, Daptomycin):\n  Target: High peak concentration (Cmax / MIC ≥8-10).\n  Optimization: Once-daily high-dose Gentamicin (5-7 mg/kg IV daily).' },
              { title: 'Stepwise Management Algorithm', content: '1. Select empiric regimens where local antibiogram susceptibility exceeds ≥85-90% for the targeted pathogen in critical illness.\n2. Therapeutic Drug Monitoring (TDM):\n  - Vancomycin: Target AUC24 / MIC ratio of 400-600 (trough levels 15-20 mcg/mL are obsolete due to nephrotoxicity risk; use Bayesian AUC software).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never compare MIC values across different antibiotic classes (e.g. an MIC of 2 for Vancomycin is borderline resistant, whereas an MIC of 2 for Cefepime represents high susceptibility). Always reference drug-specific CLSI breakpoints.' },
              { title: 'Exact Reference & Guideline Citations', content: '2020 IDSA/ASHP/SIDP Consensus Guidelines for Vancomycin TDM; CLSI M100 Performance Standards for Antimicrobial Susceptibility Testing.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'short_course_antibiotics',
            title: 'Short-Course Antibiotic Regimens',
            subtitle: 'Evidence from Multicenter Non-Inferiority RCTs ("Shorter is Better")',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on randomized controlled trials supporting shorter antibiotic durations in pneumonia, bacteremia, pyelonephritis, and intra-abdominal infections.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Over-prolonged antibiotic courses drive antimicrobial resistance, Clostridioides difficile colitis, and adverse drug events without improving clinical cure rates.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark Trial Evidence:\n• Community-Acquired Pneumonia (CAP): 3 to 5 days is non-inferior to 7-10 days once afebrile for ≥48 hours and clinically stable.\n• Uncomplicated Gram-Negative Bacteremia: 7 days is non-inferior to 14 days of therapy (JAMA 2019).\n• Uncomplicated Pyelonephritis: 5-7 days (Fluoroquinolones) or 7 days (Beta-lactams) is equivalent to 14 days.\n• Intra-Abdominal Infection (STOP-IT Trial): 4 days of antibiotics post-adequate source control achieved identical cure rates to 8-10 days (NEJM 2015).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Re-evaluate antibiotic duration daily. Discontinue antimicrobial therapy as soon as clinical stability criteria and protocolized duration are reached.' },
              { title: 'Stepwise Management Algorithm', content: 'Incorporate biomarker-guided stewardship: Discontinue antibiotics in lower respiratory tract infections when Procalcitonin drops by ≥80% from peak level or falls below <0.25-0.50 mcg/L.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Short courses apply only to uncomplicated infections with adequate source control. Deep-seated, non-drainable infections (e.g. S. aureus endocarditis, vertebral osteomyelitis, un-drained empyema) still require traditional prolonged 4-6 week regimens.' },
              { title: 'Exact Reference & Guideline Citations', content: 'STOP-IT Trial (NEJM 2015); JAMA 2019 Short-Course Bacteremia Trial; 2021 IDSA Guidance on Duration of Therapy for Common Infections.' }
            ]
          }
        ]
      }
    ]
  },

  neuro: {
    id: 'neuro',
    name: 'Neuro',
    scientificName: 'Neurology & Neurocritical Care',
    icon: 'pulse',
    color: '#7dac86',
    illustration: require('../assets/images/specialties/neurology.jpg'),
    generalScope: 'Focus exclusively on central and peripheral nervous system pathology, ischemic and hemorrhagic stroke, status epilepticus, neuromuscular emergencies, and neuroimaging.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute stroke, status epilepticus, SAH, and herniation',
        icon: 'warning',
        topics: [
          {
            id: 'stroke',
            title: 'Acute Ischemic Stroke',
            subtitle: 'tPA/TNK 4.5h Window, Mechanical Thrombectomy & Blood Pressure Parameters',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on acute ischemic stroke, NIHSS scoring, IV Alteplase/Tenecteplase inclusion/exclusion criteria, and mechanical thrombectomy up to 24 hours.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Sudden onset of focal neurological deficits: hemiparesis, facial droop, aphasia, hemianopia, ataxia. Code Stroke Activation. Red Flags: Rapid deterioration in GCS, pupillary asymmetry (uncal herniation), or malignant MCA syndrome with cerebral edema.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• National Institutes of Health Stroke Scale (NIHSS 0-42): Quantifies neurologic deficit.\n• Immediate Non-Contrast CT Head: Rules out intracerebral hemorrhage (ASPECTS score for early ischemic changes).\n• CT Angiography (CTA) Arch to Vertex: Identifies Large Vessel Occlusion (LVO: Internal Carotid, M1/M2 MCA, Basilar artery).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Intravenous Thrombolysis (Within 4.5 hours of last known normal):\n  1. Tenecteplase (TNK): 0.25 mg/kg IV single bolus over 5 seconds (max 25 mg) - preferred due to single bolus ease.\n  2. Alteplase (tPA): 0.9 mg/kg IV (max 90 mg; 10% given as initial 1-minute bolus, remainder infused over 60 minutes).\n• Strict BP Management (Prior to Thrombolytic):\n  - Target BP <185/110 mmHg BEFORE lytic, and maintain <180/105 mmHg for 24 hours post-lytic.\n  - Administer IV Labetalol 10-20 mg over 1-2 mins OR IV Nicardipine infusion 5-15 mg/hr.' },
              { title: 'Stepwise Management Algorithm', content: '1. Check fingerstick glucose immediately (rule out hypoglycemia).\n2. If eligible for IV lytic, administer without waiting for CTA or labs (unless on anticoagulants).\n3. Endovascular Thrombectomy (EVT): Indicated for anterior circulation LVO within 6 hours (standard) and up to 24 hours based on DAWN/DEFUSE-3 perfusion imaging criteria (CT perfusion mismatch).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'If patient is NOT a candidate for thrombolysis or thrombectomy, allow permissive hypertension up to 220/120 mmHg for the first 24-48 hours to maintain collateral cerebral perfusion (do NOT acutely lower BP unless >220/120 or concomitant ACS/aortic dissection).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 AHA/ASA Guidelines for the Early Management of Patients With Acute Ischemic Stroke; 2023 ESO Guidelines on Intravenous Thrombolysis for Acute Ischaemic Stroke.' }
            ]
          },
          {
            id: 'status_epilepticus',
            title: 'Status Epilepticus Protocol',
            subtitle: 'Phase 1 Benzodiazepines, Phase 2 ASMs & Refractory Anesthesia',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on status epilepticus, stepwise timeline (0-5, 5-20, 20-40 mins), benzodiazepines, non-sedating anti-seizure medications, and general anesthesia.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Continuous seizure activity lasting ≥5 minutes (t1 operational definition), or ≥2 discrete seizures without full recovery of consciousness between events. Red Flags: Hyperthermia, rhabdomyolysis, severe metabolic acidosis, non-convulsive status epilepticus (coma with subtle twitching).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clinical diagnosis. Continuous video-EEG monitoring is mandatory for all patients not returning to baseline within 10-15 minutes or those requiring general anesthesia.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Phase 1: Emergent First-Line (5-20 minutes - Benzodiazepines):\n  1. IV Lorazepam 4 mg IV bolus (0.1 mg/kg) over 2 mins (may repeat once at 5 mins) OR\n  2. IM Midazolam 10 mg IM (for body weight >40 kg; 5 mg for 13-40 kg) if no IV access OR\n  3. IV Diazepam 10 mg IV (0.15-0.2 mg/kg).\n• Phase 2: Urgent Control (20-40 minutes - Non-Sedating ASMs - ESETT Trial Regimens):\n  1. Levetiracetam (Keppra): 60 mg/kg IV (max 4500 mg) over 10 mins OR\n  2. Fosphenytoin: 20 mg PE/kg IV (max 1500 mg PE) at 150 mg PE/min OR\n  3. Valproate Sodium: 40 mg/kg IV (max 3000 mg) over 10 mins.' },
              { title: 'Stepwise Management Algorithm', content: '1. ABCs, high-flow oxygen, check glucose (give 50 mL D50W + 100 mg Thiamine IV if hypoglycemic).\n2. If seizures persist >40 minutes (Refractory Status Epilepticus): Proceed immediately to endotracheal intubation and continuous IV anesthetic infusions:\n  - Propofol 2-5 mg/kg load, then 2-10 mg/kg/hr infusion OR\n  - Midazolam 0.2 mg/kg load, then 0.05-2 mg/kg/hr infusion.\n3. Titrate anesthesia to electrographic burst suppression (8-12 seconds of suppression between bursts) on continuous EEG for 24-48 hours.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Under-dosing benzodiazepines is the single most common provider error in status epilepticus (e.g. giving only 1-2 mg Lorazepam instead of full 4 mg adult dose). Under-dosing leads to treatment failure and increases progression to refractory status epilepticus.' },
              { title: 'Exact Reference & Guideline Citations', content: '2016 American Epilepsy Society (AES) Guideline for Treatment of Status Epilepticus; ESETT Trial (NEJM 2019).' }
            ]
          },
          {
            id: 'subarachnoid_hemorrhage',
            title: 'Subarachnoid Hemorrhage',
            subtitle: 'Ottawa Rule, Hunt & Hess, Nimodipine & Vasospasm Prevention',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on aneurysmal subarachnoid hemorrhage, Ottawa SAH rule, non-contrast CT head, lumbar puncture xanthochromia, and nimodipine.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Classic "Thunderclap headache" (worst headache of life, reaching peak intensity in <1 minute). Red Flags: Syncope, neck stiffness, cranial nerve III palsy (pupil-involving, indicates posterior communicating artery aneurysm), seizures, or sudden coma.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Ottawa SAH Rule: High sensitivity for alert headache patients (Age ≥40, neck pain/stiffness, witnessed loss of consciousness, onset during exertion, thunderclap onset, limited neck flexion).\n• Diagnostic Strategy:\n  1. Non-contrast CT Head: >99% sensitive within 6 hours of headache onset.\n  2. Lumbar Puncture (LP): Mandatory if CT negative/equivocal >6 hours from onset. Confirmed by Xanthochromia (spectrophotometry) or elevated RBC count that does not clear between Tube 1 and Tube 4.\n• Severity: Hunt and Hess Scale (Grades 1-5) and Fisher Grade on CT.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Oral Nimodipine: 60 mg PO (or via NG tube) every 4 hours for 21 consecutive days (reduces delayed cerebral ischemia/vasospasm and improves neurological outcomes; do NOT give IV).\n• Blood Pressure Control (Prior to Aneurysm Securing): Target SBP <140-160 mmHg using IV Nicardipine or Labetalol.\n• Antifibrinolytic (Short-term bridge): Tranexamic Acid (TXA) 1 g IV bolus may be considered prior to aneurysm repair if transfer delayed (<24h max).' },
              { title: 'Stepwise Management Algorithm', content: '1. Emergent neurosurgical / neurointerventional consultation for aneurysm securing (endovascular coiling or surgical clipping within 24 hours).\n2. Place in neuro-ICU: Maintain euvolemia (avoid prophylactic hypervolemia), monitor daily Transcranial Doppler (TCD) for vasospasm (days 4-14).\n3. Treat Delayed Cerebral Ischemia (DCI): Induced hypertension (raise MAP using norepinephrine) and catheter-directed intra-arterial vasodilators (Verapamil/Milrinone).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer Nimodipine intravenously (fatal cardiovascular collapse from massive vasodilation). If capsule contents are drawn up for NG tube administration, use an oral syringe clearly labeled "FOR ORAL USE ONLY - NOT FOR IV INJECTION".' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 AHA/ASA Guideline for the Management of Patients With Aneurysmal Subarachnoid Hemorrhage; 2024 Neurocritical Care Society Guidelines.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'migraine_headache',
            title: 'Migraine & Primary Headache Disorders',
            subtitle: 'ICHD-3 Criteria, Triptans, Gepants & CGRP Monoclonals',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on migraine diagnosis, acute abortive therapies (triptans, gepants), and preventive therapies (CGRP monoclonals, topiramate, beta blockers).',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Pulsatile, unilateral headache lasting 4-72 hours with nausea, photophobia, and phonophobia. Red Flags (SNOOP10 criteria): Systemic symptoms (fever, weight loss), Neurologic deficits, Onset sudden (thunderclap), Older age (>50 new onset), Pattern change, Positional aggravation, Papilledema.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'ICHD-3 Diagnostic Criteria for Migraine without Aura:\n≥5 attacks lasting 4-72 hours, with ≥2 features (unilateral, pulsating, moderate/severe, aggravated by routine activity) AND ≥1 associated symptom (nausea/vomiting OR photophobia and phonophobia).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Acute Abortive Therapy (Take at earliest onset of pain):\n  1. Triptan: Sumatriptan 50-100 mg PO (or 6 mg SC) OR Rizatriptan 10 mg PO (combine with Naproxen 500 mg PO for synergistic efficacy).\n  2. Oral Gepant (CGRP Antagonist - Safe in Vascular Disease): Rimegepant 75 mg PO or Ubrogepant 50-100 mg PO.\n• Preventive Therapy (Indicated for ≥4 headache days/month or disabling attacks):\n  1. Oral First-Line: Topiramate 25-100 mg daily, Propranolol 40-160 mg daily, or Amitriptyline 10-50 mg qhs.\n  2. Targeted CGRP Monoclonal Antibodies: Erenumab 70-140 mg SC monthly, Fremanezumab 225 mg SC monthly, or Galcanezumab 120 mg SC monthly.' },
              { title: 'Stepwise Management Algorithm', content: '1. Establish headache diary and rule out Medication Overuse Headache (MOH: acute abortives used ≥10-15 days/month).\n2. Initiate preventive therapy if acute medications required >2 days/week.\n3. Re-evaluate preventive efficacy at 8-12 weeks.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Triptans and Ergotamines are strictly contraindicated in patients with coronary artery disease, history of myocardial infarction, stroke/TIA, peripheral vascular disease, or uncontrolled hypertension due to coronary and systemic vasoconstriction (prescribe Gepants or Lasmiditan instead).' },
              { title: 'Exact Reference & Guideline Citations', content: 'The International Classification of Headache Disorders 3rd edition (ICHD-3); 2021 American Headache Society (AHS) Consensus Statement on Integrating New Migraine Treatments.' }
            ]
          },
          {
            id: 'parkinsons_disease',
            title: 'Parkinson Disease & Movement Disorders',
            subtitle: 'TRAP Cardinal Signs, Levodopa Optimization & Motor Fluctuations',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Parkinson disease motor features, initial pharmacotherapy (Levodopa vs dopamine agonists), wearing-off phenomena, and dyskinesias.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Asymmetric resting tremor, bradykinesia, rigidity. Red Flags (Parkinson-Plus Syndromes): Early falls (<1 year - PSP), severe autonomic failure (Multiple System Atrophy / MSA), poor levodopa response, or early visual hallucinations/dementia (Dementia with Lewy Bodies).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'MDS Clinical Diagnostic Criteria: Bradykinesia PLUS at least one of: 1. 4-6 Hz resting "pill-rolling" tremor; 2. Rigidity (lead-pipe or cogwheel); 3. Postural instability. Supported by substantial response to dopaminergic therapy and levodopa-induced dyskinesias.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Levodopa/Carbidopa (Sinemet): 25/100 mg PO TID initial, titrate gradually to symptom relief (most effective symptomatic drug for all ages).\n• Dopamine Agonists (Pramipexole 0.125-1.5 mg TID or Ropinirole 0.25-8 mg TID) or MAO-B Inhibitors (Rasagiline 0.5-1 mg daily): Alternative initial options in young patients (<60 years) to delay motor fluctuations.' },
              { title: 'Stepwise Management Algorithm', content: '1. Managing "Wearing-Off" (end-of-dose deterioration):\n  - Increase Levodopa dosing frequency or switch to extended-release.\n  - Add COMT Inhibitor (Entacapone 200 mg with each Levodopa dose) or MAO-B inhibitor.\n2. Managing Peak-Dose Dyskinesia: Reduce individual Levodopa doses or add Amantadine (100 mg BID/TID).\n3. Advanced/Refractory Disease: Evaluate for Deep Brain Stimulation (DBS of Subthalamic Nucleus or GPi) or Levodopa-Carbidopa intestinal gel (LCIG / Duopa).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never abruptly discontinue Levodopa or dopaminergic medications (triggers Parkinsonism-Hyperpyrexia Syndrome, a life-threatening state identical to Neuroleptic Malignant Syndrome with rigidity, hyperthermia, rhabdomyolysis, and autonomic collapse).' },
              { title: 'Exact Reference & Guideline Citations', content: 'Movement Disorder Society (MDS) Clinical Diagnostic Criteria for Parkinson\'s Disease; 2021 AAN Practice Guideline on Parkinson Disease Motor Symptoms.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'nihss_gcs_scoring',
            title: 'Neurologic Assessment Scales (NIHSS & GCS)',
            subtitle: 'Standardized Neurological Deficit Scoring & Coma Triage',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on National Institutes of Health Stroke Scale scoring (0-42) and Glasgow Coma Scale breakdown for acute triage.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'NIHSS ≥25 indicates very severe stroke. GCS ≤8 defines severe brain injury/coma and represents the universal threshold for endotracheal intubation ("GCS of 8, intubate").' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• NIH Stroke Scale (NIHSS 0-42 Item Breakdown):\n  1a/1b/1c: Level of Consciousness (0-3, 0-2, 0-2)\n  2: Best Gaze (0-2)\n  3: Visual Fields (0-3)\n  4: Facial Palsy (0-3)\n  5a/5b: Motor Arm Left/Right (0-4 each)\n  6a/6b: Motor Leg Left/Right (0-4 each)\n  7: Limb Ataxia (0-2)\n  8: Sensory (0-2)\n  9: Best Language / Aphasia (0-3)\n  10: Dysarthria (0-2)\n  11: Extinction & Inattention (0-2).\n• Glasgow Coma Scale (GCS 3-15):\n  - Eyes (1-4): 4 Spontaneous, 3 To sound, 2 To pressure, 1 None.\n  - Verbal (1-5): 5 Oriented, 4 Confused, 3 Inappropriate words, 2 Incomprehensible sounds, 1 None.\n  - Motor (1-6): 6 Obeys commands, 5 Localizes, 4 Normal flexion, 3 Abnormal flexion (decorticate), 2 Extension (decerebrate), 1 None.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Scoring Tool).' },
              { title: 'Stepwise Management Algorithm', content: 'Perform serial NIHSS examinations (at baseline, 2 hours post-thrombolytic, 24 hours, and upon any acute change). A ≥4-point increase in NIHSS signifies acute stroke worsening, re-occlusion, or hemorrhagic transformation, prompting urgent stat CT head.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Score what the patient actually does, NOT what you think they can do. Never coach or assist the patient during standardized scoring.' },
              { title: 'Exact Reference & Guideline Citations', content: 'National Institute of Neurological Disorders and Stroke (NINDS) NIHSS Protocol; Teasdale G, Jennett B. Assessment of coma and impaired consciousness (Lancet 1974).' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'anti_amyloid_mabs',
            title: 'Anti-Amyloid Monoclonal Antibodies in Alzheimer Disease',
            subtitle: 'Lecanemab, Donanemab & ARIA Surveillance Protocols',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on disease-modifying therapies in early Alzheimer disease, Phase 3 trials (Clarity AD, TRAILBLAZER-ALZ 2), and ARIA monitoring.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Amyloid-Related Imaging Abnormalities (ARIA): ARIA-E (vasogenic edema/sulcal effusions) and ARIA-H (microhemorrhages and superficial siderosis). Highest risk occurs in APOE ε4 homozygotes.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Phase 3 Landmark Trials:\n• Clarity AD (Lecanemab - NEJM 2023): Slowed clinical cognitive and functional decline on CDR-SB by 27% at 18 months in early Alzheimer\'s disease (MCI or mild dementia with confirmed amyloid pathology).\n• TRAILBLAZER-ALZ 2 (Donanemab - JAMA 2023): Slowed clinical progression by 35% on iADRS score in low-medium tau population.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Lecanemab (Leqembi): 10 mg/kg IV infusion every 2 weeks.\n• Donanemab (Kisunla): 700 mg IV q4w for 3 doses, then 1400 mg IV q4w until amyloid plaque clearance on PET.' },
              { title: 'Stepwise Management Algorithm', content: '1. Confirm amyloid pathology via Amyloid PET scan or CSF biomarkers (Aβ42/Aβ40 ratio and p-tau181).\n2. APOE Genotyping: Mandatory counseling and testing before initiation.\n3. Safety Brain MRI Monitoring: Required at baseline, and prior to the 5th, 7th, and 14th infusions (weeks 9, 12, and 52) to detect asymptomatic ARIA.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Hold infusions if moderate-to-severe ARIA-E or symptomatic ARIA develops. Caution with concurrent anticoagulation (increased risk of fatal intracerebral macrohemorrhage).' },
              { title: 'Exact Reference & Guideline Citations', content: 'Clarity AD Trial (NEJM 2023); TRAILBLAZER-ALZ 2 (JAMA 2023); 2023 Appropriate Use Recommendations for Lecanemab.' }
            ]
          }
        ]
      }
    ]
  },

  skin: {
    id: 'skin',
    name: 'Skin',
    scientificName: 'Dermatology & Cutaneous Medicine',
    icon: 'body',
    color: '#9d97ca',
    illustration: require('../assets/images/specialties/dermatology.jpg'),
    generalScope: 'Focus exclusively on dermatologic diseases, severe cutaneous adverse reactions, inflammatory dermatoses, skin oncology, and dermoscopy.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'SJS/TEN, erythroderma, DRESS, and dermatologic collapse',
        icon: 'warning',
        topics: [
          {
            id: 'scar',
            title: 'Severe Cutaneous Adverse Reactions (SJS / TEN)',
            subtitle: 'SCORTEN Prognostic Scale, Culprit Drugs & Burn Center Protocol',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on SJS, TEN, SJS/TEN overlap, Nikolsky sign, high-risk medications, SCORTEN mortality scoring, and ICU/Burn unit transfer.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Prodromal fever and malaise followed by painful, dusky erythematous macules coalescing into flaccid bullae and epidermal detachment. Red Flags: Positive Nikolsky sign (sheet-like epidermal sloughing with gentle lateral pressure), involvement of ≥2 mucosal sites (oral stomatitis, severe conjunctivitis, genital erosions).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Classification by Body Surface Area (BSA) Detachment:\n• SJS: <10% BSA detachment\n• SJS/TEN Overlap: 10-30% BSA detachment\n• TEN: >30% BSA detachment\n• SCORTEN Prognostic Score (Calculated on Day 1 & 3, 1 pt each): Age ≥40, Heart rate ≥120, Malignancy, BSA detached >10%, Serum Urea >28 mg/dL (BUN >10 mmol/L), Serum Glucose >250 mg/dL, Bicarbonate <20 mEq/L. Score ≥5 indicates >90% mortality.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Immediate withdrawal of ALL suspected culprit drugs (common culprits: Allopurinol, Lamotrigine, Carbamazepine, TMP-SMX, Nevirapine, NSAIDs).\n• Supportive ICU/Burn Unit Care: Ambient temperature warming (30-32°C), non-adherent silicone dressings, aggressive fluid resuscitation (target urine output 0.5-1 mL/kg/hr).\n• Immunomodulatory Therapies (Specialist Directed):\n  1. Cyclosporine 3-5 mg/kg/day PO/IV in divided doses for 10-14 days OR\n  2. High-dose IVIG (2-3 g/kg total over 3-4 days) OR Etanercept 50 mg SC.' },
              { title: 'Stepwise Management Algorithm', content: '1. Emergent transfer to specialized Burn Center or Dermatologic ICU.\n2. Emergent Ophthalmology consultation (daily amniotic membrane transplantation or lubricating drops to prevent permanent cicatricial blindness).\n3. Strict barrier nursing and sterile wound handling without aggressive debridement.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT aggressively scrub or mechanically debride detached epidermis (the detached blister roof acts as a biological dressing; leave in place and cover with non-adherent petroleum/silicone gauze). Avoid prophylactic systemic antibiotics (increases resistant infections).' },
              { title: 'Exact Reference & Guideline Citations', content: '2021 British Association of Dermatologists guidelines for the management of Stevens-Johnson syndrome/toxic epidermal necrolysis; SCORTEN Validation Consensus.' }
            ]
          },
          {
            id: 'erythroderma',
            title: 'Exfoliative Erythroderma',
            subtitle: 'Red Man Syndrome, Metabolic Collapse & Underlying Etiologies',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on exfoliative erythroderma (>90% BSA), thermoregulatory failure, high-output cardiac failure, and etiology differential.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Generalized erythema and scaling involving >90% of total body surface area. Red Flags: Severe hypothermia (from cutaneous vasodilation), high-output heart failure (tachycardia, peripheral edema), profound protein-losing enteropathy/exfoliation, and secondary sepsis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clinical diagnosis (>90% BSA). Etiology Breakdown:\n1. Pre-existing dermatoses (~50%: Psoriasis, Atopic Dermatitis, Seborrheic Dermatitis).\n2. Drug hypersensitivity reactions (~20%: Anticonvulsants, Allopurinol, Antibiotics).\n3. Cutaneous T-Cell Lymphoma / Sézary Syndrome (~15%: check peripheral smear for Sézary cells and flow cytometry for CD4/CD8 ratio >10).\n4. Idiopathic (~15%).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Inpatient Supportive Care: Warm ambient room temperature, fluid/electrolyte repletion, high-protein nutrition.\n• Bland Topical Emollients: Copious white petrolatum under wet wraps.\n• Systemic Medical Therapy: Treat underlying etiology once identified (e.g. Cyclosporine or Acitretin for erythrodermic psoriasis; Dupilumab for severe atopic dermatitis).' },
              { title: 'Stepwise Management Algorithm', content: '1. Discontinue all non-essential medications.\n2. Obtain multiple skin punch biopsies from distinct sites.\n3. Screen for secondary bacterial superinfections (Staph aureus bacteremia).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Avoid systemic corticosteroids in suspected psoriatic erythroderma (steroids provide rapid clearance but trigger life-threatening rebound generalized pustular psoriasis upon tapering). Avoid potent topical steroids over >90% BSA to prevent systemic HPA-axis suppression.' },
              { title: 'Exact Reference & Guideline Citations', content: 'Fitzpatrick\'s Dermatology in General Medicine 9th Ed; 2020 JAAD Consensus on Management of Erythroderma.' }
            ]
          },
          {
            id: 'dress_syndrome',
            title: 'DRESS Syndrome (Drug Reaction with Eosinophilia)',
            subtitle: 'RegiSCAR Criteria, Organ Involvement & Corticosteroid Taper',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on Drug Reaction with Eosinophilia and Systemic Symptoms, RegiSCAR scoring, hepatic/renal/cardiac involvement, and systemic steroid regimens.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Extensive morbilliform eruption developing 2-8 weeks AFTER drug initiation, high fever (>38.5°C), and facial edema. Red Flags: Fulminant acute hepatitis (ALT >5x ULN), acute interstitial nephritis, myocarditis (cardiogenic shock), or pneumonitis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'RegiSCAR Diagnostic Criteria (Score ≥5 = Definite DRESS):\n1. Hospitalization due to reaction.\n2. Acute rash suggestive of DRESS.\n3. Fever >38.5°C.\n4. Lymphadenopathy in ≥2 sites.\n5. Involvement of ≥1 internal organ.\n6. Atypical lymphocytes or Eosinophilia (≥0.7 x 10⁹/L or ≥10%).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Immediate withdrawal of culprit medication (common: Allopurinol, Carbamazepine, Phenytoin, Lamotrigine, Vancomycin, Sulfasalazine).\n• Systemic Corticosteroids: Oral Prednisone 0.5-1.0 mg/kg/day (or IV Methylprednisolone in severe organ failure). Very slow taper over 8-12 weeks to prevent fatal rebound flares.\n• Refractory Organ Disease: Add IVIG (2 g/kg over 5 days) or Cyclosporine (3-5 mg/kg/day) or Tofacitinib.' },
              { title: 'Stepwise Management Algorithm', content: '1. Baseline and serial monitoring: LFTs, Serum Creatinine, CBC with differential, Troponin, and CXR.\n2. Screen for viral reactivation (HHV-6, HHV-7, EBV, CMV PCR) which characteristically drives delayed clinical flares.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Tapering corticosteroids too quickly (<6-8 weeks) frequently causes catastrophic relapse of hepatitis and myocarditis. Counsel patient NEVER to take the offending drug class again (high risk of fatal recurrence).' },
              { title: 'Exact Reference & Guideline Citations', content: 'RegiSCAR Group Guidelines; 2023 JAAD Practice Guideline for DRESS Management.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'psoriasis_vulgaris',
            title: 'Psoriasis Vulgaris & Psoriatic Arthritis',
            subtitle: 'PASI Scoring, Topical Synergies, Systemic Agents & Biologics',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on plaque psoriasis, PASI scoring, topicals (steroids + vitamin D), systemic conventional agents, and targeted biologics (IL-17, IL-23, TNF).',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Well-demarcated erythematous plaques with thick, silvery-white micaceous scales on elbows, knees, scalp, and lumbosacral region. Red Flags: Concomitant Psoriatic Arthritis (dactylitis "sausage digit", enthesitis, inflammatory back pain) which requires systemic therapy to prevent irreversible joint destruction.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clinical diagnosis. Auspitz sign (punctate bleeding upon scale removal) and Koebner phenomenon. Psoriasis Area and Severity Index (PASI 0-72) and Body Surface Area (BSA: <3% mild, 3-10% moderate, >10% severe).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Mild Disease (<3-5% BSA):\n  1. High-potency Topical Corticosteroid (Clobetasol propionate 0.05% ointment) combined with Vitamin D3 analogue (Calcipotriene 0.005%) applied BID for 2-4 weeks.\n  2. Topical Calcineurin Inhibitors (Tacrolimus 0.1%) or Roflumilast 0.3% cream for facial/intertriginous areas.\n• Moderate-to-Severe Disease (>10% BSA or Psoriatic Arthritis):\n  1. Anti-IL-23 Biologics (High Efficacy): Risankizumab 150 mg SC at W0, W4, then q12w OR Guselkumab 100 mg SC.\n  2. Anti-IL-17 Biologics (Rapid Clearance): Ixekizumab 160 mg load then 80 mg q2w to W12 then q4w OR Secukinumab 300 mg.\n  3. Oral Small Molecule: Apremilast 30 mg PO BID or Deucravacitinib 6 mg PO daily.' },
              { title: 'Stepwise Management Algorithm', content: '1. Screen all psoriasis patients for metabolic syndrome, cardiovascular risk, and psoriatic arthritis (PEST screening tool).\n2. For moderate-to-severe disease: Biologics achieve PASI 90/100 (90-100% skin clearance) in >70-80% of patients.\n3. Mandatory pre-biologic screening: Tuberculosis (IGRA), Hepatitis B/C, and HIV.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'NEVER administer oral systemic corticosteroids (Prednisone) for plaque psoriasis (tapering triggers life-threatening rebound generalized pustular psoriasis or erythroderma).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 AAD-NPF Guidelines of care for the management of psoriasis with biologics; 2021 AAD-NPF Guidelines for topical and systemic psoriasis therapies.' }
            ]
          },
          {
            id: 'atopic_dermatitis',
            title: 'Atopic Dermatitis (Eczema)',
            subtitle: 'Barrier Repair, Topical Calcineurin Inhibitors, Dupilumab & JAK Inhibitors',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on atopic dermatitis pathogenesis, Hanifin and Rajka criteria, skin barrier restoration, Dupilumab, and oral JAK inhibitors.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Intense pruritus ("the itch that rashes"), xerosis, erythematous papules, and lichenification in flexural folds. Red Flags: Eczema Herpeticum (sudden eruption of punched-out umbilicated vesicles caused by HSV-1 superinfection; emergency requiring oral/IV Acyclovir).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Hanifin & Rajka Diagnostic Criteria (Requires ≥3 major criteria: Pruritus, Typical morphology/distribution, Chronic/relapsing dermatitis, Personal/family history of atopy). EASI Score (Eczema Area and Severity Index 0-72).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Foundational Barrier Therapy: Thick ceramide-rich ointments/creams (petrolatum) applied immediately after lukewarm bathing (within 3 minutes).\n• Topical Anti-inflammatory Therapy:\n  1. Mid-to-High Potency Topical Corticosteroids (Triamcinolone 0.1% or Betamethasone 0.05%) for acute flares.\n  2. Topical Calcineurin Inhibitor (Tacrolimus 0.03-0.1% ointment) or Topical PDE4 inhibitor (Crisaborole 2%) or Topical JAK inhibitor (Ruxolitinib 1.5% cream) for steroid-free maintenance.\n• Moderate-to-Severe Systemic Therapy:\n  1. Dupilumab (IL-4Rα antagonist): 600 mg SC loading dose, then 300 mg SC every 2 weeks.\n  2. Tralokinumab (IL-13 antagonist): 600 mg SC load, then 300 mg SC q2w.\n  3. Oral JAK-1 Inhibitors (Rapid Itch Relief): Upadacitinib 15-30 mg PO daily or Abrocitinib 100-200 mg PO daily.' },
              { title: 'Stepwise Management Algorithm', content: '1. Optimize daily emollient barrier restoration and avoid harsh soaps.\n2. Use proactive twice-weekly topical steroid/tacrolimus application on previously affected skin to prevent relapses.\n3. Escalate to Dupilumab or JAK inhibitors for refractory moderate-to-severe disease.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT rely on chronic systemic steroids for eczema maintenance (causes severe rebound flares and long-term toxicity). Promptly treat secondary bacterial superinfections (Staph aureus impetiginization with honey-colored crusts; treat with oral Cephalexin or topical Mupirocin).' },
              { title: 'Exact Reference & Guideline Citations', content: '2024 AAD Guidelines of care for the management of atopic dermatitis with topical therapies; 2023 AAD Guidelines for systemic therapies in atopic dermatitis.' }
            ]
          },
          {
            id: 'acne_rosacea_management',
            title: 'Acne Vulgaris & Rosacea',
            subtitle: 'Topical Retinoids, Fixed Combinations, Oral Isotretinoin & Subtypes',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on acne grading, topical retinoids, benzoyl peroxide, oral isotretinoin protocol, and rosacea subtype management.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Comedonal vs Inflammatory papulopustular vs Nodulocystic acne with scarring. Red Flags: Severe scarring, psychosocial distress, and Acne Fulminans (sudden ulcerating acne with systemic fever, arthralgias, and leukocytosis).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clinical grading based on predominant lesion type: Mild (comedones and few papules), Moderate (numerous papules and pustules), Severe (extensive inflammatory nodules, cysts, and sinus tracts).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Mild Acne: Topical Retinoid (Adapalene 0.1-0.3% or Tretinoin 0.025-0.05%) + Benzoyl Peroxide (BPO 2.5-5%) gel daily.\n• Moderate Acne: Fixed Combination (Adapalene + BPO + Topical Clindamycin 1%) PLUS Oral Doxycycline 100 mg PO daily (limit course to 3-4 months to prevent resistance).\n• Severe / Scarring / Refractory Acne: Oral Isotretinoin 0.5-1.0 mg/kg/day PO in 2 divided doses with fatty meals to reach cumulative target dose of 120-150 mg/kg.\n• Rosacea Subtypes:\n  - Erythematotelangiectatic: Topical Brimonidine 0.33% gel or Oxymetazoline 1% cream.\n  - Papulopustular: Topical Ivermectin 1% cream daily OR Oral sub-antimicrobial Doxycycline 40 mg daily.' },
              { title: 'Stepwise Management Algorithm', content: '1. Always combine topical antibiotics with Benzoyl Peroxide to prevent bacterial resistance.\n2. Isotretinoin Protocol: Mandatory dual contraception (iPLEDGE program), baseline and monthly fasting lipids, liver enzymes, and pregnancy tests.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Isotretinoin is a potent teratogen (causes severe craniofacial, cardiac, and CNS fetal malformations); strictly enforce negative pregnancy testing before each 30-day refill. Never combine Isotretinoin with oral Tetracyclines (causes Pseudotumor Cerebri / Idiopathic Intracranial Hypertension).' },
              { title: 'Exact Reference & Guideline Citations', content: '2024 AAD Guidelines of care for the management of acne vulgaris; 2019 National Rosacea Society Expert Committee ROSCO consensus.' }
            ]
          },
          {
            id: 'bullous_disorders',
            title: 'Autoimmune Bullous Diseases',
            subtitle: 'Bullous Pemphigoid vs Pemphigus Vulgaris & Direct Immunofluorescence',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on differentiating Bullous Pemphigoid from Pemphigus Vulgaris, anti-BP180/230 vs anti-desmoglein 1/3, and Rituximab therapy.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Tense blisters vs flaccid blisters with mucosal erosions. Red Flags: Massive fluid loss, secondary septicemia, extensive oral stomatitis preventing nutrition, positive Nikolsky sign.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Bullous Pemphigoid (BP - Elderly): Tense, subepidermal bullae on urticarial base, negative Nikolsky sign, minimal mucosal involvement. Direct Immunofluorescence (DIF): Linear IgG and C3 along basement membrane zone (anti-BP180 and anti-BP230 ELISA).\n• Pemphigus Vulgaris (PV - Middle aged): Flaccid, intraepidermal blisters that rupture easily leaving painful erosions, positive Nikolsky sign, extensive oral mucosal ulceration. DIF: "Fishnet" or "chicken-wire" intercellular IgG throughout epidermis (anti-Desmoglein 3 and 1 ELISA).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Bullous Pemphigoid First-Line: High-potency Topical Corticosteroid (Clobetasol propionate 0.05% cream 20-30 g/day applied to entire body) - superior efficacy and lower mortality compared to high-dose oral steroids.\n• Pemphigus Vulgaris First-Line: Rituximab (anti-CD20) 1000 mg IV on Day 1 and Day 15, combined with oral Prednisone 1 mg/kg/day (tapered rapidly over 6 months).' },
              { title: 'Stepwise Management Algorithm', content: '1. Obtain 2 biopsies: One lesional punch biopsy for Routine H&E Histology, and one perilesional punch biopsy (normal skin within 1 cm of blister) in Michel’s medium for Direct Immunofluorescence.\n2. Confirm antibody titers with serum ELISA.\n3. Add steroid-sparing agents (Azathioprine, Mycophenolate Mofetil, or Dapsone).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never place the Direct Immunofluorescence (DIF) biopsy specimen in standard Formalin (formalin destroys tissue antibodies and invalidates immunofluorescence testing; always use Michel’s transport solution or Zeus fixative).' },
              { title: 'Exact Reference & Guideline Citations', content: '2020 EADV Guidelines for the management of pemphigus vulgaris and pemphigus foliaceus; 2022 EADV Guidelines for bullous pemphigoid.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'dermoscopy_fundamentals',
            title: 'Dermoscopy & Melanoma Evaluation',
            subtitle: 'ABCDE Clinical Rule, Chaos and Clues & Two-Step Algorithm',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on dermoscopic evaluation, differentiating melanocytic vs non-melanocytic lesions, pigment networks, and dermoscopic signs of melanoma.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Any pigmented skin lesion with the "Ugly Duckling" sign (looks distinctly different from the patient\'s background nevus pattern), rapid evolution, asymmetrical borders, or dark black/blue-white colors.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Clinical ABCDE Rule for Melanoma:\n  - A: Asymmetry (in one or two axes)\n  - B: Border irregularity (scalloped, notched, poorly defined)\n  - C: Color variation (≥2 colors: tan, brown, black, red, white, blue)\n  - D: Diameter (>6 mm; though melanomas can be smaller)\n  - E: Evolving (change in size, shape, color, or new symptoms - most sensitive clinical clue).\n• Two-Step Dermoscopy Algorithm:\n  - Step 1: Melanocytic features present (pigment network, aggregated globules, branched streaks, or homogeneous blue color)?\n  - Step 2: If melanocytic, check for Melanoma Clues (atypical pigment network with thick lines, irregular dots/globules at periphery, asymmetric blotches, blue-white veil, polymorphous/atypical linear vessels).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool). Diagnostic excision required for suspicious lesions.' },
              { title: 'Stepwise Management Algorithm', content: '1. Perform full-body cutaneous examination under polarized and non-polarized dermoscopy.\n2. Suspicious for Melanoma: Complete narrow-margin (1-3 mm) excisional biopsy down to subcutaneous fat (do NOT perform superficial shave biopsy that transects the base, preventing Breslow depth measurement).\n3. Re-excision margins based on Breslow Depth:\n  - Melanoma In Situ: 5 mm margin\n  - Breslow <1 mm: 1 cm surgical margin\n  - Breslow 1-2 mm: 1-2 cm surgical margin + Sentinel Lymph Node Biopsy\n  - Breslow >2 mm: 2 cm surgical margin + Sentinel Lymph Node Biopsy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT perform cryotherapy or superficial shave biopsy on an undiagnosed pigmented lesion suspicious for melanoma. Accurate histopathologic staging requires complete excision to measure maximal vertical tumor thickness (Breslow depth).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 NCCN Clinical Practice Guidelines in Oncology: Melanoma (Cutaneous); 2019 AAD Guidelines for the management of primary cutaneous melanoma.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'jak_inhibitors_dermatology',
            title: 'JAK Inhibitors in Alopecia Areata & Vitiligo',
            subtitle: 'Baricitinib, Ritlecitinib & Ruxolitinib Cream Breakthroughs',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on Janus kinase inhibitors in immune-mediated dermatoses, FDA approvals in severe alopecia areata and non-segmental vitiligo.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Severe autoimmune hair loss (>50% scalp loss) and progressive vitiligo causing profound psychosocial morbidity.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Phase 3 Clinical Trial Evidence:\n• BRAVE-AA1/2 & ALLEGRO Trials: Oral Baricitinib (JAK1/2) and Ritlecitinib (JAK3/TEC) achieved ≥80% scalp hair coverage (SALT score ≤20) in ~35-40% of patients with severe alopecia areata at 36-52 weeks.\n• TRuE-V1/V2 Trials (NEJM 2022): Topical Ruxolitinib 1.5% cream (JAK1/2 inhibitor) achieved ≥75% facial repigmentation (F-VASI75) in ~50% of vitiligo patients at 52 weeks by halting IFN-gamma mediated melanocyte destruction.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Severe Alopecia Areata: Baricitinib 2-4 mg PO once daily OR Ritlecitinib 50 mg PO once daily.\n• Vitiligo: Topical Ruxolitinib 1.5% cream applied BID to depigmented areas (up to max 10% BSA).' },
              { title: 'Stepwise Management Algorithm', content: '1. Baseline screening for oral JAK inhibitors: CBC, CMP, lipid panel, Tuberculosis (IGRA), and Hepatitis B/C.\n2. Monitor for class warnings (infections, cytopenias, transaminitis, lipid elevations).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Repigmentation in vitiligo requires ongoing follicular melanocyte migration; counsel patients that visible clinical repigmentation requires at least 12-24 weeks of consistent application.' },
              { title: 'Exact Reference & Guideline Citations', content: 'BRAVE-AA Trials (NEJM 2022); TRuE-V Vitiligo Trials (NEJM 2022); FDA Approval Summaries for Baricitinib, Ritlecitinib, and Ruxolitinib.' }
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
    generalScope: 'Focus exclusively on obstetric emergencies, hypertensive pregnancy disorders, intrapartum fetal monitoring, gynecologic oncology, and reproductive endocrinology.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Preeclampsia, postpartum hemorrhage, ectopic pregnancy, and fetal distress',
        icon: 'warning',
        topics: [
          {
            id: 'preeclampsia',
            title: 'Preeclampsia with Severe Features & Eclampsia',
            subtitle: 'MgSO4 Seizure Prophylaxis, Acute Antihypertensives & Delivery Timing',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on preeclampsia with severe features, eclampsia seizure management, IV labetalol/hydralazine, and delivery timing criteria.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'New-onset hypertension (SBP ≥140 or DBP ≥90 on 2 occasions ≥4h apart) after 20 weeks of gestation. Severe Feature Red Flags: SBP ≥160 or DBP ≥110, intractable severe headache, visual scotomas, persistent RUQ/epigastric pain, pulmonary edema, or Eclamptic seizures.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Preeclampsia: SBP ≥140 or DBP ≥90 after 20 weeks PLUS Proteinuria (≥300 mg/24h urine or Protein/Creatinine ratio ≥0.3) OR in the absence of proteinuria, new onset of:\n  - Thrombocytopenia (Platelets <100,000 /µL)\n  - Renal Insufficiency (Serum Creatinine >1.1 mg/dL or doubling)\n  - Impaired Liver Function (Transaminases >2x ULN)\n  - Pulmonary Edema\n  - New-onset Cerebral / Visual Disturbances.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Seizure Prophylaxis (Mandatory in Severe Features / Eclampsia):\n  Magnesium Sulfate IV: 4 to 6 g IV loading dose in 100 mL over 15-20 mins, followed by 1 to 2 g/hr continuous IV infusion for 24 hours postpartum.\n  (Toxicity antidote: Calcium Gluconate 1 g [10 mL of 10% solution] IV over 3 mins for loss of deep tendon reflexes or respiratory depression).\n• Urgent Antihypertensive Therapy (Target BP 140-150 / 90-100 mmHg within 30-60 mins):\n  1. IV Labetalol: 20 mg IV bolus over 2 mins; if BP ≥160/110 after 10 mins, give 40 mg, then 80 mg q10min (max 220 mg) OR\n  2. IV Hydralazine: 5-10 mg IV bolus over 2 mins, repeat with 10 mg at 20 mins OR\n  3. Oral Nifedipine (Immediate-Release): 10-20 mg PO (repeat in 20 mins if needed).' },
              { title: 'Stepwise Management Algorithm', content: '1. Preeclampsia WITHOUT Severe Features: Expectant management with close fetal/maternal monitoring until delivery at 37 0/7 weeks.\n2. Preeclampsia WITH Severe Features: Deliver at ≥34 0/7 weeks (or immediately at any gestational age if maternal/fetal instability, eclampsia, HELLP syndrome, or placental abruption).\n3. Administer Betamethasone 12 mg IM q24h x 2 doses for fetal lung maturity if <34 0/7 weeks and condition permits 48-hour delay.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Magnesium Sulfate is for SEIZURE PREVENTION, not for blood pressure lowering. Never use ACE inhibitors, ARBs, or mineralocorticoid receptor antagonists in pregnancy (causes fetal renal dysgenesis, oligohydramnios, and neonatal death).' },
              { title: 'Exact Reference & Guideline Citations', content: '2020 ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia; 2023 SMFM Consult Series: Preeclampsia.' }
            ]
          },
          {
            id: 'postpartum_hemorrhage',
            title: 'Postpartum Hemorrhage (PPH)',
            subtitle: 'The 4Ts Etiology, Stepwise Uterotonics, Bakri Balloon & MTP',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on postpartum hemorrhage, cumulative blood loss ≥1000 mL, 4Ts (Tone, Trauma, Tissue, Thrombin), uterotonic agents, Bakri balloon, and MTP.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Cumulative blood loss ≥1,000 mL or blood loss accompanied by signs/symptoms of hypovolemia within 24 hours of delivery. Red Flags: Persistent uterine atony, tachycardia >110 bpm, SBP <90 mmHg, oliguria, rapid drop in hematocrit.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'The 4Ts Differential Diagnosis:\n1. Tone (70-80%): Uterine Atony (soft, boggy, poorly contracted uterus).\n2. Trauma (20%): Cervical, vaginal, or perineal lacerations; uterine rupture.\n3. Tissue (10%): Retained placenta, cotyledons, or succenturiate lobe.\n4. Thrombin (1%): Coagulopathies (DIC, severe preeclampsia/HELLP, abruption).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Continuous Fundal and Bimanual Uterine Compression.\n• Stepwise Uterotonic Pharmacotherapy:\n  1. Oxytocin: 10-40 units IV in 1000 mL crystalloid infusion at 250-500 mL/hr OR 10 units IM.\n  2. Methylergonovine (Methergine): 0.2 mg IM q2-4h (CONTRAINDICATED in Hypertension/Preeclampsia).\n  3. Carboprost Tromethamine (Hemabate / 15-methyl PGF2α): 250 mcg IM or intramyometrial q15-90min up to 8 doses (CONTRAINDICATED in Asthma).\n  4. Misoprostol (Cytotec): 800-1000 mcg sublingually or PR.\n• Tranexamic Acid (TXA): 1 g IV over 10 mins within 3 hours of delivery (repeat 1 g at 30 mins if bleeding continues - WOMAN trial evidence).' },
              { title: 'Stepwise Management Algorithm', content: '1. Activate OB Massive Transfusion Protocol (1:1:1 PRBC : FFP : Platelets).\n2. Inspect genital tract for lacerations; manually explore uterine cavity for retained tissue.\n3. Intrauterine Balloon Tamponade: Insert Bakri balloon and inflate with 300-500 mL sterile saline.\n4. Surgical Escalation: Uterine compression sutures (B-Lynch), uterine artery embolization, or emergent hysterectomy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Visual estimation routinely underestimates postpartum blood loss by 50%. Always use standardized quantitative blood loss (QBL) collection drapes and gravimetric sponge weighing to trigger early PPH protocol escalation.' },
              { title: 'Exact Reference & Guideline Citations', content: '2017 ACOG Practice Bulletin No. 183: Postpartum Hemorrhage; WOMAN Trial Collaborators (Lancet 2017).' }
            ]
          },
          {
            id: 'ectopic_pregnancy',
            title: 'Acute Ectopic Pregnancy',
            subtitle: 'Discriminatory β-hCG Zone, Methotrexate Protocol & Laparoscopy',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on ectopic pregnancy, quantitative hCG discriminatory zone, TVUS findings, Methotrexate candidate criteria, and laparoscopic salpingectomy.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'First-trimester vaginal bleeding and unilateral lower pelvic pain in a reproductive-aged woman with positive pregnancy test. Rupture Red Flags: Sudden severe peritonitis, shoulder tip pain (Kehr sign - diaphragmatic blood irritation), syncope, and hypovolemic shock.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Discriminatory β-hCG Zone (1,500 - 2,000 mIU/mL):\n  At this serum hCG level, a normal intrauterine gestational sac MUST be visible on Transvaginal Ultrasound (TVUS).\n• Ectopic TVUS Findings: Absence of intrauterine pregnancy with β-hCG above discriminatory zone, complex adnexal mass separate from ovary, tubal ring sign, or free peritoneal fluid in pouch of Douglas.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Medical Management (Methotrexate Protocol):\n  - Candidate Criteria: Hemodynamically stable, unruptured mass <3.5 cm, absence of embryonic cardiac activity, baseline hCG <5,000 mIU/mL, and normal renal/liver function.\n  - Single-Dose Regimen: Methotrexate 50 mg/m² IM on Day 1.\n  - Follow-up: Measure serum hCG on Day 4 and Day 7 (expect ≥15% decrease between Day 4 and Day 7; if <15% decrease, administer 2nd dose of MTX or proceed to surgery).' },
              { title: 'Stepwise Management Algorithm', content: '1. If hemodynamically unstable or signs of tubal rupture: Emergent Laparoscopic Salpingectomy (or Salpingostomy if preserving fertility and contralateral tube compromised).\n2. Administer Rho(D) Immune Globulin (RhoGAM 50-300 mcg IM) to all Rh-negative unsensitized patients.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT administer Methotrexate until a viable intrauterine pregnancy has been definitively excluded. Patients receiving Methotrexate must avoid folic acid supplements, NSAIDs, and sexual intercourse until hCG reaches zero.' },
              { title: 'Exact Reference & Guideline Citations', content: '2018 ACOG Practice Bulletin No. 193: Tubal Ectopic Pregnancy; 2020 RCOG Guideline on Diagnosis and Management of Ectopic Pregnancy.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'pcos_management',
            title: 'Polycystic Ovary Syndrome (PCOS)',
            subtitle: 'Rotterdam Criteria, Letrozole Ovulation Induction & Metabolic Risks',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on PCOS, Rotterdam criteria, hyperandrogenism, insulin resistance, combined oral contraceptives, spironolactone, and Letrozole for fertility.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Oligomenorrhea, hirsutism, acne, central obesity, infertility. Red Flags: Prolonged unopposed estrogen exposure resulting in endometrial hyperplasia and endometrial carcinoma; screen with endometrial biopsy if prolonged amenorrhea.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Rotterdam Diagnostic Criteria (≥2 of 3 Required):\n1. Ovulatory Dysfunction (oligo- or anovulation presenting as irregular menses).\n2. Clinical and/or Biochemical Hyperandrogenism (modified Ferriman-Gallwey score ≥4-8, elevated total/free testosterone).\n3. Polycystic Ovarian Morphology on Ultrasound (≥20 follicles per ovary measuring 2-9 mm or ovarian volume ≥10 mL).\n• Rule out: Hyperprolactinemia (TSH/Prolactin), 21-hydroxylase non-classic CAH (17-hydroxyprogesterone), and Cushing syndrome.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Patient Not Seeking Pregnancy (Cycle Regulation & Hyperandrogenism):\n  1. Combined Oral Contraceptive Pills (COCPs with low androgenic progestin like Drospirenone or Desogestrel) - first-line.\n  2. Anti-Androgen: Add Spironolactone 50-200 mg PO daily if hirsutism persists after 6 months of COCPs (teratogenic; ensure reliable contraception).\n• Patient Seeking Pregnancy (Ovulation Induction):\n  1. Letrozole (Aromatase Inhibitor): 2.5 mg PO daily on cycle days 3-7 (titrate to max 7.5 mg/day) - FIRST-LINE, superior live-birth rates compared to Clomiphene.\n• Metabolic Management: Metformin 500-2000 mg PO daily for insulin resistance.' },
              { title: 'Stepwise Management Algorithm', content: '1. Screen all PCOS patients for metabolic syndrome with 75 g 2-hour Oral Glucose Tolerance Test (OGTT) and fasting lipid panel.\n2. Lifestyle modification (5-10% weight reduction) restores spontaneous ovulation in over 50% of overweight patients.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT use Clomiphene Citrate as the first-line ovulation agent in PCOS (large multicenter RCTs demonstrate that Letrozole achieves significantly higher live birth and ovulation rates with fewer multiple gestations).' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 International Evidence-based Guideline for the Assessment and Management of PCOS (Monash University / ESHRE / ASRM); 2018 ACOG Practice Bulletin No. 194.' }
            ]
          },
          {
            id: 'cervical_cancer_screening',
            title: 'Cervical Cancer Screening & ASCCP Guidelines',
            subtitle: 'Pap Smear, High-Risk HPV Cotesting & Risk-Based Colposcopy',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on cervical cancer screening intervals, high-risk HPV cotesting, ASCCP risk-based management algorithms, and colposcopy indications.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Abnormal cytology vs visible cervical lesion. Red Flags: Visible exophytic or ulcerated cervical mass, postcoital bleeding, or unexplained pelvic pain (mandates immediate punch biopsy regardless of Pap smear history).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Screening Intervals (USPSTF / ACOG Guidelines):\n  - Age 21-29: Cervical cytology (Pap smear) alone every 3 years (do NOT test for HPV in this age group due to high transient clearance).\n  - Age 30-65: Primary High-Risk HPV (hrHPV) testing alone every 5 years (preferred) OR hrHPV + Cytology Cotesting every 5 years OR Cytology alone every 3 years.\n  - Age >65: Discontinue screening if adequate prior negative screening (3 consecutive negative Paps or 2 negative cotests in last 10 years).\n  - Post-Hysterectomy (benign indications): Discontinue screening.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Primary Prevention: HPV 9-Valent Vaccine (Gardasil-9) 2-dose series (ages 9-14) or 3-dose series (ages 15-45).' },
              { title: 'Stepwise Management Algorithm', content: 'ASCCP Risk-Based Management Principles (Calculated Risk of CIN 3+):\n1. Immediate Risk ≥4%: Colposcopy indicated.\n2. Immediate Risk 25-59%: Colposcopy or immediate treatment (LEEP) acceptable.\n3. Immediate Risk ≥60% (e.g. HPV 16/18 with HSIL): Expedited treatment (LEEP / cone biopsy) strongly recommended over diagnostic colposcopy.\n4. Immediate Risk <4%: Return for surveillance in 1 or 3 years.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT perform cervical cancer screening prior to age 21 regardless of the age of sexual debut (HPV prevalence is high but clears spontaneously; screening causes unnecessary cervical excisions and increases future preterm birth risk).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ASCCP Risk-Based Management Consensus Guidelines for Abnormal Cervical Cancer Screening Tests and Cancer Precursors (JLTDC 2020); 2018 USPSTF Recommendations.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'fetal_heart_rate_monitoring',
            title: 'Intrapartum Fetal Heart Rate Monitoring (CTG)',
            subtitle: 'NICHD 3-Tier Categorization & Intrauterine Resuscitation',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on Electronic Fetal Monitoring, baseline FHR, variability, decelerations, and NICHD Category I, II, III management.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'NICHD Category III tracing: Predictive of abnormal fetal acid-base status and progressive fetal hypoxia/acidosis (mandates immediate preparation for operative delivery).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• NICHD 3-Tier FHR Categorization:\n  - Category I (Normal): Baseline 110-160 bpm, Moderate variability (6-25 bpm), Absent late/variable decelerations, +/- Accelerations.\n  - Category III (Abnormal): Requires EITHER Absent baseline variability WITH recurrent late decelerations, recurrent variable decelerations, or bradycardia (<110 bpm); OR Sinusoidal pattern (severe fetal anemia).\n  - Category II (Indeterminate): All tracings not classified as Category I or III (requires close surveillance and intrauterine resuscitation).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Uterine Tachysystole Tocolysis: Terbutaline 0.25 mg SC once to relieve excessive uterine contractions (>5 contractions in 10 mins over 30 mins).' },
              { title: 'Stepwise Management Algorithm', content: 'Stepwise Intrauterine Resuscitation Measures:\n1. Maternal Repositioning (Left lateral decubitus to relieve IVC compression).\n2. IV Fluid Bolus: 500-1000 mL Lactated Ringer’s.\n3. Discontinue Oxytocin / uterotonic infusions immediately.\n4. Administer maternal oxygen (10 L/min via non-rebreather mask if maternal hypoxia).\n5. If Category III persists despite resuscitation: Proceed to emergent operative delivery (Cesarean delivery or vacuum/forceps if fully dilated).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Moderate FHR baseline variability (6-25 bpm) is the single most reliable physiological indicator of normal fetal acid-base balance; true fetal hypoxia is virtually excluded in the presence of moderate variability.' },
              { title: 'Exact Reference & Guideline Citations', content: 'ACOG Practice Bulletin No. 106: Intrapartum Fetal Heart Rate Monitoring; NICHD Workshop on Electronic Fetal Monitoring.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'aspirin_preeclampsia_prevention',
            title: 'Low-Dose Aspirin for Preeclampsia Prevention',
            subtitle: 'ASPRE Trial Guidelines & First-Trimester Risk Screening',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on low-dose aspirin in high-risk pregnancy, the ASPRE trial, optimal timing (12-16 weeks), and preeclampsia incidence reduction.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Women with clinical risk factors for preeclampsia require prophylactic intervention in the first trimester before spiral artery remodeling is complete.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark ASPRE Trial (NEJM 2017):\n• Administering Aspirin 150 mg PO daily at bedtime starting between 11-14 weeks until 36 weeks of gestation reduced the incidence of preterm preeclampsia (<37 weeks) by 62% in high-risk women (HR 0.38, 95% CI 0.20-0.74).\n• High-Risk Indicators (Initiate Aspirin if ≥1 High-Risk factor):\n  - Prior preeclampsia (especially with preterm delivery)\n  - Chronic hypertension\n  - Pre-gestational diabetes (Type 1 or 2)\n  - Renal disease\n  - Autoimmune disease (SLE, Antiphospholipid Syndrome)\n  - Multifetal gestation.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Low-Dose Aspirin: 81 to 162 mg PO daily taken at bedtime, initiated between 12 and 16 weeks of gestation (ideally before 16 weeks) and continued daily until 36 weeks or delivery.' },
              { title: 'Stepwise Management Algorithm', content: 'Screen all pregnant women for preeclampsia risk at initial prenatal visit and initiate low-dose aspirin prophylaxis promptly if eligible.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Initiating aspirin after 20 weeks of gestation provides significantly diminished clinical benefit because trophoblastic invasion and uterine spiral artery remodeling are already established.' },
              { title: 'Exact Reference & Guideline Citations', content: 'ASPRE Trial (NEJM 2017); 2021 USPSTF Recommendation Statement: Aspirin Use to Prevent Preeclampsia; 2023 ACOG Practice Advisory.' }
            ]
          }
        ]
      }
    ]
  },

  lungs: {
    id: 'lungs',
    name: 'Lungs',
    scientificName: 'Pulmonology & Respiratory Medicine',
    icon: 'leaf',
    color: '#63aeaa',
    illustration: require('../assets/images/specialties/pulmonology.jpg'),
    generalScope: 'Focus exclusively on respiratory pathology, pulmonary embolism, ARDS, mechanical ventilation, asthma, COPD, and thoracic interventions.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'PE, status asthmaticus, ARDS, tension pneumothorax, and respiratory failure',
        icon: 'warning',
        topics: [
          {
            id: 'pe',
            title: 'Acute Pulmonary Embolism',
            subtitle: 'Wells Score, PERC Rule, PESI & Systemic Thrombolysis',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on pulmonary embolism, DVT, Wells criteria, high-sensitivity D-dimer, CTPA, PESI score, and systemic thrombolysis.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Sudden onset dyspnea, pleuritic chest pain, tachypnea, hemoptysis, syncope. High-Risk (Massive) PE Red Flags: Hemodynamic collapse (SBP <90 mmHg or drop ≥40 mmHg for >15 mins, or cardiac arrest).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Wells Criteria for PE:\n  - Clinical signs of DVT (3 pts)\n  - PE most likely diagnosis (3 pts)\n  - HR >100 bpm (1.5 pts)\n  - Immobilization/surgery in past 4w (1.5 pts)\n  - Prior DVT/PE (1.5 pts)\n  - Hemoptysis (1 pt)\n  - Malignancy (1 pt)\n• Low Risk (Wells <2): Apply PERC Rule (if all 8 PERC criteria met, PE ruled out without D-dimer).\n• Moderate Risk (Wells 2-6): Order high-sensitivity D-dimer (age-adjusted cutoff: Age x 10 for age >50).\n• High Risk (Wells >6): CT Pulmonary Angiography (CTPA) immediately.\n• Risk Stratification: PESI score and RV strain on TTE / elevated Troponin/BNP.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Hemodynamically Stable (Low / Intermediate-Low Risk):\n  Direct Oral Anticoagulants (DOACs - Preferred):\n  1. Apixaban: 10 mg PO BID for 7 days, then 5 mg PO BID OR\n  2. Rivaroxaban: 15 mg PO BID with food for 21 days, then 20 mg PO daily OR\n  3. LMWH (Enoxaparin 1 mg/kg SC q12h) bridged to Dabigatran/Edoxaban.\n• Hemodynamically Unstable (Massive PE / Shock):\n  Systemic Thrombolysis: Alteplase (tPA) 100 mg IV infusion over 2 hours (or 50 mg IV bolus in cardiac arrest) + Unfractionated Heparin infusion.' },
              { title: 'Stepwise Management Algorithm', content: '1. Start empiric anticoagulation immediately while awaiting CTPA if pretest probability is high and bleeding risk is low.\n2. In Massive PE with contraindications to thrombolysis: Catheter-directed thrombectomy or surgical embolectomy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT order D-dimer in high-probability patients (a negative D-dimer does not safely rule out PE when pretest probability is high; proceed straight to CTPA). Avoid DOACs in severe renal impairment (CrCl <15-30 mL/min) or Antiphospholipid Syndrome (use Warfarin).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism developed in collaboration with the ERS; 2021 CHEST Guideline and Expert Panel Report: Antithrombotic Therapy for VTE Disease.' }
            ]
          },
          {
            id: 'asthma_exacerbation',
            title: 'Severe Acute Asthma Exacerbation',
            subtitle: 'Peak Flow, SABA/SAMA Nebulization, IV Magnesium & Non-Invasive Ventilation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute asthma exacerbation, peak expiratory flow, high-dose bronchodilators, systemic corticosteroids, IV magnesium, and Heliox/BiPAP.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Severe dyspnea, wheezing, tachypnea (>30/min), tachycardia (>120 bpm), inability to speak full sentences. Impending Respiratory Arrest Red Flags: "Silent chest" (absence of wheezing due to severe airflow limitation), paradoxical thoracoabdominal movement, cyanosis, and drowsiness/confusion.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Peak Expiratory Flow Rate (PEFR): Severe exacerbation defined as PEFR <50% of predicted or personal best. Normal or elevated PaCO2 (>42 mmHg) on blood gas in an asthmatic patient signifies respiratory muscle exhaustion (normally hyperventilate with low PaCO2).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Inhaled Bronchodilators:\n  Albuterol 2.5-5.0 mg + Ipratropium Bromide 0.5 mg nebulized continuously or every 20 minutes for 3 doses.\n• Systemic Corticosteroids (Early Administration):\n  Oral Prednisone 40-60 mg PO daily OR IV Methylprednisolone 60-80 mg IV q12h.\n• Adjunctive Therapy for Severe / Refractory Cases:\n  1. Magnesium Sulfate: 2.0 g IV infusion in 100 mL over 20 minutes (promotes bronchial smooth muscle relaxation).\n  2. Epinephrine 0.3-0.5 mg IM (1:1,000) for anaphylaxis-associated bronchospasm.\n• Oxygen Therapy: Titrate to SpO2 93-95% (avoid 100% hyperoxia).' },
              { title: 'Stepwise Management Algorithm', content: '1. Initiate continuous nebulizers + systemic steroids + IV magnesium.\n2. Trial Non-Invasive Positive Pressure Ventilation (BiPAP/CPAP) to decrease work of breathing.\n3. If intubation required: Use large endotracheal tube (≥8.0 mm), low respiratory rate (10-12/min), and prolonged expiratory time (I:E ratio 1:3 to 1:4) to prevent dynamic hyperinflation and Auto-PEEP.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'A "normal" PaCO2 of 40 mmHg in an acute severe asthma attack is a DANGER sign of impending respiratory arrest (reflects diaphragm exhaustion; prepare for definitive airway support).' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 Global Initiative for Asthma (GINA) Global Strategy for Asthma Management and Prevention; 2020 NAEPP Asthma Guidelines.' }
            ]
          },
          {
            id: 'ards_protocol',
            title: 'Acute Respiratory Distress Syndrome (ARDS)',
            subtitle: 'Berlin Definition, Lung-Protective Ventilation & Prone Positioning',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on ARDS, Berlin definition, lung-protective mechanical ventilation (6 mL/kg PBW, plateau pressure <30), prone positioning, and neuromuscular blockade.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Severe acute hypoxemic respiratory failure refractory to oxygen therapy within 1 week of a known clinical insult (sepsis, pneumonia, aspiration, severe pancreatitis, trauma).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Berlin Definition of ARDS (Requires all 4):\n1. Timing: Within 1 week of clinical insult or new/worsening respiratory symptoms.\n2. Imaging: Bilateral opacities on CXR or CT not fully explained by effusions or collapse.\n3. Origin of Edema: Respiratory failure NOT fully explained by heart failure or fluid overload (objective assessment with TTE to exclude cardiogenic edema).\n4. Oxygenation (with PEEP ≥5 cmH2O):\n  - Mild ARDS: 200 < PaO2/FiO2 ≤ 300\n  - Moderate ARDS: 100 < PaO2/FiO2 ≤ 200\n  - Severe ARDS: PaO2/FiO2 ≤ 100.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Lung-Protective Mechanical Ventilation Protocol (ARMA Trial):\n  1. Tidal Volume: 4 to 8 mL/kg of PREDICTED Body Weight (PBW - based on height, not actual weight; start at 6 mL/kg PBW).\n  2. Plateau Pressure Target: Pplat ≤30 cmH2O (reduce tidal volume by 1 mL/kg if Pplat >30).\n  3. PEEP Titration: Use ARDSNet PEEP/FiO2 titration tables (higher PEEP for moderate-severe ARDS).\n  4. Permissive Hypercapnia: Allow pH 7.20-7.30 to maintain lung-protective low tidal volumes.' },
              { title: 'Stepwise Management Algorithm', content: '1. Moderate-to-Severe ARDS (PaO2/FiO2 <150):\n  - Prone Positioning: Minimum 16 consecutive hours/day (PROSEVA trial demonstrated significant 50% mortality reduction; HR 0.39).\n  - Neuromuscular Blockade: Cisatracurium infusion for 48 hours in early severe ARDS with ventilator dyssynchrony.\n2. Conservative Fluid Management: Maintain dry fluid balance once shock is resolved (FACTT trial).\n3. Refractory Severe Hypoxemia (PaO2/FiO2 <80): VV-ECMO evaluation (EOLIA criteria).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never set ventilator tidal volumes based on actual body weight (an obese patient has normal-sized lungs; calculating tidal volume on actual weight causes severe barotrauma, volutrauma, and pneumothorax).' },
              { title: 'Exact Reference & Guideline Citations', content: 'The Berlin Definition of ARDS (JAMA 2012); PROSEVA Trial (NEJM 2013); 2023 ESICM Guidelines on Acute Respiratory Distress Syndrome.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'copd_gold_guidelines',
            title: 'COPD Management (GOLD 2024)',
            subtitle: 'GOLD ABE Staging, Dual Bronchodilation & Inhaled Corticosteroid Stewardship',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on COPD, spirometry diagnosis (FEV1/FVC <0.70), GOLD 2024 ABE classification, LAMA/LABA dual inhalers, and exacerbation management.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Chronic progressive dyspnea, chronic cough, sputum production. Acute Exacerbation Red Flags: Acute worsening of dyspnea, increased sputum volume, increased sputum purulence, acute respiratory acidosis (pH <7.35, PaCO2 >45 mmHg).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Diagnosis requires post-bronchodilator spirometry showing FEV1/FVC < 0.70.\n• GOLD 2024 ABE Classification:\n  - Group A: 0-1 moderate exacerbations (no hospitalizations), low symptoms (mMRC 0-1, CAT <10). Initial: Single Bronchodilator (LAMA or LABA).\n  - Group B: 0-1 moderate exacerbations, high symptoms (mMRC ≥2, CAT ≥10). Initial: Dual LABA + LAMA.\n  - Group E: ≥2 moderate exacerbations OR ≥1 exacerbation requiring hospitalization. Initial: Dual LABA + LAMA (add Inhaled Corticosteroid / Triple Therapy if Blood Eosinophils ≥300 cells/µL).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Maintenance Dual Bronchodilation (LAMA/LABA):\n  Umeclidinium/Vilanterol OR Tiotropium/Olodaterol OR Glycopyrrolate/Formoterol.\n• Triple Therapy (LAMA + LABA + ICS - ETHOS/IMPACT Evidence):\n  Fluticasone furoate / Umeclidinium / Vilanterol (Trelegy) 100/62.5/25 mcg 1 inhalation daily OR Budesonide / Glycopyrrolate / Formoterol (Breztri) 160/9/4.8 mcg 2 puffs BID.\n• Acute Exacerbation Regimen:\n  1. SABA + SAMA nebulizers (Albuterol/Ipratropium) q4-6h.\n  2. Oral Prednisone 40 mg PO once daily for exactly 5 days.\n  3. Antibiotics (Azithromycin 500 mg Day 1 then 250 mg daily x 4d or Doxycycline 100 mg BID x 5d) for 5 days if increased sputum purulence.' },
              { title: 'Stepwise Management Algorithm', content: '1. Inhaled Corticosteroid (ICS) Decision Rules:\n  - Strongly Recommended: Blood eosinophils ≥300 cells/µL or history of asthma.\n  - Not Recommended / Harmful: Blood eosinophils <100 cells/µL (increases pneumonia risk without exacerbation benefit).\n2. Acute Hypercapnic Respiratory Failure: Non-Invasive Positive Pressure Ventilation (BiPAP) is first-line (reduces intubation by 65% and mortality by 50%).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never prescribe systemic corticosteroids for longer than 5 days in acute COPD exacerbations (the landmark REDUCE trial proved 5 days is non-inferior to 14 days and reduces adverse steroid complications).' },
              { title: 'Exact Reference & Guideline Citations', content: 'Global Initiative for Chronic Obstructive Lung Disease (GOLD) 2024 Report; REDUCE Trial (JAMA 2013).' }
            ]
          },
          {
            id: 'interstitial_lung_disease',
            title: 'Idiopathic Pulmonary Fibrosis (IPF)',
            subtitle: 'High-Resolution CT (HRCT) UIP Pattern & Antifibrotic Therapies',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Idiopathic Pulmonary Fibrosis, Usual Interstitial Pneumonia pattern, antifibrotics (Nintedanib, Pirfenidone), and lung transplantation referral.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Exertional dyspnea, dry chronic cough, bilateral dry inspiratory "Velcro" crackles at lung bases, and digital clubbing in an older adult (>60 years). Red Flags: Acute IPF Exacerbation (rapidly progressive hypoxemic failure with new bilateral ground-glass opacities; carries >50% in-hospital mortality).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Definite UIP Pattern on HRCT (Without need for surgical biopsy if characteristic):\n1. Subpleural and basal predominance.\n2. Reticular abnormalities.\n3. Honeycombing with or without traction bronchiectasis.\n4. Absence of inconsistent features (extensive ground-glass opacities, micronodules, mosaic attenuation/air trapping).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Antifibrotic Pharmacotherapy (Slows FVC decline by ~50%):\n  1. Nintedanib (Tyrosine Kinase Inhibitor): 150 mg PO BID with food (monitor LFTs and diarrhea).\n  2. Pirfenidone (TGF-β Inhibitor): Titrated up to 801 mg PO TID with meals (monitor photosensitivity rash and LFTs).' },
              { title: 'Stepwise Management Algorithm', content: '1. High-Resolution CT Chest (HRCT) with inspiratory, expiratory, and prone views.\n2. Exclude secondary ILD causes (autoimmune connective tissue disease serologies, environmental hypersensitivity pneumonitis, drug exposures).\n3. Early referral for Pulmonary Rehabilitation, supplemental oxygen, and Lung Transplantation evaluation.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT prescribe systemic corticosteroids or immunosuppressive agents (Azathioprine/NAC) in Idiopathic Pulmonary Fibrosis (the PANTHER-IPF trial proved combination immunosuppression increases mortality and hospitalizations in IPF).' },
              { title: 'Exact Reference & Guideline Citations', content: '2022 ATS/ERS/JRS/ALAT Clinical Practice Guideline on Idiopathic Pulmonary Fibrosis and Progressive Pulmonary Fibrosis; PANTHER-IPF Trial (NEJM 2012).' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'spirometry_pft_interpretation',
            title: 'Pulmonary Function Tests (PFTs) & Spirometry',
            subtitle: 'Obstructive vs Restrictive Patterns, DLCO & Bronchodilator Reversibility',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on systematic interpretation of spirometry, lung volumes, diffusion capacity (DLCO), and bronchodilator response.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Severe airflow obstruction (FEV1 <30% predicted) or profound restriction (TLC <50% predicted) with resting hypoxemia.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Stepwise PFT Interpretation Algorithm:\n  1. Check FEV1/FVC Ratio: If <0.70 (or < Lower Limit of Normal / LLN), an Obstructive Defect is present.\n  2. Check Total Lung Capacity (TLC): If FEV1/FVC is normal and TLC <80% predicted, a Restrictive Defect is present.\n  3. Check Bronchodilator Reversibility (Post-Albuterol): Positive if FEV1 or FVC increases by ≥12% AND ≥200 mL.\n  4. Check Diffusing Capacity (DLCO):\n     - Obstructive + Low DLCO: Emphysema\n     - Obstructive + Normal/High DLCO: Asthma or Chronic Bronchitis\n     - Restrictive + Low DLCO: Intrinsic Lung Disease (IPF, Sarcoidosis, Hypersensitivity Pneumonitis)\n     - Restrictive + Normal DLCO: Extrinsic / Chest Wall / Neuromuscular disorder (Myasthenia, ALS, Obesity hypoventilation)\n     - Normal Spirometry/Volumes + Isolated Low DLCO: Pulmonary Arterial Hypertension (PAH), Chronic Thromboembolic Pulmonary HTN (CTEPH), or early ILD.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool).' },
              { title: 'Stepwise Management Algorithm', content: 'Follow the 2022 ATS/ERS interpretation standards using GLI (Global Lung Function Initiative) reference equations and Lower Limit of Normal (LLN) to prevent misdiagnosis in elderly patients.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never diagnose a restrictive ventilatory defect based on spirometry alone (a low FVC can be caused by air trapping in severe obstruction; true restriction MUST be confirmed by measuring Total Lung Capacity / TLC by plethysmography).' },
              { title: 'Exact Reference & Guideline Citations', content: '2022 ATS/ERS Technical Standard: Interpretative Strategies for Routine Lung Function Tests (Eur Respir J 2022).' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'triple_therapy_copd',
            title: 'Single-Inhaler Triple Therapy in COPD',
            subtitle: 'All-Cause Mortality Benefits in ETHOS and IMPACT Trials',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on single-inhaler triple therapy (LAMA/LABA/ICS) in moderate-to-severe COPD, exacerbation reduction, and mortality reduction.',
            clinicalContent: [
              { title: 'Immediate Triage & Red Flags', content: 'Frequent moderate-to-severe COPD exacerbations carry progressive lung function decline and elevated cardiovascular and all-cause mortality.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark Trial Evidence:\n• IMPACT Trial (NEJM 2018) & ETHOS Trial (NEJM 2020):\n  - Single-inhaler triple therapy (Fluticasone furoate / Umeclidinium / Vilanterol OR Budesonide / Glycopyrrolate / Formoterol) significantly reduced moderate-to-severe exacerbations compared to dual LABA/LAMA therapy.\n  - Crucially, triple therapy demonstrated a statistically significant reduction in all-cause mortality (HR 0.54-0.72 in patients with blood eosinophils ≥100-300 cells/µL).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Single-inhaler triple therapy (e.g. Trelegy Ellipta 1 puff daily or Breztri Aerosphere 2 puffs BID) for symptomatic COPD patients with history of ≥1 exacerbation in the prior year and blood eosinophils ≥100 cells/µL.' },
              { title: 'Stepwise Management Algorithm', content: 'Transition symptomatic patients with persistent exacerbations on dual bronchodilation (LAMA/LABA) to single-inhaler triple therapy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Single-inhaler devices achieve significantly higher patient compliance and lower device error rates compared to multiple separate inhalers.' },
              { title: 'Exact Reference & Guideline Citations', content: 'IMPACT Trial (NEJM 2018); ETHOS Trial (NEJM 2020); GOLD 2024 Guidelines.' }
            ]
          }
        ]
      }
    ]
  }
};
