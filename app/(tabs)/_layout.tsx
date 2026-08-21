import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  type SharedValue,
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const DOCK_HEIGHT = 64;
export const FAB_SIZE = 52;
const CORNER_RADIUS = 26;
const HORIZONTAL_MARGIN = 16;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 220,
  mass: 0.8,
};

const TAB_CONFIG = [
  { name: 'index', title: 'Med Center', activeIcon: 'grid', inactiveIcon: 'grid-outline' },
  { name: 'ChatTab', title: 'Chat', activeIcon: 'chatbubble-ellipses', inactiveIcon: 'chatbubble-ellipses-outline' },
  { name: 'pearls', title: 'Pearls', activeIcon: 'sparkles', inactiveIcon: 'sparkles-outline' },
  { name: 'profile', title: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
] as const;

interface DockBackgroundProps {
  width: number;
  height: number;
  notchX: SharedValue<number>;
}

const DockNotchBackground: React.FC<DockBackgroundProps> = ({
  width,
  height,
  notchX,
}) => {
  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const W = width;
    const H = height;
    const R = CORNER_RADIUS;
    const x = notchX.value;

    if (W <= 0) return { d: '' };

    if (x < 0) {
      // Rounded all 4 corners
      return {
        d: `M 0,${R} A ${R},${R} 0 0,1 ${R},0 L ${W - R},0 A ${R},${R} 0 0,1 ${W},${R} L ${W},${H - R} A ${R},${R} 0 0,1 ${W - R},${H} L ${R},${H} A ${R},${R} 0 0,1 0,${H - R} Z`,
      };
    }

    const p0x = Math.max(R, x - 36);
    const p1x = Math.min(W - R, x + 36);

    const d = `
      M 0,${R}
      A ${R},${R} 0 0,1 ${R},0
      L ${p0x},0
      C ${x - 18},0 ${x - 20},26 ${x},26
      C ${x + 20},26 ${x + 18},0 ${p1x},0
      L ${W - R},0
      A ${R},${R} 0 0,1 ${W},${R}
      L ${W},${H - R}
      A ${R},${R} 0 0,1 ${W - R},${H}
      L ${R},${H}
      A ${R},${R} 0 0,1 0,${H - R}
      Z
    `
      .replace(/\s+/g, ' ')
      .trim();

    return { d };
  });

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <AnimatedPath
        animatedProps={animatedProps}
        fill="#080808"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth={1}
      />
    </Svg>
  );
};

function NotchedTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(
    Dimensions.get('window').width - HORIZONTAL_MARGIN * 2
  );

  const notchX = useSharedValue(-100);
  const bubbleScale = useSharedValue(1);
  const activeIndex = state.index;

  const totalTabs = state.routes.length;
  const floatingBottom = insets.bottom > 0 ? insets.bottom : 10;

  const getTabCenterX = (idx: number, width: number) => {
    'worklet';
    if (width <= 0) return 0;
    const tabWidth = width / totalTabs;
    return tabWidth * (idx + 0.5);
  };

  useEffect(() => {
    if (barWidth > 0) {
      const targetX = getTabCenterX(activeIndex, barWidth);
      if (notchX.value < 0) {
        notchX.value = targetX;
      } else {
        notchX.value = withSpring(targetX, SPRING_CONFIG);
        bubbleScale.value = withTiming(0.82, { duration: 100 }, (finished) => {
          if (finished) {
            bubbleScale.value = withSpring(1, SPRING_CONFIG);
          }
        });
      }
    }
  }, [activeIndex, barWidth]);

  const activeBubbleStyle = useAnimatedStyle(() => {
    if (notchX.value < 0) {
      return { opacity: 0 };
    }
    return {
      opacity: 1,
      transform: [
        { translateX: notchX.value - FAB_SIZE / 2 },
        { scale: bubbleScale.value },
      ],
    };
  });

  const activeConfig = TAB_CONFIG[activeIndex] ?? TAB_CONFIG[0];

  return (
    <View
      style={[
        styles.barWrapper,
        {
          bottom: floatingBottom,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.dockContainer,
          {
            height: DOCK_HEIGHT,
          },
        ]}
        onLayout={(e) => {
          setBarWidth(e.nativeEvent.layout.width);
        }}
      >
        {/* Scooped Notched SVG Background with 4 Rounded Corners */}
        {barWidth > 0 && (
          <DockNotchBackground
            width={barWidth}
            height={DOCK_HEIGHT}
            notchX={notchX}
          />
        )}

        {/* Elevated Floating Active Bubble */}
        <Animated.View
          style={[styles.activeBubble, activeBubbleStyle]}
          pointerEvents="none"
        >
          <Ionicons
            name={activeConfig.activeIcon as any}
            size={24}
            color="#010101"
          />
        </Animated.View>

        {/* Tab Slots */}
        <View style={styles.tabSlotsRow}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG[index] ?? {
              name: route.name,
              title: route.name,
              activeIcon: 'help',
              inactiveIcon: 'help-outline',
            };

            const onPress = () => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={`${config.title} tab, ${isFocused ? 'active' : 'inactive'}`}
                accessibilityHint={isFocused ? 'Double tap to scroll to top' : undefined}
                hitSlop={{ top: 20, bottom: 12, left: 8, right: 8 }}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabSlot}
              >
                {/* Inactive Icon (Fades out when tab is active) */}
                <View
                  style={[
                    styles.iconWrapper,
                    { opacity: isFocused ? 0 : 1 },
                  ]}
                >
                  <Ionicons
                    name={config.inactiveIcon as any}
                    size={22}
                    color={Colors.graySubtle}
                  />
                </View>

                {/* Tab Label */}
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                  numberOfLines={1}
                >
                  {config.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <NotchedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Med Center' }} />
      <Tabs.Screen name="ChatTab" options={{ title: 'Chat' }} />
      <Tabs.Screen name="pearls" options={{ title: 'Pearls' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginHorizontal: HORIZONTAL_MARGIN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 20,
  },
  dockContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  activeBubble: {
    position: 'absolute',
    top: -16,
    left: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.main,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 50,
  },
  tabSlotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: DOCK_HEIGHT,
  },
  tabSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  iconWrapper: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'PlexSans_600SemiBold',
    lineHeight: 12,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: Colors.main,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: Colors.graySubtle,
    fontWeight: '500',
  },
});