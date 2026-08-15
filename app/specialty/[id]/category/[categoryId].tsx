import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dbService } from '../../../../services/dbService';
import { SpecialtyData, SpecialtyCategory, TopicItem } from '../../../../constants/SpecialtyData';
import { Colors } from '../../../../constants/Colors';

export default function CategoryPage() {
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();

  const [specialty, setSpecialty] = useState<SpecialtyData | null>(null);
  const [category, setCategory] = useState<SpecialtyCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

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

  const topicsList = category?.topics || [];

  // Filter chips
  const filterChips = useMemo(() => {
    const types = new Set(topicsList.map((t) => t.type).filter(Boolean));
    return ['all', ...Array.from(types)];
  }, [topicsList]);

  // Filtered topics based on search text and chip
  const filteredTopics = useMemo(() => {
    return topicsList.filter((t) => {
      const matchesSearch =
        !searchText.trim() ||
        t.title.toLowerCase().includes(searchText.toLowerCase()) ||
        t.subtitle.toLowerCase().includes(searchText.toLowerCase());

      const matchesChip = selectedFilter === 'all' || t.type === selectedFilter;

      return matchesSearch && matchesChip;
    });
  }, [topicsList, searchText, selectedFilter]);

  const handleTopicPress = (topicId: string) => {
    if (specialty) {
      router.push(`/specialty/${specialty.id}/${topicId}` as any);
    }
  };

  const handleAskAI = () => {
    if (specialty && category) {
      router.push({
        pathname: `/specialty/${specialty.id}/general` as any,
        params: { categoryContext: category.id, query: searchText }
      });
    }
  };

  const handleSynthesizeOnDemand = async () => {
    if (!searchText.trim() || !specialty || !category) return;
    setIsSynthesizing(true);
    try {
      const compiled = await dbService.synthesizeTopicFromReference(specialty.id, category.id, searchText.trim());
      if (compiled && compiled.id) {
        // Add to local state list
        setCategory((prev) => prev ? {
          ...prev,
          topics: [compiled, ...(prev.topics || [])]
        } : prev);
        // Navigate to newly compiled topic
        router.push(`/specialty/${specialty.id}/${compiled.id}` as any);
      } else {
        Alert.alert(
          'Reference Synthesis',
          `Could not compile a verified guide for "${searchText}". Consulting specialty AI assistant instead.`,
          [{ text: 'OK', onPress: handleAskAI }]
        );
      }
    } catch {
      handleAskAI();
    } finally {
      setIsSynthesizing(false);
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-white/5 bg-background z-20">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-white text-lg font-sans-bold" numberOfLines={1}>{category.title}</Text>
          <Text className="text-turquoise text-xs font-sans-semibold uppercase tracking-wider" style={{ color: specialty.color }}>
            {specialty.scientificName} • {topicsList.length} Verified Protocols
          </Text>
        </View>
        <View 
          className="w-9 h-9 rounded-full items-center justify-center border border-white/10"
          style={{ backgroundColor: `${specialty.color}20` }}
        >
          <Ionicons name={category.icon} size={18} color={specialty.color} />
        </View>
      </View>

      {/* Live Search Bar */}
      <View className="px-5 pt-3 pb-2 bg-background">
        <View className="bg-[#181a1d] rounded-2xl flex-row items-center px-4 py-2.5 border border-white/10">
          <Ionicons name="search" size={18} color={specialty.color} />
          <TextInput
            className="flex-1 text-white ml-2.5 font-sans-medium text-sm"
            placeholder={`Filter ${category.title.toLowerCase()} topics...`}
            placeholderTextColor={Colors.grayMuted}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} className="p-1">
              <Ionicons name="close-circle" size={16} color={Colors.grayMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        {filterChips.length > 2 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5 py-1" contentContainerStyle={{ gap: 6 }}>
            {filterChips.map((chip) => {
              const isSelected = selectedFilter === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  onPress={() => setSelectedFilter(chip)}
                  className="px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: isSelected ? `${specialty.color}25` : '#181a1d',
                    borderColor: isSelected ? specialty.color : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text
                    className="text-[11px] font-sans-bold capitalize"
                    style={{ color: isSelected ? specialty.color : '#9e9e9e' }}
                  >
                    {chip === 'all' ? 'All Types' : chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4 pb-28">
          <Text className="text-gray-400 text-xs mb-4 leading-4 px-1">
            {category.description}
          </Text>

          {filteredTopics.length === 0 ? (
            <View className="items-center justify-center py-10 px-4 bg-[#181a1d] rounded-3xl border border-white/5 mt-2">
               <Ionicons name="document-text-outline" size={44} color={specialty.color} />
               <Text className="text-white font-sans-bold text-base mt-3 text-center">
                 {searchText.trim() ? `No topic matching "${searchText}"` : 'No curated topics in this filter'}
               </Text>
               <Text className="text-gray-400 text-xs text-center mt-1 mb-5 leading-4 max-w-xs">
                 {searchText.trim() 
                   ? 'Synthesize a peer-reviewed clinical guide from verified medical textbooks and guidelines on-demand.'
                   : 'Consult the specialist AI assistant for reference-grounded guidance.'}
               </Text>

               {searchText.trim().length > 0 ? (
                 <TouchableOpacity
                   onPress={handleSynthesizeOnDemand}
                   disabled={isSynthesizing}
                   className="px-5 py-3 rounded-full flex-row items-center gap-2"
                   style={{ backgroundColor: specialty.color }}
                 >
                   {isSynthesizing ? (
                     <ActivityIndicator size="small" color={Colors.ink} />
                   ) : (
                     <Ionicons name="sparkles" size={16} color={Colors.ink} />
                   )}
                   <Text className="text-ink font-sans-bold text-xs">
                     {isSynthesizing ? 'Compiling from References...' : `Synthesize Guide for "${searchText}"`}
                   </Text>
                 </TouchableOpacity>
               ) : (
                 <TouchableOpacity
                   onPress={handleAskAI}
                   className="px-5 py-2.5 rounded-full flex-row items-center gap-2"
                   style={{ backgroundColor: specialty.color }}
                 >
                   <Ionicons name="chatbubbles" size={16} color={Colors.ink} />
                   <Text className="text-ink font-sans-bold text-xs">Ask Category Specialist AI</Text>
                 </TouchableOpacity>
               )}
            </View>
          ) : (
            <View className="flex flex-col gap-3">
              {filteredTopics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  onPress={() => handleTopicPress(topic.id)}
                  className="bg-teal-medium/40 border border-white/10 p-4 rounded-2xl flex-row items-center justify-between active:opacity-70"
                >
                  <View className="flex-1 mr-3">
                    <View 
                      className="self-start px-2 py-0.5 rounded border mb-1.5"
                      style={{ backgroundColor: `${specialty.color}20`, borderColor: `${specialty.color}40` }}
                    >
                      <Text 
                        className="text-[10px] font-sans-bold uppercase"
                        style={{ color: specialty.color }}
                      >
                        {topic.type}
                      </Text>
                    </View>
                    <Text className="text-white font-sans-bold text-base mb-1">{topic.title}</Text>
                    <Text className="text-gray-400 text-xs leading-4" numberOfLines={2}>{topic.subtitle}</Text>
                  </View>
                  <View className="w-9 h-9 rounded-full bg-white/5 items-center justify-center border border-white/10">
                    <Ionicons name="chevron-forward" size={18} color={specialty.color} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Ask AI Button */}
      <View className="absolute bottom-6 left-0 right-0 items-center px-6" pointerEvents="box-none">
        <TouchableOpacity 
          onPress={handleAskAI}
          className="flex-row items-center justify-center gap-2 py-3.5 px-6 rounded-full shadow-lg shadow-black/60"
          style={{ backgroundColor: specialty.color }}
        >
          <Ionicons name="chatbubbles" size={18} color={Colors.ink} />
          <Text className="text-ink text-sm font-sans-bold">Ask AI about {category.title}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
