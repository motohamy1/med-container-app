import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import {
  EXPANDED_MEDICINE_SPECIALTIES,
  MedicineSpecialtyItem,
} from '../constants/ExpandedSpecialtiesData';

interface ExpandedSpecialtiesGridProps {
  onLayout?: (event: any) => void;
}

export const ExpandedSpecialtiesGrid: React.FC<ExpandedSpecialtiesGridProps> = ({
  onLayout,
}) => {
  const handleOpenSpecialty = (specialtyId: string) => {
    // Navigates directly to the Category Dashboard Page for this specialty
    router.push(`/specialty/${specialtyId}` as any);
  };

  return (
    <View onLayout={onLayout} className="mt-4 pt-8 border-t border-white/5 px-6 pb-8">
      {/* Section Header */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-1.5">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: Colors.main }}
            />
            <Text className="text-[11px] font-sans-bold uppercase tracking-wider text-gray-400">
              Clinical Knowledge Base
            </Text>
          </View>
          <View className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
            <Text className="text-[10px] font-mono text-gray-400">
              {EXPANDED_MEDICINE_SPECIALTIES.length} Disciplines
            </Text>
          </View>
        </View>

        <Text className="text-[19px] font-sans-bold text-white tracking-tight">
          Expanded Medical Specialties
        </Text>
        <Text className="text-[12px] font-sans text-gray-400 mt-0.5">
          Select any specialty to view categorized evidence guidelines, acute protocols, and diagnostics
        </Text>
      </View>

      {/* Grid of Rounded Sleek Minimal Dark Cards with Glow Borders */}
      <View className="flex flex-col gap-3">
        {EXPANDED_MEDICINE_SPECIALTIES.map((spec) => (
          <TouchableOpacity
            key={spec.id}
            onPress={() => handleOpenSpecialty(spec.id)}
            activeOpacity={0.82}
            style={[
              styles.cardContainer,
              {
                borderColor: `${spec.color}35`,
                shadowColor: spec.color,
              },
            ]}
          >
            <LinearGradient
              colors={[`${spec.color}15`, `${spec.color}04`, '#080c0e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-3 flex-1 mr-2">
                  <View
                    className="w-11 h-11 rounded-2xl items-center justify-center border"
                    style={{
                      backgroundColor: `${spec.color}18`,
                      borderColor: `${spec.color}45`,
                      shadowColor: spec.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 5,
                      elevation: 3,
                    }}
                  >
                    <Ionicons name={spec.icon} size={20} color={spec.color} />
                  </View>

                  <View className="flex-1">
                    <View
                      className="self-start px-2 py-0.5 rounded-md border mb-1"
                      style={{
                        backgroundColor: `${spec.color}15`,
                        borderColor: `${spec.color}40`,
                      }}
                    >
                      <Text
                        className="text-[9px] font-mono font-bold tracking-wider uppercase"
                        style={{ color: spec.color }}
                      >
                        {spec.badge}
                      </Text>
                    </View>
                    <Text
                      className="text-[15px] font-sans-bold text-white tracking-tight leading-tight"
                      numberOfLines={1}
                    >
                      {spec.scientificName}
                    </Text>
                  </View>
                </View>

                {/* Arrow Action Pill */}
                <View
                  className="flex-row items-center gap-1 px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${spec.color}15`,
                    borderColor: `${spec.color}40`,
                  }}
                >
                  <Text
                    className="text-[11px] font-sans-semibold"
                    style={{ color: spec.color }}
                  >
                    Categories
                  </Text>
                  <Ionicons name="chevron-forward" size={13} color={spec.color} />
                </View>
              </View>

              <Text
                className="text-[12px] font-sans text-gray-300 mt-2.5 leading-4"
                numberOfLines={2}
              >
                {spec.scope}
              </Text>

              {/* Core Pillars Chips */}
              <View className="flex-row flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/5">
                {spec.corePillars.slice(0, 3).map((pillar, i) => (
                  <View
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-black/40 border border-white/10"
                  >
                    <Text className="text-[10px] font-sans-medium text-gray-300">
                      {pillar}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#080c0d',
  },
  cardGradient: {
    padding: 14,
  },
});
