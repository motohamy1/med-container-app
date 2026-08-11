import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import { SpecialtyData } from '../../../constants/SpecialtyData';
import { SPECIALTY_KNOWLEDGE } from '../../../constants/SpecialtyData';

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

  const handleSearchSubmit = () => {
    if (searchText.trim() && specialty) {
      router.push({
        pathname: `/specialty/${specialty.id}/general` as any,
        params: { query: searchText }
      });
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (specialty) {
      router.push({
        pathname: `/specialty/${specialty.id}/category/${categoryId}` as any,
      });
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

  // Fallback to local illustration
  const localSpec = SPECIALTY_KNOWLEDGE[specialty.id];
  const illustration = localSpec ? localSpec.illustration : null;

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
          {illustration && (
            <Image 
              source={illustration} 
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

          <View className="flex flex-row flex-wrap justify-between gap-y-4">
            {specialty.categories.map((category) => {
              // Determine styles based on category ID for high-contrast "Emergencies"
              const isEmergency = category.id === 'emergencies';
              const bgColor = isEmergency ? 'rgba(239, 68, 68, 0.15)' : 'rgba(45, 212, 191, 0.1)';
              const borderColor = isEmergency ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)';
              const iconColor = isEmergency ? '#ef4444' : specialty.color;

              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategoryPress(category.id)}
                  className="w-[48%] p-4 rounded-3xl items-start active:opacity-70 border"
                  style={{ backgroundColor: bgColor, borderColor: borderColor }}
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mb-4 border"
                    style={{ backgroundColor: `${iconColor}20`, borderColor: `${iconColor}40` }}
                  >
                    <Ionicons name={category.icon} size={24} color={iconColor} />
                  </View>
                  <Text className="text-white font-bold text-base mb-1 leading-5">
                    {category.title}
                  </Text>
                  <Text className="text-gray-400 text-[11px] leading-4">
                    {category.description}
                  </Text>
                  
                  {/* Topic Count Pill */}
                  <View className="mt-3 px-2 py-1 rounded-full bg-black/30 border border-white/5">
                     <Text className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">
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
