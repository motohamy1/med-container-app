import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TouchableOpacity, Dimensions } from 'react-native';
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
  onSelect: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  index,
  totalCards,
  progress,
  onSelect,
  style,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    // Pure continuous cyclic difference calculation
    let diff = (index - progress.value) % totalCards;
    if (diff > totalCards / 2) diff -= totalCards;
    if (diff < -totalCards / 2) diff += totalCards;

    // Invisible / outside visible window
    if (diff < -1.4 || diff > 2.6) {
      return {
        opacity: 0,
        zIndex: 0,
        transform: [{ translateX: -SCREEN_WIDTH * 1.5 }],
      };
    }

    if (diff <= 0) {
      // Top card or card exiting offscreen
      const translateX = diff * SCREEN_WIDTH * 1.05;
      const rotate = `${diff * 14}deg`;
      const opacity = interpolate(
        diff,
        [-1, -0.6, 0],
        [0, 0.7, 1.0],
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
        zIndex: 30,
      };
    }

    // Cards stacked behind (diff > 0)
    const translateY = interpolate(
      diff,
      [0, 1, 2],
      [0, 14, 26],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      diff,
      [0, 1, 2],
      [1.0, 0.93, 0.86],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      diff,
      [0, 1, 2, 2.5],
      [1.0, 0.82, 0.45, 0],
      Extrapolation.CLAMP
    );

    const zIndex = Math.round(20 - diff * 5);

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
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onSelect}
        style={styles.touchable}
      >
        {children}
      </TouchableOpacity>
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
