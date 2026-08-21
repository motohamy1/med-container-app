import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from 'react-native';
import { Colors } from '../constants/Colors';

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
    id: 'more_surgery',
    name: 'More Surgery',
    scientificName: 'Expanded Surgical Subspecialties',
    icon: 'grid',
    color: '#dbd4fd', // Lavender
    description: 'Pediatric, Plastic, ENT, Surgical Oncology, and Transplant',
  },
];

// Additional Surgical Specialties in the Expanded Modal
export const EXPANDED_SURGICAL_SPECIALTIES: SurgicalSpecialtyItem[] = [
  {
    id: 'surgery_plastics',
    name: 'Plastic Surgery',
    scientificName: 'Plastic, Reconstructive & Burn Surgery',
    icon: 'body-outline',
    color: '#ffc3dd',
    description: 'Microsurgical free flap transfer, skin grafting, burn excision, and wound coverage',
  },
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
          className="text-[11px] font-sans-semibold text-gray-200 mt-1.5 text-center leading-tight tracking-tight max-w-[100px]"
          numberOfLines={2}
        >
          {specialty.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const SurgicalOrbitSection: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenSpecialty = (specialtyId: string) => {
    if (specialtyId === 'more_surgery') {
      setModalVisible(true);
      return;
    }
    // Navigate directly to the Surgical Specialty Detail Page
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
        <Text className="text-[19px] font-sans-bold text-white tracking-tight text-center">
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full items-center justify-center border-4 border-[#010101] z-20 px-2 text-center"
          style={{
            width: CENTER_SIZE,
            height: CENTER_SIZE,
            backgroundColor: '#ffc3dd',
            shadowColor: '#ffc3dd',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.65,
            shadowRadius: 20,
            elevation: 14,
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="cut" size={24} color="#010101" />
          <Text className="text-[11px] font-sans-bold text-[#010101] text-center mt-0.5 leading-tight">
            Surgical AI
          </Text>
          <Text className="text-[9.5px] text-[#010101]/80 font-sans-bold">
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

        {/* Node 8: Top Left (315°) -> More Surgical Specialties */}
        <SurgicalOrbitButton
          specialty={SURGICAL_ORBIT_SPECIALTIES[7]}
          size={BUTTON_SIZE}
          top="14.6%"
          left="18%"
          onPress={() => handleOpenSpecialty('more_surgery')}
        />
      </View>

      {/* Expanded Subspecialties Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/75">
          <View className="bg-[#0b0f12] rounded-t-3xl border-t border-white/10 p-6 pb-12 max-h-[80%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-white/10">
              <View>
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Ionicons name="cut" size={14} color="#ffc3dd" />
                  <Text className="text-[11px] font-sans-bold uppercase tracking-wider text-[#ffc3dd]">
                    Surgical Disciplines
                  </Text>
                </View>
                <Text className="text-xl font-sans-bold text-white">
                  Expanded Surgical Specialties
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* List of Expanded Specialties */}
            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              <View className="flex flex-col gap-3 pb-6">
                {[...SURGICAL_ORBIT_SPECIALTIES.slice(0, 7), ...EXPANDED_SURGICAL_SPECIALTIES].map((spec) => (
                  <TouchableOpacity
                    key={spec.id}
                    onPress={() => {
                      setModalVisible(false);
                      router.push(`/specialty/${spec.id}` as any);
                    }}
                    className="p-4 rounded-2xl bg-[#121719] border border-white/10 flex-row items-center gap-3.5 active:opacity-75"
                  >
                    <View
                      className="w-11 h-11 rounded-xl items-center justify-center border"
                      style={{
                        backgroundColor: `${spec.color}15`,
                        borderColor: `${spec.color}40`,
                      }}
                    >
                      <Ionicons name={spec.icon} size={20} color={spec.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-base font-sans-bold">
                        {spec.name}
                      </Text>
                      <Text className="text-[11px] font-sans-medium" style={{ color: spec.color }}>
                        {spec.scientificName}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={2}>
                        {spec.description}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
