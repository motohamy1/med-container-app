import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { MEDICAL_UPDATES_DATA, MedicalUpdate } from '../constants/MedicalUpdatesData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 320);
const CARD_GAP = 14;

export const MedicalUpdatesCarousel: React.FC = () => {
  const [selectedUpdate, setSelectedUpdate] = useState<MedicalUpdate | null>(null);

  const handleConsultAI = (update: MedicalUpdate) => {
    setSelectedUpdate(null);
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: {
        query: update.promptQuery,
        autoSend: 'true',
      },
    } as any);
  };

  const renderCard = ({ item, index }: { item: MedicalUpdate; index: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
          setSelectedUpdate(item);
        }}
        style={[
          styles.card,
          {
            marginLeft: index === 0 ? 20 : 0,
            marginRight: index === MEDICAL_UPDATES_DATA.length - 1 ? 20 : CARD_GAP,
          },
        ]}
      >
        {/* Top Header Row */}
        <View className="flex-row items-center justify-between mb-3">
          <View
            className="px-2.5 py-1 rounded-lg border flex-row items-center gap-1.5"
            style={{
              backgroundColor: `${item.specialtyColor}18`,
              borderColor: `${item.specialtyColor}40`,
            }}
          >
            <Ionicons name={item.specialtyIcon as any} size={12} color={item.specialtyColor} />
            <Text
              className="text-[10px] font-sans-bold uppercase tracking-wider"
              style={{ color: item.specialtyColor }}
            >
              {item.specialtyName}
            </Text>
          </View>

          <View className="px-2 py-0.5 rounded-full bg-white/10">
            <Text className="text-[10px] font-sans-medium text-gray-300">
              {item.date}
            </Text>
          </View>
        </View>

        {/* Badge Banner */}
        <View className="flex-row items-center gap-1.5 mb-2">
          <View className="w-1.5 h-1.5 rounded-full bg-accent" />
          <Text className="text-[10.5px] font-mono font-bold text-accent">
            {item.badge}
          </Text>
        </View>

        {/* Title */}
        <Text
          className="text-[15px] font-sans-bold text-white tracking-tight leading-5 mb-2"
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Headline Summary */}
        <Text
          className="text-[12px] font-sans text-gray-300 leading-4.5 mb-3 flex-1"
          numberOfLines={3}
        >
          {item.headline}
        </Text>

        {/* Card Footer */}
        <View className="pt-2.5 border-t border-white/10 flex-row items-center justify-between">
          <Text
            className="text-[10px] font-mono text-gray-muted flex-1 mr-2"
            numberOfLines={1}
          >
            📄 {item.journalOrSource}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-[11px] font-sans-semibold text-turquoise">Read</Text>
            <Ionicons name="arrow-forward" size={12} color={Colors.accent} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="mb-8">
      {/* Section Header */}
      <View className="px-6 flex-row items-center justify-between mb-3.5">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-turquoise/15 border border-turquoise/30 items-center justify-center">
            <Ionicons name="newspaper-outline" size={16} color={Colors.accent} />
          </View>
          <View>
            <Text className="text-[17px] font-sans-bold text-white tracking-tight">
              Latest Medical Updates
            </Text>
            <Text className="text-[11px] font-sans-medium text-gray-muted">
              Clinical Trials • Guidelines • FDA Approvals
            </Text>
          </View>
        </View>

        <View className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
          <Text className="text-[10.5px] font-mono text-lime">
            {MEDICAL_UPDATES_DATA.length} New
          </Text>
        </View>
      </View>

      {/* Horizontal Album Carousel */}
      <FlatList
        data={MEDICAL_UPDATES_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selectedUpdate}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUpdate(null)}
      >
        <View className="flex-1 bg-black/85 justify-center items-center px-5">
          {selectedUpdate && (
            <View
              className="w-full max-w-md rounded-3xl bg-[#0c1017] border border-white/15 p-6 max-h-[85%]"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.6,
                shadowRadius: 24,
                elevation: 16,
              }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Tag */}
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className="px-2.5 py-1 rounded-lg border flex-row items-center gap-1.5"
                    style={{
                      backgroundColor: `${selectedUpdate.specialtyColor}20`,
                      borderColor: `${selectedUpdate.specialtyColor}40`,
                    }}
                  >
                    <Ionicons
                      name={selectedUpdate.specialtyIcon as any}
                      size={12}
                      color={selectedUpdate.specialtyColor}
                    />
                    <Text
                      className="text-[10.5px] font-sans-bold uppercase tracking-wider"
                      style={{ color: selectedUpdate.specialtyColor }}
                    >
                      {selectedUpdate.specialtyName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedUpdate(null)}
                    className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Evidence Badge */}
                <View className="mb-2">
                  <Text className="text-[11px] font-mono text-accent font-bold">
                    ⚡ {selectedUpdate.badge} • {selectedUpdate.date}
                  </Text>
                </View>

                {/* Title */}
                <Text className="text-[18px] font-sans-bold text-white leading-6 mb-3">
                  {selectedUpdate.title}
                </Text>

                {/* Headline Box */}
                <View className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 mb-4">
                  <Text className="text-[13px] font-sans text-gray-200 leading-5">
                    {selectedUpdate.headline}
                  </Text>
                </View>

                {/* Key Takeaways */}
                <Text className="text-[13px] font-sans-bold text-lime mb-2 tracking-wide uppercase">
                  Key Takeaways
                </Text>
                <View className="gap-2 mb-4">
                  {selectedUpdate.keyTakeaways.map((point, idx) => (
                    <View key={idx} className="flex-row items-start gap-2">
                      <View className="w-1.5 h-1.5 rounded-full bg-turquoise mt-1.5" />
                      <Text className="text-[12.5px] font-sans text-gray-300 flex-1 leading-4.5">
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Clinical Impact */}
                <View className="bg-white/[0.04] border border-white/10 rounded-xl p-3 mb-4">
                  <Text className="text-[11px] font-sans-bold text-gold uppercase mb-1">
                    Clinical Practice Impact
                  </Text>
                  <Text className="text-[12px] font-sans text-gray-300 leading-4.5">
                    {selectedUpdate.clinicalImpact}
                  </Text>
                </View>

                {/* Citation */}
                <Text className="text-[11px] font-mono text-gray-muted mb-5">
                  📚 Source: {selectedUpdate.journalOrSource}
                </Text>

                {/* Buttons */}
                <TouchableOpacity
                  onPress={() => handleConsultAI(selectedUpdate)}
                  className="w-full py-3.5 rounded-full bg-accent flex-row items-center justify-center gap-2 active:opacity-90 mb-2.5"
                  style={{
                    shadowColor: Colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Ionicons name="sparkles" size={16} color={Colors.ink} />
                  <Text className="text-ink font-sans-bold text-[14px]">
                    Consult AI for Deep Analysis
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedUpdate(null)}
                  className="w-full py-2 items-center justify-center"
                >
                  <Text className="text-gray-400 font-sans-medium text-[13px]">
                    Dismiss
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 4,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 200,
    backgroundColor: '#0c1017',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
});
