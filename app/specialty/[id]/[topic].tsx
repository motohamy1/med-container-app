import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPECIALTY_KNOWLEDGE } from '../../../constants/SpecialtyData';
import TopicChat from '../../../components/TopicChat';
import ClinicalGuide from '../../../components/ClinicalGuide';

export default function TopicPage() {
  const { id, topic } = useLocalSearchParams<{ id: string; topic: string }>();
  const [activeTab, setActiveTab] = useState<'guide' | 'chat'>('guide');

  const specialty = SPECIALTY_KNOWLEDGE[id || 'heart'] || SPECIALTY_KNOWLEDGE['heart'];
  const topicData = specialty.topics.find((t) => t.id === topic) || specialty.topics[0];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#101214" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-white/5 bg-background z-20">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-white text-lg font-bold" numberOfLines={1}>{topicData.title}</Text>
          <Text className="text-xs font-medium" style={{ color: specialty.color }}>
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
      <View className="flex-row mx-4 mt-4 mb-2 bg-[#181a1d] p-1 rounded-xl border border-white/5">
        <TouchableOpacity 
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'guide' ? 'bg-[#2b2e33]' : 'bg-transparent'}`}
          onPress={() => setActiveTab('guide')}
        >
          <Text className={`font-bold ${activeTab === 'guide' ? 'text-white' : 'text-gray-500'}`}>Clinical Guide</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'chat' ? 'bg-[#2b2e33]' : 'bg-transparent'}`}
          onPress={() => setActiveTab('chat')}
        >
          <Text className={`font-bold ${activeTab === 'chat' ? 'text-white' : 'text-gray-500'}`}>AI Assistant</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'guide' ? (
        <ClinicalGuide 
          topicData={topicData} 
          themeColor={specialty.color} 
          specialtyIllustration={specialty.illustration} 
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
