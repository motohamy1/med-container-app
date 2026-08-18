import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { TopicSearchResult } from '../../constants/SpecialtyData';
import { dbService } from '../../services/dbService';

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
  'OB/GYN': '/specialty/gynacology',
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

type SearchState = {
  query: string;
  results: TopicSearchResult[];
  loading: boolean;
  searched: boolean;
};

const EMPTY_SEARCH: SearchState = { query: '', results: [], loading: false, searched: false };

// Group search results by specialty, then by category
type CategoryGroup = { categoryId: string; title: string; topics: TopicSearchResult[] };
type SpecialtyGroup = {
  specialtyId: string;
  name: string;
  scientificName: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  categories: CategoryGroup[];
  topicCount: number;
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
        <View className="flex-row items-center gap-1.5 mb-1">
          <Ionicons name="medical" size={15} color={Colors.accent} />
          <Text className="text-[13px] text-gray-muted font-sans-medium tracking-wide">{getGreeting()}</Text>
        </View>
        <Text className="text-[24px] font-sans-bold leading-tight text-white tracking-tight">Dr. Alex Doe</Text>
      </View>

      {/* Profile Avatar / Quick Access with Depth */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/profile')}
        className="w-11 h-11 rounded-full bg-teal-medium border border-white/10 items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="person" size={18} color={Colors.accent} />
      </TouchableOpacity>
    </View>
  );
};

// Search Bar Component
const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  loading,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) => {
  return (
    <View className="px-6 py-4">
      <View
        className="flex-row items-center h-14 bg-teal-dark rounded-2xl px-4 border border-white/10"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          elevation: 8,
        }}
      >
        <Ionicons name="search" size={20} color={Colors.accent} style={{ marginRight: 12 }} />
        <TextInput
          className="flex-1 text-white text-[15px] font-sans"
          placeholder="Search clinical conditions, workups..."
          placeholderTextColor={Colors.graySubtle}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 ? (
          loading ? (
            <ActivityIndicator size="small" color={Colors.accent} style={{ marginRight: 4 }} />
          ) : (
            <TouchableOpacity
              onPress={() => onChangeText('')}
              className="w-9 h-9 items-center justify-center -mr-1"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close-circle" size={18} color={Colors.grayMuted} />
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            onPress={onSubmit}
            className="w-10 h-10 items-center justify-center rounded-xl bg-turquoise/20 border border-turquoise/30 -mr-1"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="arrow-forward" size={18} color={Colors.accent} />
          </TouchableOpacity>
        )}
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
          style={{
            width: size,
            height: size,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 7,
          }}
        >
          <Ionicons name={category.icon} size={20} color={category.color} />
        </View>
        <Text className="text-[11px] font-sans-medium text-gray-200 mt-1.5 text-center leading-tight tracking-tight" numberOfLines={2}>
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
    { id: '6', name: 'OB/GYN', icon: 'woman', color: Colors.specialty.obgyn },
    { id: '7', name: 'Pulmonology', icon: 'fitness', color: Colors.specialty.pulmonology },
    { id: '8', name: 'More', icon: 'grid', color: Colors.specialty.more },
  ];

  return (
    <View className="px-6 py-4">
      <View
        className="mx-auto my-6 relative"
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

        {/* Center hub — elevated medical AI focal point */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/ChatTab')}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-turquoise rounded-full items-center justify-center border-4 border-background z-20 px-2 text-center"
          style={{
            width: CENTER_SIZE,
            height: CENTER_SIZE,
            shadowColor: Colors.accent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.55,
            shadowRadius: 20,
            elevation: 14,
          }}
        >
          <Ionicons name="medical" size={26} color={Colors.ink} />
          <Text className="text-[11px] font-sans-bold text-ink text-center mt-1">Medical Arena AI</Text>
          <Text className="text-[10px] text-ink/75 font-sans-semibold">Clinical Advisor</Text>
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
    { id: '2', topic: 'Sepsis Resuscitation Workup', category: 'Infectious Disease', timestamp: 'Yesterday' },
  ];

  return (
    <View className="px-6 pb-6 mt-2">
      {/* Visual separator between orbit navigation and recent consultations */}
      <View className="h-px bg-white/10 mb-5" />
      <View className="flex-row items-center gap-2 mb-3.5">
        <Ionicons name="time-outline" size={16} color={Colors.gold} />
        <Text className="text-[17px] font-sans-bold text-white tracking-tight">Recent Clinical Consultations</Text>
      </View>
      <View className="flex flex-col gap-2.5">
        {inquiries.map((inquiry) => (
          <TouchableOpacity
            key={inquiry.id}
            onPress={() => router.push('/(tabs)/ChatTab')}
            className="flex-row items-center gap-3.5 p-4 rounded-2xl bg-teal-medium border border-white/10 active:opacity-80"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 7,
            }}
          >
            <View
              className="w-11 h-11 rounded-xl bg-deep-teal border border-white/10 items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="pulse-outline" size={20} color={Colors.accent} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-sans-semibold text-white tracking-tight mb-0.5">{inquiry.topic}</Text>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-[12px] font-sans-medium text-turquoise">{inquiry.category}</Text>
                <Text className="text-[11px] text-gray-500">•</Text>
                <Text className="text-[12px] font-mono text-gray-muted">{inquiry.timestamp}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.grayMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Build grouped structure: specialty -> category -> topics
function groupResults(results: TopicSearchResult[]): SpecialtyGroup[] {
  const specMap = new Map<string, SpecialtyGroup>();

  for (const r of results) {
    let spec = specMap.get(r.specialtyId);
    if (!spec) {
      spec = {
        specialtyId: r.specialtyId,
        name: r.specialtyName,
        scientificName: r.specialtyScientificName,
        color: r.specialtyColor,
        icon: r.specialtyIcon,
        categories: [],
        topicCount: 0,
      };
      specMap.set(r.specialtyId, spec);
    }

    let cat = spec.categories.find((c) => c.categoryId === r.categoryId);
    if (!cat) {
      cat = { categoryId: r.categoryId, title: r.categoryTitle, topics: [] };
      spec.categories.push(cat);
    }
    cat.topics.push(r);
    spec.topicCount += 1;
  }

  return Array.from(specMap.values());
}

// A single search result row
const ResultRow = ({ item, onOpen }: { item: TopicSearchResult; onOpen: (r: TopicSearchResult) => void }) => {
  return (
    <TouchableOpacity
      onPress={() => onOpen(item)}
      className="flex-row items-center gap-3.5 p-3.5 rounded-2xl bg-teal-medium border border-white/10 active:opacity-75"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center border"
        style={{
          backgroundColor: `${item.specialtyColor}20`,
          borderColor: `${item.specialtyColor}40`,
          shadowColor: item.specialtyColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name={item.specialtyIcon} size={18} color={item.specialtyColor} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          {item.type ? (
            <View
              className="px-1.5 py-0.5 rounded border"
              style={{ backgroundColor: `${item.specialtyColor}20`, borderColor: `${item.specialtyColor}40` }}
            >
              <Text className="text-[9px] font-sans-bold uppercase" style={{ color: item.specialtyColor }}>
                {item.type}
              </Text>
            </View>
          ) : null}
          {item.categoryTitle ? (
            <Text className="text-gray-400 text-[10px] font-sans-medium">{item.categoryTitle}</Text>
          ) : null}
        </View>
        <Text className="text-[15px] font-sans-semibold text-white leading-tight tracking-tight" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-[12px] font-sans text-gray-muted mt-0.5" numberOfLines={1}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={item.specialtyColor} />
    </TouchableOpacity>
  );
};

// Search Results Component — grouped by specialty, then category
const SearchResults = ({
  results,
  loading,
  query,
  onOpen,
  onAskAi,
}: {
  results: TopicSearchResult[];
  loading: boolean;
  query: string;
  onOpen: (r: TopicSearchResult) => void;
  onAskAi: () => void;
}) => {
  const groups = useMemo(() => groupResults(results), [results]);

  if (loading) {
    return (
      <View className="px-6 py-10 items-center">
        <ActivityIndicator size="small" color={Colors.accent} />
        <Text className="text-gray-muted text-[13px] font-sans-medium mt-3">
          Searching clinical database...
        </Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View className="px-6 py-6">
        <Text className="text-[17px] font-sans-bold text-white mb-3">
          No matching topic found for &ldquo;{query}&rdquo;
        </Text>
        <View
          className="p-6 rounded-3xl bg-teal-medium border border-white/10 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View
            className="w-14 h-14 rounded-2xl bg-deep-teal border border-turquoise/30 items-center justify-center mb-3"
            style={{
              shadowColor: Colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="sparkles" size={26} color={Colors.accent} />
          </View>
          <Text className="text-white font-sans-bold text-[17px] text-center tracking-tight">
            Consult Medical Arena AI
          </Text>
          <Text className="text-gray-muted text-[13px] font-sans text-center mt-1.5 mb-5 leading-5 max-w-[280px]">
            No curated offline topic matched your query. Get instant evidence-based guidance directly from the AI Clinical Advisor.
          </Text>
          <TouchableOpacity
            onPress={onAskAi}
            className="px-6 py-3 rounded-full flex-row items-center gap-2 bg-turquoise active:opacity-90"
            style={{
              shadowColor: Colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Ionicons name="chatbubbles" size={17} color={Colors.ink} />
            <Text className="text-ink font-sans-bold text-[14px]">Consult AI Advisor</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="px-6 pb-6 mt-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-muted text-[12px] font-sans-bold uppercase tracking-wider">
          Search Results
        </Text>
        <Text className="text-gray-muted text-[12px] font-sans-medium">
          {results.length} {results.length === 1 ? 'topic' : 'topics'} • {groups.length} {groups.length === 1 ? 'specialty' : 'specialties'}
        </Text>
      </View>

      <View className="h-px bg-white/10 mb-4" />

      {groups.map((spec) => (
        <View key={spec.specialtyId} className="mb-5">
          {/* Specialty header */}
          <View className="flex-row items-center gap-2 mb-3">
            <View
              className="w-7 h-7 rounded-full items-center justify-center border"
              style={{ backgroundColor: `${spec.color}20`, borderColor: `${spec.color}40` }}
            >
              <Ionicons name={spec.icon} size={14} color={spec.color} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-[15px] font-sans-bold leading-tight">
                {spec.scientificName}
              </Text>
              <Text className="text-gray-muted text-[11px]">
                {spec.topicCount} {spec.topicCount === 1 ? 'topic' : 'topics'}
              </Text>
            </View>
          </View>

          {/* Category sub-groups */}
          {spec.categories.map((cat) => (
            <View key={cat.categoryId || cat.title} className="mb-3">
              {cat.title ? (
                <View className="flex-row items-center gap-1.5 mb-2 ml-0.5">
                  <View className="w-1 h-1 rounded-full" style={{ backgroundColor: spec.color }} />
                  <Text className="text-gray-muted text-[11px] font-sans-semibold uppercase tracking-wider">
                    {cat.title}
                  </Text>
                </View>
              ) : null}
              <View className="flex flex-col gap-2">
                {cat.topics.map((topic) => (
                  <ResultRow key={topic.id} item={topic} onOpen={onOpen} />
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default function Index() {
  const [search, setSearch] = useState<SearchState>(EMPTY_SEARCH);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const runSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearch(EMPTY_SEARCH);
      return;
    }
    const currentReqId = ++reqIdRef.current;
    setSearch((s) => ({ ...s, query, loading: true }));
    try {
      const results = await dbService.searchAllTopics(trimmed);
      // Only commit if this is still the latest request (avoid race conditions)
      if (currentReqId === reqIdRef.current) {
        setSearch({ query, results, loading: false, searched: true });
      }
    } catch {
      if (currentReqId === reqIdRef.current) {
        setSearch((s) => ({ ...s, loading: false, searched: true }));
      }
    }
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearch((s) => ({ ...s, query: text }));
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!text.trim()) {
      setSearch(EMPTY_SEARCH);
      return;
    }
    // Debounce network/local search for typing responsiveness
    debounceRef.current = setTimeout(() => {
      runSearch(text);
    }, 280);
  }, [runSearch]);

  useEffect(() => {
    const currentReqId = reqIdRef.current;
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      reqIdRef.current = currentReqId + 1;
    };
  }, []);

  const handleOpenTopic = useCallback((r: TopicSearchResult) => {
    router.push(`/specialty/${r.specialtyId}/${r.id}` as any);
  }, []);

  const handleAskAi = useCallback(() => {
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: { query: search.query },
    } as any);
  }, [search.query]);

  const handleSubmit = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(search.query);
  }, [runSearch, search.query]);

  const isSearching = search.query.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-40"
        stickyHeaderIndices={[1]}
        keyboardShouldPersistTaps="handled"
      >
        <Header />
        <View className="bg-background/95">
          <SearchBar
            value={search.query}
            onChangeText={handleSearchChange}
            onSubmit={handleSubmit}
            loading={search.loading}
          />
        </View>
        {isSearching ? (
          <SearchResults
            results={search.results}
            loading={search.loading}
            query={search.query.trim()}
            onOpen={handleOpenTopic}
            onAskAi={handleAskAi}
          />
        ) : (
          <>
            <OrbitNavigation />
            <RecentInquiries />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
