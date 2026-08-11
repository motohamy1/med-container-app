import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dbService } from '../../../../services/dbService';
import { SpecialtyData, SpecialtyCategory } from '../../../../constants/SpecialtyData';

export default function CategoryPage() {
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();

  const [specialty, setSpecialty] = useState<SpecialtyData | null>(null);
  const [category, setCategory] = useState<SpecialtyCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const specId = id || 'heart';
      const spec = await dbService.getSpecialty(specId);
      const cat = await dbService.getCategory(specId, categoryId);
      setSpecialty(spec);
      setCategory(cat);
      setLoading(false);
    }
    loadData();
  }, [id, categoryId]);

  const handleTopicPress = (topicId: string) => {
    if (specialty) {
      router.push({
        pathname: `/specialty/${specialty.id}/${topicId}` as any, // Cast as any temporarily to avoid TS path errors
      });
    }
  };

  const handleAskAI = () => {
    if (specialty && category) {
      router.push({
        pathname: `/specialty/${specialty.id}/general` as any,
        params: { categoryContext: category.id }
      });
    }
  };

  if (loading || !specialty || !category) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#6ec2be" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#101214" />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-white/5 bg-background z-20">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-white text-xl font-bold">{category.title}</Text>
          <Text className="text-turquoise text-xs font-semibold uppercase tracking-wider" style={{ color: specialty.color }}>
            {specialty.name} Specialty
          </Text>
        </View>
        <View 
          className="w-10 h-10 rounded-full items-center justify-center border border-white/10"
          style={{ backgroundColor: `${specialty.color}20` }}
        >
          <Ionicons name={category.icon} size={20} color={specialty.color} />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-24">
          <Text className="text-gray-400 text-sm mb-6 leading-5">
            {category.description}
          </Text>

          {!category.topics || category.topics.length === 0 ? (
            <View className="items-center justify-center py-10 opacity-60">
               <Ionicons name="folder-open-outline" size={48} color="#a3a8af" />
               <Text className="text-gray-400 mt-4 text-center">No curated topics yet.{'\n'}Use the AI Assistant to explore.</Text>
            </View>
          ) : (
            <View className="flex flex-col gap-3">
              {category.topics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  onPress={() => handleTopicPress(topic.id)}
                  className="bg-teal-medium/50 border border-white/10 p-4 rounded-2xl flex-row items-center justify-between active:opacity-70"
                >
                  <View className="flex-1 mr-3">
                    <View 
                      className="self-start px-2 py-0.5 rounded border mb-1.5"
                      style={{ backgroundColor: `${specialty.color}20`, borderColor: `${specialty.color}40` }}
                    >
                      <Text 
                        className="text-[10px] font-bold uppercase"
                        style={{ color: specialty.color }}
                      >
                        {topic.type}
                      </Text>
                    </View>
                    <Text className="text-white font-bold text-base mb-1">{topic.title}</Text>
                    <Text className="text-gray-400 text-xs">{topic.subtitle}</Text>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10">
                    <Ionicons name="chevron-forward" size={18} color={specialty.color} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Ask AI Button */}
      <View className="absolute bottom-8 left-0 right-0 items-center px-6 pointer-events-none">
        <TouchableOpacity 
          onPress={handleAskAI}
          className="flex-row items-center justify-center gap-2 py-4 px-6 rounded-full shadow-lg shadow-black/50 pointer-events-auto"
          style={{ backgroundColor: specialty.color }}
        >
          <Ionicons name="chatbubbles" size={20} color="#101214" />
          <Text className="text-[#101214] text-base font-bold">Ask AI about {category.title}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
