import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import EventSource from 'react-native-event-source';
import { Colors } from '../../constants/Colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001';

type Proposal = {
  id: string;
  topic_name: string;
  content: any[];
  source: string;
  reference: string;
  trigger_query?: string;
  created_at: string;
};

export default function ReviewQueue() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [missionLog, setMissionLog] = useState<{ topic: string, count: number, category: string }[]>([]);

  const specialties = [
    { id: 'pulmonology', name: 'Pulmonology' },
    { id: 'neurology', name: 'Neurology' },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'dermatology', name: 'Dermatology' },
    { id: 'infectious', name: 'Infectious Disease' },
    { id: 'endocrinology', name: 'Endocrinology' },
    { id: 'nephrology', name: 'Nephrology' },
    { id: 'oncology', name: 'Oncology' },
    { id: 'rheumatology', name: 'Rheumatology' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'urology', name: 'Urology' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'gastroenterology', name: 'Gastroenterology' }
  ];

  const fetchQueue = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/queue`);
      const data = await res.json();
      setProposals(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    // Listen for Scientist Mission Progress (SSE)
    const eventSource = new EventSource(`${BACKEND_URL}/api/admin/scientist/mission-progress`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'processing') {
        setMissionLog(prev => [{ topic: data.topic, count: data.count, category: data.category }, ...prev].slice(0, 5));
      }
      if (data.status === 'started') {
        setIsExpanding(true);
        setMissionLog([]);
      }
      if (data.status === 'complete') {
        setIsExpanding(false);
        Alert.alert('Mission Complete', `Specialty expansion finished. ${data.total} topics added.`);
      }
    };

    return () => eventSource.close();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/approve/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        Alert.alert('Success', 'Knowledge approved and published live.');
        setProposals(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to approve update.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/reject/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        setProposals(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to reject update.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExpandSpecialty = async (id: string) => {
    setIsExpanding(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expand/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        Alert.alert('Mission Started', `The Scientist is now researching top 20 topics for ${id}. This may take a few minutes.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to trigger expansion.');
    } finally {
      setIsExpanding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center p-4 border-b border-white/10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-sans-bold text-white">Scientific Review</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchQueue(); }} tintColor="#fff" />
        }
      >
        <View className="p-4 gap-4">
          {/* Specialty Expansion Mission Control */}
          <View className="bg-teal-medium/30 rounded-2xl p-4 border border-turquoise/20 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="rocket-outline" size={20} color={Colors.accent} />
              <Text className="text-white font-sans-bold ml-2">Knowledge Expansion Mission</Text>
            </View>
            <Text className="text-[11px] text-gray-muted mb-4">
              Select a specialty to autonomously brainstorm and research the top 20 missing high-yield topics from global literature.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {specialties.map(spec => (
                <TouchableOpacity
                  key={spec.id}
                  onPress={() => handleExpandSpecialty(spec.id)}
                  disabled={isExpanding}
                  className="bg-turquoise/10 px-3 py-2 rounded-full border border-turquoise/30"
                >
                  <Text className="text-turquoise text-[11px] font-sans-bold">{spec.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {isExpanding && (
              <View className="mt-4 p-3 bg-background/50 rounded-xl border border-accent/20">
                <View className="flex-row items-center mb-2">
                  <ActivityIndicator size="small" color={Colors.accent} />
                  <Text className="text-[10px] text-accent ml-2 font-sans-bold uppercase">Scientist is hunting literature...</Text>
                </View>

                {missionLog.length > 0 && (
                  <View className="gap-1">
                    {missionLog.map((log, i) => (
                      <View key={i} className="flex-row justify-between items-center opacity-90">
                        <Text className="text-[10px] text-white flex-1" numberOfLines={1}>
                          #{log.count}: {log.topic}
                        </Text>
                        <Text className="text-[8px] text-turquoise uppercase font-sans-bold bg-turquoise/10 px-1 rounded ml-2">
                          {log.category}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          <View className="h-px bg-white/10 mb-2" />
          <Text className="text-xs font-sans-bold text-gray-muted uppercase tracking-widest ml-1">Pending Proposals</Text>

          {proposals.length === 0 ? (
            <View className="items-center py-20">
              <Ionicons name="checkmark-circle-outline" size={64} color={Colors.teal} />
              <Text className="text-gray-muted mt-4 font-sans-medium">Queue is empty. Scientist is idle.</Text>
            </View>
          ) : (
            proposals.map((proposal) => (
              <View key={proposal.id} className="bg-teal-medium rounded-2xl p-4 border border-white/5">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-lg font-sans-bold text-white">{proposal.topic_name}</Text>
                    <Text className="text-xs text-turquoise uppercase tracking-widest mt-1">Source: {proposal.source}</Text>
                  </View>
                  <View className="bg-turquoise/20 px-2 py-1 rounded-md">
                    <Text className="text-[10px] text-turquoise font-sans-bold">PENDING</Text>
                  </View>
                </View>

                {proposal.trigger_query && (
                  <View className="bg-background/50 p-2 rounded-lg mb-3">
                    <Text className="text-[10px] text-gray-muted uppercase font-sans-bold mb-1">Trigger Query</Text>
                    <Text className="text-xs text-white italic">"{proposal.trigger_query}"</Text>
                  </View>
                )}

                <View className="mb-4">
                  <Text className="text-[10px] text-gray-muted uppercase font-sans-bold mb-2">Clinical Content Snippet</Text>
                  {proposal.content && Array.isArray(proposal.content.clinical_content) ? (
                    proposal.content.clinical_content.slice(0, 2).map((section: any, idx: number) => (
                      <View key={idx} className="mb-2">
                        <Text className="text-xs font-sans-bold text-turquoise">{section.title}</Text>
                        <Text className="text-[11px] text-gray-300" numberOfLines={2}>{section.content}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-xs text-gray-300">Raw: {JSON.stringify(proposal.content).substring(0, 100)}...</Text>
                  )}
                </View>

                <View className="border-t border-white/5 pt-4 flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => handleApprove(proposal.id)}
                    disabled={!!processingId}
                    className="flex-1 bg-turquoise h-11 rounded-xl items-center justify-center flex-row shadow-lg"
                  >
                    {processingId === proposal.id ? (
                      <ActivityIndicator size="small" color={Colors.ink} />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={18} color={Colors.ink} />
                        <Text className="text-ink font-sans-bold ml-2">Approve & Publish</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleReject(proposal.id)}
                    disabled={!!processingId}
                    className="w-12 h-11 bg-terracotta/20 rounded-xl items-center justify-center border border-terracotta/30"
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.terracotta} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
