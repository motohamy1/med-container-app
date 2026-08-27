import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { EXPANDED_SURGICAL_SPECIALTIES } from './SurgicalOrbitSection';
import {
  ORBIT_SIZE,
  CENTER_SIZE,
  BUTTON_SIZE,
  ORBIT_NODE_POSITIONS,
  OrbitRings,
  OrbitNode,
  OrbitCenterHub,
  OrbitSectionLabel,
} from './OrbitPrimitives';

interface ExpandedSurgicalOrbitSectionProps {
  hideHeader?: boolean;
}

// Second wheel of the surgical section — surfaces remaining surgical subspecialties
// directly as precision operative orbit nodes.
export const ExpandedSurgicalOrbitSection: React.FC<ExpandedSurgicalOrbitSectionProps> = ({
  hideHeader = true,
}) => {
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
    <View className="mt-2 pt-4 pb-10 border-t border-white/5 px-6">
      {/* Optional Header (hidden when presented under the main tab header) */}
      {!hideHeader && (
        <OrbitSectionLabel
          variant="surgical"
          badgeLabel="SURGICAL"
          badgeSubtitle="Operative subspecialties"
          title="Surgical Specialties"
          description="Tap any surgical specialty to explore operative cases, techniques, pre-op clearance & critical care"
        />
      )}

      {/* Second Circular Surgical Orbit */}
      <View
        className="mx-auto mt-4 mb-10 relative"
        style={{ width: ORBIT_SIZE, height: ORBIT_SIZE }}
      >
        {/* Precision Segmented Double-Ring Orbit */}
        <OrbitRings variant="surgical" size={ORBIT_SIZE} />

        {/* Center hub — Surgical Subspecialty AI Advisor */}
        <OrbitCenterHub
          title="Ask Surgical AI"
          icon="cut"
          variant="surgical"
          size={CENTER_SIZE}
          onPress={handleCenterHubPress}
        />

        {EXPANDED_SURGICAL_SPECIALTIES.map((spec, index) => {
          const pos = ORBIT_NODE_POSITIONS[index];
          if (!pos) return null;
          return (
            <OrbitNode
              key={spec.id}
              specialty={spec}
              size={BUTTON_SIZE}
              top={pos.top}
              left={pos.left}
              variant="surgical"
              onPress={() => handleOpenSpecialty(spec.id)}
            />
          );
        })}
      </View>
    </View>
  );
};
