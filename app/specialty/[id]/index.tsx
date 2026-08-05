import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPECIALTY_KNOWLEDGE } from '../../../constants/SpecialtyData';

export default function SpecialtyDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchText, setSearchText] = useState('');

  const specialty = SPECIALTY_KNOWLEDGE[id || 'heart'] || SPECIALTY_KNOWLEDGE['heart'];

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      router.push({
        pathname: `/specialty/${specialty.id}/general`,
        params: { query: searchText }
      });
    }
  };



  const handleTopicPress = (topicId: string) => {
    router.push({
      pathname: '/specialty/[id]/[topic]',
      params: { id: specialty.id, topic: topicId },
    });
  };

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
          <Text className="text-white text-xl font-bold">{specialty.scientificName}</Text>
          <Text className="text-turquoise text-xs font-semibold uppercase tracking-wider">
            {specialty.name} Specialty
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
        {/* Dynamic Illustration */}
        <View className="w-full h-56 relative bg-teal-dark">
          {specialty.illustration && (
            <Image 
              source={specialty.illustration} 
              className="w-full h-full opacity-80"
              resizeMode="cover"
            />
          )}
          <View className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          
          <View className="absolute bottom-4 left-6 right-6">
             <Text className="text-white text-2xl font-black mb-1">{specialty.scientificName} Hub</Text>
             <Text className="text-gray-300 text-sm">{specialty.generalScope}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-[#181a1d] rounded-2xl flex-row items-center px-4 py-3 border border-white/5 mx-4 mt-6">
            <Ionicons name="search" size={20} color="#a3a8af" />
            <TextInput
              className="flex-1 text-white ml-3 font-medium text-sm"
              placeholder={`Search ${specialty.id} topics...`}
              placeholderTextColor="#a3a8af"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
        </View>

        {/* Specialized Topics Database */}
        <View className="px-6 pb-12 mt-6">
          <Text className="text-gray-muted text-xs font-bold uppercase tracking-wider mb-1">
            Specialized Database
          </Text>
          <Text className="text-white text-lg font-bold mb-4">Clinical Topics & Protocols</Text>

          <View className="flex flex-col gap-3">
            {specialty.topics.map((topic) => (
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

          {/* Ask General AI Button */}
          <TouchableOpacity 
            onPress={() => router.push(`/specialty/${specialty.id}/general`)}
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl mx-4 mt-6 mb-8"
            style={{ backgroundColor: specialty.color }}
          >
            <Ionicons name="chatbubbles" size={20} color="#101214" />
            <Text className="text-[#101214] text-base font-bold">Ask General AI About {specialty.name}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
