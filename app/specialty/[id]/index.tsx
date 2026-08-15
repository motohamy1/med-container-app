import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dbService } from '../../../services/dbService';
import { SpecialtyData, TopicItem, SPECIALTY_KNOWLEDGE } from '../../../constants/SpecialtyData';
import { Colors } from '../../../constants/Colors';

export default function SpecialtyDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchText, setSearchText] = useState('');
  
  const [specialty, setSpecialty] = useState<SpecialtyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await dbService.getSpecialty(id || 'heart');
      setSpecialty(data);
      setLoading(false);
    }
    loadData();
  }, [id]);

  // All topics flattened for instant search
  const allTopics = useMemo(() => {
    if (!specialty) return [];
    return specialty.categories.flatMap((c) => 
      (c.topics || []).map((t) => ({ ...t, categoryTitle: c.title, categoryId: c.id }))
    );
  }, [specialty]);

  // Filtered topics based on search text
  const filteredTopics = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    if (!q) return [];
    return allTopics.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.subtitle.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.categoryTitle.toLowerCase().includes(q)
    );
  }, [searchText, allTopics]);

  const handleSearchSubmit = () => {
    if (searchText.trim() && specialty) {
      if (filteredTopics.length > 0) {
        // Navigate to the first matching topic if exact or close
        router.push(`/specialty/${specialty.id}/${filteredTopics[0].id}` as any);
      } else {
        router.push({
          pathname: `/specialty/${specialty.id}/general` as any,
          params: { query: searchText }
        });
      }
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (specialty) {
      router.push({
        pathname: `/specialty/${specialty.id}/category/${categoryId}` as any,
      });
    }
  };

  const handleTopicPress = (topicId: string) => {
    if (specialty) {
      router.push(`/specialty/${specialty.id}/${topicId}` as any);
    }
  };

  if (loading || !specialty) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#6ec2be" />
      </SafeAreaView>
    );
  }

  const localSpec = SPECIALTY_KNOWLEDGE[specialty.id];
  const illustration = localSpec ? localSpec.illustration : null;
  const totalTopicsCount = allTopics.length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-white/5 bg-background z-20">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-white text-xl font-sans-bold">{specialty.scientificName}</Text>
          <Text className="text-turquoise text-xs font-sans-semibold uppercase tracking-wider">
            {specialty.name} Reference Hub
          </Text>
        </View>
        <View 
          className="w-10 h-10 rounded-full items-center justify-center border border-white/10"
          style={{ backgroundColor: `${specialty.color}20` }}
        >
          <Ionicons name={specialty.icon} size={20} color={specialty.color} />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Dynamic Hero */}
        <View className="w-full h-52 relative bg-teal-dark">
          {illustration && (
            <Image 
              source={illustration} 
              className="w-full h-full opacity-80" 
              resizeMode="cover" 
            />
          )}
          <View className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <View className="absolute bottom-4 left-6 right-6">
             <View className="flex-row items-center gap-2 mb-1">
               <View className="px-2.5 py-0.5 rounded-full bg-black/50 border border-white/10">
                 <Text className="text-[10px] text-turquoise font-sans-bold uppercase">
                   {totalTopicsCount} Reference Protocols
                 </Text>
               </View>
             </View>
             <Text className="text-white text-2xl font-black">{specialty.scientificName} Container</Text>
             <Text className="text-gray-300 text-xs leading-4 mt-0.5" numberOfLines={2}>{specialty.generalScope}</Text>
          </View>
        </View>

        {/* Live Search Bar */}
        <View className="bg-[#181a1d] rounded-2xl flex-row items-center px-4 py-3 border border-white/10 mx-5 mt-4">
            <Ionicons name="search" size={20} color={specialty.color} />
            <TextInput
              className="flex-1 text-white ml-3 font-sans-medium text-sm"
              placeholder={`Search ${specialty.name} conditions, dosing, guidelines...`}
              placeholderTextColor={Colors.grayMuted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} className="p-1 mr-1">
                <Ionicons name="close-circle" size={18} color={Colors.grayMuted} />
              </TouchableOpacity>
            )}
        </View>

        {/* Live Search Results View */}
        {searchText.trim().length > 0 ? (
          <View className="px-5 mt-4 pb-12">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-400 text-xs font-sans-bold uppercase tracking-wider">
                Search Results ({filteredTopics.length})
              </Text>
            </View>

            {filteredTopics.length > 0 ? (
              <View className="flex flex-col gap-2.5">
                {filteredTopics.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    onPress={() => handleTopicPress(topic.id)}
                    className="bg-teal-medium/40 border border-white/10 p-3.5 rounded-2xl flex-row items-center justify-between active:opacity-70"
                  >
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View 
                          className="px-2 py-0.5 rounded border"
                          style={{ backgroundColor: `${specialty.color}20`, borderColor: `${specialty.color}40` }}
                        >
                          <Text className="text-[9px] font-sans-bold uppercase" style={{ color: specialty.color }}>
                            {topic.type}
                          </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px]">{topic.categoryTitle}</Text>
                      </View>
                      <Text className="text-white font-sans-bold text-sm mb-0.5">{topic.title}</Text>
                      <Text className="text-gray-400 text-xs" numberOfLines={1}>{topic.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={specialty.color} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="p-6 rounded-2xl bg-teal-dark/30 border border-white/5 items-center">
                <Ionicons name="search" size={36} color={Colors.grayMuted} />
                <Text className="text-white font-sans-bold text-base mt-2 text-center">
                  No direct topic found for "{searchText}"
                </Text>
                <Text className="text-gray-400 text-xs text-center mt-1 mb-4 leading-4">
                  Synthesize a verified protocol from medical references or consult the specialty AI.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: `/specialty/${specialty.id}/general` as any,
                    params: { query: searchText }
                  })}
                  className="px-5 py-2.5 rounded-full flex-row items-center gap-2"
                  style={{ backgroundColor: specialty.color }}
                >
                  <Ionicons name="sparkles" size={16} color={Colors.ink} />
                  <Text className="text-ink font-sans-bold text-xs">Consult Reference AI</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* Standard Categories Grid */
          <View className="px-5 pb-12 mt-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-400 text-xs font-sans-bold uppercase tracking-wider">
                Specialized Categories
              </Text>
              <Text className="text-gray-500 text-xs font-sans-medium">
                {specialty.categories.length} sections
              </Text>
            </View>

            <View className="flex flex-row flex-wrap justify-between gap-y-3.5">
              {specialty.categories.map((category) => {
                const isEmergency = category.id === 'emergencies';
                const bgColor = isEmergency ? 'rgba(194, 122, 78, 0.12)' : 'rgba(110, 194, 190, 0.08)';
                const borderColor = isEmergency ? 'rgba(194, 122, 78, 0.4)' : 'rgba(255, 255, 255, 0.08)';
                const iconColor = isEmergency ? Colors.terracotta : specialty.color;

                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleCategoryPress(category.id)}
                    className="w-[48.5%] p-4 rounded-3xl items-start active:opacity-70 border"
                    style={{ backgroundColor: bgColor, borderColor: borderColor }}
                  >
                    <View 
                      className="w-11 h-11 rounded-full items-center justify-center mb-3 border"
                      style={{ backgroundColor: `${iconColor}20`, borderColor: `${iconColor}40` }}
                    >
                      <Ionicons name={category.icon} size={22} color={iconColor} />
                    </View>
                    <Text className="text-white font-sans-bold text-sm mb-1 leading-4" numberOfLines={2}>
                      {category.title}
                    </Text>
                    <Text className="text-gray-400 text-[11px] leading-4" numberOfLines={2}>
                      {category.description}
                    </Text>
                    
                    {/* Topic Count Pill */}
                    <View className="mt-3 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/5">
                       <Text className="text-[10px] text-gray-300 font-sans-bold">
                         {category.topics?.length || 0} topics
                       </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Ask General AI Button */}
            <TouchableOpacity 
              onPress={() => router.push(`/specialty/${specialty.id}/general` as any)}
              className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl mx-1 mt-6"
              style={{ backgroundColor: specialty.color }}
            >
              <Ionicons name="chatbubbles" size={18} color={Colors.ink} />
              <Text className="flex-1 text-ink text-sm font-sans-bold text-center leading-4" numberOfLines={2}>
                Consult {specialty.scientificName} Specialist AI
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
