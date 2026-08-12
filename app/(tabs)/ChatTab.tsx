import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { aiService, DoctorCategory, Citation } from "../../services/aiService";
import { Colors } from "../../constants/Colors";

const FLOATING_TAB_BAR_HEIGHT = 70;

// Motion discipline (PRODUCT.md): state-changing feedback only, 150-250ms.
const EASE_HEAVY = Easing.bezier(0.32, 0.72, 0, 1);
const MOTION = { enter: 250, stagger: 60 } as const;

const TURQUOISE = Colors.accent;
const INK = Colors.ink;

// Types
type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  category?: DoctorCategory;
  citations?: Citation[];
  isError?: boolean;
  failedQuery?: string;
};

type QuickPrompt = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  prompt: string;
  color: string;
};

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    icon: "heart-circle-outline",
    title: "ACS Protocol",
    subtitle: "STEMI vs NSTEMI workup & catheterization timing",
    prompt: "Provide the acute coronary syndrome (ACS) STEMI vs NSTEMI initial emergency workup, diagnostic criteria, and management protocol.",
    color: Colors.specialty.cardiology,
  },
  {
    icon: "pulse-outline",
    title: "Sepsis Bundle",
    subtitle: "Surviving Sepsis Campaign 1-hour resuscitation",
    prompt: "Detail the Surviving Sepsis Campaign 1-hour resuscitation bundle, qSOFA scoring, and antibiotic timing.",
    color: Colors.specialty.neurology,
  },
  {
    icon: "alert-circle-outline",
    title: "Hypertensive Crisis",
    subtitle: "Urgency vs Emergency target BP reduction",
    prompt: "Explain the management of Hypertensive Urgency vs Emergency, including IV drug choices and target blood pressure reduction rates.",
    color: Colors.terracotta,
  },
  {
    icon: "analytics-outline",
    title: "Liver Scoring",
    subtitle: "Child-Pugh vs MELD-Na calculation & interpretation",
    prompt: "Compare Child-Pugh vs MELD-Na scoring systems for chronic liver failure and surgical mortality risk assessment.",
    color: Colors.specialty.dermatology,
  },
];

// Medical section config for structured AI rendering
const SECTION_CONFIG: Record<
  string,
  { color: string; border: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  "CLINICAL ASSESSMENT": {
    color: "#86b0d5",
    border: "#4b7395",
    icon: "clipboard-outline",
    label: "Clinical Assessment",
  },
  "DIFFERENTIAL DIAGNOSIS": {
    color: "#d099ab",
    border: "#905d6e",
    icon: "git-branch-outline",
    label: "Differential Diagnosis",
  },
  "INVESTIGATIONS / WORKUP": {
    color: "#7eb9a2",
    border: "#427c67",
    icon: "pulse-outline",
    label: "Investigations / Workup",
  },
  "INVESTIGATIONS": {
    color: "#7eb9a2",
    border: "#427c67",
    icon: "flask-outline",
    label: "Investigations",
  },
  "MANAGEMENT PROTOCOL": {
    color: "#ccab7f",
    border: "#8d6f44",
    icon: "medical-outline",
    label: "Management Protocol",
  },
  "SURGICAL / PROCEDURAL CONSIDERATIONS": {
    color: "#d2b689",
    border: "#8d6f44",
    icon: "cut-outline",
    label: "Surgical / Procedural",
  },
  "OVERVIEW": {
    color: "#a79ccc",
    border: "#6c618d",
    icon: "document-text-outline",
    label: "Overview",
  },
  "SCORING CRITERIA": {
    color: "#86b0d5",
    border: "#4b7395",
    icon: "list-outline",
    label: "Scoring Criteria",
  },
  "INTERPRETATION": {
    color: "#7eb9a2",
    border: "#427c67",
    icon: "analytics-outline",
    label: "Interpretation",
  },
  "DEFINITION": {
    color: "#a79ccc",
    border: "#6c618d",
    icon: "book-outline",
    label: "Definition",
  },
  "KEY POINTS": {
    color: "#86b0d5",
    border: "#4b7395",
    icon: "key-outline",
    label: "Key Points",
  },
  "PROFESSIONAL CLINICAL ADVICE": {
    color: "#6ec2be",
    border: "#2b807e",
    icon: "checkmark-circle-outline",
    label: "Clinical Advice",
  },
  "CLINICAL PICTURE": {
    color: "#86b0d5",
    border: "#4b7395",
    icon: "eye-outline",
    label: "Clinical Picture",
  },
  "UPDATED INFO / SCORES": {
    color: "#a79ccc",
    border: "#6c618d",
    icon: "trending-up-outline",
    label: "Updated Info / Scores",
  },
};

const FALLBACK_PALETTE = [
  { color: "#a79ccc", border: "#6c618d", icon: "information-circle-outline" as const },
  { color: "#86b0d5", border: "#4b7395", icon: "document-text-outline" as const },
  { color: "#7eb9a2", border: "#427c67", icon: "list-outline" as const },
  { color: "#ccab7f", border: "#8d6f44", icon: "alert-circle-outline" as const },
];

type MedicalSection = { heading: string; content: string };

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

    if (heading && heading !== "END") {
      sections.push({ heading, content });
    }
  }

  return {
    hasSections: sections.length > 0,
    sections,
    plainText,
  };
}

// Ambient radial glow field — fixed behind all content, never scrolls
const AmbientBackground: React.FC = () => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <View
      style={{
        position: "absolute",
        top: -140,
        left: -110,
        width: 360,
        height: 360,
        borderRadius: 180,
        backgroundColor: "rgba(110,194,190,0.09)",
      }}
    />
    <View
      style={{
        position: "absolute",
        top: 60,
        right: -160,
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: "rgba(134,176,213,0.06)",
      }}
    />
    <View
      style={{
        position: "absolute",
        bottom: 80,
        left: -130,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: "rgba(210,182,137,0.05)",
      }}
    />
  </View>
);

// Double-Bezel shell: outer tray + inner machined core
const BezelShell: React.FC<{
  children: React.ReactNode;
  outerClassName?: string;
  innerClassName?: string;
  innerStyle?: object;
  radius?: number;
}> = ({ children, outerClassName = "", innerClassName = "", innerStyle = {}, radius = 30 }) => (
  <View
    className={`bg-white/[0.04] border border-white/10 p-1.5 ${outerClassName}`}
    style={{ borderRadius: radius }}
  >
    <View
      className={`bg-teal-dark border border-white/[0.07] overflow-hidden ${innerClassName}`}
      style={[
        {
          borderRadius: radius - 6,
          shadowColor: "#000",
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        },
        innerStyle,
      ]}
    >
      {children}
    </View>
  </View>
);

// Reduced-motion preference (PRODUCT.md: respect system reduced-motion)
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

const MedicalSectionBox: React.FC<{
  section: MedicalSection;
  index: number;
}> = ({ section, index }) => {
  const reducedMotion = useReducedMotion();
  const upHeading = section.heading.toUpperCase();
  const matchedKey = Object.keys(SECTION_CONFIG).find(
    (key) =>
      upHeading === key || upHeading.includes(key) || key.includes(upHeading),
  );

  const known = matchedKey ? SECTION_CONFIG[matchedKey] : null;
  const fallback = FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
  const cfg = known
    ? known
    : {
        ...fallback,
        label:
          section.heading.charAt(0).toUpperCase() +
          section.heading.slice(1).toLowerCase(),
      };

  return (
    <Animated.View
      entering={
        reducedMotion
          ? undefined
          : FadeInUp.duration(MOTION.enter).delay(index * MOTION.stagger).easing(EASE_HEAVY)
      }
      style={{ width: "100%", marginBottom: 14 }}
    >
      <View
        style={{
          borderRadius: 24,
          borderWidth: 1,
          borderColor: cfg.border + "50",
          backgroundColor: "rgba(255,255,255,0.03)",
          padding: 5,
        }}
      >
        <View
          style={{
            borderRadius: 19,
            backgroundColor: "#191c20",
            overflow: "hidden",
            borderWidth: 1,
            borderColor: cfg.border + "28",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: cfg.border + "18",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: cfg.border + "45",
            }}
          >
            <View
              style={{
                backgroundColor: cfg.border + "2e",
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 11,
              }}
            >
              <Ionicons name={cfg.icon} size={15} color={cfg.color} />
            </View>
            <Text
              style={{
                color: cfg.color,
                fontFamily: "PlexSans_700Bold",
                fontSize: 12,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              {cfg.label}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 17, paddingVertical: 15 }}>
            <Text
              style={{
                color: Colors.textBody,
                fontSize: 14,
                lineHeight: 22,
                fontFamily: "PlexSans_400Regular",
              }}
            >
              {section.content}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Animated Pulse Dots for AI Thinking State
const ThinkingIndicator: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const dot1 = useSharedValue(0.25);
  const dot2 = useSharedValue(0.25);
  const dot3 = useSharedValue(0.25);

  useEffect(() => {
    if (reducedMotion) {
      dot1.value = 0.7;
      dot2.value = 0.7;
      dot3.value = 0.7;
      return;
    }
    const wave = () =>
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: EASE_HEAVY }),
          withTiming(0.25, { duration: 420, easing: EASE_HEAVY }),
        ),
        -1,
        true,
      );
    dot1.value = wave();
    const t2 = setTimeout(() => (dot2.value = wave()), 160);
    const t3 = setTimeout(() => (dot3.value = wave()), 320);
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
      <View className="w-8 h-8 rounded-full bg-turquoise/15 items-center justify-center border border-turquoise/30">
        <Ionicons name="sparkles" size={15} color={TURQUOISE} />
      </View>
      <View className="flex-row items-center gap-1.5 bg-teal-dark border border-white/10 px-4 py-3 rounded-3xl rounded-tl-md">
        <Text className="text-gray-400 text-xs font-sans-semibold mr-1">Consulting clinical guidelines</Text>
        <Animated.View style={s1} className="w-1.5 h-1.5 rounded-full bg-turquoise" />
        <Animated.View style={s2} className="w-1.5 h-1.5 rounded-full bg-turquoise" />
        <Animated.View style={s3} className="w-1.5 h-1.5 rounded-full bg-turquoise" />
      </View>
    </Animated.View>
  );
};

const ChatBubble: React.FC<{
  message: Message;
  onCopy: (text: string) => void;
  onRetry?: (query: string) => void;
}> = ({ message, onCopy, onRetry }) => {
  const reducedMotion = useReducedMotion();
  const isAi = !message.isUser;

  // Error bubble — a clinical tool must fail visibly, never silently
  if (message.isError) {
    return (
      <View className="mb-7 px-4 w-full">
        <View className="flex-row items-center gap-2.5 mb-2.5">
          <View className="w-7 h-7 rounded-full bg-turquoise/15 items-center justify-center border border-turquoise/35">
            <Ionicons name="sparkles" size={13} color={TURQUOISE} />
          </View>
          <Text className="text-white text-xs font-sans-bold tracking-wide">Med Arena AI</Text>
        </View>
        <View className="bg-teal-dark border border-terracotta/30 rounded-3xl rounded-tl-md p-4">
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
    const { hasSections, sections, plainText } = parseMedicalSections(
      message.text,
    );

    return (
      <Animated.View
        entering={reducedMotion ? undefined : FadeInUp.duration(MOTION.enter).easing(EASE_HEAVY)}
        className="mb-7 px-4 w-full"
      >
        {/* AI Avatar & Header */}
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-2.5">
            <View className="w-7 h-7 rounded-full bg-turquoise/15 items-center justify-center border border-turquoise/35">
              <Ionicons name="sparkles" size={13} color={TURQUOISE} />
            </View>
            <Text className="text-white text-xs font-sans-bold tracking-wide">Med Arena AI</Text>
            <View className="px-2.5 py-1 rounded-full bg-teal-medium border border-white/10">
              <Text className="text-[10px] text-turquoise font-sans-semibold tracking-widest uppercase">Clinical RAG</Text>
            </View>
          </View>
          <Text className="text-gray-500 text-[10px]">{message.timestamp}</Text>
        </View>

        {/* AI Message Content */}
        {hasSections ? (
          <View className="pl-1">
            {plainText.length > 0 && (
              <View className="bg-teal-dark border border-turquoise/20 rounded-3xl p-4 mb-3">
                <Text className="text-gray-200 text-sm leading-6 font-sans">{plainText}</Text>
              </View>
            )}
            {sections.map((section, i) => (
              <MedicalSectionBox key={`sec-${i}`} section={section} index={i} />
            ))}
          </View>
        ) : (
          <View className="bg-teal-dark border border-white/10 rounded-3xl rounded-tl-md p-4 shadow-card">
            <Text className="text-gray-200 text-sm leading-6 font-sans">
              {message.text}
            </Text>
          </View>
        )}

        {/* Citations Block */}
        {message.citations && message.citations.length > 0 && (
          <View className="mt-4 mb-2">
            <Text className="text-gray-400 text-[11px] font-sans-bold uppercase tracking-widest mb-2.5 ml-1">
              <Ionicons name="library-outline" size={12} /> Medical References
            </Text>
            {message.citations.map((cit) => (
              <View key={cit.id} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3.5 mb-2">
                <View className="flex-row items-start gap-2.5">
                  <View className="bg-turquoise/15 border border-turquoise/25 px-2 py-0.5 rounded-full mt-0.5">
                    <Text className="text-turquoise text-[10px] font-sans-bold">[{cit.id}]</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-200 text-xs font-sans-semibold leading-4 mb-1">{cit.title}</Text>
                    <Text className="text-gray-400 text-[10px] font-sans-medium">{cit.journal} ({cit.year})</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Toolbar for AI message */}
        <View className="flex-row items-center gap-4 mt-2.5 pl-2">
          <TouchableOpacity
            onPress={() => onCopy(message.text)}
            className="flex-row items-center gap-1.5 active:opacity-60"
          >
            <Ionicons name="copy-outline" size={14} color="#a3a8af" />
            <Text className="text-gray-400 text-xs font-sans-medium">Copy</Text>
          </TouchableOpacity>
        </View>
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
          <Text className="text-turquoise text-xs font-sans-bold">Doctor</Text>
        </View>
        <View
          className="rounded-3xl rounded-tr-md overflow-hidden shadow-bubble"
          style={{ maxWidth: "85%" }}
        >
          <LinearGradient
            colors={[Colors.accentBright, Colors.accentDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View className="px-4 py-3">
            <Text className="text-[#0c2321] text-sm font-sans-semibold leading-5">
              {message.text}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const ChatTab = () => {
  const params = useLocalSearchParams<{ query?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(params.query || "");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const reducedMotion = useReducedMotion();

  // Header collapses once a conversation starts (question sent or messages present)
  const chatActive = messages.length > 0 || isTyping;
  const headerCollapse = useSharedValue(0);

  useEffect(() => {
    headerCollapse.value = withTiming(chatActive ? 1 : 0, {
      duration: reducedMotion ? 0 : MOTION.enter,
      easing: EASE_HEAVY,
    });
  }, [chatActive, headerCollapse, reducedMotion]);

  const headerPadStyle = useAnimatedStyle(() => ({
    paddingVertical: interpolate(headerCollapse.value, [0, 1], [14, 10]),
  }));

  const markOuterStyle = useAnimatedStyle(() => ({
    width: interpolate(headerCollapse.value, [0, 1], [44, 34]),
    height: interpolate(headerCollapse.value, [0, 1], [44, 34]),
    borderRadius: interpolate(headerCollapse.value, [0, 1], [22, 17]),
  }));

  const markInnerStyle = useAnimatedStyle(() => ({
    width: interpolate(headerCollapse.value, [0, 1], [32, 25]),
    height: interpolate(headerCollapse.value, [0, 1], [32, 25]),
    borderRadius: interpolate(headerCollapse.value, [0, 1], [16, 12.5]),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(headerCollapse.value, [0, 1], [17, 15]),
  }));

  const subtitleWrapStyle = useAnimatedStyle(() => ({
    height: interpolate(headerCollapse.value, [0, 1], [20, 0]),
    opacity: interpolate(headerCollapse.value, [0, 0.6, 1], [1, 0.4, 0]),
  }));

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 200);
      },
    );
    return () => {
      keyboardShowListener.remove();
    };
  }, []);

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied", "Clinical response copied to clipboard.");
  };

  const handleTextSend = async (queryOverride?: string) => {
    const query = queryOverride || inputText.trim();
    if (!query) return;
    if (!queryOverride) setInputText("");
    setIsTyping(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { reply, citations } = await aiService.sendMessageByText(query, "general", "physicians");
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        category: "physicians",
        citations,
      };
      setMessages((prev) => [...prev, aiMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
        failedQuery: query,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = (failedQuery: string) => {
    // Remove the failed error bubble, then resend
    setMessages((prev) => prev.filter((m) => !(m.isError && m.failedQuery === failedQuery)));
    handleTextSend(failedQuery);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <View className="flex-1 bg-background">
      <AmbientBackground />

      {/* Floating Glass Island Header */}
      <SafeAreaView edges={["top"]}>
        <Animated.View
          entering={reducedMotion ? undefined : FadeInDown.duration(MOTION.enter).easing(EASE_HEAVY)}
          className="mx-4 mt-3"
        >
          <BezelShell radius={30}>
            <Animated.View style={[{ paddingHorizontal: 16 }, headerPadStyle]}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  {/* Brand mark — double ring */}
                  <Animated.View
                    style={[
                      {
                        borderRadius: 22,
                        borderWidth: 1,
                        borderColor: "rgba(110,194,190,0.3)",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(110,194,190,0.06)",
                      },
                      markOuterStyle,
                    ]}
                  >
                    <Animated.View
                      style={[
                        {
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(110,194,190,0.18)",
                        },
                        markInnerStyle,
                      ]}
                    >
                      <Ionicons name="medical" size={16} color={TURQUOISE} />
                    </Animated.View>
                  </Animated.View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Animated.Text
                        style={[
                          {
                            color: "#fff",
                            fontFamily: "PlexSans_700Bold",
                            letterSpacing: -0.3,
                          },
                          titleStyle,
                        ]}
                      >
                        Med Arena
                      </Animated.Text>
                      <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {/* Compact category chip removed */}
                    </View>
                    <Animated.View
                      style={[{ overflow: "hidden" }, subtitleWrapStyle]}
                    >
                      <Text className="text-gray-400 text-[11px] font-sans-medium mt-0.5">Clinical Decision Support</Text>
                    </Animated.View>
                  </View>
                </View>

                {messages.length > 0 && (
                  <TouchableOpacity
                    onPress={handleNewChat}
                    className="flex-row items-center rounded-full bg-white/[0.06] border border-white/10 pl-3 pr-1.5 py-1.5 active:opacity-70"
                  >
                    <Text className="text-turquoise text-xs font-sans-bold mr-2">New</Text>
                    <View className="w-6 h-6 rounded-full bg-turquoise/20 items-center justify-center">
                      <Ionicons name="add" size={14} color={TURQUOISE} />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </BezelShell>
        </Animated.View>
      </SafeAreaView>

      {/* Main Chat Body & Empty State */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {messages.length === 0 ? (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 36,
              paddingBottom: FLOATING_TAB_BAR_HEIGHT + 88,
            }}
            showsVerticalScrollIndicator={false}
            className="flex-1"
          >
            {/* Empty State Hero */}
            <Animated.View
              entering={reducedMotion ? undefined : FadeIn.duration(MOTION.enter).easing(EASE_HEAVY)}
              className="items-center mb-12"
            >
              {/* Double-ring hero emblem */}
              <View className="w-24 h-24 rounded-full border border-turquoise/25 items-center justify-center bg-turquoise/[0.05] mb-6">
                <View className="w-[72px] h-[72px] rounded-full items-center justify-center border border-turquoise/30" style={{ backgroundColor: "rgba(110,194,190,0.12)" }}>
                  <Ionicons name="sparkles" size={30} color={TURQUOISE} />
                </View>
              </View>

              {/* Eyebrow tag */}
              <View className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 mb-4">
                <Text className="text-[10px] uppercase tracking-[0.25em] font-sans-semibold text-turquoise">
                  Evidence-Based RAG
                </Text>
              </View>

              <Text className="text-white text-[28px] font-sans-bold text-center tracking-tight leading-9 mb-3">
                Clinical Consultant AI
              </Text>
              <Text className="text-gray-400 text-sm text-center max-w-[290px] leading-6 font-sans">
                High-yield evidence-based clinical reasoning, differential diagnosis & workup protocols.
              </Text>
            </Animated.View>

            {/* Bento: featured inquiry */}
            <Animated.View entering={reducedMotion ? undefined : FadeInUp.duration(MOTION.enter).delay(MOTION.stagger).easing(EASE_HEAVY)}>
              <TouchableOpacity
                onPress={() => handleTextSend(QUICK_PROMPTS[0].prompt)}
                activeOpacity={0.85}
                className="mb-3.5"
              >
                <View className="rounded-[30px] p-1.5 border border-gold/30" style={{ backgroundColor: "rgba(210,182,137,0.06)" }}>
                  <View className="rounded-3xl bg-teal-dark border border-white/[0.07] p-5">
                    <View className="flex-row items-center justify-between mb-4">
                      <View
                        className="w-12 h-12 rounded-2xl items-center justify-center border"
                        style={{ backgroundColor: QUICK_PROMPTS[0].color + "1f", borderColor: QUICK_PROMPTS[0].color + "35" }}
                      >
                        <Ionicons name={QUICK_PROMPTS[0].icon} size={22} color={QUICK_PROMPTS[0].color} />
                      </View>
                      <View className="px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 flex-row items-center gap-1">
                        <Ionicons name="star" size={9} color={Colors.gold} />
                        <Text className="text-[10px] uppercase tracking-[0.2em] font-sans-semibold text-gold">Featured</Text>
                      </View>
                    </View>
                    <Text className="text-white font-sans-bold text-[17px] mb-1.5">{QUICK_PROMPTS[0].title}</Text>
                    <Text className="text-gray-400 text-[13px] leading-5 mb-4 font-sans">{QUICK_PROMPTS[0].subtitle}</Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-turquoise text-xs font-sans-bold tracking-wide">Run inquiry</Text>
                      <View className="w-9 h-9 rounded-full bg-turquoise/15 border border-turquoise/30 items-center justify-center">
                        <Ionicons name="arrow-up" size={16} color={TURQUOISE} />
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Bento: stacked inquiries */}
            <View className="flex-col gap-3.5">
              {QUICK_PROMPTS.slice(1).map((item, idx) => (
                <Animated.View
                  key={idx}
                  entering={reducedMotion ? undefined : FadeInUp.duration(MOTION.enter).delay(MOTION.stagger * (2 + idx)).easing(EASE_HEAVY)}
                >
                  <TouchableOpacity
                    onPress={() => handleTextSend(item.prompt)}
                    activeOpacity={0.85}
                  >
                    <View className="rounded-[26px] p-1.5 bg-white/[0.04] border border-white/10">
                      <View className="rounded-[20px] bg-teal-dark border border-white/[0.06] px-4 py-3.5 flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1 mr-3">
                          <View
                            className="w-10 h-10 rounded-2xl items-center justify-center mr-3.5 border"
                            style={{ backgroundColor: item.color + "1f", borderColor: item.color + "30" }}
                          >
                            <Ionicons name={item.icon} size={19} color={item.color} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-white font-sans-bold text-sm mb-1">{item.title}</Text>
                            <Text className="text-gray-400 text-xs leading-4 font-sans" numberOfLines={1}>
                              {item.subtitle}
                            </Text>
                          </View>
                        </View>

                        {/* Button-in-button trailing icon */}
                        <View className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 items-center justify-center">
                          <Ionicons name="arrow-up" size={15} color={TURQUOISE} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatBubble message={item} onCopy={handleCopyText} onRetry={handleRetry} />}
            ListFooterComponent={isTyping ? <ThinkingIndicator /> : null}
            contentContainerStyle={{
              paddingTop: 24,
              paddingBottom: FLOATING_TAB_BAR_HEIGHT + 88,
              flexGrow: 1,
            }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}

        {/* Floating Composer Island */}
        <View
          className="absolute left-4 right-4"
          style={{ bottom: FLOATING_TAB_BAR_HEIGHT + 4 }}
        >
          <View
            className="flex-row items-center rounded-full px-3 py-4 border border-white/10"
            style={{ backgroundColor: Colors.islandBg }}
          >
            <TextInput
              className="flex-1 text-white text-base max-h-32 py-2 bg-transparent font-sans"
              placeholder="Ask clinical case, protocol, differential..."
              placeholderTextColor={Colors.graySubtle}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleTextSend()}
              returnKeyType="send"
              multiline
              textAlignVertical="center"
              style={{ minHeight: 36 }}
            />

            <TouchableOpacity
              onPress={() => handleTextSend()}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.8}
              className="ml-2"
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: inputText.trim() && !isTyping ? TURQUOISE : "rgba(255,255,255,0.06)",
              }}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color={Colors.grayMuted} />
              ) : (
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={inputText.trim() ? INK : Colors.graySubtle}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatTab;
