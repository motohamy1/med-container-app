import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { aiService, DoctorCategory, Citation } from "../../services/aiService";
import { dbService } from "../../services/dbService";
import { TopicItem, SpecialtyData } from "../../constants/SpecialtyData";
import { Colors } from "../../constants/Colors";
import FormattedClinicalText from "../../components/FormattedClinicalText";
import { getDailyPromptBatches, QuickPrompt } from "../../constants/ClinicalPresetsData";
import { KnowledgeMap } from "../../components/KnowledgeMap";

// Motion discipline (PRODUCT.md): state-changing feedback only, 150-250ms.
const EASE_HEAVY = Easing.bezier(0.32, 0.72, 0, 1);
const MOTION = { enter: 250, stagger: 60 } as const;

const TURQUOISE = Colors.accent;

// Types
type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  category?: DoctorCategory;
  citations?: Citation[];
  suggestions?: string[];
  isError?: boolean;
  failedQuery?: string;
};

// Medical section config for structured AI rendering — harmonized with 4 main colors
const SECTION_CONFIG: Record<
  string,
  { color: string; border: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  "EMERGENCY PROTOCOL & IMMEDIATE ACTION": {
    color: Colors.pink,
    border: "rgba(255, 195, 221, 0.45)",
    icon: "alert-circle-outline",
    label: "Emergency Protocol & Action",
  },
  "DIAGNOSTIC CRITERIA & SCORING": {
    color: Colors.teal,
    border: "rgba(109, 194, 189, 0.45)",
    icon: "checkbox-outline",
    label: "Diagnostic Criteria & Scoring",
  },
  "DIAGNOSTIC CRITERIA": {
    color: Colors.teal,
    border: "rgba(109, 194, 189, 0.45)",
    icon: "checkbox-outline",
    label: "Diagnostic Criteria",
  },
  "CLINICAL ASSESSMENT": {
    color: Colors.main,
    border: "rgba(222, 255, 249, 0.45)",
    icon: "clipboard-outline",
    label: "Clinical Assessment",
  },
  "DIFFERENTIAL DIAGNOSIS": {
    color: Colors.lavender,
    border: "rgba(219, 212, 253, 0.45)",
    icon: "git-branch-outline",
    label: "Differential Diagnosis",
  },
  "INVESTIGATIONS / WORKUP": {
    color: Colors.teal,
    border: "rgba(109, 194, 189, 0.45)",
    icon: "pulse-outline",
    label: "Investigations / Workup",
  },
  "INVESTIGATIONS": {
    color: Colors.teal,
    border: "rgba(109, 194, 189, 0.45)",
    icon: "flask-outline",
    label: "Investigations",
  },
  "MANAGEMENT PROTOCOL": {
    color: Colors.main,
    border: "rgba(222, 255, 249, 0.45)",
    icon: "medical-outline",
    label: "Management Protocol",
  },
  "MANAGEMENT & PHARMACOTHERAPY": {
    color: Colors.main,
    border: "rgba(222, 255, 249, 0.45)",
    icon: "medical-outline",
    label: "Management & Pharmacotherapy",
  },
  "FIRST-LINE PHARMACOTHERAPY": {
    color: Colors.main,
    border: "rgba(222, 255, 249, 0.45)",
    icon: "medical-outline",
    label: "First-Line Pharmacotherapy",
  },
  "PEDIATRIC SAFETY & CONTRAINDICATIONS": {
    color: Colors.pink,
    border: "rgba(255, 195, 221, 0.45)",
    icon: "warning-outline",
    label: "Pediatric Safety & Contraindications",
  },
  "RECOMMENDED REGIMEN & DOSING": {
    color: Colors.teal,
    border: "rgba(109, 194, 189, 0.45)",
    icon: "flask-outline",
    label: "Recommended Regimen & Dosing",
  },
  "SURGICAL / PROCEDURAL CONSIDERATIONS": {
    color: Colors.lavender,
    border: "rgba(219, 212, 253, 0.45)",
    icon: "cut-outline",
    label: "Surgical Considerations",
  },
  "CLINICAL PEARLS & PITFALLS": {
    color: Colors.lavender,
    border: "rgba(219, 212, 253, 0.45)",
    icon: "sparkles-outline",
    label: "Clinical Pearls & Pitfalls",
  },
  "RED FLAGS / EMERGENCY": {
    color: Colors.pink,
    border: "rgba(255, 195, 221, 0.45)",
    icon: "warning-outline",
    label: "Red Flags & Warnings",
  },
};

const FALLBACK_PALETTE = [
  { color: Colors.lavender, border: "rgba(219, 212, 253, 0.45)" },
  { color: Colors.teal, border: "rgba(109, 194, 189, 0.45)" },
  { color: Colors.pink, border: "rgba(255, 195, 221, 0.45)" },
  { color: Colors.main, border: "rgba(222, 255, 249, 0.45)" },
];

function parseMedicalSections(text: string): {
  hasSections: boolean;
  sections: { heading: string; content: string }[];
  plainText: string;
} {
  const parts = text.split(/##(.*?)##/);
  const sections: { heading: string; content: string }[] = [];
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

// Hook for reduced motion preference
const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    return () => sub.remove();
  }, []);
  return reducedMotion;
};

// Animated Thinking Wave
const ThinkingIndicator: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    if (reducedMotion) return;
    const wave = () =>
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: EASE_HEAVY }),
          withTiming(0.3, { duration: 400, easing: EASE_HEAVY }),
        ),
        -1,
        true,
      );

    dot1.value = wave();
    const t2 = setTimeout(() => (dot2.value = wave()), 150);
    const t3 = setTimeout(() => (dot3.value = wave()), 300);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dot1, dot2, dot3, reducedMotion]);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.duration(MOTION.enter).easing(EASE_HEAVY)}
      className="flex-row items-center gap-3 px-4 py-3 mb-4"
    >
      <View className="w-7 h-7 rounded-full bg-turquoise/15 items-center justify-center border border-turquoise/35">
        <Ionicons name="sparkles" size={13} color={TURQUOISE} />
      </View>
      <View className="flex-row items-center gap-1.5 bg-[#0c1017] border border-white/10 px-4 py-2.5 rounded-3xl rounded-tl-md">
        <Text className="text-gray-400 text-xs font-sans-medium mr-1">Consulting knowledge base</Text>
        <Animated.View className="w-1.5 h-1.5 rounded-full bg-turquoise" style={s1} />
        <Animated.View className="w-1.5 h-1.5 rounded-full bg-turquoise" style={s2} />
        <Animated.View className="w-1.5 h-1.5 rounded-full bg-turquoise" style={s3} />
      </View>
    </Animated.View>
  );
};

// Chat Bubble Component with Centered Response & Map Tab Support
const ChatBubble: React.FC<{
  message: Message;
  topicContext?: TopicItem | null;
  specialtyContext?: SpecialtyData | null;
  onCopy: (text: string) => void;
  onRetry?: (query: string) => void;
  onSelectSuggestion?: (query: string) => void;
}> = ({ message, topicContext, specialtyContext, onCopy, onRetry, onSelectSuggestion }) => {
  const reducedMotion = useReducedMotion();
  const isAi = !message.isUser;
  const [responseTab, setResponseTab] = useState<'response' | 'map'>('response');

  const { hasSections, sections, plainText } = useMemo(
    () => parseMedicalSections(message.text),
    [message.text]
  );

  const responseTopicItem = useMemo<TopicItem>(() => {
    if (topicContext) return topicContext;
    return {
      id: `chat-resp-${message.id}`,
      title: 'Clinical Inquiry',
      subtitle: 'Generated Knowledge Graph',
      type: 'AI Knowledge Graph',
      aiScopeDescription: '',
      clinicalContent: sections.map((s) => ({
        title: s.heading,
        content: s.content,
      })),
    };
  }, [topicContext, message.id, sections]);

  if (message.isError) {
    return (
      <View className="mb-6 px-4 w-full">
        <View className="flex-row items-center gap-2 mb-2">
          <View className="w-6 h-6 rounded-full bg-terracotta/20 items-center justify-center border border-terracotta/40">
            <Ionicons name="alert" size={12} color={Colors.terracotta} />
          </View>
          <Text className="text-terracotta text-xs font-sans-bold">System Notice</Text>
          <Text className="text-gray-500 text-[10px] font-mono ml-auto">{message.timestamp}</Text>
        </View>
        <View className="bg-[#0c1017] border border-terracotta/30 rounded-3xl rounded-tl-md p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="alert-circle-outline" size={16} color={Colors.terracotta} />
            <Text className="text-terracotta text-xs font-sans-bold uppercase tracking-wider">
              Consultation interrupted
            </Text>
          </View>
          <Text className="text-gray-200 text-sm leading-6 font-sans">
            The clinical service did not respond. Your question was not processed — check your
            connection and try again.
          </Text>
          {message.failedQuery && onRetry && (
            <TouchableOpacity
              onPress={() => onRetry(message.failedQuery!)}
              className="mt-3 self-start flex-row items-center gap-2 px-4 py-2.5 rounded-full bg-turquoise/15 border border-turquoise/30 active:opacity-70"
            >
              <Ionicons name="refresh" size={14} color={TURQUOISE} />
              <Text className="text-turquoise text-xs font-sans-bold">Retry inquiry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (isAi) {
    return (
      <Animated.View
        entering={reducedMotion ? undefined : FadeInUp.duration(MOTION.enter).easing(EASE_HEAVY)}
        className="mb-7 px-4 w-full"
      >
        {/* Centered Segmented Response | Map Switcher */}
        <View className="flex-row justify-center items-center mb-3">
          <View className="flex-row bg-[#151c1f] p-1 rounded-full border border-white/10 shadow-sm">
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setResponseTab('response');
              }}
              className={`px-4 py-1.5 rounded-full flex-row items-center gap-1.5 ${
                responseTab === 'response' ? 'bg-white/15' : ''
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name="document-text-outline"
                size={13}
                color={responseTab === 'response' ? TURQUOISE : '#8e8e93'}
              />
              <Text
                className={`text-xs font-sans-semibold ${
                  responseTab === 'response' ? 'text-white' : 'text-gray-400'
                }`}
              >
                Response
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setResponseTab('map');
              }}
              className={`px-4 py-1.5 rounded-full flex-row items-center gap-1.5 ${
                responseTab === 'map' ? 'bg-white/15' : ''
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name="git-network-outline"
                size={13}
                color={responseTab === 'map' ? TURQUOISE : '#8e8e93'}
              />
              <Text
                className={`text-xs font-sans-semibold ${
                  responseTab === 'map' ? 'text-white' : 'text-gray-400'
                }`}
              >
                Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content: Seamless Map Tab vs Response Tab */}
        {responseTab === 'map' ? (
          <View
            style={{
              height: 420,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#010101',
            }}
          >
            <KnowledgeMap
              topic={responseTopicItem}
              specialty={specialtyContext || undefined}
              themeColor={TURQUOISE}
              onAskAi={onSelectSuggestion}
            />
          </View>
        ) : (
          <>
            {/* AI Header */}
            <View className="flex-row items-center justify-between mb-2.5">
              <View className="flex-row items-center gap-2.5">
                <View className="w-7 h-7 rounded-full bg-turquoise/15 items-center justify-center border border-turquoise/35">
                  <Ionicons name="sparkles" size={13} color={TURQUOISE} />
                </View>
                <Text className="text-white text-xs font-sans-bold tracking-wide">Med Arena AI</Text>
                <View className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10">
                  <Text className="text-[10px] text-turquoise font-sans-semibold">Evidence-Based</Text>
                </View>
              </View>
              <Text className="text-gray-500 text-[10px] font-mono">{message.timestamp}</Text>
            </View>

            {/* Structured Medical Cards or Formatted Fallback */}
            {hasSections ? (
              <View className="gap-3">
                {plainText.length > 0 && (
                  <View className="bg-[#0c1017] border border-white/10 rounded-2xl p-4">
                    <FormattedClinicalText text={plainText} />
                  </View>
                )}
                {sections.map((sec, sIdx) => {
                  const upperHeading = sec.heading.toUpperCase().trim();
                  const matchedKey =
                    Object.keys(SECTION_CONFIG).find((key) =>
                      upperHeading.includes(key),
                    ) || upperHeading;
                  const cfg =
                    SECTION_CONFIG[matchedKey] ||
                    FALLBACK_PALETTE[sIdx % FALLBACK_PALETTE.length];
                  const sectionIcon = (cfg as any).icon || "information-circle-outline";
                  const sectionLabel = (cfg as any).label || sec.heading;
                  const sectionColor = cfg.color;
                  const sectionBorder = cfg.border;

                  return (
                    <View
                      key={`sec-${sIdx}`}
                      className="rounded-2xl overflow-hidden bg-[#0c1017]"
                      style={{
                        borderWidth: 1,
                        borderColor: sectionBorder,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.35,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <View
                        className="flex-row items-center gap-2 px-4 py-2.5 border-b"
                        style={{
                          backgroundColor: `${sectionColor}12`,
                          borderBottomColor: `${sectionColor}25`,
                        }}
                      >
                        <Ionicons name={sectionIcon} size={15} color={sectionColor} />
                        <Text
                          className="text-xs font-sans-bold uppercase tracking-wider flex-1"
                          style={{ color: sectionColor }}
                        >
                          {sectionLabel}
                        </Text>
                      </View>
                      <View className="p-4">
                        <FormattedClinicalText text={sec.content} />
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="bg-[#0c1017] border border-white/10 rounded-3xl rounded-tl-md p-4">
                <FormattedClinicalText text={message.text} />
              </View>
            )}

            {/* Citations section */}
            {message.citations && message.citations.length > 0 && (
              <View className="mt-3.5 pt-3 border-t border-white/5">
                <View className="flex-row items-center gap-1.5 mb-2 ml-1">
                  <Ionicons name="book-outline" size={13} color={Colors.lavender} />
                  <Text className="text-gray-400 text-[10.5px] font-sans-bold uppercase tracking-wider">
                    Guidelines & Evidence Grounding
                  </Text>
                </View>
                {message.citations.map((cit) => (
                  <View
                    key={cit.id}
                    className="bg-[#0c1017] border border-white/10 rounded-xl p-3 mb-2"
                  >
                    <View className="flex-row items-start gap-2">
                      <View className="px-2 py-0.5 rounded-full bg-lavender/20 mt-0.5">
                        <Text className="text-[10px] text-lavender font-sans-bold">[{cit.id}]</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-200 text-xs font-sans-semibold leading-4 mb-0.5">
                          {cit.title}
                        </Text>
                        <Text className="text-gray-400 text-[10px] font-sans-medium">
                          {cit.journal} ({cit.year}) · {cit.author}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Interactive Follow-Up Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <View className="mt-3.5 mb-1">
                <View className="flex-row items-center gap-1.5 mb-2 ml-1">
                  <Ionicons name="sparkles" size={12} color={TURQUOISE} />
                  <Text className="text-gray-400 text-[10.5px] font-sans-bold uppercase tracking-wider">
                    Related Clinical Inquiries
                  </Text>
                </View>
                <View className="gap-2">
                  {message.suggestions.map((sug, sIdx) => (
                    <TouchableOpacity
                      key={`tab-sug-${sIdx}`}
                      onPress={() => onSelectSuggestion?.(sug)}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#0c1214] border border-turquoise/30 active:opacity-60"
                    >
                      <Ionicons name="arrow-forward-circle" size={14} color={TURQUOISE} />
                      <Text className="text-gray-200 text-xs font-sans-medium leading-4 flex-1">
                        {sug}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Action Toolbar for AI message */}
            <View className="flex-row items-center gap-4 mt-2.5 pl-2">
              <TouchableOpacity
                onPress={() => onCopy(message.text)}
                className="flex-row items-center gap-1.5 active:opacity-60"
              >
                <Ionicons name="copy-outline" size={14} color={Colors.grayMuted} />
                <Text className="text-gray-400 text-xs font-sans-medium">Copy</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    );
  }

  // User Message
  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.duration(MOTION.enter).easing(EASE_HEAVY)}
      className="flex-row justify-end mb-5 px-4"
    >
      <View className="max-w-[85%] items-end">
        <View className="flex-row items-center gap-1.5 mb-1.5 pr-1">
          <Text className="text-gray-400 text-[10px] font-mono">{message.timestamp}</Text>
          <Text className="text-lavender text-xs font-sans-bold">Doctor</Text>
        </View>
        <View
          className="rounded-3xl rounded-tr-md overflow-hidden shadow-bubble"
          style={{ maxWidth: "85%" }}
        >
          <LinearGradient
            colors={[Colors.lavender, '#9d74e8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View className="px-4 py-3">
            <Text className="text-[#010101] text-sm font-sans-bold leading-5">
              {message.text}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const ChatTab = () => {
  const params = useLocalSearchParams<{
    query?: string;
    autoSend?: string;
    specialtyId?: string;
    topicId?: string;
    topicName?: string;
  }>();
  const insets = useSafeAreaInsets();
  const floatingBottom = insets.bottom > 0 ? insets.bottom : 10;
  const DOCK_BAR_HEIGHT = 72;
  
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'map'>('chat');
  const [contextSpecialty, setContextSpecialty] = useState<SpecialtyData | null>(null);
  const [contextTopic, setContextTopic] = useState<TopicItem | null>(null);

  // Load medical context if specialtyId and topicId are provided in route params
  useEffect(() => {
    async function loadContext() {
      if (params.specialtyId && params.topicId) {
        const spec = await dbService.getSpecialty(params.specialtyId);
        const topic = await dbService.getTopic(params.specialtyId, params.topicId);
        setContextSpecialty(spec);
        setContextTopic(topic);
      } else if (params.topicId) {
        const topic = await dbService.getTopic('heart', params.topicId);
        if (topic) {
          const spec = await dbService.getSpecialty('heart');
          setContextSpecialty(spec);
          setContextTopic(topic);
        }
      }
    }
    loadContext();
  }, [params.specialtyId, params.topicId]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [presetBatches] = useState<QuickPrompt[][]>(() => getDailyPromptBatches());
  const [batchIndex, setBatchIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const isHandlingAutoSend = useRef(false);
  const lastProcessedQuery = useRef<string | null>(null);

  // Preset rotation
  const currentPresets = presetBatches[batchIndex] || [];
  const handleShufflePresets = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBatchIndex((prev) => (prev + 1) % presetBatches.length);
  };

  const handleCopy = async (text: string) => {
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied", "Clinical response copied to clipboard.");
    } catch {
      Alert.alert("Copy", "Unable to copy text.");
    }
  };

  // Main send handler
  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isTyping) return;

    if (!queryText) setInputText("");
    setIsTyping(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);

    try {
      const { reply, citations, suggestions } = await aiService.sendMessageByText(
        textToSend,
        "general",
        params.specialtyId as any,
        params.topicId,
        undefined,
        currentHistory.map((m) => ({ text: m.text, isUser: m.isUser })),
      );

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
    } catch (err) {
      console.error(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "The clinical service did not respond.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
        failedQuery: textToSend,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle incoming query param
  useEffect(() => {
    if (params.query && params.query !== lastProcessedQuery.current) {
      lastProcessedQuery.current = params.query;
      setInputText(params.query);
      if (params.autoSend === "true" && !isHandlingAutoSend.current) {
        isHandlingAutoSend.current = true;
        handleSend(params.query);
      }
    }
  }, [params.query, params.autoSend]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header with Title & Context Switcher if Medical Context exists */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/5 bg-background">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-full bg-turquoise/15 items-center justify-center border border-turquoise/35">
            <Ionicons name="medical" size={16} color={TURQUOISE} />
          </View>
          <View>
            <Text className="text-white text-base font-sans-bold">
              {contextTopic ? contextTopic.title : "Clinical Hub"}
            </Text>
            <Text className="text-gray-400 text-xs font-sans-medium">
              {contextSpecialty ? contextSpecialty.scientificName : "Universal Evidence AI"}
            </Text>
          </View>
        </View>

        {contextTopic && (
          <View className="flex-row bg-[#121719] p-1 rounded-xl border border-white/10">
            <TouchableOpacity
              onPress={() => setActiveMode('chat')}
              className={`px-3 py-1 rounded-lg flex-row items-center gap-1.5 ${
                activeMode === 'chat' ? 'bg-turquoise/20 border border-turquoise/40' : ''
              }`}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={12}
                color={activeMode === 'chat' ? TURQUOISE : '#8e8e93'}
              />
              <Text
                className={`text-xs font-sans-semibold ${
                  activeMode === 'chat' ? 'text-turquoise' : 'text-gray-400'
                }`}
              >
                Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveMode('map')}
              className={`px-3 py-1 rounded-lg flex-row items-center gap-1.5 ${
                activeMode === 'map' ? 'bg-turquoise/20 border border-turquoise/40' : ''
              }`}
            >
              <Ionicons
                name="git-network-outline"
                size={12}
                color={activeMode === 'map' ? TURQUOISE : '#8e8e93'}
              />
              <Text
                className={`text-xs font-sans-semibold ${
                  activeMode === 'map' ? 'text-turquoise' : 'text-gray-400'
                }`}
              >
                Map
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Screen Body: Knowledge Map Mode vs Chat Stream Mode */}
      {activeMode === 'map' && contextTopic ? (
        <View className="flex-1 bg-[#010101]">
          <KnowledgeMap
            topic={contextTopic}
            specialty={contextSpecialty || undefined}
            themeColor={TURQUOISE}
            onAskAi={(question) => {
              setActiveMode('chat');
              handleSend(question);
            }}
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          style={{ flex: 1 }}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                topicContext={contextTopic}
                specialtyContext={contextSpecialty}
                onCopy={handleCopy}
                onRetry={handleSend}
                onSelectSuggestion={(sug) => handleSend(sug)}
              />
            )}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: isKeyboardVisible ? 20 : DOCK_BAR_HEIGHT + floatingBottom + 16,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center py-10 px-6">
                <View className="w-16 h-16 rounded-full bg-turquoise/10 items-center justify-center mb-4 border border-turquoise/25">
                  <Ionicons name="sparkles" size={28} color={TURQUOISE} />
                </View>
                <Text className="text-white text-lg font-sans-bold text-center mb-1">
                  Evidence-Based Clinical Assistant
                </Text>
                <Text className="text-gray-400 text-xs font-sans text-center leading-5 mb-6 px-4">
                  Query treatment algorithms, drug interactions, triage pathways, and explore interactive visual knowledge maps.
                </Text>

                {/* Quick Presets */}
                <View className="w-full gap-2">
                  <View className="flex-row items-center justify-between mb-1 px-1">
                    <Text className="text-gray-400 text-[11px] font-sans-bold uppercase tracking-wider">
                      Daily Clinical Inquiries
                    </Text>
                    <TouchableOpacity
                      onPress={handleShufflePresets}
                      className="flex-row items-center gap-1"
                    >
                      <Ionicons name="shuffle" size={12} color={TURQUOISE} />
                      <Text className="text-turquoise text-xs font-sans-medium">Refresh</Text>
                    </TouchableOpacity>
                  </View>
                  {currentPresets.map((preset, pIdx) => (
                    <TouchableOpacity
                      key={preset.id || pIdx}
                      onPress={() => handleSend(preset.prompt)}
                      className="bg-[#0c1017] border border-white/10 p-3.5 rounded-2xl flex-row items-center justify-between active:opacity-70"
                    >
                      <View className="flex-1 mr-2">
                        <Text className="text-white text-xs font-sans-semibold mb-0.5">
                          {preset.title}
                        </Text>
                        <Text className="text-gray-400 text-[11px] font-sans" numberOfLines={1}>
                          {preset.prompt}
                        </Text>
                      </View>
                      <Ionicons name="arrow-forward" size={14} color={TURQUOISE} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
            ListFooterComponent={isTyping ? <ThinkingIndicator /> : null}
          />

          {/* Input Dock */}
          <View
            style={{
              paddingBottom: isKeyboardVisible ? 8 : floatingBottom + 70,
            }}
            className="px-4 pt-2 bg-background border-t border-white/5"
          >
            <View className="flex-row items-center bg-[#0c1017] border border-white/10 rounded-full px-4 py-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about guidelines, dosages, criteria..."
                placeholderTextColor="#6b7280"
                className="flex-1 text-white text-sm font-sans"
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
                editable={!isTyping}
              />
              <TouchableOpacity
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                className="w-8 h-8 rounded-full items-center justify-center ml-2"
                style={{
                  backgroundColor: inputText.trim() && !isTyping ? TURQUOISE : "#1f2937",
                }}
              >
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={inputText.trim() && !isTyping ? "#010101" : "#4b5563"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default ChatTab;
