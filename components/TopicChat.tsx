import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Clipboard,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { aiService, Citation } from "../services/aiService";
import { SPECIALTY_KNOWLEDGE } from "../constants/SpecialtyData";
import { Colors } from "../constants/Colors";
import FormattedClinicalText from "./FormattedClinicalText";

const EASE_HEAVY = Easing.bezier(0.32, 0.72, 0, 1);

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  citations?: Citation[];
  suggestions?: string[];
  isError?: boolean;
  failedQuery?: string;
};

type MedicalSection = {
  heading: string;
  content: string;
};

function parseMedicalSections(text: string): {
  hasSections: boolean;
  sections: MedicalSection[];
  plainText: string;
} {
  const parts = text.split(/##(.*?)##/);
  const sections: MedicalSection[] = [];
  let plainText = parts[0]?.trim() || "";

  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i]?.trim();
    let content = parts[i + 1] || "";
    content = content.replace(/##END##/gi, "").trim();

    if (heading && heading !== "END" && heading !== "SUGGESTIONS") {
      sections.push({ heading, content });
    }
  }

  return {
    hasSections: sections.length > 0,
    sections,
    plainText,
  };
}

const SECTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "DEFINITION": "book-outline",
  "DEFINITION & OVERVIEW": "book-outline",
  "DEFINITION & CRITERIA": "book-outline",
  "DEFINITION & CLASSIFICATION": "book-outline",
  "CLINICAL ASSESSMENT": "clipboard-outline",
  "CLINICAL PICTURE": "eye-outline",
  "PRESENTATION": "eye-outline",
  "DIFFERENTIAL DIAGNOSIS": "git-branch-outline",
  "INVESTIGATIONS": "pulse-outline",
  "INVESTIGATIONS / WORKUP": "pulse-outline",
  "DIAGNOSTIC CRITERIA": "checkmark-done-circle-outline",
  "MANAGEMENT PROTOCOL": "medical-outline",
  "MANAGEMENT & PHARMACOTHERAPY": "medical-outline",
  "FIRST-LINE PHARMACOTHERAPY": "medical-outline",
  "PHARMACOTHERAPY & DOSING": "flask-outline",
  "STEP-UP PROTOCOL": "trending-up-outline",
  "CLINICAL PEARLS": "sparkles-outline",
  "CLINICAL PEARLS & PITFALLS": "sparkles-outline",
  "KEY POINTS": "bulb-outline",
  "RED FLAGS / EMERGENCY": "alert-circle-outline",
  "EMERGENCY PROTOCOL & RED FLAGS": "warning-outline",
  "SURGICAL / PROCEDURAL CONSIDERATIONS": "cut-outline",
  "GREETING": "chatbubble-ellipses-outline",
};

// Animated Thinking Wave
const ThinkingIndicator: React.FC<{ themeColor: string }> = ({ themeColor }) => {
  const dot1 = useSharedValue(0.25);
  const dot2 = useSharedValue(0.25);
  const dot3 = useSharedValue(0.25);

  useEffect(() => {
    const wave = () =>
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: EASE_HEAVY }),
          withTiming(0.25, { duration: 420, easing: EASE_HEAVY })
        ),
        -1,
        true
      );
    dot1.value = wave();
    const t2 = setTimeout(() => (dot2.value = wave()), 160);
    const t3 = setTimeout(() => (dot3.value = wave()), 320);
    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <Animated.View
      entering={FadeInDown.duration(200).easing(EASE_HEAVY)}
      className="flex-row items-center gap-3 px-4 py-2 mb-4"
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center border"
        style={{
          backgroundColor: `${themeColor}20`,
          borderColor: `${themeColor}40`,
        }}
      >
        <Ionicons name="sparkles" size={14} color={themeColor} />
      </View>
      <View className="flex-row items-center gap-1.5 bg-[#141b1d] border border-white/10 px-4 py-2.5 rounded-2xl rounded-tl-md">
        <Text className="text-gray-400 text-xs font-sans-medium mr-1">
          Synthesizing clinical guidelines
        </Text>
        <Animated.View style={[s1, { backgroundColor: themeColor }]} className="w-1.5 h-1.5 rounded-full" />
        <Animated.View style={[s2, { backgroundColor: themeColor }]} className="w-1.5 h-1.5 rounded-full" />
        <Animated.View style={[s3, { backgroundColor: themeColor }]} className="w-1.5 h-1.5 rounded-full" />
      </View>
    </Animated.View>
  );
};

export default function TopicChat({
  specialtyId,
  topicId,
  topicName,
  themeColor,
  initialQuery,
  categoryContext,
}: {
  specialtyId: string;
  topicId: string;
  topicName: string;
  themeColor: string;
  initialQuery?: string;
  categoryContext?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(initialQuery || "");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const specialty = SPECIALTY_KNOWLEDGE[specialtyId || "heart"] || SPECIALTY_KNOWLEDGE["heart"];
  const topicData = specialty.categories.flatMap((c) => c.topics).find((t) => t.id === topicId);

  // Suggested Starter Prompts tailored to this topic
  const starterPrompts = [
    `Treatment protocol for ${topicName}`,
    `Diagnostic criteria & workup for ${topicName}`,
    `First-line medications and dosing for ${topicName}`,
    `Emergency red flags & complications in ${topicName}`,
  ];

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    });
    return () => keyboardShowListener.remove();
  }, []);

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied", "Clinical response copied to clipboard.");
  };

  const handleTextSend = async (queryOverride?: string) => {
    const query = (queryOverride || inputText).trim();
    if (!query) return;
    if (!queryOverride) setInputText("");
    setIsTyping(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { reply, citations, suggestions } = await aiService.sendMessageByText(
        query,
        "general",
        specialtyId as any,
        topicId,
        categoryContext
      );

      // Check for Out-of-Scope flag from the AI
      if (reply.includes("##OUT_OF_SCOPE##")) {
        const cleanReply = reply.replace("##OUT_OF_SCOPE##", "").trim();
        Alert.alert(
          "Out of Topic Scope",
          `${cleanReply}\n\nWould you like to search in the general clinical hub?`,
          [
            { text: "Stay Here", style: "cancel" },
            {
              text: "Go to General Chat",
              onPress: () => {
                router.push({
                  pathname: "/(tabs)/ChatTab",
                  params: { query },
                });
              },
            },
          ]
        );
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: reply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          citations,
          suggestions,
        };
        setMessages((prev) => [...prev, aiMessage]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble with the clinical AI model right now. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
        failedQuery: query,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderAiMessage = (item: Message) => {
    const { hasSections, sections, plainText } = parseMedicalSections(item.text);

    return (
      <Animated.View
        entering={FadeInUp.duration(250).easing(EASE_HEAVY)}
        className="mb-6 px-4 w-full"
      >
        {/* Header Badge */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <View
              className="w-6 h-6 rounded-full items-center justify-center border"
              style={{
                backgroundColor: `${themeColor}20`,
                borderColor: `${themeColor}40`,
              }}
            >
              <Ionicons name="sparkles" size={12} color={themeColor} />
            </View>
            <Text className="text-white text-xs font-sans-bold">{topicName} AI</Text>
            <View className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10">
              <Text className="text-[10px] font-sans-semibold" style={{ color: themeColor }}>
                Scoped RAG
              </Text>
            </View>
          </View>
          <Text className="text-gray-500 text-[10px] font-mono">{item.timestamp}</Text>
        </View>

        {/* Sections or Plain Text */}
        {hasSections ? (
          <View className="space-y-3">
            {plainText.length > 0 && (
              <View className="bg-[#141b1d] border border-white/10 rounded-2xl p-4 mb-3">
                <FormattedClinicalText text={plainText} themeColor={themeColor} />
              </View>
            )}
            {sections.map((sec, sIdx) => {
              const upHeading = sec.heading.toUpperCase();
              const matchedIconKey = Object.keys(SECTION_ICONS).find(
                (k) => upHeading === k || upHeading.includes(k) || k.includes(upHeading)
              );
              const iconName = matchedIconKey ? SECTION_ICONS[matchedIconKey] : "document-text-outline";

              return (
                <View
                  key={`sec-${sIdx}`}
                  className="rounded-2xl border bg-[#0d1214] mb-3 overflow-hidden shadow-md"
                  style={{ borderColor: `${themeColor}35` }}
                >
                  {/* Section Title Bar */}
                  <View
                    className="flex-row items-center px-4 py-2.5 border-b"
                    style={{
                      backgroundColor: `${themeColor}12`,
                      borderBottomColor: `${themeColor}25`,
                    }}
                  >
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2"
                      style={{ backgroundColor: `${themeColor}25` }}
                    >
                      <Ionicons name={iconName} size={13} color={themeColor} />
                    </View>
                    <Text
                      className="text-xs font-sans-bold uppercase tracking-wider flex-1"
                      style={{ color: themeColor }}
                    >
                      {sec.heading}
                    </Text>
                  </View>

                  {/* Section Content */}
                  <View className="p-4">
                    <FormattedClinicalText text={sec.content} themeColor={themeColor} />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View
            className="bg-[#141b1d] border border-white/10 rounded-2xl p-4"
            style={{ borderColor: `${themeColor}35` }}
          >
            <FormattedClinicalText text={item.text} themeColor={themeColor} />
          </View>
        )}

        {/* Peer-Reviewed Literature References */}
        {item.citations && item.citations.length > 0 && (
          <View className="mt-3.5 mb-1">
            <View className="flex-row items-center gap-1.5 mb-2 ml-1">
              <Ionicons name="library-outline" size={12} color={themeColor} />
              <Text className="text-gray-400 text-[10.5px] font-sans-bold uppercase tracking-wider">
                Clinical Evidence & Guidelines
              </Text>
            </View>
            {item.citations.map((cit) => (
              <View
                key={cit.id}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 mb-2"
              >
                <View className="flex-row items-start gap-2">
                  <View
                    className="px-2 py-0.5 rounded-full mt-0.5"
                    style={{ backgroundColor: `${themeColor}20` }}
                  >
                    <Text className="text-[10px] font-sans-bold" style={{ color: themeColor }}>
                      [{cit.id}]
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-200 text-xs font-sans-semibold leading-4 mb-0.5">
                      {cit.title}
                    </Text>
                    <Text className="text-gray-400 text-[10px] font-sans-medium">
                      {cit.journal} ({cit.year})
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Interactive Follow-Up Questions (Suggestions) */}
        {item.suggestions && item.suggestions.length > 0 && (
          <View className="mt-3.5 mb-2">
            <View className="flex-row items-center gap-1.5 mb-2 ml-1">
              <Ionicons name="sparkles" size={12} color={themeColor} />
              <Text className="text-gray-400 text-[11px] font-sans-bold uppercase tracking-wider">
                Related Follow-Up Questions
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {item.suggestions.map((sug, sIdx) => (
                <TouchableOpacity
                  key={`sug-${sIdx}`}
                  onPress={() => handleTextSend(sug)}
                  disabled={isTyping}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#141c1e] border active:opacity-60"
                  style={{ borderColor: `${themeColor}40` }}
                >
                  <Ionicons name="arrow-forward-circle" size={14} color={themeColor} />
                  <Text className="text-gray-200 text-xs font-sans-medium leading-4 flex-shrink">
                    {sug}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Action Toolbar */}
        <View className="flex-row items-center gap-4 mt-2.5 pl-1">
          <TouchableOpacity
            onPress={() => handleCopyText(item.text)}
            className="flex-row items-center gap-1.5 active:opacity-60"
          >
            <Ionicons name="copy-outline" size={13} color={Colors.grayMuted} />
            <Text className="text-gray-400 text-xs font-sans-medium">Copy Response</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderUserMessage = (item: Message) => (
    <Animated.View
      entering={FadeInDown.duration(200).easing(EASE_HEAVY)}
      className="flex-row justify-end mb-5 px-4"
    >
      <View className="max-w-[85%] items-end">
        <View className="flex-row items-center gap-1.5 mb-1 pr-1">
          <Text className="text-gray-400 text-[10px] font-mono">{item.timestamp}</Text>
          <Text className="text-xs font-sans-bold" style={{ color: themeColor }}>
            Doctor
          </Text>
        </View>
        <View
          className="rounded-3xl rounded-tr-md overflow-hidden shadow-md px-4 py-3"
          style={{ backgroundColor: themeColor }}
        >
          <Text className="text-[#010101] text-sm font-sans-semibold leading-5">
            {item.text}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-[#010101]">
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 110, flexGrow: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (item.isUser ? renderUserMessage(item) : renderAiMessage(item))}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-6 mb-8 px-4">
            <View
              className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 items-center justify-center bg-white/[0.03]"
              style={{ borderColor: `${themeColor}50` }}
            >
              {specialty.illustration ? (
                <Image source={specialty.illustration} className="w-full h-full opacity-80" resizeMode="cover" />
              ) : (
                <Ionicons name="medical" size={36} color={themeColor} />
              )}
            </View>
            <Text className="text-white text-xl font-sans-bold text-center mb-1">{topicName}</Text>
            {topicData && (
              <Text className="text-gray-400 text-xs font-sans-medium text-center px-4 mb-4 leading-4">
                {topicData.subtitle}
              </Text>
            )}

            {/* Scoped Information Box */}
            <View
              className="bg-[#0e1416] rounded-2xl p-3.5 mx-2 border flex-row items-center mb-6"
              style={{ borderColor: `${themeColor}30` }}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={themeColor} style={{ marginRight: 10 }} />
              <Text className="text-gray-300 text-xs flex-1 leading-4 font-sans">
                Topic AI is strictly scoped to {topicName}. Ask for specific treatments, workups, dosages, or diagnostic criteria.
              </Text>
            </View>

            {/* Quick Starter Prompts */}
            <View className="w-full">
              <Text className="text-gray-400 text-[11px] font-sans-bold uppercase tracking-wider mb-2.5 px-1">
                Suggested Topics to Explore
              </Text>
              <View className="gap-2">
                {starterPrompts.map((promptText, idx) => (
                  <TouchableOpacity
                    key={`starter-${idx}`}
                    onPress={() => handleTextSend(promptText)}
                    activeOpacity={0.75}
                    className="flex-row items-center justify-between p-3 rounded-2xl bg-[#0e1416] border border-white/10 active:opacity-60"
                  >
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <Ionicons name="sparkles-outline" size={14} color={themeColor} />
                      <Text className="text-gray-200 text-xs font-sans-medium" numberOfLines={1}>
                        {promptText}
                      </Text>
                    </View>
                    <Ionicons name="arrow-up-circle" size={18} color={themeColor} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        }
        ListFooterComponent={isTyping ? <ThinkingIndicator themeColor={themeColor} /> : null}
      />

      {/* Input Composer Island */}
      <View className="px-4 py-3 bg-[#010101] border-t border-white/5">
        <View className="flex-row items-end bg-[#0e1416] border border-white/10 rounded-3xl px-4 py-2 min-h-[50px] shadow-lg">
          <TextInput
            className="flex-1 text-white text-sm max-h-24 pt-2 pb-2 font-sans"
            placeholder={`Ask a specific question about ${topicName}...`}
            placeholderTextColor={Colors.graySubtle}
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            onPress={() => handleTextSend()}
            disabled={!inputText.trim() || isTyping}
            className="w-9 h-9 rounded-full items-center justify-center mb-0.5 ml-2 active:opacity-70"
            style={{ backgroundColor: inputText.trim() ? themeColor : "#1e2629" }}
          >
            <Ionicons name="arrow-up" size={18} color={inputText.trim() ? "#010101" : Colors.grayMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
