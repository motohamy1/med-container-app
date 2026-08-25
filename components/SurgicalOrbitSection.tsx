import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORBIT_SIZE = Math.min(SCREEN_WIDTH * 0.78, 300);
const CENTER_SIZE = ORBIT_SIZE * 0.42;
const BUTTON_SIZE = ORBIT_SIZE * 0.19;

export type SurgicalSpecialtyItem = {
  id: string;
  name: string;
  scientificName: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
};

// 8 Orbit Specialties (7 primary surgical disciplines + More)
export const SURGICAL_ORBIT_SPECIALTIES: SurgicalSpecialtyItem[] = [
  {
    id: 'surgery_gi',
    name: 'GI Surgery',
    scientificName: 'Gastrointestinal & General Surgery',
    icon: 'cut',
    color: '#ffc3dd', // Rose
    description: 'Hepatobiliary, colorectal, laparoscopy, and acute abdomen',
  },
  {
    id: 'surgery_neuro',
    name: 'Neurosurgery',
    scientificName: 'Neurological & Spine Surgery',
    icon: 'pulse',
    color: '#defff9', // Mint
    description: 'Craniotomy, brain trauma, spine instrumentation, and ACDF',
  },
  {
    id: 'surgery_cardio',
    name: 'Cardiothoracic',
    scientificName: 'Cardiothoracic & Thoracic Surgery',
    icon: 'heart',
    color: '#6dc2bd', // Teal
    description: 'CABG, valve replacement, VATS lobectomy, and CPB',
  },
  {
    id: 'surgery_vascular',
    name: 'Vascular',
    scientificName: 'Vascular & Endovascular Surgery',
    icon: 'git-network',
    color: '#dbd4fd', // Lavender
    description: 'EVAR, carotid endarterectomy, bypass, and limb salvage',
  },
  {
    id: 'surgery_trauma',
    name: 'Trauma & Acute',
    scientificName: 'Trauma & Acute Care Surgery',
    icon: 'flame',
    color: '#ffc3dd', // Rose
    description: 'Damage control laparotomy, lethal triad, and thoracotomy',
  },
  {
    id: 'surgery_ortho',
    name: 'Orthopedics',
    scientificName: 'Orthopedic & Trauma Surgery',
    icon: 'fitness',
    color: '#defff9', // Mint
    description: 'Total hip/knee arthroplasty, fracture fixation, and ACL',
  },
  {
    id: 'surgery_urology',
    name: 'Urology',
    scientificName: 'Urological & Pelvic Surgery',
    icon: 'medkit',
    color: '#6dc2bd', // Teal
    description: 'Endourology, laser lithotripsy, robotic prostatectomy, and torsion',
  },
  {
    id: 'surgery_plastics',
    name: 'Plastic Surgery',
    scientificName: 'Plastic, Reconstructive & Burn Surgery',
    icon: 'body-outline',
    color: '#ffc3dd', // Rose
    description: 'Microsurgical free flap transfer, skin grafting, burn excision, and wound coverage',
  },
];

// Surgical specialties for the second wheel
export const EXPANDED_SURGICAL_SPECIALTIES: SurgicalSpecialtyItem[] = [
  {
    id: 'surgery_pediatric',
    name: 'Pediatric Surgery',
    scientificName: 'Pediatric & Neonatal Surgery',
    icon: 'people-outline',
    color: '#defff9',
    description: 'Congenital anomalies, pediatric hernia, pyloric stenosis, and Hirschsprung disease',
  },
  {
    id: 'surgery_ent',
    name: 'ENT / Head & Neck',
    scientificName: 'Otolaryngology & Head/Neck Surgery',
    icon: 'headset-outline',
    color: '#6dc2bd',
    description: 'Tracheostomy, neck dissection, thyroidectomy, endoscopic sinus surgery, and mastoidectomy',
  },
  {
    id: 'surgery_onco',
    name: 'Surgical Oncology',
    scientificName: 'Complex General Surgical Oncology',
    icon: 'shield-outline',
    color: '#dbd4fd',
    description: 'Hyperthermic intraperitoneal chemotherapy (HIPEC), sarcoma resection, and sentinel lymph node biopsy',
  },
  {
    id: 'surgery_transplant',
    name: 'Transplant Surgery',
    scientificName: 'Abdominal & Thoracic Organ Transplantation',
    icon: 'repeat-outline',
    color: '#defff9',
    description: 'Deceased & living donor renal transplant, orthotopic liver transplant, and immunosuppression',
  },
  {
    id: 'surgery_bariatric',
    name: 'Bariatric',
    scientificName: 'Bariatric & Metabolic Surgery',
    icon: 'resize-outline',
    color: '#ffc3dd',
    description: 'Sleeve gastrectomy, Roux-en-Y gastric bypass, and metabolic syndrome resolution',
  },
  {
    id: 'surgery_hepatobiliary',
    name: 'Hepatobiliary',
    scientificName: 'Hepatobiliary & Pancreatic Surgery',
    icon: 'flask-outline',
    color: '#6dc2bd',
    description: 'Whipple procedure, hepatectomy, bile duct reconstruction, and pancreatic necrosectomy',
  },
  {
    id: 'surgery_maxillofacial',
    name: 'Maxillofacial',
    scientificName: 'Oral & Maxillofacial Surgery',
    icon: 'happy-outline',
    color: '#dbd4fd',
    description: 'Orthognathic surgery, TMJ reconstruction, facial fracture fixation, and cleft repair',
  },
  {
    id: 'surgery_endocrine',
    name: 'Endocrine Surgery',
    scientificName: 'Endocrine & Thyroid Surgery',
    icon: 'nuclear-outline',
    color: '#defff9',
    description: 'Thyroidectomy, parathyroidectomy, adrenalectomy, and MEN syndrome management',
  },
];

// Orbit Button Component
const SurgicalOrbitButton = ({
  specialty,
  size,
  top,
  left,
  onPress,
}: {
  specialty: SurgicalSpecialtyItem;
  size: number;
  top: DimensionValue;
  left: DimensionValue;
  onPress: () => void;
}) => {
  return (
    <View
      className="absolute items-center justify-start"
      style={{ top, left, marginTop: -size / 2, width: 120, marginLeft: -60 }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={onPress}
        className="items-center justify-center"
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        activeOpacity={0.75}
      >
        <View
          className="border items-center justify-center rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: '#080c0e',
            borderColor: `${specialty.color}45`,
            shadowColor: specialty.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 7,
          }}
        >
          <Ionicons name={specialty.icon} size={19} color={specialty.color} />
        </View>
        <Text
          className="text-[11px] font-sans-semibold text-gray-200 mt-1.5 text-center leading-tight max-w-[100px]"
          numberOfLines={2}
          allowFontScaling={false}
          style={{ includeFontPadding: false }}
        >
          {specialty.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const SurgicalOrbitSection: React.FC = () => {
  const handleOpenSpecialty = (specialtyId: string) => {
    router.push(`/specialty/${specialtyId}` as any);
  };

  const handleCenterHubPress = () => {
    // Navigates directly to the Surgical AI Suite / Chat
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: { query: 'Surgical Operative Protocol and Procedure Guide' },
    } as any);
  };

  return (
    <View className="mt-8 pt-8 pb-10 border-t border-white/5 px-6">
      {/* Section Header with generous breathing space */}
      <View className="items-center mb-6">
        <View className="flex-row items-center gap-1.5 mb-2 px-3 py-1 rounded-full bg-[#ffc3dd]15 border border-[#ffc3dd]30">
          <Ionicons name="cut" size={13} color="#ffc3dd" />
          <Text className="text-[10.5px] font-mono text-[#ffc3dd] font-bold uppercase tracking-wider">
            Surgical Specialties & Operative Arena
          </Text>
        </View>
        <Text className="text-[19px] font-sans-bold text-white text-center">
          Surgical Specialties & Procedures
        </Text>
        <Text className="text-[12px] font-sans text-gray-400 text-center mt-1 max-w-[280px]">
          Tap any surgical specialty to explore operative cases, techniques, pre-op clearance & critical care
        </Text>
      </View>

      {/* Circular Surgical Orbit */}
      <View
        className="mx-auto mt-4 mb-10 relative"
        style={{ width: ORBIT_SIZE, height: ORBIT_SIZE }}
      >
        {/* Inner dashed ring */}
        <View
          className="mx-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 border-dashed"
          style={{ width: ORBIT_SIZE * 0.68, height: ORBIT_SIZE * 0.68 }}
        />

        {/* Outer solid ring */}
        <View
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
          style={{ width: ORBIT_SIZE * 0.98, height: ORBIT_SIZE * 0.98 }}
        />

        {/* Center hub — elevated Surgical Suite AI Advisor in Rose/Pastel Pink */}
        <TouchableOpacity
          onPress={handleCenterHubPress}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full items-center justify-center border-4 border-[#010101] z-10 px-2 text-center"
          style={{
            width: CENTER_SIZE,
            height: CENTER_SIZE,
            backgroundColor: '#ffc3dd',
            shadowColor: '#ffc3dd',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="cut" size={24} color="#010101" />
          <Text className="text-[11px] font-sans-bold text-[#010101] text-center mt-0.5 leading-tight" allowFontScaling={false} style={{ includeFontPadding: false }}>
            Surgical AI
          </Text>
          <Text className="text-[9.5px] text-[#010101]/80 font-sans-bold" allowFontScaling={false} style={{ includeFontPadding: false }}>
            OR Advisor
          </Text>
        </TouchableOpacity>

        {/* 8 Circular Orbit Nodes Arranged at 45° Intervals */}
        {/* Node 1: Top (0°) -> GI & General Surgery */}
        <SurgicalOrbitButton
          specialty={SURGICAL_ORBIT_SPECIALTIES[0]}
          size={BUTTON_SIZE}
          top="0%"
          left="50%"
          onPress={() => handleOpenSpecialty('surgery_gi')}
        />

        {/* Node 2: Top Right (45°) -> Neurosurgery */}
        <SurgicalOrbitButton
          specialty={SURGICAL_ORBIT_SPECIALTIES[1]}
          size={BUTTON_SIZE}
          top="14.6%"
          left="82%"
          onPress={() => handleOpenSpecialty('surgery_neuro')}
        />

        {/* Node 3: Middle Right (90°) -> Cardiothoracic Surgery */}
        <SurgicalOrbitButton
          specialty={SURGICAL_ORBIT_SPECIALTIES[2]}
          size={BUTTON_SIZE}
          top="50%"
          left="95%"
          onPress={() => handleOpenSpecialty('surgery_cardio')}
        />

        {/* Node 4: Bottom Right (135°) -> Vascular Surgery */}
        <SurgicalOrbitButton
          specialty={SURGICAL_ORBIT_SPECIALTIES[3]}
          size={BUTTON_SIZE}
          top="85.4%"
          left="82%"
          onPress={() => handleOpenSpecialty('surgery_vascular')}
        />

        {/* Node 5: Bottom (180°) -> Trauma & Emergency Surgery */}
        <SurgicalOrbitButton
          specialty={SURGICAL_ORBIT_SPECIALTIES[4]}
          size={BUTTON_SIZE}
          top="100%"
          left="50%"
          onPress={() => handleOpenSpecialty('surgery_trauma')}
        />

        {/* Node 6: Bottom Left (225°) -> Orthopedic Surgery */}
        <SurgicalOrbitButton
          specialty={SURGICAL_ORBIT_SPECIALTIES[5]}
          size={BUTTON_SIZE}
          top="85.4%"
          left="18%"
          onPress={() => handleOpenSpecialty('surgery_ortho')}
        />

        {/* Node 7: Middle Left (270°) -> Urology */}
        <SurgicalOrbitButton
          specialty={SURGICAL_ORBIT_SPECIALTIES[6]}
          size={BUTTON_SIZE}
          top="50%"
          left="5%"
          onPress={() => handleOpenSpecialty('surgery_urology')}
        />

        {/* Node 8: Top Left (315°) -> Plastic Surgery */}
        <SurgicalOrbitButton
          specialty={SURGICAL_ORBIT_SPECIALTIES[7]}
          size={BUTTON_SIZE}
          top="14.6%"
          left="18%"
          onPress={() => handleOpenSpecialty('surgery_plastics')}
        />
      </View>

    </View>
  );
};