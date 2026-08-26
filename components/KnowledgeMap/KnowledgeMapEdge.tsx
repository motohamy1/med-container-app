import React from 'react';
import { Path, G, Text as SvgText, Rect } from 'react-native-svg';
import { KnowledgeMapEdge as EdgeType } from '../../types/knowledgeMap';
import { Colors } from '../../constants/Colors';

interface KnowledgeMapEdgeProps {
  edge: EdgeType;
  sourcePos: { x: number; y: number; width: number; height: number };
  targetPos: { x: number; y: number; width: number; height: number };
  isSelected?: boolean;
  isDimmed?: boolean;
  themeColor?: string;
}

/**
 * Flexible, organic rope connector that dynamically calculates natural tension
 * and anchor points between nodes based on their relative positioning.
 */
export const KnowledgeMapEdge: React.FC<KnowledgeMapEdgeProps> = React.memo(
  function KnowledgeMapEdge({ edge, sourcePos, targetPos, isSelected = false, isDimmed = false, themeColor }) {
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const isTargetBelow = dy >= 0;
    const isTargetRight = dx >= 0;

    let x1 = sourcePos.x;
    let y1 = sourcePos.y + (isTargetBelow ? sourcePos.height / 2 : -sourcePos.height / 2);
    let x2 = targetPos.x;
    let y2 = targetPos.y + (isTargetBelow ? -targetPos.height / 2 : targetPos.height / 2);

    // If nodes are side-by-side rather than stacked
    if (Math.abs(dx) > Math.abs(dy) * 1.8) {
      x1 = sourcePos.x + (isTargetRight ? sourcePos.width / 2 : -sourcePos.width / 2);
      y1 = sourcePos.y;
      x2 = targetPos.x + (isTargetRight ? -targetPos.width / 2 : targetPos.width / 2);
      y2 = targetPos.y;
    }

    const dist = Math.hypot(x2 - x1, y2 - y1);
    // Dynamic organic rope sag & elastic curvature
    const sagY = Math.min(Math.max(Math.abs(y2 - y1) * 0.5, 30), 100);
    const sagX = Math.min(Math.abs(x2 - x1) * 0.25, 60);

    let cp1x = x1;
    let cp1y = y1 + (isTargetBelow ? sagY : -sagY);
    let cp2x = x2;
    let cp2y = y2 + (isTargetBelow ? -sagY : sagY);

    if (Math.abs(dx) > Math.abs(dy) * 1.8) {
      cp1x = x1 + (isTargetRight ? sagX : -sagX);
      cp1y = y1;
      cp2x = x2 + (isTargetRight ? -sagX : sagX);
      cp2y = y2;
    }

    const pathData = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

    const accent = themeColor || Colors.accent;
    const strokeColor = isSelected ? accent : '#2a3b3e';
    const glowColor = isSelected ? `${accent}40` : 'transparent';
    const strokeWidth = isSelected ? 2.4 : 1.6;
    const strokeOpacity = isDimmed ? 0.15 : isSelected ? 1.0 : 0.65;

    // Midpoint for edge label
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return (
      <G>
        {/* Soft glowing rope shadow / ambient depth */}
        {isSelected && (
          <Path
            d={pathData}
            stroke={glowColor}
            strokeWidth={strokeWidth + 4}
            strokeOpacity={0.5}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Main Flexible Rope */}
        <Path
          d={pathData}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
          fill="none"
          strokeLinecap="round"
        />

        {/* Connected Label Badge */}
        {isSelected && edge.label && (
          <G>
            <Rect
              x={midX - 38}
              y={midY - 10}
              width={76}
              height={20}
              rx={6}
              fill="#080e10"
              stroke={strokeColor}
              strokeWidth={0.9}
              strokeOpacity={0.85}
            />
            <SvgText
              x={midX}
              y={midY + 3.5}
              fill={strokeColor}
              fontSize="9.5"
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {edge.label}
            </SvgText>
          </G>
        )}
      </G>
    );
  }
);

KnowledgeMapEdge.displayName = 'KnowledgeMapEdge';
