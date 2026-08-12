import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Clipboard,
  FlatList,
  Keyboard,
  StyleSheet,
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
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { router } from "expo-router";
import { aiService, Citation } from "../services/aiService";
import { SPECIALTY_KNOWLEDGE } from "../constants/SpecialtyData";

const EASE_HEAVY = Easing.bezier(0.32, 0.72, 0, 1);
const TURQUOISE = "#6ec2be";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  citations?: Citation[];
};

export default function TopicChat({ 
  specialtyId, 
  topicId, 
  topicName, 
  themeColor,
  initialQuery,
  categoryContext
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

  const specialty = SPECIALTY_KNOWLEDGE[specialtyId || 'heart'] || SPECIALTY_KNOWLEDGE['heart'];
  const topicData = specialty.categories.flatMap(c => c.topics).find((t) => t.id === topicId);

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    });
    return () => keyboardShowListener.remove();
  }, []);

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied", "Clinical response copied to clipboard.");
  };

  const handleTextSend = async () => {
    const query = inputText.trim();
    if (!query) return;
    setInputText("");
    setIsTyping(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Pass the topicScope along with specialty
      const { reply, citations } = await aiService.sendMessageByText(query, "general", specialtyId as any, topicId, categoryContext);
      
      // Check for Out-of-Scope flag from the AI
      if (reply.includes("##OUT_OF_SCOPE##")) {
        const cleanReply = reply.replace("##OUT_OF_SCOPE##", "").trim();
        Alert.alert(
          "Out of Scope",
          `${cleanReply}\n\nRedirecting you to the general clinical hub...`,
          [
            { 
              text: "OK", 
              onPress: () => {
                // Redirect back to normal chat with the query
                router.push({
                  pathname: "/(tabs)/ChatTab",
                  params: { query }
                });
              } 
            }
          ]
        );
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: reply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          citations,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100, flexGrow: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View className={`mb-5 px-4 flex-row ${item.isUser ? "justify-end" : "justify-start"}`}>
            <View className={`max-w-[85%] ${item.isUser ? "items-end" : "items-start"}`}>
              <Text className="text-gray-400 text-[10px] mb-1">{item.isUser ? "Doctor" : "AI"} • {item.timestamp}</Text>
              <View 
                className={`px-4 py-3 rounded-3xl ${item.isUser ? "rounded-tr-md" : "rounded-tl-md"}`}
                style={{ backgroundColor: item.isUser ? themeColor : "#191c20" }}
              >
                <Text style={{ color: item.isUser ? "#101214" : "#e4e8ed", fontSize: 14, fontWeight: item.isUser ? "600" : "400" }}>
                  {item.text.replace(/##(.*?)##/g, "$1:")}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-12 mb-8">
            <View className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4" style={{ borderColor: `${themeColor}40` }}>
              {specialty.illustration ? (
                <Image source={specialty.illustration} className="w-full h-full opacity-80" resizeMode="cover" />
              ) : (
                <View className="w-full h-full bg-teal-dark items-center justify-center">
                  <Ionicons name="medical" size={40} color={themeColor} />
                </View>
              )}
            </View>
            <Text className="text-white text-2xl font-black text-center mb-2 px-4">{topicName}</Text>
            {topicData && (
              <Text className="text-gray-400 text-sm font-sans-medium text-center px-8 mb-8 leading-5">
                {topicData.subtitle}
              </Text>
            )}
            {topicId === 'general' && (
              <Text className="text-gray-400 text-sm font-sans-medium text-center px-8 mb-8 leading-5">
                {specialty.generalScope}
              </Text>
            )}
            <View className="bg-white/5 rounded-xl p-4 mx-4 border border-white/10 flex-row items-center">
              <Ionicons name="information-circle" size={24} color={themeColor} style={{ marginRight: 12 }} />
              <Text className="text-gray-300 text-xs flex-1 leading-5">
                The AI is strictly scoped to this topic. Ask questions, request workups, or query clinical guidelines related to {topicName}.
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={isTyping ? <Text className="text-gray-500 ml-6 italic text-xs mt-4">AI is consulting guidelines...</Text> : null}
      />

      {/* Input Area */}
      <View className="px-4 py-3 bg-background border-t border-white/5">
        <View className="flex-row items-end bg-teal-dark border border-white/10 rounded-3xl px-4 py-2 min-h-[50px] shadow-lg">
          <TextInput
            className="flex-1 text-white text-base max-h-24 pt-2 pb-2"
            placeholder={`Ask about ${topicName}...`}
            placeholderTextColor="#6c737f"
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            onPress={handleTextSend}
            disabled={!inputText.trim() || isTyping}
            className="w-9 h-9 rounded-full items-center justify-center mb-0.5 ml-2"
            style={{ backgroundColor: inputText.trim() ? themeColor : "#313843" }}
          >
            <Ionicons name="arrow-up" size={18} color="#101214" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
