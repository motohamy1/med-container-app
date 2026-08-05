import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPECIALTY_KNOWLEDGE } from '../../../constants/SpecialtyData';
import TopicChat from '../../../components/TopicChat';

export default function GeneralSpecialtyChat() {
  const { id, query } = useLocalSearchParams<{ id: string, query?: string }>();

  const specialty = SPECIALTY_KNOWLEDGE[id || 'heart'] || SPECIALTY_KNOWLEDGE['heart'];

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
          <Text className="text-white text-lg font-bold" numberOfLines={1}>General AI ({specialty.name})</Text>
          <Text className="text-xs font-medium" style={{ color: specialty.color }}>
            {specialty.scientificName} • Specialty Scope Active
          </Text>
        </View>
        <View 
          className="w-8 h-8 rounded-full items-center justify-center border border-white/10"
          style={{ backgroundColor: `${specialty.color}20` }}
        >
          <Ionicons name="medkit" size={14} color={specialty.color} />
        </View>
      </View>

      <TopicChat 
        specialtyId={specialty.id} 
        topicId="general" 
        topicName={`General ${specialty.scientificName}`}
        themeColor={specialty.color}
        initialQuery={query}
      />
    </SafeAreaView>
  );
}
