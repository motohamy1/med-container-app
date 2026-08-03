import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { aiService, DoctorCategory, Citation } from "../../services/aiService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FLOATING_TAB_BAR_HEIGHT = 65;
const FLOATING_TAB_BAR_BOTTOM_OFFSET = 16;
const CHAT_BOTTOM_OFFSET = FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_BOTTOM_OFFSET + 16;

// Types
type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  category?: DoctorCategory;
  citations?: Citation[];
};

type CategoryOption = {
  id: DoctorCategory;
  name: string;
  shortName: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isAvailable: boolean;
};

const CATEGORIES: CategoryOption[] = [
  { id: "physicians", name: "Physicians", shortName: "Physicians", icon: "medkit-outline" as any, color: "#44cabf", isAvailable: true },
  { id: "dentists", name: "Dentists", shortName: "Dentists", icon: "happy-outline", color: "#7fb0cf", isAvailable: false },
  { id: "physiotherapy", name: "Physiotherapy", shortName: "Physio", icon: "body-outline", color: "#b3a8cf", isAvailable: false },
];

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
    color: "#d98a8a",
  },
  {
    icon: "pulse-outline",
    title: "Sepsis Bundle",
    subtitle: "Surviving Sepsis Campaign 1-hour resuscitation",
    prompt: "Detail the Surviving Sepsis Campaign 1-hour resuscitation bundle, qSOFA scoring, and antibiotic timing.",
    color: "#7fb8a8",
  },
  {
    icon: "alert-circle-outline",
    title: "Hypertensive Crisis",
    subtitle: "Urgency vs Emergency target BP reduction",
    prompt: "Explain the management of Hypertensive Urgency vs Emergency, including IV drug choices and target blood pressure reduction rates.",
    color: "#d8b07f",
  },
  {
    icon: "analytics-outline",
    title: "Liver Scoring",
    subtitle: "Child-Pugh vs MELD-Na calculation & interpretation",
    prompt: "Compare Child-Pugh vs MELD-Na scoring systems for chronic liver failure and surgical mortality risk assessment.",
    color: "#b3a8cf",
  },
];

// Medical section config for structured AI rendering
const SECTION_CONFIG: Record<
  string,
  { color: string; border: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  "CLINICAL ASSESSMENT": {
    color: "#7fb0cf",
    border: "#5f97b8",
    icon: "clipboard-outline",
    label: "Clinical Assessment",
  },
  "DIFFERENTIAL DIAGNOSIS": {
    color: "#d8a8b8",
    border: "#bb8298",
    icon: "git-branch-outline",
    label: "Differential Diagnosis",
  },
  "INVESTIGATIONS / WORKUP": {
    color: "#7fb8a8",
    border: "#5f9c8c",
    icon: "pulse-outline",
    label: "Investigations / Workup",
  },
  "INVESTIGATIONS": {
    color: "#7fb8a8",
    border: "#5f9c8c",
    icon: "flask-outline",
    label: "Investigations",
  },
  "MANAGEMENT PROTOCOL": {
    color: "#d8b07f",
    border: "#bb9163",
    icon: "medical-outline",
    label: "Management Protocol",
  },
  "SURGICAL / PROCEDURAL CONSIDERATIONS": {
    color: "#d9b25a",
    border: "#b8924a",
    icon: "cut-outline",
    label: "Surgical / Procedural",
  },
  "OVERVIEW": {
    color: "#b3a8cf",
    border: "#9286b8",
    icon: "document-text-outline",
    label: "Overview",
  },
  "SCORING CRITERIA": {
    color: "#7fb0cf",
    border: "#5f97b8",
    icon: "list-outline",
    label: "Scoring Criteria",
  },
  "INTERPRETATION": {
    color: "#7fb8a8",
    border: "#5f9c8c",
    icon: "analytics-outline",
    label: "Interpretation",
  },
  "DEFINITION": {
    color: "#b3a8cf",
    border: "#9286b8",
    icon: "book-outline",
    label: "Definition",
  },
  "KEY POINTS": {
    color: "#7fb0cf",
    border: "#5f97b8",
    icon: "key-outline",
    label: "Key Points",
  },
  "PROFESSIONAL CLINICAL ADVICE": {
    color: "#44cabf",
    border: "#358f80",
    icon: "checkmark-circle-outline",
    label: "Clinical Advice",
  },
  "CLINICAL PICTURE": {
    color: "#7fb0cf",
    border: "#5f97b8",
    icon: "eye-outline",
    label: "Clinical Picture",
  },
  "UPDATED INFO / SCORES": {
    color: "#b3a8cf",
    border: "#9286b8",
    icon: "trending-up-outline",
    label: "Updated Info / Scores",
  },
};

const FALLBACK_PALETTE = [
  { color: "#b3a8cf", border: "#9286b8", icon: "information-circle-outline" as const },
  { color: "#7fb0cf", border: "#5f97b8", icon: "document-text-outline" as const },
  { color: "#7fb8a8", border: "#5f9c8c", icon: "list-outline" as const },
  { color: "#d8b07f", border: "#bb9163", icon: "alert-circle-outline" as const },
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

const MedicalSectionBox: React.FC<{
  section: MedicalSection;
  index: number;
}> = ({ section, index }) => {
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
      entering={ZoomIn.duration(400).delay(index * 90).springify()}
      style={{
        width: "100%",
        marginBottom: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: cfg.border + "65",
        backgroundColor: "#1b1d22",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: cfg.border + "20",
          paddingHorizontal: 16,
          paddingVertical: 11,
          borderBottomWidth: 1,
          borderBottomColor: cfg.border + "40",
        }}
      >
        <View style={{ backgroundColor: cfg.border + "35", padding: 6, borderRadius: 10, marginRight: 10 }}>
          <Ionicons name={cfg.icon} size={16} color={cfg.color} />
        </View>
        <Text
          style={{
            color: cfg.color,
            fontWeight: "800",
            fontSize: 13,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          {cfg.label}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
        <Text style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 23, fontWeight: "400" }}>
          {section.content}
        </Text>
      </View>
    </Animated.View>
  );
};

// Animated Pulse Dots for AI Thinking State
const ThinkingIndicator: React.FC = () => {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    dot1.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, true);
    setTimeout(() => {
      dot2.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, true);
    }, 150);
    setTimeout(() => {
      dot3.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, true);
    }, 300);
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <Animated.View entering={FadeInDown.duration(300)} className="flex-row items-center gap-3 px-4 py-3 mb-4">
      <View className="w-8 h-8 rounded-full bg-turquoise/20 items-center justify-center border border-turquoise/40">
        <Ionicons name="sparkles" size={16} color="#44cabf" />
      </View>
      <View className="flex-row items-center gap-1.5 bg-teal-dark border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none">
        <Text className="text-gray-400 text-xs font-semibold mr-1">Consulting clinical guidelines</Text>
        <Animated.View style={s1} className="w-2 h-2 rounded-full bg-turquoise" />
        <Animated.View style={s2} className="w-2 h-2 rounded-full bg-turquoise" />
        <Animated.View style={s3} className="w-2 h-2 rounded-full bg-turquoise" />
      </View>
    </Animated.View>
  );
};

const ChatBubble: React.FC<{
  message: Message;
  onCopy: (text: string) => void;
}> = ({ message, onCopy }) => {
  const isAi = !message.isUser;

  if (isAi) {
    const { hasSections, sections, plainText } = parseMedicalSections(
      message.text,
    );

    return (
      <Animated.View entering={FadeInUp.duration(400)} className="mb-6 px-4 w-full">
        {/* AI Avatar & Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <View className="w-7 h-7 rounded-full bg-turquoise/20 items-center justify-center border border-turquoise/40">
              <Ionicons name="sparkles" size={14} color="#44cabf" />
            </View>
            <Text className="text-white text-xs font-bold">Med Arena AI</Text>
            <View className="px-2 py-0.5 rounded-full bg-teal-medium border border-white/10">
              <Text className="text-[9px] text-turquoise font-semibold">Clinical RAG</Text>
            </View>
          </View>
          <Text className="text-gray-500 text-[10px]">{message.timestamp}</Text>
        </View>

        {/* AI Message Content */}
        {hasSections ? (
          <View className="pl-1">
            {plainText.length > 0 && (
              <View className="bg-teal-dark border border-turquoise/20 rounded-2xl p-4 mb-3">
                <Text className="text-gray-200 text-sm leading-6">{plainText}</Text>
              </View>
            )}
            {sections.map((section, i) => (
              <MedicalSectionBox key={`sec-${i}`} section={section} index={i} />
            ))}
          </View>
        ) : (
          <View className="bg-teal-dark border border-white/10 rounded-2xl rounded-tl-none p-4 shadow-sm">
            <Text className="text-gray-200 text-sm leading-6 font-normal">
              {message.text}
            </Text>
          </View>
        )}

        {/* Citations Block */}
        {message.citations && message.citations.length > 0 && (
          <View className="mt-4 mb-2">
            <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2 ml-1">
              <Ionicons name="library-outline" size={12} /> Medical References
            </Text>
            {message.citations.map((cit) => (
              <View key={cit.id} className="bg-teal-dark/50 border border-white/5 rounded-xl p-3 mb-2 shadow-sm">
                <View className="flex-row items-start gap-2.5">
                  <View className="bg-turquoise/20 px-1.5 py-0.5 rounded mt-0.5">
                    <Text className="text-turquoise text-[10px] font-bold">[{cit.id}]</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-200 text-xs font-semibold leading-4 mb-1">{cit.title}</Text>
                    <Text className="text-gray-400 text-[10px] font-medium">{cit.journal} ({cit.year})</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Toolbar for AI message */}
        <View className="flex-row items-center gap-4 mt-2 pl-2">
          <TouchableOpacity onPress={() => onCopy(message.text)} className="flex-row items-center gap-1">
            <Ionicons name="copy-outline" size={14} color="#9fa3ac" />
            <Text className="text-gray-400 text-xs font-medium">Copy</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // User Message
  return (
    <Animated.View entering={FadeInDown.duration(300)} className="flex-row justify-end mb-5 px-4">
      <View className="max-w-[85%] items-end">
        <View className="flex-row items-center gap-1.5 mb-1 pr-1">
          <Text className="text-gray-400 text-[10px]">{message.timestamp}</Text>
          <Text className="text-turquoise text-xs font-bold">Doctor</Text>
        </View>
        <View className="bg-gradient-to-r from-teal-600 to-turquoise/80 bg-turquoise px-4 py-3 rounded-2xl rounded-tr-none shadow-md">
          <Text className="text-black text-sm font-semibold leading-5">
            {message.text}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const ChatTab = () => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<DoctorCategory>("physicians");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  const handleSelectCategory = (cat: CategoryOption) => {
    if (!cat.isAvailable) {
      Alert.alert("Coming Soon", `${cat.name} clinical resources will be unlocked in the upcoming release. Currently set to Physicians.`);
      return;
    }
    setSelectedCategory(cat.id);
  };

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied", "Clinical response copied to clipboard.");
  };

  const handleQuery = (text: string, reply: string, citations?: Citation[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: reply,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      category: selectedCategory,
      citations,
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
  };

  const handleTextSend = async (queryOverride?: string) => {
    const query = queryOverride || inputText.trim();
    if (!query) return;
    if (!queryOverride) setInputText("");
    setIsTyping(true);

    try {
      const { reply, citations } = await aiService.sendMessageByText(query, "general", selectedCategory);
      handleQuery(query, reply, citations);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Modern Header Bar */}
      <SafeAreaView edges={["top"]} className="bg-teal-dark/95 border-b border-white/5">
        <View className="px-5 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-turquoise/15 items-center justify-center border border-turquoise/30 shadow-glow-cyan">
              <Ionicons name="medical" size={20} color="#44cabf" />
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-white font-extrabold text-base tracking-tight">Med Arena</Text>
                <View className="w-2 h-2 rounded-full bg-emerald-400" />
              </View>
              <Text className="text-gray-400 text-[11px] font-medium">Clinical Decision Support</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {messages.length > 0 && (
              <TouchableOpacity
                onPress={handleNewChat}
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-teal-medium border border-white/10"
              >
                <Ionicons name="add" size={16} color="#44cabf" />
                <Text className="text-turquoise text-xs font-bold">New</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Doctor Category Segmented Switcher */}
        <View className="px-5 pb-3">
          <View className="flex-row bg-teal-dark/80 p-1 rounded-2xl border border-white/10 gap-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleSelectCategory(cat)}
                  className={`flex-1 flex-row items-center justify-center py-2 rounded-xl transition-all ${
                    isSelected
                      ? "bg-turquoise shadow-md"
                      : "bg-transparent"
                  }`}
                >
                  <Ionicons
                    name={cat.icon}
                    size={14}
                    color={isSelected ? "#141519" : "#9fa3ac"}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {cat.shortName}
                  </Text>
                  {!cat.isAvailable && !isSelected && (
                    <View className="ml-1 px-1 bg-white/10 rounded">
                      <Text className="text-[7px] text-amber-300 font-bold">SOON</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
              paddingTop: 30,
              paddingBottom: 40 + CHAT_BOTTOM_OFFSET,
            }}
            showsVerticalScrollIndicator={false}
            className="flex-1"
          >
            {/* Empty State Hero Header */}
            <Animated.View entering={FadeIn.duration(500)} className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-turquoise/10 items-center justify-center border border-turquoise/30 mb-4 shadow-glow-cyan">
                <Ionicons name="sparkles" size={38} color="#44cabf" />
              </View>
              <Text className="text-white text-2xl font-extrabold text-center mb-1">
                Clinical Consultant AI
              </Text>
              <Text className="text-gray-400 text-sm text-center max-w-[280px]">
                High-yield evidence-based clinical reasoning, differential diagnosis & workup protocols.
              </Text>
            </Animated.View>

            {/* Quick Starter List */}
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
              Suggested Clinical Inquiries
            </Text>

            <View className="flex-col gap-2.5 mb-6">
              {QUICK_PROMPTS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleTextSend(item.prompt)}
                  className="bg-teal-medium/40 border border-white/10 p-3.5 rounded-2xl flex-row items-center justify-between shadow-sm active:bg-teal-medium/70"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: item.color + "25" }}
                    >
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-sm mb-0.5">
                        {item.title}
                      </Text>
                      <Text className="text-gray-400 text-xs leading-4" numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>

                  <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
                    <Ionicons name="arrow-forward" size={16} color="#44cabf" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatBubble message={item} onCopy={handleCopyText} />}
            ListFooterComponent={isTyping ? <ThinkingIndicator /> : null}
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: 20 + CHAT_BOTTOM_OFFSET,
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

        {/* Floating Composer Bar */}
        <View
          className="bg-teal-dark/95 border-t border-white/10 px-4 pt-3"
          style={{
            paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 12,
            marginBottom: CHAT_BOTTOM_OFFSET,
          }}
        >
          <View className="flex-row items-end bg-teal-medium/70 rounded-3xl px-4 py-2 border border-white/10 shadow-lg">
            <TextInput
              className="flex-1 text-white text-base max-h-32 py-2"
              placeholder="Ask clinical case, protocol, differential..."
              placeholderTextColor="#9fa3ac"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleTextSend()}
              returnKeyType="send"
              multiline
              textAlignVertical="center"
              style={{ minHeight: 28 }}
            />

            <TouchableOpacity
              onPress={() => handleTextSend()}
              disabled={!inputText.trim() || isTyping}
              className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${
                inputText.trim() && !isTyping
                  ? "bg-turquoise shadow-glow-cyan"
                  : "bg-white/10"
              }`}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="#9fa3ac" />
              ) : (
                <Ionicons
                  name="arrow-up"
                  size={22}
                  color={inputText.trim() ? "#141519" : "#8a8e98"}
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
