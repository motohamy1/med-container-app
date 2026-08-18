import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { ClinicalPearl } from '../constants/DailyPearlsData';
import { dbService } from '../services/dbService';
import { ScrollStack } from './ScrollStack/ScrollStack';

const STORAGE_DATE_KEY = '@med_arena_pearls_date';
const STORAGE_REGEN_KEY = '@med_arena_pearls_regen_count';
const STORAGE_OFFSET_KEY = '@med_arena_pearls_offset';
const MAX_FREE_REGENS = 3;

export const DailyClinicalPearls = () => {
  const [pearls, setPearls] = useState<ClinicalPearl[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [regensRemaining, setRegensRemaining] = useState(MAX_FREE_REGENS);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Rotation animation for the regenerate icon
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Initialize daily state from AsyncStorage
  useEffect(() => {
    async function initDailyState() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const storedDate = await AsyncStorage.getItem(STORAGE_DATE_KEY);
        const storedRegen = await AsyncStorage.getItem(STORAGE_REGEN_KEY);
        const storedOffset = await AsyncStorage.getItem(STORAGE_OFFSET_KEY);

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

    initDailyState();
  }, []);

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
      // Fallback
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

  return (
    <View className="px-6 pb-12 mt-4">
      {/* Subtle Visual Divider */}
      <View className="h-px bg-white/10 mb-5" />

      {/* Header Row */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 items-center justify-center">
            <Ionicons name="sparkles" size={16} color={Colors.gold} />
          </View>
          <View>
            <Text className="text-[17px] font-sans-bold text-white tracking-tight">
              Daily High-Yield Pearls
            </Text>
            <Text className="text-[11px] font-sans-medium text-gray-muted tracking-wide">
              Swipe Deck • Evidence & Pitfalls
            </Text>
          </View>
        </View>

        {/* Regenerate Action Button */}
        <TouchableOpacity
          onPress={handleRegenerate}
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-medium border border-white/10"
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
              color={regensRemaining > 0 ? Colors.accent : Colors.gold}
            />
          </Animated.View>
          <Text
            className="text-[11px] font-sans-semibold"
            style={{ color: regensRemaining > 0 ? Colors.accent : Colors.gold }}
          >
            {regensRemaining > 0 ? `Shuffle (${regensRemaining})` : 'Upgrade'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ScrollStack Deck */}
      {loading ? (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text className="text-gray-muted text-[12px] font-sans-medium mt-3">
            Loading today's clinical pearls deck...
          </Text>
        </View>
      ) : (
        <ScrollStack>
          {pearls.map((item) => (
            <View
              key={item.id}
              className="p-4 rounded-3xl bg-teal-medium border border-white/10"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 18,
                elevation: 10,
              }}
            >
              {/* Top Row: Specialty Badge + Key Threshold Badge */}
              <View className="flex-row items-center justify-between mb-2">
                <View
                  className="px-2.5 py-1 rounded-lg border flex-row items-center gap-1.5"
                  style={{
                    backgroundColor: `${item.specialtyColor}20`,
                    borderColor: `${item.specialtyColor}45`,
                  }}
                >
                  <Ionicons name={item.specialtyIcon as any} size={12} color={item.specialtyColor} />
                  <Text
                    className="text-[10.5px] font-sans-bold uppercase tracking-wider"
                    style={{ color: item.specialtyColor }}
                  >
                    {item.specialtyName}
                  </Text>
                </View>

                {item.badge ? (
                  <View className="px-2.5 py-1 rounded-full bg-deep-teal border border-white/10 max-w-[150px] flex-shrink">
                    <Text className="text-[10.5px] font-mono text-lime" numberOfLines={1}>
                      {item.badge}
                    </Text>
                  </View>
                ) : (
                  <View className="px-2.5 py-1 rounded-full bg-deep-teal border border-white/10">
                    <Text className="text-[10.5px] font-sans-medium text-lavender">
                      {item.category}
                    </Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text className="text-[16.5px] font-sans-bold text-white tracking-tight leading-5 mb-2.5">
                {item.title}
              </Text>

              {/* SECTION 1: 💡 Core Rule & Mechanism (Jewel Teal #6dc2bd) */}
              <View className="bg-deep-teal/95 border border-white/5 border-l-2 border-l-turquoise rounded-xl p-2.5 mb-2">
                <Text className="text-[12.5px] font-sans text-gray-200 leading-5">
                  <Text className="font-sans-bold text-turquoise">💡 Core Rule: </Text>
                  {item.rule}
                </Text>
              </View>

              {/* SECTION 2: ⚡ Immediate Action & Dosing (Electric Lime #c4f230) */}
              <View className="bg-white/[0.03] border border-white/[0.07] border-l-2 border-l-lime rounded-xl p-2.5 mb-2">
                <Text className="text-[12px] font-sans text-gray-200 leading-4.5">
                  <Text className="font-sans-bold text-lime">⚡ Action: </Text>
                  {item.action}
                </Text>
              </View>

              {/* SECTION 3: ⚠️ Danger Pitfall (Pastel Rose Pink #ffc3dd) */}
              {item.pitfall ? (
                <View className="bg-pink/10 border border-pink/30 rounded-xl px-2.5 py-1.5 mb-2.5 flex-row items-center gap-1.5">
                  <Ionicons name="warning-outline" size={13} color={Colors.pink} />
                  <Text className="text-[11.5px] font-sans-medium text-pink flex-1 leading-4">
                    {item.pitfall}
                  </Text>
                </View>
              ) : null}

              {/* Footer Row: Reference + Consult AI Button */}
              <View className="flex-row items-center justify-between pt-2 border-t border-white/5">
                <Text className="text-[10.5px] font-mono text-gray-muted flex-1 mr-2" numberOfLines={1}>
                  📚 {item.citation}
                </Text>

                <TouchableOpacity
                  onPress={() => handleConsultAI(item)}
                  activeOpacity={0.75}
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-turquoise/15 border border-turquoise/35"
                >
                  <Ionicons name="sparkles" size={12} color={Colors.accent} />
                  <Text className="text-turquoise text-[11px] font-sans-bold">
                    Consult AI
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollStack>
      )}

      {/* Upgrade / Daily Limit Modal */}
      <Modal
        visible={showUpgradeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <View
            className="w-full max-w-sm rounded-3xl bg-teal-dark border border-gold/30 p-6"
            style={{
              shadowColor: Colors.gold,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            {/* Modal Icon Badge */}
            <View className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/40 items-center justify-center mx-auto mb-4">
              <Ionicons name="star" size={28} color={Colors.gold} />
            </View>

            <Text className="text-white font-sans-bold text-[19px] text-center tracking-tight mb-1.5">
              Daily Shuffle Limit Reached
            </Text>

            <Text className="text-gray-muted font-sans text-[13px] text-center leading-5 mb-5">
              You've used all <Text className="text-white font-sans-semibold">3 free daily shuffles</Text>. Your free quota resets every midnight at 00:00.
            </Text>

            {/* Pro Feature Highlights */}
            <View className="bg-deep-teal rounded-2xl p-3.5 border border-white/5 mb-5 gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Unlimited daily clinical shuffles
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Filter pearls by your specific sub-specialty
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Save & bookmark pearls to custom study decks
                </Text>
              </View>
            </View>

            {/* Modal Buttons */}
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
    </View>
  );
};
