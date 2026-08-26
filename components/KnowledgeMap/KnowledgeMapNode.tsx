import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { KnowledgeMapNode as NodeType } from '../../types/knowledgeMap';
import { getNodeVisualConfig } from '../../utils/knowledgeMap/graphConstants';

interface KnowledgeMapNodeProps {
  node: NodeType;
  pos: { x: number; y: number; width: number; height: number };
  isSelected?: boolean;
  isConnected?: boolean;
  isDimmed?: boolean;
  themeColor?: string;
  scaleSharedValue?: SharedValue<number>;
  onPress?: (node: NodeType) => void;
  onDragStart?: (nodeId: string) => void;
  onDragUpdate?: (nodeId: string, x: number, y: number) => void;
  onDragEnd?: (nodeId: string) => void;
}

export const KnowledgeMapNode: React.FC<KnowledgeMapNodeProps> = React.memo(
  function KnowledgeMapNode({
    node,
    pos,
    isSelected = false,
    isConnected = false,
    isDimmed = false,
    themeColor,
    scaleSharedValue,
    onPress,
    onDragStart,
    onDragUpdate,
    onDragEnd,
  }) {
    const config = getNodeVisualConfig(node.type, themeColor);
    const { width, height } = pos;

    // Anchor coordinates for the active gesture session
    const originX = useSharedValue(pos.x);
    const originY = useSharedValue(pos.y);
    const isDragging = useSharedValue(false);

    // Sync only when external position updates while NOT actively dragging
    React.useEffect(() => {
      if (!isDragging.value) {
        originX.value = pos.x;
        originY.value = pos.y;
      }
    }, [pos.x, pos.y, isDragging, originX, originY]);

    const handleHaptic = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePress = () => {
      onPress?.(node);
    };

    const handleDragStart = () => {
      onDragStart?.(node.id);
    };

    const handleDragUpdate = (nx: number, ny: number) => {
      onDragUpdate?.(node.id, nx, ny);
    };

    const handleDragEnd = () => {
      onDragEnd?.(node.id);
    };

    // Pan Gesture: 1:1 screen-to-canvas coordinate mapping without runaway drift
    const panGesture = Gesture.Pan()
      .minDistance(3)
      .onStart(() => {
        isDragging.value = true;
        // Freeze anchor origin at exact gesture start
        originX.value = pos.x;
        originY.value = pos.y;
        runOnJS(handleHaptic)();
        runOnJS(handleDragStart)();
      })
      .onUpdate((e) => {
        const currentScale = scaleSharedValue ? scaleSharedValue.value : 1.0;
        const scaleVal = currentScale > 0.05 ? currentScale : 1.0;
        const newX = originX.value + e.translationX / scaleVal;
        const newY = originY.value + e.translationY / scaleVal;
        runOnJS(handleDragUpdate)(newX, newY);
      })
      .onEnd(() => {
        isDragging.value = false;
        runOnJS(handleDragEnd)();
      });

    // Tap Gesture for Node Selection
    const tapGesture = Gesture.Tap().onEnd(() => {
      runOnJS(handlePress)();
    });

    const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

    const cornerRadius = node.type === 'root' ? 16 : node.type === 'section' ? 14 : 12;
    const strokeColor = isSelected
      ? config.iconColor
      : isConnected
      ? `${config.iconColor}cc`
      : config.border;
    const strokeWidth = isSelected ? 2.2 : isConnected ? 1.5 : 1.0;
    const opacity = isDimmed ? 0.35 : 1.0;

    return (
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.nodeContainer,
            {
              left: pos.x - width / 2,
              top: pos.y - height / 2,
              width,
              minHeight: height,
              borderRadius: cornerRadius,
              backgroundColor: config.bg,
              borderColor: strokeColor,
              borderWidth: strokeWidth,
              opacity,
              shadowColor: isSelected ? config.iconColor : '#000',
              shadowOpacity: isSelected ? 0.45 : 0.25,
              shadowRadius: isSelected ? 8 : 4,
              elevation: isSelected ? 6 : 2,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${node.label}, ${node.type}`}
        >
          <View style={styles.contentRow}>
            {/* Type Icon / Dot */}
            <View
              style={[
                styles.iconDot,
                {
                  backgroundColor: `${config.iconColor}22`,
                  borderColor: `${config.iconColor}55`,
                },
              ]}
            >
              <Ionicons
                name={config.iconName}
                size={node.type === 'root' ? 14 : 11}
                color={config.iconColor}
              />
            </View>

            {/* Label Text */}
            <View style={styles.textWrapper}>
              <Text
                style={[
                  styles.nodeLabel,
                  {
                    color: config.text,
                    fontSize: node.type === 'root' ? 12.5 : node.type === 'section' ? 11 : 10,
                    fontWeight: node.type === 'root' ? '700' : '600',
                  },
                ]}
                numberOfLines={2}
              >
                {node.label}
              </Text>
            </View>

            {/* Hidden Children Badge */}
            {node.hiddenChildCount !== undefined && node.hiddenChildCount > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: config.badgeBg,
                    borderColor: config.iconColor,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: config.iconColor }]}>
                  +{node.hiddenChildCount}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    );
  }
);

KnowledgeMapNode.displayName = 'KnowledgeMapNode';

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  nodeLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    lineHeight: 14,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
  },
});
