import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SPECIALTY_KNOWLEDGE, TopicItem } from '../../../constants/SpecialtyData';
import { Colors } from '../../../constants/Colors';
import ClinicalGuide from '../../../components/ClinicalGuide';
import TopicChat from '../../../components/TopicChat';
import { KnowledgeMap } from '../../../components/KnowledgeMap';

type TabType = 'guide' | 'chat' | 'map';

export default function SpecialtyTopicDetailScreen() {
  const router = useRouter();
  const { id, topic } = useLocalSearchParams<{ id: string; topic: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const [mapChatQuery, setMapChatQuery] = useState<string | undefined>(undefined);
  const [targetGuideSection, setTargetGuideSection] = useState<number | undefined>(undefined);

  const specialty = id ? SPECIALTY_KNOWLEDGE[id as string] : undefined;
  let topicData: TopicItem | null = null;

  if (specialty && specialty.categories) {
    for (const cat of specialty.categories) {
      const found = cat.topics.find((t: TopicItem) => t.id === topic);
      if (found) {
        topicData = found;
        break;
      }
    }
  }

  if (!specialty || !topicData) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.main} />
      </SafeAreaView>
    );
  }

  const handleAskAiFromMap = (question: string) => {
    setMapChatQuery(question);
    setActiveTab('chat');
  };

  const handleOpenGuideFromMap = (sectionIndex?: number) => {
    setTargetGuideSection(sectionIndex);
    setActiveTab('guide');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3.5 border-b border-white/5 bg-background z-20">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-white text-lg font-sans-bold" numberOfLines={1}>{topicData.title}</Text>
          <Text className="text-xs font-sans-medium" style={{ color: specialty.color }}>
            {specialty.scientificName} • Strict Scope Active
          </Text>
        </View>
        <View 
          className="w-8 h-8 rounded-full items-center justify-center border border-white/10"
          style={{ backgroundColor: `${specialty.color}20` }}
        >
          <Ionicons name="lock-closed" size={14} color={specialty.color} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'guide' && [styles.tabButtonActive, { backgroundColor: `${specialty.color}22`, borderColor: `${specialty.color}55` }]
          ]}
          onPress={() => setActiveTab('guide')}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="book-outline" 
            size={13} 
            color={activeTab === 'guide' ? specialty.color : '#8e8e93'} 
            style={{ marginRight: 4 }} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'guide' && { color: specialty.color, fontWeight: '700' }
            ]}
            numberOfLines={1}
          >
            Clinical Guide
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'chat' && [styles.tabButtonActive, { backgroundColor: `${specialty.color}22`, borderColor: `${specialty.color}55` }]
          ]}
          onPress={() => setActiveTab('chat')}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="chatbubbles-outline" 
            size={13} 
            color={activeTab === 'chat' ? specialty.color : '#8e8e93'} 
            style={{ marginRight: 4 }} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'chat' && { color: specialty.color, fontWeight: '700' }
            ]}
            numberOfLines={1}
          >
            AI Assistant
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'map' && [styles.tabButtonActive, { backgroundColor: `${specialty.color}22`, borderColor: `${specialty.color}55` }]
          ]}
          onPress={() => setActiveTab('map')}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="git-network-outline" 
            size={13} 
            color={activeTab === 'map' ? specialty.color : '#8e8e93'} 
            style={{ marginRight: 4 }} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'map' && { color: specialty.color, fontWeight: '700' }
            ]}
            numberOfLines={1}
          >
            Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Panels: Keep all mounted to preserve chat messages and guide scroll position */}
      <View style={[styles.panelContainer, { display: activeTab === 'guide' ? 'flex' : 'none' }]}>
        <ClinicalGuide 
          topicData={topicData} 
          themeColor={specialty.color}
          targetSectionIndex={targetGuideSection}
        />
      </View>

      <View style={[styles.panelContainer, { display: activeTab === 'chat' ? 'flex' : 'none' }]}>
        <TopicChat 
          specialtyId={specialty.id}
          topicId={topicData.id}
          topicName={topicData.title}
          themeColor={specialty.color}
          initialQuery={mapChatQuery}
        />
      </View>

      <View style={[styles.panelContainer, { display: activeTab === 'map' ? 'flex' : 'none' }]}>
        <KnowledgeMap
          specialty={specialty}
          topic={topicData}
          themeColor={specialty.color}
          onAskAi={handleAskAiFromMap}
          onOpenGuide={handleOpenGuideFromMap}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: '#121719',
    padding: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'PlexSans_500Medium',
    color: '#8e8e93',
  },
  panelContainer: {
    flex: 1,
  },
});
