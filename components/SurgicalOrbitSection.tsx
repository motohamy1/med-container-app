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
import {
  SURGERY_CATEGORIES,
  SurgeryCategoryItem,
} from '../constants/ExpandedSpecialtiesData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORBIT_SIZE = Math.min(SCREEN_WIDTH * 0.78, 300);
const CENTER_SIZE = ORBIT_SIZE * 0.42;
const BUTTON_SIZE = ORBIT_SIZE * 0.19;

// Circular button for the surgical orbit
const SurgicalOrbitButton = ({
  item,
  size,
  top,
  left,
  onPress,
}: {
  item: SurgeryCategoryItem;
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
            borderColor: `${item.color}45`,
            shadowColor: item.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 7,
          }}
        >
          <Ionicons name={item.icon} size={19} color={item.color} />
        </View>
        <Text
          className="text-[11px] font-sans-semibold text-gray-200 mt-1.5 text-center leading-tight tracking-tight max-w-[100px]"
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const SurgicalOrbitSection: React.FC = () => {
  const handleOpenCategory = (categoryId: string) => {
    // Navigates directly to the Category Page inside General Surgery
    router.push(`/specialty/surgery/category/${categoryId}` as any);
  };

  const handleCenterHubPress = () => {
    // Navigates directly to the Main Surgery Category Dashboard
    router.push('/specialty/surgery' as any);
  };

  return (
    <View className="mt-12 pt-6 border-t border-white/5 px-6">
      {/* Section Header with 25%+ increased breathing space */}
      <View className="items-center mb-2">
        <View className="flex-row items-center gap-1.5 mb-1 px-3 py-1 rounded-full bg-[#ffc3dd]15 border border-[#ffc3dd]30">
          <Ionicons name="cut" size={13} color="#ffc3dd" />
          <Text className="text-[10.5px] font-mono text-[#ffc3dd] font-bold uppercase tracking-wider">
            Surgical Suite & Operative Medicine
          </Text>
        </View>
        <Text className="text-[18px] font-sans-bold text-white tracking-tight text-center">
          Surgical Specialties & Procedures
        </Text>
        <Text className="text-[12px] font-sans text-gray-400 text-center mt-0.5 max-w-[280px]">
          Tap any operative domain to open its protocols, steps, and techniques
        </Text>
      </View>

      {/* Circular Surgical Orbit */}
      <View
        className="mx-auto my-6 relative"
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
            Surgical Suite
          </Text>
          <Text className="text-[9.5px] text-[#010101]/80 font-sans-bold">
            Operative Hub
          </Text>
        </TouchableOpacity>

        {/* 6 Circular Orbit Nodes Arranged at 60° Intervals */}
        {/* Node 1: Top (0°) -> Operative Cases */}
        <SurgicalOrbitButton
          item={SURGERY_CATEGORIES[0]}
          size={BUTTON_SIZE}
          top="0%"
          left="50%"
          onPress={() => handleOpenCategory('surgical_cases')}
        />

        {/* Node 2: Top Right (60°) -> Operative Steps */}
        <SurgicalOrbitButton
          item={SURGERY_CATEGORIES[1]}
          size={BUTTON_SIZE}
          top="25%"
          left="93.3%"
          onPress={() => handleOpenCategory('operative_steps')}
        />

        {/* Node 3: Bottom Right (120°) -> Instruments & Devices */}
        <SurgicalOrbitButton
          item={SURGERY_CATEGORIES[2]}
          size={BUTTON_SIZE}
          top="75%"
          left="93.3%"
          onPress={() => handleOpenCategory('instruments_energy')}
        />

        {/* Node 4: Bottom (180°) -> Post-Op & ERAS */}
        <SurgicalOrbitButton
          item={SURGERY_CATEGORIES[3]}
          size={BUTTON_SIZE}
          top="100%"
          left="50%"
          onPress={() => handleOpenCategory('postop_eras')}
        />

        {/* Node 5: Bottom Left (240°) -> Emergency & Damage Control */}
        <SurgicalOrbitButton
          item={SURGERY_CATEGORIES[5]}
          size={BUTTON_SIZE}
          top="75%"
          left="6.7%"
          onPress={() => handleOpenCategory('damage_control')}
        />

        {/* Node 6: Top Left (300°) -> Pre-Op Risk & Clearance */}
        <SurgicalOrbitButton
          item={SURGERY_CATEGORIES[4]}
          size={BUTTON_SIZE}
          top="25%"
          left="6.7%"
          onPress={() => handleOpenCategory('preop_risk')}
        />
      </View>
    </View>
  );
};
