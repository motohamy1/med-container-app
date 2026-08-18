import React, { Children, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { createScrollStackStyles } from './scrollStack.styles';
import ScrollStackItem from './ScrollStackItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 26,
  stiffness: 240,
  mass: 0.8,
};

interface ScrollStackProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onCardChange?: (index: number) => void;
}

export const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  style,
  onCardChange,
}) => {
  const styles = createScrollStackStyles();
  const cardArray = Children.toArray(children);
  const totalCards = cardArray.length;

  const [activeIndex, setActiveIndex] = useState(0);

  // Single continuous float value representing the scroll position
  const progress = useSharedValue(0);
  const startProgress = useSharedValue(0);

  const handleIndexChange = useCallback(
    (newIndex: number) => {
      setActiveIndex(newIndex);
      onCardChange?.(newIndex);
    },
    [onCardChange]
  );

  const goToCard = useCallback(
    (targetIndex: number) => {
      if (totalCards <= 1) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

      const currentNorm = ((Math.round(progress.value) % totalCards) + totalCards) % totalCards;
      let diff = targetIndex - currentNorm;
      if (diff > totalCards / 2) diff -= totalCards;
      if (diff < -totalCards / 2) diff += totalCards;

      const newTarget = Math.round(progress.value) + diff;

      progress.value = withSpring(newTarget, SPRING_CONFIG, (finished) => {
        if (finished) {
          const normalized = ((newTarget % totalCards) + totalCards) % totalCards;
          runOnJS(handleIndexChange)(normalized);
        }
      });
    },
    [totalCards, progress, handleIndexChange]
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      startProgress.value = progress.value;
    })
    .onUpdate((e) => {
      // Direct 1:1 real-time drag tracking
      progress.value = startProgress.value - e.translationX / SCREEN_WIDTH;
    })
    .onEnd((e) => {
      const dragDistance = e.translationX;
      const velocity = e.velocityX;

      let target = Math.round(progress.value);

      // Flick or drag distance threshold
      if (Math.abs(velocity) > 450) {
        target =
          velocity < 0
            ? Math.floor(startProgress.value) + 1
            : Math.ceil(startProgress.value) - 1;
      } else if (Math.abs(dragDistance) > SCREEN_WIDTH * 0.2) {
        target =
          dragDistance < 0
            ? Math.floor(startProgress.value) + 1
            : Math.ceil(startProgress.value) - 1;
      } else {
        target = Math.round(startProgress.value);
      }

      progress.value = withSpring(target, SPRING_CONFIG, (finished) => {
        if (finished) {
          const normalized = ((target % totalCards) + totalCards) % totalCards;
          runOnJS(handleIndexChange)(normalized);
        }
      });
    });

  return (
    <View style={[styles.container, style]}>
      {/* Gesture-Driven Stack with Single-Pass Physics */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.stackContainer}>
          {cardArray.map((child, idx) => (
            <ScrollStackItem
              key={idx}
              index={idx}
              totalCards={totalCards}
              progress={progress}
              onSelect={() => goToCard(idx)}
            >
              {child}
            </ScrollStackItem>
          ))}
        </View>
      </GestureDetector>

      {/* Pagination Controls */}
      {totalCards > 1 && (
        <View style={styles.paginationRow}>
          <TouchableOpacity
            onPress={() => goToCard(activeIndex - 1)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.6}
            style={styles.navArrow}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.grayMuted} />
          </TouchableOpacity>

          {cardArray.map((_, dotIdx) => {
            const isActive = dotIdx === activeIndex;
            return (
              <TouchableOpacity
                key={dotIdx}
                onPress={() => goToCard(dotIdx)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                style={[styles.paginationDot, isActive && styles.paginationDotActive]}
              />
            );
          })}

          <TouchableOpacity
            onPress={() => goToCard(activeIndex + 1)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.6}
            style={styles.navArrow}
          >
            <Ionicons name="chevron-forward" size={18} color={Colors.grayMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ScrollStack;
