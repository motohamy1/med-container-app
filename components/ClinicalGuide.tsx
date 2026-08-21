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
  if (lower.includes('definition') || lower.includes('overview') || lower.includes('introduction')) return 'book-outline';
  if (lower.includes('operative step') || lower.includes('surgical technique') || lower.includes('dissection')) return 'cut';
  if (lower.includes('instrument') || lower.includes('equipment') || lower.includes('device') || lower.includes('suture')) return 'hardware-chip';
  if (lower.includes('preoperative') || lower.includes('pre-op') || lower.includes('clearance') || lower.includes('risk')) return 'shield-checkmark';
  if (lower.includes('post-operative') || lower.includes('post-op') || lower.includes('critical care') || lower.includes('eras') || lower.includes('drain')) return 'pulse';
  if (lower.includes('complication') || lower.includes('intraoperative') || lower.includes('pitfall') || lower.includes('malpractice') || lower.includes('warning')) return 'alert-circle';
  if (lower.includes('scenario') || lower.includes('presentation') || lower.includes('history')) return 'document-text';
  if (lower.includes('triage') || lower.includes('red flag') || lower.includes('emergency')) return 'warning';
  if (lower.includes('diagnostic') || lower.includes('criteria') || lower.includes('scoring') || lower.includes('scale')) return 'clipboard';
  if (lower.includes('pharmacotherapy') || lower.includes('dosing') || lower.includes('medication') || lower.includes('drug')) return 'medkit';
  if (lower.includes('algorithm') || lower.includes('stepwise') || lower.includes('management') || lower.includes('protocol')) return 'git-network';
  if (lower.includes('citation') || lower.includes('reference') || lower.includes('guideline') || lower.includes('trial')) return 'book';
  return 'information-circle';
}

function getSectionCardStyle(title: string, themeColor: string) {
  const lower = title.toLowerCase();

  // Clinical Definition & Overview (Clean Lavender / Indigo)
  if (lower.includes('definition') || lower.includes('overview') || lower.includes('introduction')) {
    return {
      cardBg: 'rgba(219, 212, 253, 0.08)',
      cardBorder: 'rgba(219, 212, 253, 0.4)',
      iconBg: 'rgba(219, 212, 253, 0.2)',
      iconBorder: 'rgba(219, 212, 253, 0.55)',
      iconColor: '#dbd4fd',
    };
  }

  // Operative Steps & Techniques (Surgical Cut - Vibrant Mint/Teal)
  if (lower.includes('operative step') || lower.includes('surgical technique') || lower.includes('dissection')) {
    return {
      cardBg: 'rgba(222, 255, 249, 0.07)',
      cardBorder: 'rgba(222, 255, 249, 0.35)',
      iconBg: 'rgba(222, 255, 249, 0.18)',
      iconBorder: 'rgba(222, 255, 249, 0.5)',
      iconColor: '#defff9',
    };
  }

  // Preoperative Risk & Preparation (Shield - Rose / Light Amber)
  if (lower.includes('preoperative') || lower.includes('pre-op') || lower.includes('clearance')) {
    return {
      cardBg: 'rgba(255, 195, 221, 0.07)',
      cardBorder: 'rgba(255, 195, 221, 0.35)',
      iconBg: 'rgba(255, 195, 221, 0.18)',
      iconBorder: 'rgba(255, 195, 221, 0.5)',
      iconColor: '#ffc3dd',
    };
  }

  // Clinical Pitfalls & Malpractice Warnings / Critical Alerts (Pastel Rose Pink)
  if (lower.includes('pitfall') || lower.includes('malpractice') || lower.includes('warning') || lower.includes('complication') || lower.includes('triage') || lower.includes('red flag') || lower.includes('emergency')) {
    return {
      cardBg: 'rgba(255, 195, 221, 0.08)',
      cardBorder: 'rgba(255, 195, 221, 0.35)',
      iconBg: 'rgba(255, 195, 221, 0.2)',
      iconBorder: 'rgba(255, 195, 221, 0.5)',
      iconColor: '#ffc3dd',
    };
  }

  // Exact Reference & Guideline Citations / Evidence (Soft Lavender)
  if (lower.includes('citation') || lower.includes('reference') || lower.includes('guideline') || lower.includes('trial')) {
    return {
      cardBg: 'rgba(219, 212, 253, 0.07)',
      cardBorder: 'rgba(219, 212, 253, 0.35)',
      iconBg: 'rgba(219, 212, 253, 0.18)',
      iconBorder: 'rgba(219, 212, 253, 0.5)',
      iconColor: '#dbd4fd',
    };
  }

  // Diagnostic Criteria, Scoring Systems & Workup (Jewel Teal)
  if (lower.includes('diagnostic') || lower.includes('criteria') || lower.includes('scoring') || lower.includes('scale') || lower.includes('investigation') || lower.includes('workup')) {
    return {
      cardBg: 'rgba(109, 194, 189, 0.07)',
      cardBorder: 'rgba(109, 194, 189, 0.35)',
      iconBg: 'rgba(109, 194, 189, 0.18)',
      iconBorder: 'rgba(109, 194, 189, 0.5)',
      iconColor: '#6dc2bd',
    };
  }

  // Pharmacotherapy, Dosing & Medications (Aqua Mint)
  if (lower.includes('pharmacotherapy') || lower.includes('dosing') || lower.includes('medication') || lower.includes('drug')) {
    return {
      cardBg: 'rgba(222, 255, 249, 0.07)',
      cardBorder: 'rgba(222, 255, 249, 0.35)',
      iconBg: 'rgba(222, 255, 249, 0.18)',
      iconBorder: 'rgba(222, 255, 249, 0.5)',
      iconColor: '#defff9',
    };
  }

  // Post-Op Critical Care & ERAS (Soft Lavender)
  if (lower.includes('post-operative') || lower.includes('post-op') || lower.includes('critical care') || lower.includes('eras')) {
    return {
      cardBg: 'rgba(219, 212, 253, 0.07)',
      cardBorder: 'rgba(219, 212, 253, 0.35)',
      iconBg: 'rgba(219, 212, 253, 0.18)',
      iconBorder: 'rgba(219, 212, 253, 0.5)',
      iconColor: '#dbd4fd',
    };
  }

  // Surgical Instruments & Equipment (Jewel Teal)
  if (lower.includes('instrument') || lower.includes('equipment') || lower.includes('device') || lower.includes('suture')) {
    return {
      cardBg: 'rgba(109, 194, 189, 0.07)',
      cardBorder: 'rgba(109, 194, 189, 0.35)',
      iconBg: 'rgba(109, 194, 189, 0.18)',
      iconBorder: 'rgba(109, 194, 189, 0.5)',
      iconColor: '#6dc2bd',
    };
  }

  // Management Algorithm & Stepwise Protocols (Aqua Mint)
  if (lower.includes('algorithm') || lower.includes('stepwise') || lower.includes('management') || lower.includes('protocol')) {
    return {
      cardBg: 'rgba(222, 255, 249, 0.07)',
      cardBorder: 'rgba(222, 255, 249, 0.35)',
      iconBg: 'rgba(222, 255, 249, 0.18)',
      iconBorder: 'rgba(222, 255, 249, 0.5)',
      iconColor: '#defff9',
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
