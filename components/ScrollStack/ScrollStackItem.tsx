import React from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  Pressable,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScrollStackItemProps {
  children: React.ReactNode;
  index: number;
  totalCards: number;
  progress: SharedValue<number>;
  itemScale?: number;
  itemStackDistance?: number;
  baseScale?: number;
  rotationAmount?: number;
  onSelect: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  index,
  totalCards,
  progress,
  itemScale = 0.04,
  itemStackDistance = 12,
  baseScale = 0.90,
  rotationAmount = 10,
  onSelect,
  onLayout,
  style,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    // Pure continuous cyclic difference calculation
    let diff = (index - progress.value) % totalCards;
    if (diff > totalCards / 2) diff -= totalCards;
    if (diff < -totalCards / 2) diff += totalCards;

    // Invisible / outside visible window
    if (diff < -1.15 || diff > 2.5) {
      return {
        opacity: 0,
        zIndex: 0,
        transform: [{ translateX: -SCREEN_WIDTH * 1.5 }],
      };
    }

    if (diff <= 0) {
      // Top card or card exiting offscreen — stays completely solid while swiping
      const translateX = diff * SCREEN_WIDTH * 1.05;
      const rotate = `${diff * rotationAmount}deg`;
      const opacity = interpolate(
        diff,
        [-1, -0.8, 0],
        [0, 0.95, 1.0],
        Extrapolation.CLAMP
      );

      return {
        transform: [
          { translateX },
          { translateY: 0 },
          { scale: 1.0 },
          { rotate },
        ],
        opacity,
        zIndex: 40,
      };
    }

    // Cards stacked behind (diff > 0)
    const translateY = interpolate(
      diff,
      [0, 1, 2],
      [0, itemStackDistance, itemStackDistance * 1.8],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      diff,
      [0, 1, 2],
      [1.0, 1.0 - itemScale, baseScale],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      diff,
      [0, 1, 2, 2.5],
      [1.0, 0.88, 0.6, 0],
      Extrapolation.CLAMP
    );

    const zIndex = Math.round(30 - diff * 5);

    return {
      transform: [{ translateY }, { scale }],
      opacity,
      zIndex,
    };
  });

  return (
    <Animated.View
      style={[styles.cardContainer, animatedStyle, style]}
      pointerEvents="box-none"
      onLayout={onLayout}
    >
      <Pressable
        onPress={onSelect}
        style={styles.touchable}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  touchable: {
    width: '100%',
  },
});

export default ScrollStackItem;
