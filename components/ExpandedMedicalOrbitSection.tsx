import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { EXPANDED_MEDICINE_SPECIALTIES } from '../constants/ExpandedSpecialtiesData';
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

interface ExpandedMedicalOrbitSectionProps {
  onLayout?: (event: any) => void;
  hideHeader?: boolean;
}

// Second wheel of the medical section — surfaces remaining medicine subspecialties
// directly as clinical orbit nodes with smooth continuous circular geometry.
export const ExpandedMedicalOrbitSection: React.FC<ExpandedMedicalOrbitSectionProps> = ({
  onLayout,
  hideHeader = true,
}) => {
  const handleOpenSpecialty = (specialtyId: string) => {
    router.push(`/specialty/${specialtyId}` as any);
  };

  const handleCenterHubPress = () => {
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: { query: 'Internal Medicine Subspecialty Clinical Advisor' },
    } as any);
  };

  return (
    <View onLayout={onLayout} className="mt-2 pt-4 pb-10 border-t border-white/5 px-6">
      {/* Optional Header (hidden when presented under the main tab header) */}
      {!hideHeader && (
        <OrbitSectionLabel
          variant="medical"
          badgeLabel="MEDICAL"
          badgeSubtitle="Clinical subspecialties"
          title="Medical Specialties"
          description="Tap any specialty to explore categorized evidence guidelines, acute protocols & diagnostics"
        />
      )}

      {/* Second Circular Medical Orbit */}
      <View
        className="mx-auto mt-4 mb-10 relative"
        style={{ width: ORBIT_SIZE, height: ORBIT_SIZE }}
      >
        {/* Continuous Smooth Clinical Orbit Rings */}
        <OrbitRings variant="medical" size={ORBIT_SIZE} />

        {/* Center hub — Medicine AI Subspecialty Advisor */}
        <OrbitCenterHub
          title="Ask Medical AI"
          icon="medical"
          variant="medical"
          size={CENTER_SIZE}
          onPress={handleCenterHubPress}
        />

        {EXPANDED_MEDICINE_SPECIALTIES.map((spec, index) => {
          const pos = ORBIT_NODE_POSITIONS[index];
          if (!pos) return null;
          return (
            <OrbitNode
              key={spec.id}
              specialty={spec}
              size={BUTTON_SIZE}
              top={pos.top}
              left={pos.left}
              variant="medical"
              onPress={() => handleOpenSpecialty(spec.id)}
            />
          );
        })}
      </View>
    </View>
  );
};
