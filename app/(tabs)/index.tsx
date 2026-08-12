import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type DimensionValue
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORBIT_SIZE = Math.min(SCREEN_WIDTH * 0.78, 300);
const CENTER_SIZE = ORBIT_SIZE * 0.42;
const BUTTON_SIZE = ORBIT_SIZE * 0.19;

// Category routes mapping
const categoryRoutes: Record<string, string> = {
  'Cardiology': '/specialty/heart',
  'GIT': '/specialty/git',
  'Infectious Disease': '/specialty/fever',
  'Neurology': '/specialty/neuro',
  'Dermatology': '/specialty/skin',
  'Obstetrics/Gynecology': '/specialty/gynacology',
  'Pulmonology': '/specialty/lungs',
};

// Types
type RecentInquiry = {
  id: string;
  topic: string;
  category: string;
  timestamp: string;
};

type SpecialtyCategory = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

// Header Component
const Header = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View className="flex-row items-center justify-between px-6 pt-6 pb-2">
      <View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="medical" size={16} color={Colors.accent} />
          <Text className="text-[13px] text-gray-muted font-sans-medium">{getGreeting()}, Dr.</Text>
        </View>
        <Text className="text-[22px] font-sans-bold leading-tight text-white tracking-tight">Alex Doe</Text>
      </View>

      {/* Active Role Badge */}
      <View className="px-3 py-1.5 rounded-full bg-turquoise/20 border border-turquoise flex-row items-center gap-1.5">
        <View className="w-2 h-2 rounded-full bg-turquoise" />
        <Text className="text-turquoise text-[11px] font-sans-bold uppercase tracking-wider">Physician Mode</Text>
      </View>
    </View>
  );
};

// Search Bar Component
const SearchBar = () => {
  const [searchText, setSearchText] = useState('');

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      router.push({
        pathname: '/(tabs)/ChatTab',
      });
    }
  };

  return (
    <View className="px-6 py-4">
      <View className="flex-row items-center h-14 bg-teal-dark rounded-full px-4 border border-white/5">
        <Ionicons name="search" size={20} color={Colors.accent} style={{ marginRight: 12 }} />
        <TextInput
          className="flex-1 text-white text-base font-sans"
          placeholder="Search clinical conditions, workups..."
          placeholderTextColor={Colors.graySubtle}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={handleSearchSubmit}
          className="w-11 h-11 items-center justify-center rounded-full bg-turquoise/15 -mr-2"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="arrow-forward" size={18} color={Colors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Orbit Button Component
const OrbitButton = ({
  category,
  size,
  top,
  left,
}: {
  category: SpecialtyCategory;
  size: number;
  top: DimensionValue;
  left: DimensionValue;
}) => {
  const route = categoryRoutes[category.name];
  const handlePress = () => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <View
      className="absolute items-center justify-start"
      style={{ top, left, marginTop: -size / 2, width: 120, marginLeft: -60 }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={handlePress}
        className="items-center justify-center"
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      >
        <View
          className="bg-teal-medium border border-white/10 items-center justify-center rounded-full"
          style={{ width: size, height: size }}
        >
          <Ionicons name={category.icon} size={20} color={category.color} />
        </View>
        <Text className="text-[11px] font-sans-semibold text-gray-300 mt-1.5 text-center leading-tight" numberOfLines={2}>
          {category.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Orbit Navigation Component
const OrbitNavigation = () => {
  const categories: SpecialtyCategory[] = [
    { id: '1', name: 'Cardiology', icon: 'heart', color: Colors.specialty.cardiology },
    { id: '2', name: 'GIT', icon: 'restaurant', color: Colors.specialty.git },
    { id: '3', name: 'Infectious Disease', icon: 'thermometer', color: Colors.specialty.infectious },
    { id: '4', name: 'Neurology', icon: 'pulse', color: Colors.specialty.neurology },
    { id: '5', name: 'Dermatology', icon: 'body', color: Colors.specialty.dermatology },
    { id: '6', name: 'Obstetrics/Gynecology', icon: 'woman', color: Colors.specialty.obgyn },
    { id: '7', name: 'Pulmonology', icon: 'fitness', color: Colors.specialty.pulmonology },
    { id: '8', name: 'More', icon: 'grid', color: Colors.specialty.more },
  ];

  return (
    <View className="px-6 py-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[17px] font-sans-bold text-white">Physician Specialties</Text>
        <TouchableOpacity className="flex-row items-center gap-1" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text className="text-turquoise text-[13px] font-sans-semibold">Clinical Hub</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <View
        className="mx-auto mt-12 mb-6 relative"
        style={{ width: ORBIT_SIZE, height: ORBIT_SIZE }}
      >
        <View
          className="mx-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 border-dashed"
          style={{ width: ORBIT_SIZE * 0.68, height: ORBIT_SIZE * 0.68 }}
        />

        <View
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
          style={{ width: ORBIT_SIZE * 0.98, height: ORBIT_SIZE * 0.98 }}
        />

        {/* Center hub — the one glow on this screen */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/ChatTab')}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-turquoise shadow-glow-cyan rounded-full items-center justify-center border-4 border-background z-20 px-2 text-center"
          style={{ width: CENTER_SIZE, height: CENTER_SIZE }}
        >
          <Ionicons name="medical" size={26} color={Colors.ink} />
          <Text className="text-[11px] font-sans-bold text-black text-center mt-1">Medical Arena AI</Text>
          <Text className="text-[10px] text-black/70 font-sans-semibold">Clinical Advisor</Text>
        </TouchableOpacity>
        <OrbitButton category={categories[0]} size={BUTTON_SIZE} top="0%" left="50%" />
        <OrbitButton category={categories[1]} size={BUTTON_SIZE} top="14.6%" left="82%" />
        <OrbitButton category={categories[2]} size={BUTTON_SIZE} top="50%" left="95%" />
        <OrbitButton category={categories[3]} size={BUTTON_SIZE} top="85.4%" left="82%" />
        <OrbitButton category={categories[4]} size={BUTTON_SIZE} top="100%" left="50%" />
        <OrbitButton category={categories[5]} size={BUTTON_SIZE} top="85.4%" left="18%" />
        <OrbitButton category={categories[6]} size={BUTTON_SIZE} top="50%" left="5%" />
        <OrbitButton category={categories[7]} size={BUTTON_SIZE} top="14.6%" left="18%" />
      </View>
    </View>
  );
};

// Recent Inquiries Component
const RecentInquiries = () => {
  const inquiries: RecentInquiry[] = [
    { id: '1', topic: 'Acute Coronary Syndrome Protocol', category: 'Cardiology', timestamp: 'Today' },
    { id: '2', topic: 'Sepsis Resuscitation Workup', category: 'Emergency', timestamp: 'Yesterday' },
  ];

  return (
    <View className="px-6 pb-6">
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name="time-outline" size={15} color={Colors.gold} />
        <Text className="text-[17px] font-sans-bold text-white">Recent Clinical Consultations</Text>
      </View>
      <View className="flex flex-col gap-2">
        {inquiries.map((inquiry) => (
          <TouchableOpacity
            key={inquiry.id}
            onPress={() => router.push('/(tabs)/ChatTab')}
            className="flex-row items-center gap-3 p-3 rounded-2xl bg-teal-medium border border-white/5"
          >
            <View className="w-10 h-10 rounded-full bg-turquoise/10 items-center justify-center">
              <Ionicons name="pulse-outline" size={18} color={Colors.accent} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-sans-medium text-white">{inquiry.topic}</Text>
              <Text className="text-[13px] text-gray-muted">
                {inquiry.category} • {inquiry.timestamp}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grayMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-40"
        stickyHeaderIndices={[1]}
      >
        <Header />
        <View className="bg-background/95">
          <SearchBar />
        </View>
        <OrbitNavigation />
        <RecentInquiries />
      </ScrollView>
    </SafeAreaView>
  );
}
