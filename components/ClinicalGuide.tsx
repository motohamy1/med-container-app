import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopicItem } from '../constants/SpecialtyData';

interface ClinicalGuideProps {
  topicData: TopicItem;
  themeColor: string;
  specialtyIllustration?: any;
}

export default function ClinicalGuide({ topicData, themeColor, specialtyIllustration }: ClinicalGuideProps) {
  const illustration = topicData.illustration || specialtyIllustration;

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header / Hero */}
      <View className="items-center mt-12 mb-8 px-6">
        <View 
          className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4" 
          style={{ borderColor: `${themeColor}40` }}
        >
          {illustration ? (
            <Image 
              source={illustration} 
              className="w-full h-full opacity-80" 
              resizeMode="cover" 
            />
          ) : (
            <View className="w-full h-full bg-teal-dark items-center justify-center">
              <Ionicons name="medical" size={40} color={themeColor} />
            </View>
          )}
        </View>
        <Text className="text-white text-3xl font-black text-center mb-2">{topicData.title}</Text>
        <Text className="text-gray-400 text-base font-medium text-center leading-6">
          {topicData.subtitle}
        </Text>
      </View>

      {/* Clinical Content */}
      <View className="px-6">
        {topicData.clinicalContent ? (
          topicData.clinicalContent.map((section, index) => (
            <View key={index} className="mb-8">
              <View className="flex-row items-center mb-3">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${themeColor}20` }}
                >
                  <Ionicons 
                    name={getIconForSection(section.title)} 
                    size={16} 
                    color={themeColor} 
                  />
                </View>
                <Text className="text-white text-xl font-bold">{section.title}</Text>
              </View>
              <View className="bg-[#181a1d] rounded-2xl p-5 border border-white/5">
                <Text className="text-gray-300 text-sm leading-6">
                  {section.content}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center justify-center mt-10">
            <Ionicons name="document-text-outline" size={48} color="#404040" />
            <Text className="text-gray-500 mt-4 text-center">
              Comprehensive clinical content for this topic is being updated.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Helper to map section titles to relevant icons
function getIconForSection(title: string): keyof typeof Ionicons.glyphMap {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('definition') || lowerTitle.includes('pathophysiology')) return 'book';
  if (lowerTitle.includes('clinical') || lowerTitle.includes('presentation')) return 'body';
  if (lowerTitle.includes('investigation') || lowerTitle.includes('lab') || lowerTitle.includes('diagnosis')) return 'flask';
  if (lowerTitle.includes('treatment') || lowerTitle.includes('management')) return 'medkit';
  if (lowerTitle.includes('follow') || lowerTitle.includes('prognosis')) return 'calendar';
  return 'information-circle';
}
