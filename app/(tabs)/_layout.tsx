import { Ionicons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

const GRADIENT_COLORS = ["#acdcd9", "#6ec2be", "#499592"] as const;
const INACTIVE_COLOR = "#a3a8af";

function GradientIcon({
  name,
  size = 24,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
}) {
  return (
    <MaskedView
      style={{ width: size, height: size }}
      maskElement={<Ionicons name={name} size={size} color="#fff" />}
    >
      <LinearGradient
        colors={[...GRADIENT_COLORS]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </MaskedView>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6ec2be",
        tabBarInactiveTintColor: INACTIVE_COLOR,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          lineHeight: 12,
          textAlign: "center",
        },
        tabBarItemStyle: {
          flex: 1,
          minWidth: 0,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 4,
        },
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          marginHorizontal: 16,
          bottom: 0,
          height: 66,
          paddingHorizontal: 10,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 22,
          shadowColor: "#000",
          shadowOpacity: 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          backgroundColor: "#1a1c1f",
          borderRadius: 33,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        },
      }}
    >
      <Tabs.Screen
        name="ChatTab"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <GradientIcon name="chatbubble-ellipses" />
            ) : (
              <Ionicons
                name="chatbubble-ellipses-outline"
                color={INACTIVE_COLOR}
                size={24}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <GradientIcon name="grid" />
            ) : (
              <Ionicons
                name="grid-outline"
                color={INACTIVE_COLOR}
                size={24}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <GradientIcon name="person-circle" />
            ) : (
              <Ionicons
                name="person-circle-outline"
                color={INACTIVE_COLOR}
                size={24}
              />
            ),
        }}
      />
    </Tabs>
  );
}
