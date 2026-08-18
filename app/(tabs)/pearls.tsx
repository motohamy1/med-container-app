import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ClinicalPearl, CLINICAL_PEARLS_POOL } from '../../constants/DailyPearlsData';
import { dbService } from '../../services/dbService';
import { ScrollStack } from '../../components/ScrollStack/ScrollStack';
import { MedicalUpdatesCarousel } from '../../components/MedicalUpdatesCarousel';

const STORAGE_DATE_KEY = '@med_arena_pearls_date';
const STORAGE_REGEN_KEY = '@med_arena_pearls_regen_count';
const STORAGE_OFFSET_KEY = '@med_arena_pearls_offset';
const STORAGE_BOOKMARKS_KEY = '@med_arena_saved_pearls_list';
const MAX_FREE_REGENS = 3;

export default function PearlsTab() {
  const [pearls, setPearls] = useState<ClinicalPearl[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [savedFilter, setSavedFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [regensRemaining, setRegensRemaining] = useState(MAX_FREE_REGENS);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;

  // Load daily pearls and saved bookmarks
  useEffect(() => {
    async function loadData() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const storedDate = await AsyncStorage.getItem(STORAGE_DATE_KEY);
        const storedRegen = await AsyncStorage.getItem(STORAGE_REGEN_KEY);
        const storedOffset = await AsyncStorage.getItem(STORAGE_OFFSET_KEY);
        const storedBookmarks = await AsyncStorage.getItem(STORAGE_BOOKMARKS_KEY);

        if (storedBookmarks) {
          try {
            setBookmarkedIds(JSON.parse(storedBookmarks));
          } catch {}
        }

        let currentOffset = 0;
        let remaining = MAX_FREE_REGENS;

        if (storedDate === todayStr) {
          remaining = storedRegen !== null ? parseInt(storedRegen, 10) : MAX_FREE_REGENS;
          currentOffset = storedOffset !== null ? parseInt(storedOffset, 10) : 0;
        } else {
          await AsyncStorage.setItem(STORAGE_DATE_KEY, todayStr);
          await AsyncStorage.setItem(STORAGE_REGEN_KEY, MAX_FREE_REGENS.toString());
          await AsyncStorage.setItem(STORAGE_OFFSET_KEY, '0');
        }

        setRegensRemaining(remaining);
        setOffset(currentOffset);

        const data = await dbService.getDailyClinicalPearls(currentOffset, 5);
        setPearls(data);
      } catch {
        const data = await dbService.getDailyClinicalPearls(0, 5);
        setPearls(data);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleBookmark = async (pearlId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const isBookmarked = bookmarkedIds.includes(pearlId);
    const updated = isBookmarked
      ? bookmarkedIds.filter((id) => id !== pearlId)
      : [...bookmarkedIds, pearlId];

    setBookmarkedIds(updated);
    await AsyncStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(updated));
  };

  const handleRegenerate = useCallback(async () => {
    if (regensRemaining <= 0) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      setShowUpgradeModal(true);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);
    const nextOffset = offset + 1;
    const nextRemaining = regensRemaining - 1;

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      await AsyncStorage.setItem(STORAGE_DATE_KEY, todayStr);
      await AsyncStorage.setItem(STORAGE_REGEN_KEY, nextRemaining.toString());
      await AsyncStorage.setItem(STORAGE_OFFSET_KEY, nextOffset.toString());

      setOffset(nextOffset);
      setRegensRemaining(nextRemaining);

      const newPearls = await dbService.getDailyClinicalPearls(nextOffset, 5);
      setPearls(newPearls);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [offset, regensRemaining, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleConsultAI = (pearl: ClinicalPearl) => {
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: {
        query: `Explain the clinical rationale, mechanism, and guideline evidence for: "${pearl.title}" (${pearl.citation}).`,
        autoSend: 'true',
      },
    } as any);
  };

  const savedPearlsList = CLINICAL_PEARLS_POOL.filter((p) => bookmarkedIds.includes(p.id));
  const filteredSavedPearls = savedFilter === 'All'
    ? savedPearlsList
    : savedPearlsList.filter((p) => p.specialtyName === savedFilter);

  const availableCategories = ['All', ...Array.from(new Set(savedPearlsList.map((p) => p.specialtyName)))];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView className="flex-1 bg-[#05070a]" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#05070a" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'android' ? 10 : 6,
          paddingBottom: 120,
        }}
      >
        {/* ========================================================================= */}
        {/* CLEAN, UNCLUTTERED HEADER WITH ADEQUATE BREATHING ROOM                    */}
        {/* ========================================================================= */}
        <View className="px-5 pt-2 pb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-[23px] font-sans-bold text-white tracking-tight">
              Pearls & Updates
            </Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <View className="w-2 h-2 rounded-full bg-lime" />
              <Text className="text-[11.5px] font-mono text-gray-400">
                {currentDateFormatted} • High-Yield Briefs
              </Text>
            </View>
          </View>

          {/* Minimalist Shuffle Action */}
          <TouchableOpacity
            onPress={handleRegenerate}
            activeOpacity={0.75}
            className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.06] border border-white/10"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons
                name="sync"
                size={13}
                color={regensRemaining > 0 ? Colors.lime : Colors.gold}
              />
            </Animated.View>
            <Text
              className="text-[11.5px] font-sans-semibold"
              style={{ color: regensRemaining > 0 ? Colors.lime : Colors.gold }}
            >
              {regensRemaining > 0 ? `Shuffle (${regensRemaining})` : 'Upgrade'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* SECTION 1: MAIN SECTION - SILKY HIGH-YIELD PEARL SWIPE DECK               */}
        {/* ========================================================================= */}
        <View className="px-5 mb-2">
          {loading ? (
            <View className="py-24 items-center justify-center">
              <ActivityIndicator size="small" color={Colors.accent} />
              <Text className="text-gray-400 text-[12px] font-sans-medium mt-3">
                Loading today's clinical pearls deck...
              </Text>
            </View>
          ) : (
            <ScrollStack>
              {pearls.map((item) => {
                const isBookmarked = bookmarkedIds.includes(item.id);
                return (
                  <View
                    key={item.id}
                    className="p-5 rounded-[28px] bg-[#0c1017] border border-white/[0.12]"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.6,
                      shadowRadius: 20,
                      elevation: 12,
                    }}
                  >
                    {/* Top Row: Specialty Pill + Threshold Badge + Bookmark */}
                    <View className="flex-row items-center justify-between mb-3 gap-2">
                      <View className="flex-row items-center gap-2 flex-1 min-w-0">
                        <View
                          className="px-2.5 py-1 rounded-full border flex-row items-center gap-1.5 flex-shrink-0"
                          style={{
                            backgroundColor: `${item.specialtyColor}15`,
                            borderColor: `${item.specialtyColor}40`,
                          }}
                        >
                          <Ionicons
                            name={item.specialtyIcon as any}
                            size={12}
                            color={item.specialtyColor}
                          />
                          <Text
                            className="text-[10.5px] font-sans-bold uppercase tracking-wider"
                            style={{ color: item.specialtyColor }}
                          >
                            {item.specialtyName}
                          </Text>
                        </View>

                        {item.badge ? (
                          <View className="px-2 py-0.5 rounded-full bg-lime/10 border border-lime/30 flex-1 min-w-0">
                            <Text
                              className="text-[10px] font-mono font-bold text-lime"
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {item.badge}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <TouchableOpacity
                        onPress={() => toggleBookmark(item.id)}
                        activeOpacity={0.7}
                        className="w-8 h-8 rounded-full bg-white/[0.08] items-center justify-center flex-shrink-0"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                          size={15}
                          color={isBookmarked ? Colors.gold : '#9ca3af'}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Pearl Title */}
                    <Text className="text-[18.5px] font-sans-bold text-white tracking-tight leading-[24px] mb-3">
                      {item.title}
                    </Text>

                    {/* SECTION 1: Core Clinical Rule & Evidence */}
                    <View className="mb-3">
                      <Text className="text-[13.5px] font-sans text-gray-200 leading-[21px]">
                        <Text className="font-sans-bold text-turquoise">💡 Core Rule: </Text>
                        {item.rule}
                      </Text>
                    </View>

                    {/* SECTION 2: Immediate Action Protocol (Clean Airy Glass) */}
                    <View className="bg-lime/[0.06] border border-lime/25 rounded-2xl p-3.5 mb-2.5">
                      <View className="flex-row items-center gap-1.5 mb-1">
                        <Ionicons name="flash" size={12} color={Colors.lime} />
                        <Text className="text-[10.5px] font-sans-bold text-lime uppercase tracking-wider">
                          Action Protocol
                        </Text>
                      </View>
                      <Text className="text-[12.5px] font-sans text-gray-200 leading-[19px]">
                        {item.action}
                      </Text>
                    </View>

                    {/* SECTION 3: Pitfall Warning (Soft Rose Glass) */}
                    {item.pitfall ? (
                      <View className="bg-pink/[0.08] border border-pink/30 rounded-2xl px-3 py-2 mb-3 flex-row items-center gap-2">
                        <Ionicons name="warning-outline" size={14} color={Colors.pink} />
                        <Text className="text-[11.5px] font-sans-medium text-pink flex-1 leading-[17px]">
                          {item.pitfall}
                        </Text>
                      </View>
                    ) : null}

                    {/* Footer: Citation + Consult AI Action */}
                    <View className="flex-row items-center justify-between pt-3 border-t border-white/[0.08] mt-1">
                      <Text
                        className="text-[10.5px] font-mono text-gray-400 flex-1 mr-2"
                        numberOfLines={1}
                      >
                        📚 {item.citation}
                      </Text>

                      <TouchableOpacity
                        onPress={() => handleConsultAI(item)}
                        activeOpacity={0.75}
                        className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-turquoise/15 border border-turquoise/35"
                      >
                        <Ionicons name="sparkles" size={12} color={Colors.accent} />
                        <Text className="text-turquoise text-[11.5px] font-sans-bold">
                          Consult AI
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollStack>
          )}
        </View>

        {/* Divider */}
        <View className="h-px bg-white/[0.08] mx-5 my-3.5" />

        {/* ========================================================================= */}
        {/* SECTION 2: MEDICAL UPDATES & BREAKTHROUGHS HORIZONTAL CAROUSEL            */}
        {/* ========================================================================= */}
        <MedicalUpdatesCarousel />

        {/* Divider */}
        <View className="h-px bg-white/[0.08] mx-5 my-3.5" />

        {/* ========================================================================= */}
        {/* SECTION 3: BOOKMARKS & SAVED CLINICAL DECKS                                */}
        {/* ========================================================================= */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3.5">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl bg-lavender/15 border border-lavender/30 items-center justify-center">
                <Ionicons name="bookmark" size={15} color={Colors.lavender} />
              </View>
              <View>
                <Text className="text-[16.5px] font-sans-bold text-white tracking-tight">
                  Saved Pearls Deck
                </Text>
                <Text className="text-[11px] font-sans-medium text-gray-400">
                  Personal High-Yield Study Collection
                </Text>
              </View>
            </View>

            <View className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
              <Text className="text-[10.5px] font-mono text-lavender font-semibold">
                {savedPearlsList.length} Saved
              </Text>
            </View>
          </View>

          {/* Filter Pills */}
          {savedPearlsList.length > 0 && availableCategories.length > 2 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              contentContainerStyle={{ gap: 8 }}
            >
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSavedFilter(cat)}
                  className={`px-3 py-1.5 rounded-full border ${
                    savedFilter === cat
                      ? 'bg-lavender/25 border-lavender'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-sans-semibold ${
                      savedFilter === cat ? 'text-lavender' : 'text-gray-400'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Bookmarked Cards List or Empty State */}
          {filteredSavedPearls.length === 0 ? (
            <View className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 items-center justify-center">
              <Ionicons name="bookmark-outline" size={26} color={Colors.grayMuted} />
              <Text className="text-white font-sans-bold text-[14px] mt-2 mb-1">
                {savedPearlsList.length === 0 ? 'No Saved Pearls Yet' : 'No Pearls in this category'}
              </Text>
              <Text className="text-gray-400 font-sans text-[12px] text-center max-w-[260px] leading-4.5">
                {savedPearlsList.length === 0
                  ? 'Tap the bookmark icon on any pearl card above to save it for rapid clinical review.'
                  : 'Select another filter or save more pearls from the daily deck.'}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredSavedPearls.map((savedItem) => (
                <View
                  key={savedItem.id}
                  className="p-4 rounded-2xl bg-[#0c1017] border border-white/10"
                >
                  <View className="flex-row items-center justify-between mb-2 gap-2">
                    <View
                      className="px-2.5 py-0.5 rounded-md border flex-shrink-0"
                      style={{
                        backgroundColor: `${savedItem.specialtyColor}15`,
                        borderColor: `${savedItem.specialtyColor}35`,
                      }}
                    >
                      <Text
                        className="text-[10px] font-sans-bold uppercase"
                        style={{ color: savedItem.specialtyColor }}
                      >
                        {savedItem.specialtyName}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleBookmark(savedItem.id)}
                      className="p-1 flex-shrink-0"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="bookmark" size={16} color={Colors.gold} />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-white font-sans-bold text-[14.5px] mb-1.5">
                    {savedItem.title}
                  </Text>

                  <Text className="text-gray-300 font-sans text-[12px] leading-4.5 mb-3">
                    {savedItem.rule}
                  </Text>

                  <View className="flex-row items-center justify-between pt-2 border-t border-white/5">
                    <Text className="text-[10px] font-mono text-gray-400" numberOfLines={1}>
                      {savedItem.citation}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleConsultAI(savedItem)}
                      className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-turquoise/15 border border-turquoise/30"
                    >
                      <Ionicons name="sparkles" size={10} color={Colors.accent} />
                      <Text className="text-turquoise text-[10.5px] font-sans-semibold">
                        Review AI
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Upgrade / Daily Limit Modal */}
      <Modal
        visible={showUpgradeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <View
            className="w-full max-w-sm rounded-3xl bg-[#0c1017] border border-gold/30 p-6"
            style={{
              shadowColor: Colors.gold,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <View className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/40 items-center justify-center mx-auto mb-4">
              <Ionicons name="star" size={28} color={Colors.gold} />
            </View>

            <Text className="text-white font-sans-bold text-[19px] text-center tracking-tight mb-1.5">
              Daily Shuffle Limit Reached
            </Text>

            <Text className="text-gray-400 font-sans text-[13px] text-center leading-5 mb-5">
              You've used all <Text className="text-white font-sans-semibold">3 free daily shuffles</Text>. Your free quota resets every midnight at 00:00.
            </Text>

            <View className="bg-white/[0.04] rounded-2xl p-3.5 border border-white/5 mb-5 gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Unlimited daily clinical shuffles
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Custom specialty-specific pearl filtering
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Unlimited saved bookmark study decks
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowUpgradeModal(false)}
              className="w-full py-3.5 rounded-full bg-gold items-center justify-center mb-2.5 active:opacity-90"
              style={{
                shadowColor: Colors.gold,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text className="text-ink font-sans-bold text-[14px]">
                Upgrade to Pro (Coming Soon)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowUpgradeModal(false)}
              className="w-full py-2.5 items-center justify-center"
            >
              <Text className="text-gray-400 font-sans-medium text-[13px]">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
