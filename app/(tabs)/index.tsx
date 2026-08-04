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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ORBIT_SIZE = Math.min(SCREEN_WIDTH * 0.85, 340);
const CENTER_SIZE = ORBIT_SIZE * 0.42;
const BUTTON_SIZE = ORBIT_SIZE * 0.18;

// Category routes mapping
const categoryRoutes: Record<string, string> = {
  'Heart': '/heart',
  'GIT': '/git',
  'Fever': '/fever',
  'Neuro': '/neuro',
  'Skin': '/skin',
  'Gynacology': '/gynacology',
  'Lungs': '/lungs',
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
          <Ionicons name="medical" size={16} color="#6ec2be" />
          <Text className="text-sm text-gray-muted font-medium">{getGreeting()}, Dr.</Text>
        </View>
        <Text className="text-2xl font-bold leading-tight text-white">Alex Doe</Text>
      </View>
      
      {/* Active Role Badge */}
      <View className="px-3 py-1.5 rounded-full bg-turquoise/20 border border-turquoise flex-row items-center gap-1.5">
        <View className="w-2 h-2 rounded-full bg-turquoise" />
        <Text className="text-turquoise text-xs font-bold uppercase tracking-wider">Physician Mode</Text>
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
      <View className="relative">
        <View className="absolute -inset-0.5 rounded-full blur-md opacity-75 bg-gradient-to-r from-turquoise/30 to-cyan/30" />
        <View className="relative flex-row items-center h-14 bg-teal-dark rounded-full px-4 border border-white/5 shadow-lg">
          <Ionicons name="search" size={20} color="#6ec2be" style={{ marginRight: 12 }} />
          <TextInput
            className="flex-1 text-white text-base font-medium"
            placeholder="Search clinical conditions, workups..."
            placeholderTextColor="#a3a8af"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearchSubmit} className="p-2 bg-turquoise/20 rounded-full">
            <Ionicons name="arrow-forward" size={18} color="#6ec2be" />
          </TouchableOpacity>
        </View>
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
    <TouchableOpacity
      onPress={handlePress}
      className="absolute bg-teal-medium border border-white/10 items-center justify-center shadow-lg rounded-full"
      style={{ width: size, height: size, top, left, marginTop: -size / 2, marginLeft: -size / 2 }}
    >
      <Ionicons name={category.icon} size={20} color={category.color} />
      <Text className="text-[9px] font-bold text-gray-300 mt-0.5">{category.name}</Text>
    </TouchableOpacity>
  );
};

// Orbit Navigation Component
const OrbitNavigation = () => {
  const categories: SpecialtyCategory[] = [
    { id: '1', name: 'Heart', icon: 'heart', color: '#d18c90' },
    { id: '2', name: 'GIT', icon: 'restaurant', color: '#d2b689' },
    { id: '3', name: 'Fever', icon: 'thermometer', color: '#6f9ccb' },
    { id: '4', name: 'Neuro', icon: 'nutrition', color: '#70b19a' },
    { id: '5', name: 'Skin', icon: 'body', color: '#8e86c0' },
    { id: '6', name: 'Gynacology', icon: 'woman', color: '#c08ebb' },
    { id: '7', name: 'Lungs', icon: 'leaf', color: '#6ec2be' },
    { id: '8', name: 'More', icon: 'grid', color: '#a3a8af' },
  ];

  return (
    <View className="px-6 py-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xl font-bold text-white">Physician Specialties</Text>
        <TouchableOpacity className="flex-row items-center gap-1">
          <Text className="text-turquoise text-sm font-semibold">Clinical Hub</Text>
          <Ionicons name="chevron-forward" size={16} color="#6ec2be" />
        </TouchableOpacity>
      </View>

      <View
        className="mx-auto mt-14 mb-8 relative"
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

        {/* Center hub */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/ChatTab')}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-turquoise shadow-glow-cyan rounded-full items-center justify-center border-4 border-background z-20 px-2 text-center"
          style={{ width: CENTER_SIZE, height: CENTER_SIZE }}
        >
          <Ionicons name="medical" size={26} color="#101214" />
          <Text className="text-xs font-bold text-black text-center mt-1">Medical Arena AI</Text>
          <Text className="text-[9px] text-black/70 font-semibold">Clinical Advisor</Text>
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
      <Text className="text-lg font-bold text-white mb-3">Recent Clinical Consultations</Text>
      <View className="flex flex-col gap-2">
        {inquiries.map((inquiry) => (
          <TouchableOpacity
            key={inquiry.id}
            onPress={() => router.push('/(tabs)/ChatTab')}
            className="flex-row items-center gap-3 p-3 rounded-2xl bg-teal-medium border border-white/5"
          >
            <View className="w-10 h-10 rounded-full bg-turquoise/10 items-center justify-center">
              <Ionicons name="pulse-outline" size={18} color="#6ec2be" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-white">{inquiry.topic}</Text>
              <Text className="text-xs text-gray-muted">
                {inquiry.category} • {inquiry.timestamp}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a3a8af" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const BackgroundEffects = () => (
  <View className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
    <View className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-turquoise/5 rounded-full blur-[100px]" />
    <View className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-cyan/5 rounded-full blur-[80px]" />
  </View>
);

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#101214" />
      <BackgroundEffects />

      <ScrollView
        className="flex-1 relative z-10"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-40"
        stickyHeaderIndices={[1]}
      >
        <Header />
        <View className="bg-background/95 backdrop-blur-sm">
          <SearchBar />
        </View>
        <OrbitNavigation />
        <RecentInquiries />
      </ScrollView>
    </SafeAreaView>
  );
}
