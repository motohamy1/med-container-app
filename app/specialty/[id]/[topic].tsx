import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StatusBar, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dbService } from '../../../services/dbService';
import { SpecialtyData, TopicItem } from '../../../constants/SpecialtyData';
import { Colors } from '../../../constants/Colors';
import TopicChat from '../../../components/TopicChat';
import ClinicalGuide from '../../../components/ClinicalGuide';

export default function TopicPage() {
  const { id, topic } = useLocalSearchParams<{ id: string; topic: string }>();
  const [activeTab, setActiveTab] = useState<'guide' | 'chat'>('guide');

  const [specialty, setSpecialty] = useState<SpecialtyData | null>(null);
  const [topicData, setTopicData] = useState<TopicItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const specId = id || 'heart';
      const spec = await dbService.getSpecialty(specId);
      const data = await dbService.getTopic(specId, topic);
      setSpecialty(spec);
      setTopicData(data);
      setLoading(false);
    }
    loadData();
  }, [id, topic]);

  if (loading || !specialty || !topicData) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.main} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-white/5 bg-background z-20">
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
            name="book" 
            size={14} 
            color={activeTab === 'guide' ? specialty.color : '#8e8e93'} 
            style={{ marginRight: 6 }} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'guide' && { color: specialty.color, fontWeight: '700' }
            ]}
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
            name="chatbubbles" 
            size={14} 
            color={activeTab === 'chat' ? specialty.color : '#8e8e93'} 
            style={{ marginRight: 6 }} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'chat' && { color: specialty.color, fontWeight: '700' }
            ]}
          >
            AI Assistant
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'guide' ? (
        <ClinicalGuide 
          topicData={topicData} 
          themeColor={specialty.color} 
        />
      ) : (
        <TopicChat 
          specialtyId={specialty.id}
          topicId={topicData.id}
          topicName={topicData.title}
          themeColor={specialty.color}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#121719',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 9,
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
    elevation: 2,
  },
  tabText: {
    fontSize: 12.5,
    fontFamily: 'PlexSans_600SemiBold',
    color: '#8e8e93',
  },
});
