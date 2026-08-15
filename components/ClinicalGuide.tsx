import React, { useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopicItem } from '../constants/SpecialtyData';
import { Colors } from '../constants/Colors';

interface ClinicalGuideProps {
  topicData: TopicItem;
  themeColor: string;
  specialtyIllustration?: any;
}

export default function ClinicalGuide({ topicData, themeColor, specialtyIllustration }: ClinicalGuideProps) {
  const illustration = topicData.illustration || specialtyIllustration;
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<number, number>>({});

  const handleScrollToSection = (index: number) => {
    const y = sectionRefs.current[index] || 0;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header / Hero */}
      <View className="items-center mt-6 mb-4 px-6">
        <View 
          className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2" 
          style={{ borderColor: `${themeColor}60` }}
        >
          {illustration ? (
            <Image 
              source={illustration} 
              className="w-full h-full opacity-85" 
              resizeMode="cover" 
            />
          ) : (
            <View className="w-full h-full bg-teal-dark items-center justify-center">
              <Ionicons name="medical" size={32} color={themeColor} />
            </View>
          )}
        </View>

        {/* Type Badge */}
        <View 
          className="px-3 py-1 rounded-full border mb-2"
          style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}40` }}
        >
          <Text className="text-[11px] font-sans-bold uppercase tracking-wider" style={{ color: themeColor }}>
            {topicData.type || 'Clinical Reference'}
          </Text>
        </View>

        <Text className="text-white text-2xl font-sans-bold text-center mb-1 leading-tight">{topicData.title}</Text>
        <Text className="text-gray-300 text-sm font-sans-medium text-center leading-5 px-2">
          {topicData.subtitle}
        </Text>
      </View>

      {/* Quick Section Jumpers */}
      {topicData.clinicalContent && topicData.clinicalContent.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="px-4 py-2 mb-4 border-y border-white/5 bg-teal-dark/30"
          contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
        >
          {topicData.clinicalContent.map((sec, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleScrollToSection(idx)}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex-row items-center gap-1.5"
            >
              <Ionicons name={getIconForSection(sec.title)} size={12} color={themeColor} />
              <Text className="text-[11px] font-sans-semibold text-gray-300">
                {sec.title.split('&')[0].trim()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Clinical Content Sections */}
      <View className="px-5">
        {topicData.clinicalContent && topicData.clinicalContent.length > 0 ? (
          topicData.clinicalContent.map((section, index) => {
            const style = getSectionCardStyle(section.title, themeColor);

            return (
              <View 
                key={index} 
                className="mb-5"
                onLayout={(e) => {
                  sectionRefs.current[index] = e.nativeEvent.layout.y;
                }}
              >
                {/* Section Header */}
                <View className="flex-row items-center mb-2.5">
                  <View 
                    className="w-7 h-7 rounded-full items-center justify-center mr-2.5 border"
                    style={{ backgroundColor: style.iconBg, borderColor: style.iconBorder }}
                  >
                    <Ionicons 
                      name={getIconForSection(section.title)} 
                      size={14} 
                      color={style.iconColor} 
                    />
                  </View>
                  <Text className="text-white text-base font-sans-bold flex-1">{section.title}</Text>
                </View>

                {/* Section Content Container */}
                <View 
                  className="rounded-2xl p-4 border"
                  style={{ backgroundColor: style.cardBg, borderColor: style.cardBorder }}
                >
                  <Text className="text-gray-200 text-sm leading-6 font-sans">
                    {section.content}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-12 px-6">
            <Ionicons name="document-text-outline" size={48} color="#404040" />
            <Text className="text-gray-400 mt-4 text-center text-sm leading-5">
              Clinical guidelines for this topic are being compiled from active medical references.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function getIconForSection(title: string): keyof typeof Ionicons.glyphMap {
  const lower = title.toLowerCase();
  if (lower.includes('triage') || lower.includes('red flag') || lower.includes('emergency')) return 'warning';
  if (lower.includes('diagnostic') || lower.includes('criteria') || lower.includes('scoring') || lower.includes('scale')) return 'clipboard';
  if (lower.includes('pharmacotherapy') || lower.includes('dosing') || lower.includes('medication') || lower.includes('drug')) return 'medkit';
  if (lower.includes('algorithm') || lower.includes('stepwise') || lower.includes('management') || lower.includes('protocol')) return 'git-network';
  if (lower.includes('pitfall') || lower.includes('malpractice') || lower.includes('warning')) return 'alert-circle';
  if (lower.includes('citation') || lower.includes('reference') || lower.includes('guideline') || lower.includes('trial')) return 'book';
  return 'information-circle';
}

function getSectionCardStyle(title: string, themeColor: string) {
  const lower = title.toLowerCase();

  // Red Flags / Immediate Triage
  if (lower.includes('triage') || lower.includes('red flag')) {
    return {
      cardBg: 'rgba(217, 83, 79, 0.08)',
      cardBorder: 'rgba(217, 83, 79, 0.35)',
      iconBg: 'rgba(217, 83, 79, 0.2)',
      iconBorder: 'rgba(217, 83, 79, 0.5)',
      iconColor: '#e06c75',
    };
  }

  // Pharmacotherapy & Dosing
  if (lower.includes('pharmacotherapy') || lower.includes('dosing') || lower.includes('drug')) {
    return {
      cardBg: 'rgba(110, 194, 190, 0.08)',
      cardBorder: 'rgba(110, 194, 190, 0.35)',
      iconBg: 'rgba(110, 194, 190, 0.2)',
      iconBorder: 'rgba(110, 194, 190, 0.5)',
      iconColor: Colors.accent,
    };
  }

  // Pitfalls & Malpractice
  if (lower.includes('pitfall') || lower.includes('malpractice') || lower.includes('warning')) {
    return {
      cardBg: 'rgba(230, 150, 60, 0.08)',
      cardBorder: 'rgba(230, 150, 60, 0.35)',
      iconBg: 'rgba(230, 150, 60, 0.2)',
      iconBorder: 'rgba(230, 150, 60, 0.5)',
      iconColor: '#f0ad4e',
    };
  }

  // Citations & Evidence
  if (lower.includes('citation') || lower.includes('reference') || lower.includes('guideline')) {
    return {
      cardBg: 'rgba(201, 168, 124, 0.06)',
      cardBorder: 'rgba(201, 168, 124, 0.25)',
      iconBg: 'rgba(201, 168, 124, 0.15)',
      iconBorder: 'rgba(201, 168, 124, 0.4)',
      iconColor: Colors.gold,
    };
  }

  // Default Standard Container
  return {
    cardBg: '#181a1d',
    cardBorder: 'rgba(255, 255, 255, 0.07)',
    iconBg: `${themeColor}15`,
    iconBorder: `${themeColor}35`,
    iconColor: themeColor,
  };
}
