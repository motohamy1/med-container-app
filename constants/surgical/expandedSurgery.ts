import { SpecialtyData } from '../SpecialtyData';

export const EXPANDED_SURGICAL_KNOWLEDGE: Record<string, SpecialtyData> = {
  surgery_plastics: {
    id: 'surgery_plastics',
    name: 'Plastic Surgery',
    scientificName: 'Plastic, Reconstructive & Burn Surgery',
    icon: 'body-outline',
    color: '#ffc3dd', // Rose
    illustration: require('../../assets/images/specialties/dermatology.jpg'),
    generalScope: 'Comprehensive reconstructive microsurgery, free flap transfers, burn management, skin grafting, and aesthetic plastic surgery.',
    categories: [
      {
        id: 'microsurgery_reconstruction',
        title: 'Microsurgery & Wound Coverage',
        description: 'Perforator flaps, free tissue transfers, and composite defect reconstructions',
        icon: 'construct-outline',
        topics: [
          {
            id: 'alt_free_flap_protocol',
            title: 'Anterolateral Thigh (ALT) Perforator Free Flap',
            subtitle: 'Complex Tibial Defect, Septocutaneous Perforators & 9-0 Nylon Microvascular Anastomosis',
            type: 'Reconstructive Microsurgery Protocol',
            aiScopeDescription: 'ALT free flap, lateral circumflex femoral artery, microvascular coupler, operating microscope, and flap salvage.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 54-year-old male presents with an 8x6 cm composite soft tissue defect over the distal third of the tibia with exposed bone following a Gustilo-Anderson Grade IIIB open tibia fracture. Indication: Microvascular Free Tissue Transfer with Anterolateral Thigh (ALT) Perforator Flap.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Acoustic Doppler mapping of thigh perforators; CTA lower extremity confirming patent anterior/posterior tibial arteries; 2-team simultaneous approach.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Flap Design: 10x8 cm skin paddle centered along ASIS-patella axis over perforator cluster.\n2. Subfascial Dissection: Incise medial fascia lata, identify LCFA descending branch perforators between rectus femoris and vastus lateralis.\n3. Intramuscular Dissection: Dissect perforator through vastus lateralis back to main LCFA trunk to obtain 8-10 cm pedicle length.\n4. Recipient Bed: Expose posterior tibial artery and venae comitantes under microscope.\n5. Microvascular Anastomoses: Arterial end-to-side anastomosis with interrupted 9-0 Nylon; venous anastomosis with 2.5mm GEM Microvascular Anastomotic Coupler.\n6. Inset & Drain: Inset flap with 3-0 Monocryl; Blake drain; primary donor closure.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Flap Pallor / Arterial Thrombosis: Immediate re-exploration, anastomotic revision, and intra-arterial tPA flush.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Hourly Doppler checks for 24h; warm room (>23°C); Aspirin 81mg daily.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Operating microscope, micro-Acland clamps, 9-0/10-0 Nylon sutures, GEM 2.5mm coupler.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_pediatric: {
    id: 'surgery_pediatric',
    name: 'Pediatric Surgery',
    scientificName: 'Pediatric & Neonatal Surgery',
    icon: 'people-outline',
    color: '#defff9', // Mint
    illustration: require('../../assets/images/specialties/gastroenterology.jpg'),
    generalScope: 'Comprehensive neonatal congenital anomaly repairs, pediatric general surgery, and pediatric surgical emergencies.',
    categories: [
      {
        id: 'neonatal_pediatric_emergencies',
        title: 'Pediatric & Neonatal Surgeries',
        description: 'Pyloric stenosis, congenital hernia, TEF, and malrotation',
        icon: 'happy-outline',
        topics: [
          {
            id: 'lap_pyloromyotomy_ramstedt',
            title: 'Laparoscopic Pyloromyotomy (Ramstedt)',
            subtitle: 'Hypertrophic Pyloric Stenosis, Electrolyte Normalization & Mucosal Integrity Test',
            type: 'Pediatric Surgical Protocol',
            aiScopeDescription: 'Pyloric stenosis, hypochloremic alkalosis correction, laparoscopic pyloromyotomy, Benson spreader, and mucosal leak test.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 4-week-old male infant presents with non-bilious projectile vomiting after feeds and a palpable epigastric "olive". Ultrasound: Pyloric muscle thickness 4.5 mm, channel length 17 mm. Labs: Hypochloremic hypokalemic metabolic alkalosis. Indication: Laparoscopic Ramstedt Pyloromyotomy after medical electrolyte normalization.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Correct electrolytes first (Cl >100 mEq/L, K >3.5 mEq/L, HCO3 <30 mEq/L); stomach decompression with NG tube.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Access: 3mm umbilical scope port, 2x 3mm RUQ and LUQ working ports.\n2. Pyloric Incision: Longitudinal seromuscular incision on anterior pyloric olive with micro-knife.\n3. Muscle Spreading: Introduce 3mm Benson pyloric spreader; spread circular fibers until submucosa bulges freely.\n4. Air Leak Test: Inject 50 mL air through OG tube under saline immersion; confirm zero mucosal bubbling.\n5. Closure: Desufflate; 3-0 Vicryl for umbilical fascia; Dermabond on skin.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Duodenal Mucosal Perforation: Repair with interrupted 5-0 PDS and omental patch.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Oral feeds initiated at 4-6 hours post-op; discharge POD 1.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• 3mm pediatric laparoscope and instruments, Benson pyloric spreader, Dermabond.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_ent: {
    id: 'surgery_ent',
    name: 'ENT / Head & Neck',
    scientificName: 'Otolaryngology & Head/Neck Surgery',
    icon: 'headset-outline',
    color: '#6dc2bd', // Teal
    illustration: require('../../assets/images/specialties/pulmonology.jpg'),
    generalScope: 'Comprehensive endocrine neck surgery, surgical airway management, endoscopic sinus surgery, and head and neck oncology.',
    categories: [
      {
        id: 'head_neck_endocrine',
        title: 'Head, Neck & Airway Surgeries',
        description: 'Thyroidectomy, parathyroidectomy, tracheostomy, and neck dissection',
        icon: 'headset-outline',
        topics: [
          {
            id: 'total_thyroidectomy_ionm',
            title: 'Total Thyroidectomy with Intraoperative Nerve Monitoring',
            subtitle: 'Bethesda VI Papillary Thyroid Carcinoma, RLN / EBSLN Preservation & Parathyroid Autotransplantation',
            type: 'Endocrine Surgical Protocol',
            aiScopeDescription: 'Total thyroidectomy, intraoperative nerve monitoring (IONM), Berry ligament, parathyroid preservation, and vocal cord mobility.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 38-year-old female presents with a 2.8 cm TI-RADS 5 right thyroid nodule. FNA: Bethesda VI (Papillary Thyroid Carcinoma). Indication: Total Thyroidectomy with Continuous Intraoperative Nerve Monitoring (IONM).'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• NIM 3.0 nerve monitoring endotracheal tube with electrodes placed between vocal cords; avoid paralytics after induction.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Incision: Low collar Kocher incision; elevate subplatysmal flaps; open strap muscles in midline.\n2. Superior Pole: Ligate superior vessels close to capsule with LigaSure; preserve EBSLN.\n3. RLN Mapping: Identify Recurrent Laryngeal Nerve (RLN) in tracheoesophageal groove with IONM probe (1-2 mA; confirm baseline V1/R1 EMG response >500 µV).\n4. Parathyroids: Dissect superior and inferior parathyroid glands off thyroid capsule on their vascular pedicles.\n5. Berry Ligament: Divide vascular ligament of Berry under direct RLN visualization; resect gland.\n6. Confirm final V2/R2 nerve signals bilaterally; layered closure.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Loss of Signal (LOS) on First Side: Stop and stage the contralateral lobe to prevent bilateral vocal cord paralysis.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Check 4h post-op ionized calcium and PTH; discharge on POD 1 with Levothyroxine.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• NIM 3.0 Nerve Monitor, LigaSure Small Jaw, Green thyroid retractors.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_onco: {
    id: 'surgery_onco',
    name: 'Surgical Oncology',
    scientificName: 'Complex General Surgical Oncology',
    icon: 'shield-outline',
    color: '#dbd4fd', // Lavender
    illustration: require('../../assets/images/specialties/gastroenterology.jpg'),
    generalScope: 'Comprehensive complex multivisceral oncologic resections, cytoreductive surgery, HIPEC, and retroperitoneal sarcomas.',
    categories: [
      {
        id: 'cytoreduction_peritonectomy',
        title: 'Cytoreduction & Advanced Oncology',
        description: 'Sugarbaker peritonectomy, heated chemoperfusion, and sarcoma resections',
        icon: 'flask-outline',
        topics: [
          {
            id: 'crs_hipec_sugarbaker',
            title: 'Cytoreductive Surgery (CRS) & 42°C HIPEC',
            subtitle: 'Pseudomyxoma Peritonei, Peritoneal Cancer Index (PCI) & Mitomycin-C Perfusion',
            type: 'Complex Surgical Oncology Protocol',
            aiScopeDescription: 'CRS, Sugarbaker peritonectomy, PCI scoring, CC-0 completeness, and 42°C Hyperthermic Intraperitoneal Chemotherapy.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 52-year-old female presents with low-grade appendiceal mucinous neoplasm (LAMN) and pseudomyxoma peritonei (PCI score 14/39). Indication: Complete Cytoreductive Surgery (CRS) with 42°C Hyperthermic Intraperitoneal Chemotherapy (HIPEC) using Mitomycin-C.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Extensive pre-op nutritional and cardiac optimization; IV Sodium Thiosulfate for nephroprotection; forced diuresis.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Laparotomy: Full midline laparotomy; calculate exact PCI across 13 regions.\n2. Sugarbaker Peritonectomy: Greater omentectomy, right/left diaphragmatic peritonectomy, and pelvic peritonectomy achieving CC-0 cytoreduction.\n3. HIPEC Perfusion: Place inflow/outflow catheters connected to hyperthermic pump; circulate Mitomycin-C (35 mg/m²) at 41.5-42.5°C for 90 minutes.\n4. Washout & Reconstruction: Saline lavage; construct bowel anastomoses AFTER chemotherapy washout; mass closure.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Acute Nephrotoxicity / Bone Marrow Suppression: Maintain high urine output (>100 mL/h); monitor CBC and G-CSF.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Surgical ICU protocol; TPN on POD 2 for prolonged ileus; 28-day extended VTE prophylaxis with LMWH.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Belmont Hyperthermia Perfusion Pump, Omni-Tract retractor, spray electrocautery, loop #1 PDS.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_transplant: {
    id: 'surgery_transplant',
    name: 'Transplant Surgery',
    scientificName: 'Abdominal & Thoracic Organ Transplantation',
    icon: 'repeat-outline',
    color: '#defff9', // Mint
    illustration: require('../../assets/images/specialties/nephrology.jpg'),
    generalScope: 'Comprehensive deceased and living donor kidney, liver, and pancreas organ transplantation and immunosuppression protocols.',
    categories: [
      {
        id: 'renal_hepatic_allograft',
        title: 'Organ Allograft Transplantation',
        description: 'Back-table vascular preparation, iliac anastomoses, and Lich-Gregoir reimplantation',
        icon: 'repeat-outline',
        topics: [
          {
            id: 'deceased_donor_renal_allograft',
            title: 'Deceased Donor Renal Allograft Transplantation',
            subtitle: 'Iliac Vascular Anastomoses (5-0/6-0 Prolene) & Lich-Gregoir Ureteroneocystostomy with Double-J Stent',
            type: 'Organ Transplantation Protocol',
            aiScopeDescription: 'Kidney transplant, cold ischemic time, Carrel patch, external iliac vein/artery anastomoses, Lich-Gregoir reimplantation, and Thymoglobulin induction.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 49-year-old male with ESRD on hemodialysis receives an offer for a deceased donor kidney transplant (KDPI 22%, CIT 12h, negative crossmatch). Indication: Heterotopic Renal Allograft Transplantation into Right Iliac Fossa.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Pre-op dialysis (K+ 4.1 mEq/L); induction with Thymoglobulin 1.5 mg/kg + Methylprednisolone 500mg IV; distend bladder with Methylene Blue saline.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Back-Table Prep: On ice slush, inspect donor kidney, Carrel patch, renal vein, and ureter; flush with cold UW solution.\n2. Extra-Peritoneal Exposure: Right lower quadrant Gibson incision; reflect peritoneum medially to expose external iliac vessels.\n3. Venous Anastomosis: End-to-side anastomosis of donor renal vein to recipient External Iliac Vein with running 5-0/6-0 Prolene.\n4. Arterial Anastomosis: End-to-side anastomosis of donor Carrel patch to External Iliac Artery with running 5-0/6-0 Prolene.\n5. Reperfusion: IV Mannitol 25g + Furosemide 100mg; release venous then arterial clamps; kidney becomes immediately pink and pulsatile.\n6. Ureteroneocystostomy (Lich-Gregoir): Extravesical submucosal tunnel; spatulate ureter over 6 Fr Double-J stent; suture to bladder mucosa with 5-0 PDS; close detrusor with 4-0 Vicryl anti-reflux valve.\n7. JP drain; layered closure.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Hyperacute Rejection / Thrombosis: Immediate Doppler ultrasound; emergent re-exploration if vascular compromise.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Hourly mL-for-mL urine output fluid replacement; Tacrolimus, MMF, and Prednisone triple maintenance immunosuppression.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Satinsky clamps, Cooley clamps, Castroviejo needle holder, 6 Fr Double-J stent, 5-0/6-0 Prolene.'
              }
            ]
          }
        ]
      }
    ]
  }
};
