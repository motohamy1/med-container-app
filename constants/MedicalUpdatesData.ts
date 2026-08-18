import { Colors } from './Colors';

export type MedicalUpdate = {
  id: string;
  title: string;
  category: 'Practice Guideline' | 'Clinical Trial' | 'FDA Approval' | 'Safety Alert';
  specialtyName: string;
  specialtyColor: string;
  specialtyIcon: string;
  badge: string;
  date: string;
  journalOrSource: string;
  headline: string;
  keyTakeaways: string[];
  clinicalImpact: string;
  promptQuery: string;
};

export const MEDICAL_UPDATES_DATA: MedicalUpdate[] = [
  {
    id: 'update_1',
    title: 'Dual SGLT2i + GLP-1RA in Advanced CKD',
    category: 'Clinical Trial',
    specialtyName: 'Cardio-Renal',
    specialtyColor: Colors.specialty.cardiology,
    specialtyIcon: 'water',
    badge: 'NEJM Landmark 2026',
    date: 'August 2026',
    journalOrSource: 'New England Journal of Medicine (NEJM)',
    headline: 'Synergistic nephroprotection without excess acute kidney injury risk in eGFR 20–45 mL/min.',
    keyTakeaways: [
      'Combination therapy reduced composite renal endpoints (ESKD or 50% eGFR decline) by 34% vs SGLT2i alone.',
      'All-cause cardiovascular mortality decreased by an additional 21% without increased euglycemic DKA rates.',
      'Sustained preservation of renal filtration slope over 3.2-year median follow-up.',
    ],
    clinicalImpact: 'Guideline-defining evidence supporting early upfront combination in diabetic and non-diabetic proteinuric CKD.',
    promptQuery: 'Explain the renal outcomes, hemodynamic mechanisms, and practical initiation guidelines for dual SGLT2i and GLP-1RA therapy in CKD based on the latest 2026 NEJM trials.',
  },
  {
    id: 'update_2',
    title: '2026 ESC Guidelines on Heart Failure & Iron',
    category: 'Practice Guideline',
    specialtyName: 'Cardiology',
    specialtyColor: Colors.specialty.cardiology,
    specialtyIcon: 'heart',
    badge: 'Class 1A Recommendation',
    date: 'July 2026',
    journalOrSource: 'European Heart Journal / ESC 2026',
    headline: 'Universal IV Ferric Derisomaltose/Carboxymaltose screening and repletion across HFrEF and HFpEF.',
    keyTakeaways: [
      'Screen ferritin & transferrin saturation (TSAT) at every hospitalization and semi-annually outpatient.',
      'Replete IV iron for Ferritin < 100 ng/mL or Ferritin 100-299 ng/mL with TSAT < 20%, regardless of hemoglobin.',
      'Reduces HF hospitalizations by 24% and markedly improves NYHA functional capacity and 6MWD.',
    ],
    clinicalImpact: 'Standardized IV iron as a cornerstone disease-modifying therapy in symptomatic HF with iron deficiency.',
    promptQuery: 'Summarize the 2026 ESC guidelines for IV iron repletion in heart failure: inclusion criteria, dosing formulas, and clinical trial evidence.',
  },
  {
    id: 'update_3',
    title: 'Subcutaneous Continuous Levodopa Pump',
    category: 'FDA Approval',
    specialtyName: 'Neurology',
    specialtyColor: Colors.specialty.neurology,
    specialtyIcon: 'flash',
    badge: 'FDA Fast-Track 2026',
    date: 'August 2026',
    journalOrSource: 'FDA Drug Approval Bulletin',
    headline: 'Continuous 24-hour subcutaneous infusion provides steady dopaminergic stimulation for advanced Parkinson’s.',
    keyTakeaways: [
      'Increases daily "On" time without troublesome dyskinesia by an average of 2.8 hours per day.',
      'Significantly reduces nocturnal akinesia and morning off-periods compared to oral standard-of-care.',
      'Minimally invasive wearable patch pump eliminates need for surgical PEG-J enteral placement.',
    ],
    clinicalImpact: 'Transforms the management of motor fluctuations in advanced Parkinson’s disease without major invasive surgery.',
    promptQuery: 'Discuss the indications, mechanism of continuous subcutaneous levodopa infusion, and comparison to enteral intestinal gel for advanced Parkinson disease.',
  },
  {
    id: 'update_4',
    title: 'Neoadjuvant Dual Checkpoint Blockade in Resectable NSCLC',
    category: 'Clinical Trial',
    specialtyName: 'Pulmonology & Onc',
    specialtyColor: Colors.specialty.pulmonology,
    specialtyIcon: 'leaf',
    badge: 'Lancet Oncology 2026',
    date: 'June 2026',
    journalOrSource: 'The Lancet Oncology',
    headline: 'Pathologic complete response (pCR) triples with perioperative Nivolumab + Ipilimumab + Platinum doublet.',
    keyTakeaways: [
      'Achieved 38.2% pathologic complete response vs 11.5% with chemotherapy alone in Stage II-IIIB NSCLC.',
      'Event-free survival (EFS) hazard ratio of 0.58 at 24 months post-surgical resection.',
      'Surgical resection rates and perioperative morbidity were comparable across treatment arms.',
    ],
    clinicalImpact: 'Firmly establishes perioperative immunotherapy as the gold standard for resectable locally advanced lung cancer.',
    promptQuery: 'Review the latest 2026 clinical data on perioperative immunotherapy combinations in resectable non-small cell lung cancer (NSCLC).',
  },
  {
    id: 'update_5',
    title: 'Direct Oral Anticoagulant Protocol in Splanchnic Vein Thrombosis',
    category: 'Safety Alert',
    specialtyName: 'Gastroenterology',
    specialtyColor: Colors.specialty.git,
    specialtyIcon: 'restaurant',
    badge: 'AASLD Consensus Update',
    date: 'July 2026',
    journalOrSource: 'Hepatology / AASLD Guidance',
    headline: 'DOACs prove non-inferior in recanalization with significantly lower major bleeding vs LMWH/VKA in non-cirrhotic SVT.',
    keyTakeaways: [
      'Apixaban and Rivaroxaban demonstrate 82% portal vein recanalization within 6 months when started early.',
      'Major GI bleeding incidence decreased by 42% compared to Warfarin in non-cirrhotic patients.',
      'Endoscopic screening and eradication of esophageal varices remains mandatory before DOAC initiation.',
    ],
    clinicalImpact: 'Establishes safe oral anticoagulant protocols for portal and mesenteric venous thrombosis.',
    promptQuery: 'What are the current consensus guidelines on DOAC safety, dosing, and variceal bleeding risks in portal vein thrombosis?',
  },
];
