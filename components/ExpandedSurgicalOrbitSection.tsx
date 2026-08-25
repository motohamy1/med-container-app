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
import { EXPANDED_SURGICAL_SPECIALTIES, type SurgicalSpecialtyItem } from './SurgicalOrbitSection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORBIT_SIZE = Math.min(SCREEN_WIDTH * 0.78, 300);
const CENTER_SIZE = ORBIT_SIZE * 0.42;
const BUTTON_SIZE = ORBIT_SIZE * 0.19;

// Positions for 8 nodes arranged evenly around the circle (45° increments)
const NODE_POSITIONS: { top: DimensionValue; left: DimensionValue }[] = [
  { top: '0%', left: '50%' },
  { top: '14.6%', left: '82%' },
  { top: '50%', left: '95%' },
  { top: '85.4%', left: '82%' },
  { top: '100%', left: '50%' },
  { top: '85.4%', left: '18%' },
  { top: '50%', left: '5%' },
  { top: '14.6%', left: '18%' },
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

// Second wheel of the surgical section — surfaces remaining surgical specialties
// directly as orbit nodes instead of hiding them behind a "More" button/modal.
export const ExpandedSurgicalOrbitSection: React.FC = () => {
  const handleOpenSpecialty = (specialtyId: string) => {
    router.push(`/specialty/${specialtyId}` as any);
  };

  const handleCenterHubPress = () => {
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: { query: 'Surgical Subspecialty Operative Protocol Advisor' },
    } as any);
  };

  return (
    <View className="mt-4 pt-8 pb-10 border-t border-white/5 px-6">
      {/* Section Header */}
      <View className="items-center mb-6">
        <View className="flex-row items-center gap-1.5 mb-2 px-3 py-1 rounded-full bg-[#ffc3dd]15 border border-[#ffc3dd]30">
          <Ionicons name="cut" size={13} color="#ffc3dd" />
          <Text className="text-[10.5px] font-mono text-[#ffc3dd] font-bold uppercase tracking-wider">
            Surgical Specialties
          </Text>
        </View>
        <Text className="text-[19px] font-sans-bold text-white text-center">
          Surgical Specialties
        </Text>
        <Text className="text-[12px] font-sans text-gray-400 text-center mt-1 max-w-[280px]">
          Tap any surgical specialty to explore operative cases, techniques, pre-op clearance & critical care
        </Text>
      </View>

      {/* Second Circular Surgical Orbit */}
      <View
        className="mx-auto mt-4 mb-2 relative"
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

        {/* Center hub — Surgical Subspecialty AI Advisor in Rose/Pastel Pink */}
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
            Subspecialty Advisor
          </Text>
        </TouchableOpacity>

        {EXPANDED_SURGICAL_SPECIALTIES.map((spec, index) => {
          const pos = NODE_POSITIONS[index];
          if (!pos) return null;
          return (
            <SurgicalOrbitButton
              key={spec.id}
              specialty={spec}
              size={BUTTON_SIZE}
              top={pos.top}
              left={pos.left}
              onPress={() => handleOpenSpecialty(spec.id)}
            />
          );
        })}
      </View>
    </View>
  );
};
