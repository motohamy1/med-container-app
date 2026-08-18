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
  prompt: string;
  color: string;
};

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    icon: "heart-pulse-outline",
    title: "ACS Protocol & Cath",
    prompt: "Provide the acute coronary syndrome (ACS) STEMI vs NSTEMI initial emergency workup, diagnostic criteria, and management protocol.",
    color: Colors.pink,
  },
  {
    icon: "flash-outline",
    title: "Sepsis 1-Hr Bundle",
    prompt: "Detail the Surviving Sepsis Campaign 1-hour resuscitation bundle, qSOFA scoring, and antibiotic timing.",
    color: Colors.lime,
  },
  {
    icon: "speedometer-outline",
    title: "Hypertensive Crisis",
    prompt: "Explain the management of Hypertensive Urgency vs Emergency, including IV drug choices and target blood pressure reduction rates.",
    color: Colors.accent,
  },
  {
    icon: "analytics-outline",
    title: "Child-Pugh vs MELD",
    prompt: "Compare Child-Pugh vs MELD-Na scoring systems for chronic liver failure and surgical mortality risk assessment.",
    color: Colors.lavender,
  },
  {
    icon: "git-network-outline",
    title: "Acute Stroke Triage",
    prompt: "Outline the acute ischemic stroke thrombolysis (tPA/TNK) eligibility criteria, BP targets, and thrombectomy window.",
    color: Colors.lime,
  },
  {
    icon: "fitness-outline",
    title: "ARDS Lung Protection",
    prompt: "Detail the ARDS low tidal volume ventilation strategy (6 mL/kg PBW), plateau pressure limits, and driving pressure targets.",
    color: Colors.accent,
  },
];

// Medical section config for structured AI rendering — harmonized with 4 main colors
const SECTION_CONFIG: Record<
  string,
  { color: string; border: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  "CLINICAL ASSESSMENT": {
    color: Colors.accent, // #6dc2bd (Jewel Teal)
    border: "rgba(109, 194, 189, 0.45)",
    icon: "clipboard-outline",
    label: "Clinical Assessment",
  },
  "DIFFERENTIAL DIAGNOSIS": {
    color: Colors.lavender, // #c09ffa (Soft Lavender)
    border: "rgba(192, 159, 250, 0.45)",
    icon: "git-branch-outline",
    label: "Differential Diagnosis",
  },
  "INVESTIGATIONS / WORKUP": {
    color: Colors.lime, // #c4f230 (Electric Lime)
    border: "rgba(196, 242, 48, 0.45)",
    icon: "pulse-outline",
    label: "Investigations / Workup",
  },
  "INVESTIGATIONS": {
    color: Colors.lime, // #c4f230 (Electric Lime)
    border: "rgba(196, 242, 48, 0.45)",
    icon: "flask-outline",
    label: "Investigations",
  },
  "MANAGEMENT PROTOCOL": {
    color: Colors.accent, // #6dc2bd (Jewel Teal)
    border: "rgba(109, 194, 189, 0.45)",
    icon: "medical-outline",
    label: "Management Protocol",
  },
  "SURGICAL / PROCEDURAL CONSIDERATIONS": {
    color: Colors.lavender, // #c09ffa (Soft Lavender)
    border: "rgba(192, 159, 250, 0.45)",
    icon: "cut-outline",
    label: "Surgical / Procedural",
  },
  "CLINICAL PEARLS & PITFALLS": {
    color: Colors.pink, // #ffc3dd (Pastel Rose Pink)
    border: "rgba(255, 195, 221, 0.45)",
    icon: "sparkles-outline",
    label: "Clinical Pearls & Pitfalls",
  },
  "RED FLAGS / EMERGENCY": {
    color: Colors.pink, // #ffc3dd (Pastel Rose Pink)
    border: "rgba(255, 195, 221, 0.45)",
    icon: "alert-circle-outline",
    label: "Red Flags / Emergency",
  },
  "EVIDENCE & CITATIONS": {
    color: Colors.lavender, // #c09ffa (Soft Lavender)
    border: "rgba(192, 159, 250, 0.45)",
    icon: "book-outline",
    label: "Evidence & Citations",
  },
};

const FALLBACK_PALETTE = [
  { color: Colors.lavender, border: "rgba(192, 159, 250, 0.45)", icon: "information-circle-outline" as const },
  { color: Colors.accent, border: "rgba(109, 194, 189, 0.45)", icon: "document-text-outline" as const },
  { color: Colors.lime, border: "rgba(196, 242, 48, 0.45)", icon: "list-outline" as const },
  { color: Colors.pink, border: "rgba(255, 195, 221, 0.45)", icon: "alert-circle-outline" as const },
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

// Ambient background is clean pure pitch black
const AmbientBackground: React.FC = () => null;

// Double-Bezel shell: outer tray + inner machined core
const BezelShell: React.FC<{
  children: React.ReactNode;
  outerClassName?: string;
  innerClassName?: string;
  innerStyle?: object;
  radius?: number;
}> = ({ children, outerClassName = "", innerClassName = "", innerStyle = {}, radius = 30 }) => (
  <View
    className={`bg-white/[0.03] border border-white/10 p-1.5 ${outerClassName}`}
    style={{ borderRadius: radius }}
  >
    <View
      className={`bg-[#080808] border border-white/[0.08] overflow-hidden ${innerClassName}`}
      style={[
        {
          borderRadius: radius - 6,
          shadowColor: "#000",
          shadowOpacity: 0.5,
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
            <Ionicons name="copy-outline" size={14} color={Colors.grayMuted} />
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
  const params = useLocalSearchParams<{ query?: string; autoSend?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const reducedMotion = useReducedMotion();
  const lastAutoQueryRef = useRef<string | null>(null);

  // Header collapses once a conversation starts (question sent or messages present)
  const chatActive = messages.length > 0 || isTyping;
  const headerCollapse = useSharedValue(0);

  useEffect(() => {
    if (params.query && params.query.trim()) {
      const q = params.query.trim();
      if (lastAutoQueryRef.current !== q) {
        lastAutoQueryRef.current = q;
        setInputText("");
        handleTextSend(q);
      }
    }
  }, [params.query, params.autoSend]);

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
    <View className="flex-1 bg-[#010101]" style={{ backgroundColor: "#010101" }}>
      <StatusBar barStyle="light-content" backgroundColor="#010101" />

      {/* Floating Header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#010101" }}>
        <Animated.View style={[{ paddingHorizontal: 20 }, headerPadStyle]}>
          <BezelShell radius={28}>
            <Animated.View
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                },
                headerPadStyle,
              ]}
            >
              <View className="flex-row items-center">
                <Animated.View
                  style={[
                    {
                      backgroundColor: "rgba(196,242,48,0.12)",
                      borderWidth: 1,
                      borderColor: "rgba(196,242,48,0.3)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 11,
                    },
                    markOuterStyle,
                  ]}
                >
                  <Animated.View
                    style={[
                      {
                        backgroundColor: "rgba(196,242,48,0.2)",
                        borderWidth: 1,
                        borderColor: "rgba(196,242,48,0.45)",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      markInnerStyle,
                    ]}
                  >
                    <Ionicons name="sparkles" size={15} color={Colors.lime} />
                  </Animated.View>
                </Animated.View>

                <View>
                  <View className="flex-row items-center gap-1.5">
                    <Animated.Text
                      style={[
                        {
                          color: "#ffffff",
                          fontFamily: "PlexSans_700Bold",
                          letterSpacing: -0.4,
                        },
                        titleStyle,
                      ]}
                    >
                      Med Arena
                    </Animated.Text>
                    <View className="w-1.5 h-1.5 rounded-full bg-lime" />
                  </View>
                  <Animated.View
                    style={[{ overflow: "hidden" }, subtitleWrapStyle]}
                  >
                    <Text className="text-lavender text-[11px] font-sans-medium mt-0.5">Clinical Decision Support</Text>
                  </Animated.View>
                </View>
              </View>

              {messages.length > 0 && (
                <TouchableOpacity
                  onPress={handleNewChat}
                  className="flex-row items-center rounded-full bg-white/[0.06] border border-white/10 pl-3 pr-1.5 py-1.5 active:opacity-70"
                >
                  <Text className="text-lime text-xs font-sans-bold mr-2">New</Text>
                  <View className="w-6 h-6 rounded-full bg-lime/20 items-center justify-center">
                    <Ionicons name="add" size={14} color={Colors.lime} />
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          </BezelShell>
        </Animated.View>
      </SafeAreaView>

      {/* Main Chat Body & Empty State */}
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
    <View className="flex-1 bg-[#010101]" style={{ backgroundColor: "#010101" }}>
      <StatusBar barStyle="light-content" backgroundColor="#010101" />

      {/* Floating Header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#010101" }}>
        <Animated.View style={[{ paddingHorizontal: 20 }, headerPadStyle]}>
          <BezelShell radius={28}>
            <Animated.View
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                },
                headerPadStyle,
              ]}
            >
              <View className="flex-row items-center">
                <Animated.View
                  style={[
                    {
                      backgroundColor: "rgba(196,242,48,0.12)",
                      borderWidth: 1,
                      borderColor: "rgba(196,242,48,0.3)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 11,
                    },
                    markOuterStyle,
                  ]}
                >
                  <Animated.View
                    style={[
                      {
                        backgroundColor: "rgba(196,242,48,0.2)",
                        borderWidth: 1,
                        borderColor: "rgba(196,242,48,0.45)",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      markInnerStyle,
                    ]}
                  >
                    <Ionicons name="sparkles" size={15} color={Colors.lime} />
                  </Animated.View>
                </Animated.View>

                <View>
                  <View className="flex-row items-center gap-1.5">
                    <Animated.Text
                      style={[
                        {
                          color: "#ffffff",
                          fontFamily: "PlexSans_700Bold",
                          letterSpacing: -0.4,
                        },
                        titleStyle,
                      ]}
                    >
                      Med Arena
                    </Animated.Text>
                    <View className="w-1.5 h-1.5 rounded-full bg-lime" />
                  </View>
                  <Animated.View
                    style={[{ overflow: "hidden" }, subtitleWrapStyle]}
                  >
                    <Text className="text-lavender text-[11px] font-sans-medium mt-0.5">Clinical Decision Support</Text>
                  </Animated.View>
                </View>
              </View>

              {messages.length > 0 && (
                <TouchableOpacity
                  onPress={handleNewChat}
                  className="flex-row items-center rounded-full bg-white/[0.06] border border-white/10 pl-3 pr-1.5 py-1.5 active:opacity-70"
                >
                  <Text className="text-lime text-xs font-sans-bold mr-2">New</Text>
                  <View className="w-6 h-6 rounded-full bg-lime/20 items-center justify-center">
                    <Ionicons name="add" size={14} color={Colors.lime} />
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          </BezelShell>
        </Animated.View>
      </SafeAreaView>

      {/* Main Chat Body & Empty State */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-[#010101]"
        style={{ backgroundColor: "#010101" }}
      >
        {messages.length === 0 ? (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 36,
              paddingBottom: FLOATING_TAB_BAR_HEIGHT + 96,
            }}
            showsVerticalScrollIndicator={false}
            className="flex-1 bg-[#010101]"
            style={{ backgroundColor: "#010101" }}
          >
            {/* Empty State Hero */}
            <Animated.View
              entering={reducedMotion ? undefined : FadeIn.duration(MOTION.enter).easing(EASE_HEAVY)}
              className="items-center mb-8"
            >
              {/* Double-ring hero emblem */}
              <View className="w-20 h-20 rounded-full border border-lime/30 items-center justify-center bg-lime/[0.06] mb-4">
                <View className="w-[60px] h-[60px] rounded-full items-center justify-center border border-lime/45 bg-lime/15">
                  <Ionicons name="sparkles" size={26} color={Colors.lime} />
                </View>
              </View>

              {/* Eyebrow tag */}
              <View className="px-3.5 py-1 rounded-full bg-lavender/15 border border-lavender/40 mb-3">
                <Text className="text-[10px] uppercase tracking-[0.25em] font-sans-bold text-lavender">
                  Evidence-Based Clinical AI
                </Text>
              </View>

              <Text className="text-white text-[25px] font-sans-bold text-center tracking-tight leading-8 mb-2">
                Clinical Consultant AI
              </Text>
              <Text className="text-gray-400 text-[13px] text-center max-w-[280px] leading-5 font-sans">
                Ask about clinical management, diagnostic workups, dosing, or tap a preset below.
              </Text>
            </Animated.View>

            {/* Small Rounded Preset Chips (ChatGPT / Gemini Style) */}
            <Animated.View
              entering={reducedMotion ? undefined : FadeInUp.duration(MOTION.enter).delay(MOTION.stagger).easing(EASE_HEAVY)}
              className="flex-row flex-wrap justify-center gap-2.5 px-1 mb-8"
            >
              {QUICK_PROMPTS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleTextSend(item.prompt)}
                  activeOpacity={0.75}
                  className="flex-row items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#0c1017] border border-white/[0.12]"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.35,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center border"
                    style={{
                      backgroundColor: item.color + "20",
                      borderColor: item.color + "45",
                    }}
                  >
                    <Ionicons name={item.icon} size={12} color={item.color} />
                  </View>
                  <Text className="text-gray-200 font-sans-semibold text-[12.5px]">
                    {item.title}
                  </Text>
                  <Ionicons name="arrow-up" size={12} color={Colors.grayMuted} />
                </TouchableOpacity>
              ))}
            </Animated.View>
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
              paddingBottom: FLOATING_TAB_BAR_HEIGHT + 96,
              flexGrow: 1,
              backgroundColor: "#010101",
            }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: "#010101" }}
          />
        )}

        {/* Floating Composer Island (Height Increased by 25%) */}
        <View
          className="absolute left-4 right-4"
          style={{ bottom: FLOATING_TAB_BAR_HEIGHT + 4 }}
        >
          <View
            className="flex-row items-center rounded-[28px] px-4 py-2 border border-white/[0.12]"
            style={{
              backgroundColor: "#0c1017",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <TextInput
              className="flex-1 text-white text-[15px] py-2 bg-transparent font-sans leading-5"
              placeholder="Ask clinical case, protocol, differential..."
              placeholderTextColor={Colors.graySubtle}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleTextSend()}
              returnKeyType="send"
              multiline
              textAlignVertical="center"
              style={{ minHeight: 46, maxHeight: 115 }}
            />

            <TouchableOpacity
              onPress={() => handleTextSend()}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.8}
              className="ml-2.5 self-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: inputText.trim() && !isTyping ? Colors.lime : "rgba(255,255,255,0.06)",
              }}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color={Colors.grayMuted} />
              ) : (
                <Ionicons
                  name="arrow-up"
                  size={19}
                  color={inputText.trim() ? "#010101" : Colors.graySubtle}
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
