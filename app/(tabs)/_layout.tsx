import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "../../constants/Colors";

// Dark glass island — matches the chat composer, turquoise marks current state.
// Active tab also gets a dot indicator so color is not the only signal.
const BAR_BG = Colors.tabIslandBg;
const BAR_BORDER = "rgba(255,255,255,0.08)";
const ACTIVE_COLOR = Colors.accent;
const INACTIVE_COLOR = Colors.graySubtle;

const ICON_SIZE = 24;
const EASE = Easing.bezier(0.2, 0, 0, 1);

const TAB_ICONS: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  ChatTab: { active: "chatbubble-ellipses", inactive: "chatbubble-ellipses-outline" },
  index: { active: "grid", inactive: "grid-outline" },
  profile: { active: "person-circle", inactive: "person-circle-outline" },
};

function TabBarItem({
  focused,
  label,
  activeName,
  inactiveName,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  label: string;
  activeName: keyof typeof Ionicons.glyphMap;
  inactiveName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const progress = useSharedValue(focused ? 1 : 0);
  const press = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      progress.value = focused ? 1 : 0;
      return;
    }
    progress.value = withTiming(focused ? 1 : 0, { duration: 200, easing: EASE });
  }, [focused, progress]);

  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.25, 1]) }],
  }));

  const inactiveIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.25]) }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [INACTIVE_COLOR, ACTIVE_COLOR]),
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.25, 1]) }],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated by design
        press.value = withTiming(0.96, { duration: 120, easing: EASE });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated by design
        press.value = withTiming(1, { duration: 150, easing: EASE });
      }}
      style={styles.item}
    >
      <Animated.View style={[styles.itemContent, pressStyle]}>
        <View style={styles.iconContainer}>
          <Animated.View
            collapsable={false}
            style={[StyleSheet.absoluteFill, styles.iconLayer, inactiveIconStyle]}
          >
            <Ionicons name={inactiveName} color={INACTIVE_COLOR} size={ICON_SIZE} />
          </Animated.View>
          <Animated.View
            collapsable={false}
            style={[StyleSheet.absoluteFill, styles.iconLayer, activeIconStyle]}
          >
            <Ionicons name={activeName} color={ACTIVE_COLOR} size={ICON_SIZE} />
          </Animated.View>
        </View>
        <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
        <Animated.View style={[styles.dot, dotStyle]} />
      </Animated.View>
    </Pressable>
  );
}

function FabricTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.bar} pointerEvents="box-none">
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const icons = TAB_ICONS[route.name] ?? TAB_ICONS.index;
        const label =
          typeof options.title === "string" ? options.title : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <TabBarItem
            key={route.key}
            focused={focused}
            label={label}
            activeName={icons.active}
            inactiveName={icons.inactive}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FabricTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Med Center" }} />
      <Tabs.Screen name="ChatTab" options={{ title: "Chat" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    marginHorizontal: 16,
    height: 66,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 22,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    backgroundColor: BAR_BG,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: BAR_BORDER,
    overflow: "hidden",
  },
  item: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  itemContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  iconLayer: {
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontFamily: "PlexSans_600SemiBold",
    lineHeight: 12,
    textAlign: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
    marginTop: 3,
  },
});
