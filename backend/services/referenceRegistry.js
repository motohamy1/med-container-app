/**
 * Medical Reference Registry & Harvester
 * 
 * Provides direct access to canonical clinical topics, guidelines, surgical protocols,
 * and high-yield references stored across the application.
 * 
 * Eliminates ungrounded AI "brainstorming" by harvesting verified topics directly
 * from local reference datasets, ingested custom knowledge, and knowledge gaps.
 */

const fs = require('fs');
const path = require('path');

// Canonical reference topics indexed by specialty ID
const CANONICAL_SPECIALTY_RESOURCES = {
    // 1. Pulmonology / Respiratory Medicine
    pulmonology: {
        id: 'pulmonology',
        aliases: ['lungs', 'respiratory'],
        name: 'Pulmonology & Respiratory Medicine',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Acute respiratory failure, airway emergencies, and life-threatening pulmonary conditions',
                topics: [
                    { title: 'Acute Severe Asthma & Status Asthmaticus', subtitle: 'GINA 2024 Criteria, Magnesium, Heliox & BiPAP', type: 'Emergency Protocol' },
                    { title: 'Acute Exacerbation of COPD (AECOPD)', subtitle: 'GOLD 2024 Staging, Non-Invasive Ventilation & Steroid/Antibiotic Dosing', type: 'Emergency Protocol' },
                    { title: 'Massive & Submassive Pulmonary Embolism', subtitle: 'PESI Score, Right Heart Strain, Systemic vs Catheter Thrombolysis', type: 'Emergency Protocol' },
                    { title: 'Tension & Spontaneous Pneumothorax', subtitle: 'Needle Thoracostomy (5th ICS), Chest Tube Insertion & Drainage Systems', type: 'Emergency Protocol' },
                    { title: 'Acute Respiratory Distress Syndrome (ARDS)', subtitle: 'Berlin Definition, Lung-Protective Ventilation (4-8 mL/kg PBW) & Proning', type: 'Emergency Protocol' },
                    { title: 'Massive Hemoptysis Protocol', subtitle: 'Bronchial Artery Embolization, Rigid Bronchoscopy & Cold Saline Lavage', type: 'Emergency Protocol' },
                    { title: 'Acute Epiglottitis & Severe Upper Airway Obstruction', subtitle: 'Awake Fiberoptic Intubation, Heliox & IV Ceftriaxone/Dexamethasone', type: 'Emergency Protocol' },
                    { title: 'Severe Community-Acquired Pneumonia (SCAP)', subtitle: 'SMART-COP / CURB-65, Empiric Beta-Lactam + Macrolide/Respiratory FQ', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Chronic pulmonary diseases, diagnostic algorithms, and evidence-based outpatient management',
                topics: [
                    { title: 'Chronic Obstructive Pulmonary Disease (COPD) Maintenance', subtitle: 'GOLD 2024 ABCD Paradigm, LAMA/LABA vs ICS Triad Therapy', type: 'Clinical Guideline' },
                    { title: 'Severe Asthma Stepwise Escalation', subtitle: 'SMART Strategy (Formoterol/ICS), Biologic Phenotyping (Anti-IL5/IL4R/TSLP)', type: 'Clinical Guideline' },
                    { title: 'Idiopathic Pulmonary Fibrosis (IPF) & Interstitial Lung Diseases', subtitle: 'HRCT UIP Pattern, Antifibrotics (Pirfenidone & Nintedanib)', type: 'Clinical Guideline' },
                    { title: 'Pulmonary Arterial Hypertension (PAH)', subtitle: 'WHO Functional Classification, Right Heart Cath & Dual/Triple Oral Vasodilators', type: 'Clinical Guideline' },
                    { title: 'Bronchiectasis & Non-CF Bronchiectasis Management', subtitle: 'Airway Clearance, Inhaled Mucoactive Agents & Chronic Macrolide Therapy', type: 'Clinical Guideline' },
                    { title: 'Obstructive Sleep Apnea (OSA) & Obesity Hypoventilation', subtitle: 'Apnea-Hypopnea Index (AHI), Polysomnography & CPAP/BiPAP Auto-Titration', type: 'Clinical Guideline' },
                    { title: 'Pulmonary Sarcoidosis & Granulomatous Lung Disease', subtitle: 'Scadding Radiographic Staging, Extrapulmonary Screening & Steroid Regimens', type: 'Clinical Guideline' },
                    { title: 'Solitary Pulmonary Nodule (SPN) Evaluation', subtitle: 'Fleischner Society Guidelines, Brock University Risk Model & PET/CT Workup', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Diagnostic scoring, physiological evaluations, and bedside procedural guidelines',
                topics: [
                    { title: 'Systematic Pulmonary Function Testing (PFT) Interpretation', subtitle: 'Spirometry (FEV1/FVC), Lung Plethysmography (TLC/RV) & DLCO Patterns', type: 'Diagnostic Tool' },
                    { title: 'Arterial Blood Gas (ABG) & Acid-Base Stepwise Analysis', subtitle: 'Henderson-Hasselbalch, Winter Formula, Delta-Delta & Anion Gap Algorithms', type: 'Diagnostic Tool' },
                    { title: 'Thoracentesis & Pleural Fluid Light Criteria', subtitle: 'Transudate vs Exudate Differentiation, Fluid pH, Pleural Amylase & Cytology', type: 'Diagnostic Tool' },
                    { title: 'Bedside Lung Ultrasound (BLUE Protocol)', subtitle: 'A-lines, B-lines, Lung Sliding, Consolidation & Pneumothorax Identification', type: 'Diagnostic Tool' },
                    { title: 'Wells & Geneva Pulmonary Embolism Risk Scoring', subtitle: 'Pre-Test Probability Stratification, Age-Adjusted D-Dimer & PERC Rule', type: 'Diagnostic Tool' },
                    { title: 'CURB-65 & PSI (Pneumonia Severity Index) Stratification', subtitle: 'Mortality Prediction, Outpatient vs Inpatient vs ICU Admission Criteria', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark clinical trials, updated ATS/ERS guidelines, and novel pulmonary therapeutics',
                topics: [
                    { title: 'Triple Inhalation Therapy in COPD (ETHOS & IMPACT Trials)', subtitle: 'Single-Inhaler Fluticasone/Umeclidinium/Vilanterol Mortality Benefits', type: 'Trial & Evidence' },
                    { title: 'Biologic Therapies in Severe Asthma (Tezepelumab / NAVIGATOR Trial)', subtitle: 'Anti-TSLP Efficacy Across Eosinophilic and Non-Eosinophilic Asthma Phenotypes', type: 'Trial & Evidence' },
                    { title: 'Prone Positioning in Non-Intubated ARDS (Awake Prone Meta-Analyses)', subtitle: 'Reduction in Endotracheal Intubation Rates with High-Flow Nasal Cannula', type: 'Trial & Evidence' },
                    { title: 'Antifibrotic Therapy in Progressive Pulmonary Fibrosis (INBUILD Trial)', subtitle: 'Nintedanib in Non-IPF Progressive Fibrosing Interstitial Lung Diseases', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 2. Cardiology / Cardiovascular Medicine
    heart: {
        id: 'heart',
        aliases: ['cardio', 'cardiology', 'cardiovascular'],
        name: 'Cardiology',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Acute coronary syndromes, shock, and lethal arrhythmias',
                topics: [
                    { title: 'Acute Coronary Syndrome (STEMI vs NSTEMI)', subtitle: 'STEMI vs NSTEMI Workup, DAPT & PCI Timing (Door-to-Balloon <90m)', type: 'Emergency Protocol' },
                    { title: 'Acute Decompensated Heart Failure & Cardiogenic Shock', subtitle: 'Wet/Cold Hemodynamic Profiling, Inotropes & GDMT', type: 'Emergency Protocol' },
                    { title: 'Atrial Fibrillation with Rapid Ventricular Response (RVR)', subtitle: 'Rate vs Rhythm Control & CHA2DS2-VASc Anticoagulation', type: 'Emergency Protocol' },
                    { title: 'Acute Aortic Dissection', subtitle: 'Stanford Classification, Anti-Impulse Hemodynamic Control & Emergent Surgery', type: 'Emergency Protocol' },
                    { title: 'Hypertensive Emergency & Target Organ Damage', subtitle: 'Labetalol/Nicardipine Infusion, MAP Reduction Rules & Dissection/Encephalopathy', type: 'Emergency Protocol' },
                    { title: 'Ventricular Tachycardia (VT) & Electrical Storm', subtitle: 'Stable vs Unstable Monomorphic/Polymorphic VT, Amiodarone & Stellate Ganglion Block', type: 'Emergency Protocol' },
                    { title: 'Cardiac Tamponade & Pericardiocentesis', subtitle: 'Beck Triad, Pulsus Paradoxus >10 mmHg & Subxiphoid Needle Drainage', type: 'Emergency Protocol' },
                    { title: 'Acute Myocarditis & Fulminant Heart Failure', subtitle: 'Cardiac MRI Lake Louise Criteria, Endomyocardial Biopsy & Inotropic/MCS Support', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Chronic cardiovascular diseases, heart failure, and preventive cardiology',
                topics: [
                    { title: 'Essential Hypertension Guidelines', subtitle: 'ACC/AHA & ESC Staging, GDMT & Resistant HTN Spironolactone Protocols', type: 'Clinical Guideline' },
                    { title: 'Chronic Coronary Syndromes (Stable Ischemic Heart Disease)', subtitle: 'Stable Angina, CCTA, Functional Stress & ISCHEMIA Trial Principles', type: 'Clinical Guideline' },
                    { title: 'Dyslipidemia & ASCVD Risk Reduction', subtitle: 'Statin Intensity, Ezetimibe, PCSK9 Monoclonals & Bempedoic Acid', type: 'Clinical Guideline' },
                    { title: 'Heart Failure with Reduced Ejection Fraction (HFrEF 4 Pillars)', subtitle: 'Quadruple GDMT (ARNI + Beta-Blocker + MRA + SGLT2i) Initiation Matrix', type: 'Clinical Guideline' },
                    { title: 'Heart Failure with Preserved Ejection Fraction (HFpEF)', subtitle: 'H2FPEF Score, SGLT2 Inhibitors, GLP-1 RAs & Diuretic Titration', type: 'Clinical Guideline' },
                    { title: 'Aortic Stenosis & Transcatheter Aortic Valve Implantation (TAVI)', subtitle: 'Severe AS Criteria, AVA <1.0 cm², Mean Gradient ≥40 mmHg & TAVI vs SAVR', type: 'Clinical Guideline' },
                    { title: 'Mitral Regurgitation & Transcatheter Edge-to-Edge Repair (TEER)', subtitle: 'Primary vs Secondary MR, COAPT Trial & MitraClip Indications', type: 'Clinical Guideline' },
                    { title: 'Hypertrophic Cardiomyopathy (HCM)', subtitle: 'LVOT Gradient, Sudden Cardiac Death Stratification & Mavacamten Therapy', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'ECG interpretation, echocardiography, and risk scoring calculators',
                topics: [
                    { title: 'Systematic 12-Lead ECG Interpretation', subtitle: 'Axis, Ischemia Territories, Bundle Branch Blocks, Sgarbossa & QTc Intervals', type: 'Diagnostic Tool' },
                    { title: 'Transthoracic Echocardiography & EF Assessment', subtitle: 'Simpson Biplane Method, Diastology (E/e\') & Valvular Gradients', type: 'Diagnostic Tool' },
                    { title: 'CHA2DS2-VASc & HAS-BLED Anticoagulation Scoring', subtitle: 'Stroke vs Bleeding Risk Calculation in Non-Valvular Atrial Fibrillation', type: 'Diagnostic Tool' },
                    { title: 'TIMI & GRACE Risk Stratification in NACS', subtitle: 'Mortality & Ischemic Event Prediction Guiding Early Invasive Strategy (<24h)', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark cardiology trials, guideline updates, and novel therapeutics',
                topics: [
                    { title: 'SGLT2 Inhibitors Across Heart Failure Spectrum (DAPA-HF & DELIVER)', subtitle: 'Universal Cardiovascular Death & HF Hospitalization Reduction Regardless of EF', type: 'Trial & Evidence' },
                    { title: 'GLP-1 Receptor Agonists in CVD & Obesity (SELECT Trial)', subtitle: 'Semaglutide 2.4 mg 20% MACE Reduction in Non-Diabetic Overweight Patients', type: 'Trial & Evidence' },
                    { title: 'Mavacamten in Obstructive HCM (EXPLORER-HCM Trial)', subtitle: 'Cardiac Myosin Inhibitor for LVOT Gradient Reduction & Symptom Relief', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 3. Gastroenterology & Hepatology
    git: {
        id: 'git',
        aliases: ['gastro', 'gastroenterology', 'hepatology'],
        name: 'Gastroenterology & Hepatology',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Acute GI hemorrhages, infections, and hepatic decompensation',
                topics: [
                    { title: 'Acute Upper GI Bleeding', subtitle: 'Glasgow-Blatchford Score, Variceal vs Peptic Ulcer & Endoscopy Timing', type: 'Emergency Protocol' },
                    { title: 'Acute Pancreatitis Management', subtitle: 'Revised Atlanta Criteria, BISAP Score & Goal-Directed Ringer Lactate Resuscitation', type: 'Emergency Protocol' },
                    { title: 'Acute Ascending Cholangitis', subtitle: 'Tokyo Guidelines (TG18), Charcot Triad & Urgent ERCP Biliary Decompression', type: 'Emergency Protocol' },
                    { title: 'Spontaneous Bacterial Peritonitis (SBP)', subtitle: 'Diagnostic Paracentesis (PMN ≥250/µL), IV Cefotaxime & IV Albumin Infusion', type: 'Emergency Protocol' },
                    { title: 'Acute Lower GI Bleeding', subtitle: 'Oakland Score, CTA Localization & Colonoscopy / Embolization Strategy', type: 'Emergency Protocol' },
                    { title: 'Acute Liver Failure (ALF) & Acetaminophen Toxicity', subtitle: 'King\'s College Criteria, Rumack-Matthew Nomogram & IV N-Acetylcysteine', type: 'Emergency Protocol' },
                    { title: 'Hepatic Encephalopathy (HE)', subtitle: 'West Haven Staging, Lactulose Titration & Oral Rifaximin 550 mg BID', type: 'Emergency Protocol' },
                    { title: 'Acute Mesenteric Ischemia', subtitle: 'SMA Embolism/Thrombosis, Biphasic CT Angiography & Emergent Revascularization', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Chronic liver diseases, inflammatory bowel disease, and luminal disorders',
                topics: [
                    { title: 'Inflammatory Bowel Disease (Crohn vs Ulcerative Colitis)', subtitle: 'Mayo Endoscopic Score, Biologics (Anti-TNF, Anti-IL23) & Mucosal Healing', type: 'Clinical Guideline' },
                    { title: 'Cirrhosis & Portal Hypertension Management', subtitle: 'Child-Pugh & MELD-Na Scoring, Non-Selective Beta-Blockers & Variceal Banding', type: 'Clinical Guideline' },
                    { title: 'Metabolic Dysfunction-Associated Steatohepatitis (MASH / NAFLD)', subtitle: 'FIB-4 Index, Resmetirom (THR-beta agonist) & Lifestyle Interventions', type: 'Clinical Guideline' },
                    { title: 'Helicobacter Pylori Eradication Regimens', subtitle: 'Bismuth Quadruple Therapy vs Concomitant Non-Bismuth Regimens', type: 'Clinical Guideline' },
                    { title: 'Irritable Bowel Syndrome (IBS-C / IBS-D)', subtitle: 'Rome IV Criteria, Low-FODMAP Diet, Lubiprostone & Linaclotide', type: 'Clinical Guideline' },
                    { title: 'Celiac Disease Diagnostic & Therapeutic Framework', subtitle: 'Anti-tTG IgA, Duodenal Biopsy Marsh Classification & Gluten-Free Protocol', type: 'Clinical Guideline' },
                    { title: 'Clostridioides Difficile Infection (CDI)', subtitle: 'First-Line Oral Fidaxomicin vs Vancomycin & Fecal Microbiota Transplant (FMT)', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Endoscopic classifications, risk stratification formulas, and liver function panels',
                topics: [
                    { title: 'MELD-Na & Child-Pugh Cirrhosis Staging', subtitle: 'Liver Transplant Prioritization, 90-Day Mortality & Hepatic Reserve', type: 'Diagnostic Tool' },
                    { title: 'Glasgow-Blatchford & Rockall GI Bleed Scoring', subtitle: 'Outpatient Triage vs Urgent Endoscopic Hemostasis Stratification', type: 'Diagnostic Tool' },
                    { title: 'FIB-4 Index & Transient Elastography (FibroScan)', subtitle: 'Non-Invasive Hepatic Fibrosis Staging in MASH and Viral Hepatitis', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark gastroenterology trials, FDA approvals, and guideline updates',
                topics: [
                    { title: 'Resmetirom in MASH with Moderate-to-Advanced Fibrosis (MAESTRO-NASH)', subtitle: 'First FDA-Approved Thyroid Hormone Receptor-Beta Agonist for MASH Fibrosis', type: 'Trial & Evidence' },
                    { title: 'Dual IL-23 and TNF Inhibition in Inflammatory Bowel Disease', subtitle: 'Guselkumab and Risankizumab Remission Rates in Ulcerative Colitis & Crohn', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 4. Neurology & Neurocritical Care
    neuro: {
        id: 'neuro',
        aliases: ['neurology', 'brain'],
        name: 'Neurology & Neurocritical Care',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Acute ischemic stroke, intracerebral hemorrhage, and status epilepticus',
                topics: [
                    { title: 'Acute Ischemic Stroke (Thrombolysis & Thrombectomy)', subtitle: 'NIHSS Scoring, IV Tenecteplase/Alteplase (<4.5h) & EVT (<24h DAWN/DEFUSE-3)', type: 'Emergency Protocol' },
                    { title: 'Spontaneous Intracerebral Hemorrhage (ICH)', subtitle: 'ICH Score, Intensive BP Lowering (Target SBP 130-140) & Coagulopathy Reversal', type: 'Emergency Protocol' },
                    { title: 'Aneurysmal Subarachnoid Hemorrhage (aSAH)', subtitle: 'Hunt-Hess / Fisher Scales, Nimodipine, Coiling vs Clipping & Vasospasm Prevention', type: 'Emergency Protocol' },
                    { title: 'Status Epilepticus Stepwise Escalation', subtitle: 'IV Lorazepam (0.1 mg/kg) -> IV Levetiracetam/Fosphenytoin -> Midazolam/Propofol', type: 'Emergency Protocol' },
                    { title: 'Acute Bacterial Meningitis Protocol', subtitle: 'Immediate Dexamethasone (10mg IV) before IV Ceftriaxone + Vancomycin + Ampicillin', type: 'Emergency Protocol' },
                    { title: 'Elevated Intracranial Pressure (ICP) & Brain Herniation', subtitle: 'Tier 1-3 Neurocritical Protocol, Hypertonic Saline (3%) vs Mannitol & Hyperventilation', type: 'Emergency Protocol' },
                    { title: 'Myasthenic Crisis & Guillain-Barré Syndrome', subtitle: 'Negative Inspiratory Force (NIF < -20), Forced Vital Capacity (<20 mL/kg), IVIG & PLEX', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Chronic neurological disorders, headache syndromes, and neurodegenerative conditions',
                topics: [
                    { title: 'Parkinson Disease Management', subtitle: 'Levodopa/Carbidopa Motor Fluctuations, Dopamine Agonists & MAO-B Inhibitors', type: 'Clinical Guideline' },
                    { title: 'Multiple Sclerosis (Relapsing-Remitting vs Progressive)', subtitle: 'McDonald 2017 Criteria, High-Efficacy DMTs (Ocrelizumab, Natalizumab, Ofatumumab)', type: 'Clinical Guideline' },
                    { title: 'Acute & Preventive Migraine Management', subtitle: 'Triptans, CGRP Antagonists (Ubrogepant/Rimegepant) & Monoclonals (Erenumab)', type: 'Clinical Guideline' },
                    { title: 'Epilepsy & Antiseizure Medication Selection', subtitle: 'Focal vs Generalized Seizure Syndromes, Levetiracetam, Lamotrigine & Valproate Safety', type: 'Clinical Guideline' },
                    { title: 'Alzheimer Disease & Cognitive Impairment', subtitle: 'Cholinesterase Inhibitors, Memantine & Amyloid-Targeted Monoclonals (Lecanemab/Donanemab)', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Neurological scoring systems, neuroimaging analysis, and lumbar puncture interpretation',
                topics: [
                    { title: 'NIH Stroke Scale (NIHSS) Scoring System', subtitle: 'Systematic 11-Item Neurological Exam Quantifying Stroke Deficits (0-42)', type: 'Diagnostic Tool' },
                    { title: 'Glasgow Coma Scale (GCS) Assessment', subtitle: 'Eye, Verbal, Motor Evaluation (3-15) & Intubation Threshold (GCS ≤8)', type: 'Diagnostic Tool' },
                    { title: 'Lumbar Puncture & CSF Analysis Algorithm', subtitle: 'Opening Pressure, Protein, Glucose, Cell Count & Gram Stain in CNS Infections', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark neurology trials, stroke window expansions, and Alzheimer monoclonal trials',
                topics: [
                    { title: 'Tenecteplase in Acute Ischemic Stroke (AcT & EXTEND-IA TNK Trials)', subtitle: 'Single IV Bolus TNK Non-Inferiority and Superior Reperfusion vs Alteplase', type: 'Trial & Evidence' },
                    { title: 'Amyloid-Beta Monoclonals in Early Alzheimer Disease (Clarity AD & TRAILBLAZER)', subtitle: 'Lecanemab and Donanemab Cognitive Decline Slowing & ARIA Monitoring', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 5. Nephrology & Renal Medicine
    nephrology: {
        id: 'nephrology',
        aliases: ['renal', 'kidney'],
        name: 'Nephrology & Renal Medicine',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Severe electrolyte derangements, acute uremia, and dialytic emergencies',
                topics: [
                    { title: 'Severe Hyperkalemia Emergency Protocol', subtitle: 'Membrane Stabilization (IV Calcium), Intracellular Shift & Potassium Elimination', type: 'Emergency Protocol' },
                    { title: 'Acute Kidney Injury (KDIGO Staging) & Workup', subtitle: 'Prerenal vs ATN vs AIN Differentiation, FeNa / FeUrea & Fluid Challenge', type: 'Emergency Protocol' },
                    { title: 'Urgent Dialysis Indications ("AEIOU")', subtitle: 'Refractory Acidosis, Severe Electrolytes, Ingestions, Volume Overload & Uremia', type: 'Emergency Protocol' },
                    { title: 'Severe Dysnatremias (Hyponatremia & Hypernatremia)', subtitle: '3% Hypertonic Saline, Desmopressin Clamp & Osmotic Demyelination Prevention (Max 8 mEq/L/24h)', type: 'Emergency Protocol' },
                    { title: 'Severe Metabolic Acidosis & Sodium Bicarbonate Protocol', subtitle: 'High Anion Gap vs Non-Gap Acidosis, Winter Formula & Bicarbonate Replacement Rules', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Chronic kidney disease, glomerular diseases, and resistant hypertension',
                topics: [
                    { title: 'Chronic Kidney Disease (KDIGO Staging & GDMT)', subtitle: 'G1-G5 / A1-A3 Heatmap, SGLT2 Inhibitors, Finerenone & ACEi/ARB Regimens', type: 'Clinical Guideline' },
                    { title: 'Nephrotic Syndrome (Minimal Change, FSGS, Membranous)', subtitle: 'Heavy Proteinuria (>3.5 g/24h), Hypercoagulability, Corticosteroids & Biologics', type: 'Clinical Guideline' },
                    { title: 'Rapidly Progressive Glomerulonephritis (RPGN / ANCA Vasculitis)', subtitle: 'Crescentic GN, Anti-GBM, Pulse Methylprednisolone, Cyclophosphamide & Avacopan', type: 'Clinical Guideline' },
                    { title: 'Autosomal Dominant Polycystic Kidney Disease (ADPKD)', subtitle: 'Mayo Imaging Classification, Total Kidney Volume & Tolvaptan (V2 Antagonist)', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Renal equations, fractional excretion formulas, and urine microscopy',
                topics: [
                    { title: 'CKD-EPI 2021 eGFR Calculation (Race-Free)', subtitle: 'Serum Creatinine & Cystatin-C Equations for Accurate Renal Dosing Adjustment', type: 'Diagnostic Tool' },
                    { title: 'Urinary Indices (FeNa, FeUrea, Urine Osmolality)', subtitle: 'Distinguishing Pre-Renal Azotemia from Acute Tubular Necrosis in Diuretic Patients', type: 'Diagnostic Tool' },
                    { title: 'Urine Sediment Microscopy Interpretation', subtitle: 'Muddy Brown Granular Casts (ATN), RBC Casts (GN) & WBC Casts (AIN)', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark nephrology trials, cardiorenal protection, and complement inhibitors',
                topics: [
                    { title: 'SGLT2 Inhibitors in Non-Diabetic CKD (DAPA-CKD & EMPA-KIDNEY)', subtitle: 'Significant Reductions in Renal Disease Progression & Cardiovascular Death', type: 'Trial & Evidence' },
                    { title: 'Non-Steroidal MRA in Diabetic CKD (FIDELIO-DKD & FIGARO-DKD)', subtitle: 'Finerenone Efficacy in Preserving Renal Function with Lower Hyperkalemia Risk', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 6. Endocrinology & Metabolism
    endocrinology: {
        id: 'endocrinology',
        aliases: ['endo', 'diabetes', 'metabolism'],
        name: 'Endocrinology & Metabolism',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Diabetic emergencies, adrenal crisis, and thyroid storms',
                topics: [
                    { title: 'Diabetic Ketoacidosis (DKA) Management Protocol', subtitle: 'Hyperglycemia, Anion Gap Acidosis, IV Insulin Infusion & Potassium Repletion Rules', type: 'Emergency Protocol' },
                    { title: 'Hyperosmolar Hyperglycemic State (HHS)', subtitle: 'Severe Dehydration, Osmolality >320 mOsm/kg, Vigorous IV Fluids & Insulin Dosing', type: 'Emergency Protocol' },
                    { title: 'Thyroid Storm (Burch-Wartofsky Score ≥45)', subtitle: 'Quadruple Therapy: Beta-Blocker -> PTU -> Lugol Iodine (after 1h) -> IV Hydrocortisone', type: 'Emergency Protocol' },
                    { title: 'Myxedema Coma Emergency', subtitle: 'Severe Hypothermia, Altered Mentation, IV Levothyroxine (T4) + IV Liothyronine (T3) + Stress Steroids', type: 'Emergency Protocol' },
                    { title: 'Acute Adrenal Crisis', subtitle: 'Refractory Hypotension, Hypoglycemia, Hyperkalemia & Immediate IV Hydrocortisone 100 mg', type: 'Emergency Protocol' },
                    { title: 'Severe Hypercalcemic Crisis', subtitle: 'Serum Calcium >14 mg/dL, Aggressive Isotonic Saline, IV Zoledronic Acid & Calcitonin', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Type 1 and Type 2 diabetes algorithms, thyroid nodules, and pituitary/osteoporosis guidelines',
                topics: [
                    { title: 'Type 2 Diabetes ADA Standards of Care (2024/2025)', subtitle: 'Cardiorenal Risk-First Paradigm, Dual GIP/GLP-1 RAs (Tirzepatide), SGLT2i & Metformin', type: 'Clinical Guideline' },
                    { title: 'Inpatient Glycemic Control & Insulin Regimens', subtitle: 'Basal-Bolus vs Correctional Scale, CGM in Hospital & Steroid-Induced Hyperglycemia', type: 'Clinical Guideline' },
                    { title: 'Thyroid Nodules & ATA Risk Stratification', subtitle: 'TIRADS Ultrasound Grading, FNA Biopsy Thresholds & Bethesda Cytopathology', type: 'Clinical Guideline' },
                    { title: 'Primary Hyperparathyroidism & Osteoporosis', subtitle: 'Asymptomatic Surgical Indications, Bone Mineral Density (DEXA T-Score) & Bisphosphonates / Denosumab', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Endocrine diagnostic workups, stimulation testing, and dynamic hormone panels',
                topics: [
                    { title: 'Burch-Wartofsky Point Scale for Thyroid Storm', subtitle: 'Diagnostic Scoring for Thermoregulatory, CNS, GI, and Cardiovascular Dysfunction', type: 'Diagnostic Tool' },
                    { title: 'Short Synacthen (ACTH Stimulation) Test Protocol', subtitle: 'Cosyntropin 250 mcg IV/IM with Baseline, 30m, and 60m Cortisol Assay Interpretation', type: 'Diagnostic Tool' },
                    { title: 'Dexamethasone Suppression Tests in Cushing Syndrome', subtitle: '1mg Overnight Low-Dose Screening vs High-Dose Suppression in Pituitary vs Ectopic ACTH', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark endocrine trials, incretin co-agonists, and automated insulin delivery',
                topics: [
                    { title: 'Dual GIP/GLP-1 Co-Agonism in Diabetes & Obesity (SURPASS & SURMOUNT)', subtitle: 'Tirzepatide Superiority in HbA1c Lowering and Sustained Body Weight Reduction', type: 'Trial & Evidence' },
                    { title: 'Triple Hormone Receptor Agonists in Cardiometabolic Disease (Retatrutide)', subtitle: 'GLP-1/GIP/Glucagon Triple Agonism Achieving Landmark Weight Loss and Steatosis Reversal', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 7. Critical Care & Emergency Medicine
    critical_care: {
        id: 'critical_care',
        aliases: ['icu', 'emergency_medicine', 'em_critical_care'],
        name: 'Emergency & Critical Care Medicine',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Resuscitation in catastrophic shock, acute airway compromise, and septic shock',
                topics: [
                    { title: 'Undifferentiated Shock & RUSH Ultrasound Protocol', subtitle: 'Pump (TTE), Tank (IVC/Lungs), Pipes (Aorta/DVT) Rapid Bedside Diagnostic Matrix', type: 'Emergency Protocol' },
                    { title: 'Rapid Sequence Intubation (RSI) in Shock', subtitle: 'Hemodynamic Sedative Optimization, Ketamine/Etomidate & Push-Dose Pressor Support', type: 'Emergency Protocol' },
                    { title: 'Septic Shock & Surviving Sepsis Campaign 1-Hour Bundle', subtitle: 'Lactate, Blood Cultures, 30 mL/kg Crystalloid & Norepinephrine/Vasopressin Matrix', type: 'Emergency Protocol' },
                    { title: 'Severe Anaphylactic Shock', subtitle: 'Intramuscular Epinephrine (0.3-0.5 mg 1:1,000 mid-thigh), IV Fluids & Refractory Epinephrine Infusion', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'ICU delirium, mechanical ventilation weaning, and sedation/paralysis management',
                topics: [
                    { title: 'ARDS Lung-Protective Mechanical Ventilation Protocol', subtitle: 'Tidal Volume 4-8 mL/kg PBW, Plateau Pressure <30 cmH2O & PEEP/FiO2 Titration', type: 'Clinical Guideline' },
                    { title: 'Vasoactive & Inotropic Infusion Management', subtitle: 'Norepinephrine, Epinephrine, Vasopressin, Dobutamine & Milrinone Pharmacodynamics', type: 'Clinical Guideline' },
                    { title: 'ICU Delirium & Sedation (PADIS Guidelines)', subtitle: 'CAM-ICU Screening, Light Sedation (Dexmedetomidine/Propofol) & ABCDEF Bundle', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Bedside critical care ultrasonography, invasive lines, and arterial waveforms',
                topics: [
                    { title: 'Central Venous Catheter (CVC) & Arterial Line Placement', subtitle: 'Internal Jugular Ultrasound Guidance, Radial Artery Cannulation & Sterile Barrier Checklist', type: 'Diagnostic Tool' },
                    { title: 'SOFA & qSOFA Sepsis Organ Failure Scoring', subtitle: 'Quantifying Multiorgan Failure & Mortality Prediction in the Intensive Care Unit', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark critical care trials, proning trials, and septic shock resuscitation trials',
                topics: [
                    { title: 'PROSEVA Landmark Trial in Severe ARDS', subtitle: 'Early Prone Positioning (≥16h/day) Significant 28-Day and 90-Day Mortality Reduction', type: 'Trial & Evidence' },
                    { title: 'VASST and ANDROMEDA-SHOCK Resuscitation Trials', subtitle: 'Capillary Refill Time-Guided Resuscitation vs Serum Lactate in Early Septic Shock', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 8. Pediatrics & Neonatal Medicine
    pediatrics: {
        id: 'pediatrics',
        aliases: ['peds', 'pediatric', 'neonatology'],
        name: 'Pediatrics & Neonatal Medicine',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Pediatric resuscitation, neonatal sepsis, and acute airway emergencies',
                topics: [
                    { title: 'Febrile Infant Protocol (<60 Days Old)', subtitle: 'Full Sepsis Workup (<28d Ampicillin+Ceftazidime) & PECARN/Step-by-Step Risk Stratification', type: 'Emergency Protocol' },
                    { title: 'Acute Croup (Laryngotracheobronchitis) vs Epiglottitis', subtitle: 'Westley Score, Single-Dose Oral Dexamethasone (0.6 mg/kg) & Nebulized Racemic Epinephrine', type: 'Emergency Protocol' },
                    { title: 'Pediatric Status Epilepticus & PALS Algorithm', subtitle: 'Broselow Tape Dosing, Midazolam Buccal/IM -> IV Levetiracetam (60 mg/kg)', type: 'Emergency Protocol' },
                    { title: 'Pediatric Septic Shock & 20 mL/kg Fluid Bolus', subtitle: 'Rapid Fluid Resuscitation, Epinephrine/Norepinephrine Infusion & Stress Steroid Thresholds', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Pediatric asthma, bronchiolitis, and common childhood infections',
                topics: [
                    { title: 'Acute Bronchiolitis Management (AAP Guidelines)', subtitle: 'Clinical Diagnosis, Supportive Care, High-Flow Nasal Cannula & Avoidance of Routine Albuterol/Steroids', type: 'Clinical Guideline' },
                    { title: 'Pediatric Asthma Exacerbation Pathways', subtitle: 'Pediatric Respiratory Assessment Measure (PRAM), Inhaled SABA + Ipratropium & Oral Prednisolone', type: 'Clinical Guideline' },
                    { title: 'Kawasaki Disease & MIS-C Diagnostic Guidelines', subtitle: 'Fever ≥5 Days + Classic Criteria, High-Dose IVIG (2 g/kg) + High-Dose Aspirin & Coronary Echo', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Weight-based fluid formulas, pediatric vital signs, and growth curves',
                topics: [
                    { title: 'Holliday-Segar (4-2-1 Rule) Pediatric Maintenance Fluids', subtitle: 'Isotonic Maintenance Fluid Calculation (D5 0.9% NaCl + 20 mEq/L KCl) & Deficit Replacement', type: 'Diagnostic Tool' },
                    { title: 'Pediatric Glasgow Coma Scale & Age-Specific Vitals', subtitle: 'Normal Heart Rate, Blood Pressure & Respiratory Rate Ranges from Neonate to Adolescent', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark pediatric clinical trials and updated AAP guidelines',
                topics: [
                    { title: 'High-Flow Nasal Cannula in Pediatric Bronchiolitis (PARIS Trial)', subtitle: 'Early HFNC Impact on Escalation of Care and ICU Transfer Rates', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 9. Hematology & Medical Oncology
    hematology_oncology: {
        id: 'hematology_oncology',
        aliases: ['heme_onc', 'hematology', 'oncology'],
        name: 'Hematology & Medical Oncology',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Febrile neutropenia, acute oncologic emergencies, and coagulopathies',
                topics: [
                    { title: 'Febrile Neutropenia Emergency Protocol', subtitle: 'MASCC Score, 60-Minute Door-to-Antibiotic Rule (Cefepime / Pip-Tazo / Meropenem)', type: 'Emergency Protocol' },
                    { title: 'Tumor Lysis Syndrome (Cairo-Bishop Staging)', subtitle: 'Aggressive Hydration (2.5-3 L/m²/day), Allopurinol Prevention & Rasburicase 0.2 mg/kg IV', type: 'Emergency Protocol' },
                    { title: 'Heparin-Induced Thrombocytopenia (4Ts Score & Argatroban)', subtitle: 'Platelet Drop >50%, Anti-PF4 Testing & Non-Heparin Direct Thrombin Inhibitors', type: 'Emergency Protocol' },
                    { title: 'Thrombotic Thrombocytopenic Purpura (TTP / PLASMIC Score)', subtitle: 'ADAMTS13 Activity <10%, Immediate Plasma Exchange (PLEX) + Steroids + Caplacizumab', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Anemia workups, sickle cell disease, and anticoagulant selection',
                topics: [
                    { title: 'Sickle Cell Vaso-Occlusive Pain Crisis (VOC)', subtitle: 'Rapid Individualized IV Opioids within 30 mins, Hydration & Hydroxyurea Escalation', type: 'Clinical Guideline' },
                    { title: 'Immune Thrombocytopenia (ITP) First-Line Management', subtitle: 'Platelets <30k with Bleeding: IVIG (1 g/kg) + High-Dose Dexamethasone (40 mg/day x 4d)', type: 'Clinical Guideline' },
                    { title: 'Direct Oral Anticoagulant (DOAC) Dosing & Reversal Matrix', subtitle: 'Apixaban/Rivaroxaban Dosing by CrCl, Andexanet Alfa & Idarucizumab (Praxbind)', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Coagulation assays, peripheral smear interpretation, and MASCC score',
                topics: [
                    { title: 'Peripheral Blood Smear Systematic Interpretation', subtitle: 'Schistocytes (MAHA/TTP/DIC), Hypersegmented Neutrophils (B12/Folate), Blast Cells & Rouleaux', type: 'Diagnostic Tool' },
                    { title: 'MASCC Risk Index in Febrile Neutropenia', subtitle: 'Outpatient Oral (Cipro + Augmentin) vs Mandatory Inpatient IV Antibiotic Stratification', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark hematology/oncology clinical trials and novel immunotherapies',
                topics: [
                    { title: 'Caplacizumab in Acquired TTP (HERCULES Trial)', subtitle: 'Anti-vWF Nanobody Significantly Accelerating Platelet Count Normalization and Reducing Mortality', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 10. Rheumatology & Autoimmune Diseases
    rheumatology: {
        id: 'rheumatology',
        aliases: ['rheum', 'autoimmune'],
        name: 'Rheumatology & Autoimmune Diseases',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Vasculitis crises, acute lupus nephritis, and acute joint infections',
                topics: [
                    { title: 'Giant Cell (Temporal) Arteritis Emergency', subtitle: 'Age >50, Jaw Claudication, Vision Loss -> Immediate High-Dose IV/Oral Steroids before Biopsy', type: 'Emergency Protocol' },
                    { title: 'Acute Monoarthritis (Septic Joint vs Gout/CPPD)', subtitle: 'Arthrocentesis Synovial Fluid WBC >50k, Polarized Crystals & Empiric IV Vancomycin', type: 'Emergency Protocol' },
                    { title: 'Systemic Lupus Erythematosus (SLE) Severe Flare & Lupus Nephritis', subtitle: 'ISN/RPS Class III/IV, Pulse Methylprednisolone + Mycophenolate Mofetil / Cyclophosphamide + Belimumab', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Rheumatoid arthritis, axial spondyloarthritis, and systemic sclerosis',
                topics: [
                    { title: 'Rheumatoid Arthritis Treat-to-Target (ACR Guidelines)', subtitle: 'Methotrexate First-Line (15-25 mg weekly) + Folic Acid, Biologic DMARDs (Anti-TNF/JAKi)', type: 'Clinical Guideline' },
                    { title: 'Axial Spondyloarthritis & Ankylosing Spondylitis', subtitle: 'ASAS Classification, HLA-B27, Sacroiliitis on MRI, NSAIDs & IL-17/TNF Inhibitors', type: 'Clinical Guideline' },
                    { title: 'Systemic Sclerosis (Scleroderma) & Renal Crisis', subtitle: 'Limited vs Diffuse SSc, ACE Inhibitors Mandatory for Renal Crisis (Avoid High-Dose Steroids)', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Autoantibody panels, synovial fluid analysis, and disease activity calculators',
                topics: [
                    { title: 'Comprehensive Autoantibody Panel Interpretation', subtitle: 'ANA Patterns, Anti-dsDNA, Anti-Smith, Anti-SSA/SSB, Anti-CCP, ANCA (PR3/MPO) Specificity Matrix', type: 'Diagnostic Tool' },
                    { title: 'Synovial Fluid Crystal & Cell Count Analysis', subtitle: 'Differentiating Monosodium Urate (Needle / Negative) from Calcium Pyrophosphate (Rhomboid / Positive)', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark trials in rheumatology, JAK inhibitor safety trials, and CAR-T in autoimmunity',
                topics: [
                    { title: 'CAR-T Cell Therapy in Refractory Systemic Autoimmune Diseases', subtitle: 'Landmark NEJM Studies on CD19 CAR-T Inducing Drug-Free Remission in SLE and SSc', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 11. Psychiatry & Behavioral Health
    psychiatry: {
        id: 'psychiatry',
        aliases: ['psych', 'behavioral_health'],
        name: 'Psychiatry & Behavioral Health',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Acute agitation, toxic syndrome differentiation, and severe withdrawal',
                topics: [
                    { title: 'Acute Severe Agitation & Chemical De-escalation (Project BETA)', subtitle: 'Verbal First, IM Haloperidol 5mg + Lorazepam 2mg ("5 & 2"), IM Olanzapine, or IM Ketamine', type: 'Emergency Protocol' },
                    { title: 'Serotonin Syndrome vs Neuroleptic Malignant Syndrome (NMS)', subtitle: 'Hunter Criteria (Hyperreflexia/Clonus) vs Lead-Pipe Rigidity & Extreme Hyperthermia', type: 'Emergency Protocol' },
                    { title: 'Alcohol Withdrawal & Delirium Tremens (CIWA-Ar Protocol)', subtitle: 'Symptom-Triggered Diazepam/Lorazepam Regimens + High-Dose IV Thiamine (500 mg TID)', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Major depressive disorder, bipolar disorder, and schizophrenia maintenance',
                topics: [
                    { title: 'Major Depressive Disorder Stepwise Pharmacotherapy', subtitle: 'SSRI/SNRI First-Line, Augmentation Strategies (Aripiprazole, Lithium, Bupropion), Esketamine', type: 'Clinical Guideline' },
                    { title: 'Bipolar I / II Disorder Acute Mania & Maintenance', subtitle: 'Lithium (Therapeutic Level 0.8-1.2 mEq/L), Valproate, Second-Generation Antipsychotics', type: 'Clinical Guideline' },
                    { title: 'Schizophrenia & Clozapine Protocols', subtitle: 'Treatment-Resistant Schizophrenia, ANC Monitoring Protocols & Second-Generation Long-Acting Injectables', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Standardized psychiatric rating scales and suicide risk assessments',
                topics: [
                    { title: 'CIWA-Ar Alcohol Withdrawal Assessment Scale', subtitle: '10-Item Clinical Scoring System Guiding Precision Symptom-Triggered Benzodiazepine Dosing', type: 'Diagnostic Tool' },
                    { title: 'Columbia Suicide Severity Rating Scale (C-SSRS)', subtitle: 'Standardized Triage for Suicidal Ideation, Intent, Planning, and Lethality Risk Levels', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark psychiatric clinical trials and novel mechanism antipsychotics',
                topics: [
                    { title: 'Muscarinic Agonist Antipsychotics in Schizophrenia (EMERGENT Trials)', subtitle: 'Xanomeline-Trospium (KarXT) Novel Mechanism Efficacy without D2 Dopamine Receptor Blockade', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 12. Ophthalmology & Visual Sciences
    ophthalmology: {
        id: 'ophthalmology',
        aliases: ['ophtho', 'eye'],
        name: 'Ophthalmology & Visual Sciences',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Acute painful and painless vision loss, acute glaucoma, and chemical ocular burns',
                topics: [
                    { title: 'Acute Angle-Closure Glaucoma Emergency', subtitle: 'IOP >40 mmHg, Topical Timolol/Pilocarpine + IV Acetazolamide 500 mg + Laser Iridotomy', type: 'Emergency Protocol' },
                    { title: 'Central Retinal Artery Occlusion (CRAO)', subtitle: 'Sudden Painless Monocular Blindness, Cherry-Red Spot, Ocular Massage & Immediate Stroke Protocol', type: 'Emergency Protocol' },
                    { title: 'Chemical Eye Burns & Copious Irrigation Protocol', subtitle: 'Morgan Lens, Immediate 30-Min Isotonic Irrigation, Litmus pH Neutralization (7.0-7.4)', type: 'Emergency Protocol' },
                    { title: 'Orbital Compartment Syndrome & Lateral Canthotomy', subtitle: 'Proptosis, IOP >40 mmHg, Retrobulbar Hemorrhage & Emergent Bedside Lateral Cantholysis', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Chronic open-angle glaucoma, macular degeneration, and diabetic retinopathy',
                topics: [
                    { title: 'Open-Angle Glaucoma Management (AAO Preferred Practice)', subtitle: 'Prostaglandin Analogues (Latanoprost), SLT Laser Trabeculoplasty & Target IOP Lowering', type: 'Clinical Guideline' },
                    { title: 'Neovascular Age-Related Macular Degeneration (nAMD)', subtitle: 'Anti-VEGF Intravitreal Injections (Aflibercept, Ranibizumab, Faricimab) Treat-and-Extend Regimens', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Slit-lamp examination, intraocular pressure measurement, and fluorescein staining',
                topics: [
                    { title: 'Tonometry & Fluorescein Corneal Staining Protocol', subtitle: 'Goldmann / Tonopen Calibration, Seidel Sign for Corneal Perforation & Dendritic Ulcers', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark ophthalmology trials and dual Ang-2/VEGF-A inhibitors',
                topics: [
                    { title: 'Dual Angiopoietin-2 and VEGF-A Inhibition in AMD (TENAYA & LUCERNE Trials)', subtitle: 'Faricimab Durability and Extended 16-Week Dosing Intervals in Macular Disease', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 13. Dermatology & Skin Disorders
    dermatology: {
        id: 'dermatology',
        aliases: ['skin', 'derm'],
        name: 'Dermatology & Skin Disorders',
        categories: [
            {
                id: 'emergencies',
                title: 'Emergencies',
                description: 'Life-threatening dermatologic emergencies, drug reactions, and blistering diseases',
                topics: [
                    { title: 'Stevens-Johnson Syndrome & Toxic Epidermal Necrolysis (SJS/TEN)', subtitle: 'SCORTEN Risk Staging, Epidermal Detachment >30% BSA, Immediate Culprit Drug Cessation & Burn Unit Care', type: 'Emergency Protocol' },
                    { title: 'Necrotizing Fasciitis & Soft Tissue Infections', subtitle: 'LRINEC Score ≥6, Pain Out of Proportion, Crepitus & Emergent Surgical Debridement (<6h)', type: 'Emergency Protocol' },
                    { title: 'DRESS Syndrome (Drug Reaction with Eosinophilia and Systemic Symptoms)', subtitle: 'RegiSCAR Criteria, Facial Edema, Eosinophilia >1,500/µL, Liver/Renal Injury & Systemic Corticosteroids', type: 'Emergency Protocol' }
                ]
            },
            {
                id: 'clinical_topics',
                title: 'Clinical Topics',
                description: 'Chronic inflammatory dermatoses, autoimmune blistering, and cutaneous oncology',
                topics: [
                    { title: 'Plaque Psoriasis Management (AAD/NPF Guidelines)', subtitle: 'Topical Steroids/Calcipotriene, Biologics (IL-17, IL-23, TNF Inhibitors) & PASI Staging', type: 'Clinical Guideline' },
                    { title: 'Atopic Dermatitis & Eczema Escalation', subtitle: 'Skin Barrier Repair, Topical Calcineurin Inhibitors, Dupilumab (Anti-IL4R) & JAK Inhibitors', type: 'Clinical Guideline' },
                    { title: 'Melanoma & Non-Melanoma Skin Cancers', subtitle: 'ABCDE Criteria, Breslow Depth, Sentinel Lymph Node Biopsy & Targeted/Immunotherapy Protocols', type: 'Clinical Guideline' }
                ]
            },
            {
                id: 'tools',
                title: 'Tools & Diagnostics',
                description: 'Dermatoscopic evaluation, SCORTEN score, and skin biopsy techniques',
                topics: [
                    { title: 'SCORTEN Mortality Prognostication Score in SJS/TEN', subtitle: '7 Clinical Variables Calculating In-Hospital Mortality Risk and Guiding Burn ICU Triage', type: 'Diagnostic Tool' },
                    { title: 'Systematic Dermoscopy & ABCDE Melanoma Screening', subtitle: 'Pigment Network, Asymmetry, Border Irregularity, Blue-White Veil & Punch Biopsy Standards', type: 'Diagnostic Tool' }
                ]
            },
            {
                id: 'research',
                title: 'Recent Research',
                description: 'Landmark dermatology trials and biologic breakthrough therapies',
                topics: [
                    { title: 'Anti-IL-23 Monoclonals in Moderate-to-Severe Psoriasis (VOYAGE & NAVIGATE)', subtitle: 'Guselkumab and Risankizumab Achieving Landmark PASI 90 and PASI 100 Skin Clearance', type: 'Trial & Evidence' }
                ]
            }
        ]
    },

    // 14. Surgical Suite & Perioperative Medicine
    surgical_suite: {
        id: 'surgical_suite',
        aliases: ['surgery', 'surgical', 'general_surgery', 'or'],
        name: 'Surgical Suite & Perioperative Care',
        categories: [
            {
                id: 'surgical_cases',
                title: 'Operative Cases & Scenarios',
                description: 'High-yield acute surgical admissions, triage decision pathways, and operative indications',
                topics: [
                    { title: 'Acute Appendicitis (Alvarado & AIR Score)', subtitle: 'Laparoscopic Appendectomy Timing, Antibiotic Source Control & Single Port Access', type: 'Surgical Case' },
                    { title: 'Acute Gangrenous Cholecystitis', subtitle: 'Tokyo Guidelines Grade I-III, Urgent Laparoscopic Cholecystectomy (<72h) vs Cholecystostomy', type: 'Surgical Case' },
                    { title: 'Small Bowel Obstruction (SBO)', subtitle: 'Transition Point on CT, Strangulation Signs, Water-Soluble Contrast (Gastrografin) & Laparotomy', type: 'Surgical Case' },
                    { title: 'Perforated Peptic Ulcer & Pneumoperitoneum', subtitle: 'Subdiaphragmatic Free Air, Emergent Laparoscopic/Open Graham Patch Omentoplasty Repair', type: 'Surgical Case' },
                    { title: 'Incarcerated / Strangulated Inguinal Hernia', subtitle: 'Emergent Groin Exploration, Viability Assessment & Mesh vs Primary Tissue Repair', type: 'Surgical Case' },
                    { title: 'Acute Colonic Volvulus (Sigmoid vs Cecal)', subtitle: 'Coffee-Bean Sign, Endoscopic Detorsion vs Emergent Resection & Stoma Creation', type: 'Surgical Case' }
                ]
            },
            {
                id: 'operative_steps',
                title: 'Operative Steps & Techniques',
                description: 'Stepwise surgical dissection stages, critical safety views, and closure mechanics',
                topics: [
                    { title: 'Laparoscopic Cholecystectomy & Critical View of Safety', subtitle: 'Calot Triangle Dissection, Strasberg 3 Criteria & Fenestrating Bailout Protocol', type: 'Operative Technique' },
                    { title: 'Lichtenstein Tension-Free Inguinal Hernioplasty', subtitle: 'Spermatic Cord Mobilization, Nerve Preservation & Polypropylene Mesh Fixation', type: 'Operative Technique' },
                    { title: 'Laparoscopic Appendectomy Stepwise Technique', subtitle: 'Mesoappendix Skeletonization, Base Ligation (Endoloop vs Stapler) & Specimen Bag Retrieval', type: 'Operative Technique' },
                    { title: 'Exploratory Laparotomy & Mass Abdominal Closure', subtitle: 'Midline Celiotomy, 4-Quadrant Packing, Systematic Small Bowel Run & 4:1 PDS Closure', type: 'Operative Technique' },
                    { title: 'Right Hemicolectomy with Complete Mesocolic Excision (CME)', subtitle: 'Medial-to-Lateral Dissection, Central Vascular Ligation & Stapled Ileocolic Anastomosis', type: 'Operative Technique' },
                    { title: 'Low Anterior Resection (LAR) with Total Mesorectal Excision (TME)', subtitle: 'Dissection in Holy Plane of Heald, Circular EEA Colorectal Anastomosis & Loop Ileostomy', type: 'Operative Technique' }
                ]
            },
            {
                id: 'instruments_energy',
                title: 'Instruments & Devices',
                description: 'Surgical instrument inventory, scalpel blade mechanics, advanced bipolar & energy platforms',
                topics: [
                    { title: 'Surgical Energy Platforms (Monopolar, Bipolar, Harmonic & LigaSure)', subtitle: 'Thermal Lateral Spread (<2mm), High-Frequency Ultrasound vs Impedance Sealing', type: 'Equipment & Device' },
                    { title: 'Endomechanical Staplers & Cartridge Color Selection', subtitle: 'Vascular (White/Grey 2.0mm), GI (Blue 3.5mm), Thick Stomach/Rectum (Purple/Black 4.0-4.8mm)', type: 'Equipment & Device' },
                    { title: 'Surgical Suture Matrix & Needle Selection', subtitle: 'Absorbable (Vicryl, Monocryl, PDS) vs Permanent (Prolene, Silk) & Tapered vs Cutting Needles', type: 'Equipment & Device' },
                    { title: 'Retractor Systems & Deep Surgical Exposure', subtitle: 'Self-Retaining Bookwalter & Balfour Platforms, Army-Navy, Deaver & Senn Handhelds', type: 'Equipment & Device' }
                ]
            },
            {
                id: 'postop_eras',
                title: 'Post-Op Critical Care & ERAS',
                description: 'Enhanced Recovery pathways, surgical drain output algorithms, and wound complications',
                topics: [
                    { title: 'Enhanced Recovery After Surgery (ERAS) Colorectal Protocol', subtitle: 'Multimodal Non-Opioid Analgesia, Zero-Fluid Balance, Early Enteral Feeding & Day-0 Ambulation', type: 'Post-Op Protocol' },
                    { title: 'Postoperative Fever Differential & Systematic Workup', subtitle: 'The 5 Ws: Wind (Atelectasis POD 1-2), Water (UTI POD 3), Wound (SSI POD 5-7), Walking (DVT), Drugs', type: 'Post-Op Protocol' },
                    { title: 'Surgical Drain Management & Fluid Testing', subtitle: 'Jackson-Pratt / Blake Output, Drain Amylase (Pancreatic Fistula >3x) & Bilirubin Assays', type: 'Post-Op Protocol' },
                    { title: 'Acute Wound Dehiscence & Evisceration', subtitle: 'Salmon-Pink Fluid Warning, Sterile Saline Dressings & Emergent OR Fascial Repair', type: 'Post-Op Protocol' }
                ]
            },
            {
                id: 'preop_risk',
                title: 'Pre-Op Risk Clearance',
                description: 'Systematic preoperative risk stratification, cardiac RCRI, and anticoagulant bridging',
                topics: [
                    { title: 'Revised Cardiac Risk Index (Lee RCRI) & Pre-Op Cardiac Clearance', subtitle: 'METs Functional Capacity Assessment, Pre-Op Biomarkers (NT-proBNP) & Stress Testing', type: 'Pre-Op Guideline' },
                    { title: 'Perioperative Anticoagulation & Antiplatelet Interruption', subtitle: 'Warfarin 5-Day Hold (INR <1.5), DOAC Timing by CrCl & LMWH Bridging Protocols', type: 'Pre-Op Guideline' },
                    { title: 'ASA Physical Status Classification & Anesthesia Risk', subtitle: 'ASA I-VI Staging, Emergency E-Designation & ARISCAT Pulmonary Risk Calculator', type: 'Pre-Op Guideline' }
                ]
            },
            {
                id: 'damage_control',
                title: 'Emergency & Damage Control Surgery',
                description: 'Resuscitation in catastrophic hemorrhage, Lethal Triad abrogation, and rapid operative staging',
                topics: [
                    { title: 'Damage Control Laparotomy & The Lethal Triad', subtitle: 'Abbreviated Initial Surgery (<60-90m), Hypothermia, Acidosis & Coagulopathy ICU Reversal', type: 'Trauma Protocol' },
                    { title: 'Massive Transfusion Protocol (MTP) & TXA in Trauma Hemorrhage', subtitle: 'Balanced 1:1:1 Ratio (PRBC : FFP : Platelets) + IV Tranexamic Acid (1g <3h CRASH-2)', type: 'Trauma Protocol' },
                    { title: 'Emergency Tube Thoracostomy & Thoracotomy Indications', subtitle: 'Safe Triangle (5th ICS Anterior Axillary), Chest Drainage & Emergent OR (>1500 mL Blood)', type: 'Trauma Protocol' }
                ]
            }
        ]
    }
};

/**
 * Returns canonical reference topics for a given specialty ID from local app datasets.
 */
function getCanonicalTopicsForSpecialty(specialtyId) {
    const norm = (specialtyId || '').toLowerCase().trim();
    
    // Check direct match or alias
    for (const [key, spec] of Object.entries(CANONICAL_SPECIALTY_RESOURCES)) {
        if (key === norm || spec.aliases.includes(norm)) {
            return spec;
        }
    }

    return null;
}

/**
 * Gathers all reference topics for a specialty by combining:
 * 1. Local App Verified Reference Catalogs
 * 2. Ingested Custom Knowledge documents in Supabase
 * 3. Logged Knowledge Gaps requested by clinical users
 */
async function harvestTopicsFromAllReferences(specialtyId, specialtyName, supabaseClient = null) {
    const harvestedQueue = [];
    const seenTitles = new Set();

    console.log(`[ReferenceHarvester] Harvesting verified topics for specialty: ${specialtyName} (${specialtyId})...`);

    // 1. Harvest from Canonical App Datasets
    const canonicalData = getCanonicalTopicsForSpecialty(specialtyId);
    if (canonicalData) {
        for (const cat of canonicalData.categories) {
            for (const t of cat.topics) {
                const titleLower = t.title.toLowerCase().trim();
                if (!seenTitles.has(titleLower)) {
                    seenTitles.add(titleLower);
                    harvestedQueue.push({
                        id: `${specialtyId}_${cat.id}_${Date.now()}_${harvestedQueue.length}`,
                        title: t.title,
                        subtitle: t.subtitle || 'Evidence-Based Reference Protocol',
                        category: cat.title,
                        categoryId: cat.id,
                        type: t.type || 'Clinical Protocol',
                        sourceReference: 'Med Arena Canonical Clinical Knowledge Base',
                        status: 'pending',
                        error: null,
                        processedAt: null
                    });
                }
            }
        }
        console.log(`[ReferenceHarvester] Loaded ${harvestedQueue.length} canonical reference topics from local knowledge bases.`);
    }

    // 2. Harvest from Ingested Custom Knowledge in Supabase
    if (supabaseClient) {
        try {
            const { data: customDocs, error } = await supabaseClient
                .from('custom_knowledge')
                .select('id, title, guideline_society, publication_year, content')
                .ilike('content', `%${specialtyName.split(' ')[0]}%`)
                .limit(25);

            if (!error && Array.isArray(customDocs) && customDocs.length > 0) {
                console.log(`[ReferenceHarvester] Found ${customDocs.length} custom knowledge guideline documents in Supabase.`);
                for (const doc of customDocs) {
                    if (doc.title && !seenTitles.has(doc.title.toLowerCase().trim())) {
                        seenTitles.add(doc.title.toLowerCase().trim());
                        harvestedQueue.push({
                            id: `${specialtyId}_custom_${Date.now()}_${harvestedQueue.length}`,
                            title: doc.title,
                            subtitle: `${doc.guideline_society || 'Clinical Reference'} (${doc.publication_year || 'Latest'})`,
                            category: 'Clinical Topics',
                            categoryId: 'clinical_topics',
                            type: 'Ingested Guideline',
                            sourceReference: `Supabase Custom Knowledge: ${doc.title}`,
                            status: 'pending',
                            error: null,
                            processedAt: null
                        });
                    }
                }
            }
        } catch (dbErr) {
            console.warn(`[ReferenceHarvester] Database custom knowledge harvest skipped: ${dbErr.message}`);
        }

        // 3. Harvest from Logged Knowledge Gaps
        try {
            const { data: gaps } = await supabaseClient
                .from('knowledge_gaps')
                .select('query, context')
                .ilike('query', `%${specialtyName.split(' ')[0]}%`)
                .limit(20);

            if (Array.isArray(gaps) && gaps.length > 0) {
                for (const gap of gaps) {
                    const cleanTitle = gap.query.charAt(0).toUpperCase() + gap.query.slice(1);
                    if (!seenTitles.has(cleanTitle.toLowerCase().trim())) {
                        seenTitles.add(cleanTitle.toLowerCase().trim());
                        harvestedQueue.push({
                            id: `${specialtyId}_gap_${Date.now()}_${harvestedQueue.length}`,
                            title: cleanTitle,
                            subtitle: 'Clinician Inquired Clinical Entity',
                            category: 'Clinical Topics',
                            categoryId: 'clinical_topics',
                            type: 'Knowledge Gap Protocol',
                            sourceReference: 'Clinician Inquired Knowledge Gap',
                            status: 'pending',
                            error: null,
                            processedAt: null
                        });
                    }
                }
            }
        } catch (_) {}
    }

    console.log(`[ReferenceHarvester] ✅ Total harvested reference topics for ${specialtyName}: ${harvestedQueue.length}`);
    return harvestedQueue;
}

module.exports = {
    CANONICAL_SPECIALTY_RESOURCES,
    getCanonicalTopicsForSpecialty,
    harvestTopicsFromAllReferences
};
